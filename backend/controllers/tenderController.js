const Tender = require('../models/Tender');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/tenders';
        // Create directory if it doesn't exist
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const tenderController = {
    // Client: Create a new tender
    createTender: [
        upload.array('attachments', 5), // Allow up to 5 attachments
        (req, res) => {
            const client_id = req.user.id; // From authMiddleware
            const { title, description, category, budget_range, deadline, location, contact_info, status } = req.body;

            // Basic validation
            if (!title || !description || !deadline) {
                return res.status(400).send({ message: "Title, Description, and Deadline are required." });
            }

            const attachments = req.files ? req.files.map(file => `/uploads/tenders/${file.filename}`) : [];

            const tenderData = {
                client_id,
                title,
                description,
                category,
                budget_range,
                deadline,
                location,
                contact_info,
                attachments: JSON.stringify(attachments), // Store as JSON string in DB
                status: status || 'draft' // Default to draft
            };

            Tender.create(tenderData, (err, result) => {
                if (err) {
                    console.error('Error creating tender:', err);
                    return res.status(500).send({ message: "Error creating tender." });
                }
                res.status(201).send({ message: "Tender created successfully!", tenderId: result.insertId });
            });
        }
    ],

    // Client: Get all tenders created by the authenticated client
    getClientTenders: (req, res) => {
        const client_id = req.user.id;
        Tender.findByClientId(client_id, (err, tenders) => {
            if (err) {
                console.error('Error fetching client tenders:', err);
                return res.status(500).send({ message: "Error fetching your tenders." });
            }
            res.status(200).send(tenders.map(tender => {
                if (tender.attachments) {
                    tender.attachments = JSON.parse(tender.attachments);
                }
                return tender;
            }));
        });
    },

    // Client: Update a specific tender
    updateTender: [
        upload.array('attachments', 5),
        (req, res) => {
            const tenderId = req.params.id;
            const client_id = req.user.id; // Ensure client owns the tender
            const { title, description, category, budget_range, deadline, location, contact_info, status, existingAttachments } = req.body;

            Tender.getById(tenderId, (err, tenders) => {
                if (err) {
                    console.error('Error fetching tender for update:', err);
                    return res.status(500).send({ message: "Error fetching tender." });
                }
                if (tenders.length === 0) {
                    return res.status(404).send({ message: "Tender not found." });
                }
                const tender = tenders[0];
                if (tender.client_id !== client_id) {
                    return res.status(403).send({ message: "You are not authorized to update this tender." });
                }

                // Handle attachments: combine existing ones (passed as JSON string) with new uploads
                let updatedAttachments = [];
                if (existingAttachments) {
                    try {
                        updatedAttachments = JSON.parse(existingAttachments);
                    } catch (e) {
                        console.warn("Invalid existingAttachments JSON:", existingAttachments);
                    }
                }
                const newAttachments = req.files ? req.files.map(file => `/uploads/tenders/${file.filename}`) : [];
                updatedAttachments = updatedAttachments.concat(newAttachments);


                const updateData = {
                    title, description, category, budget_range, deadline, location, contact_info,
                    attachments: JSON.stringify(updatedAttachments),
                    status: status || tender.status // Allow updating status, or keep current
                };

                Tender.update(tenderId, updateData, (err, result) => {
                    if (err) {
                        console.error('Error updating tender:', err);
                        return res.status(500).send({ message: "Error updating tender." });
                    }
                    if (result.affectedRows === 0) {
                        return res.status(404).send({ message: "Tender not found for update." });
                    }
                    res.status(200).send({ message: "Tender updated successfully!" });
                });
            });
        }
    ],

    // Client: Delete a specific tender
    deleteTender: (req, res) => {
        const tenderId = req.params.id;
        const client_id = req.user.id;

        Tender.getById(tenderId, (err, tenders) => {
            if (err) {
                console.error('Error fetching tender for deletion:', err);
                return res.status(500).send({ message: "Error fetching tender." });
            }
            if (tenders.length === 0) {
                return res.status(404).send({ message: "Tender not found." });
            }
            const tender = tenders[0];
            if (tender.client_id !== client_id) {
                return res.status(403).send({ message: "You are not authorized to delete this tender." });
            }

            // Optionally, delete associated files from the filesystem here
            if (tender.attachments) {
                try {
                    const attachments = JSON.parse(tender.attachments);
                    attachments.forEach(filePath => {
                        const fullPath = path.join(__dirname, '..', filePath); // Assuming 'uploads' is in the root
                        fs.unlink(fullPath, (unlinkErr) => {
                            if (unlinkErr && unlinkErr.code !== 'ENOENT') { // ENOENT means file not found, which is fine
                                console.warn(`Failed to delete old attachment: ${fullPath}`, unlinkErr);
                            }
                        });
                    });
                } catch (e) {
                    console.error('Error parsing attachments for deletion:', e);
                }
            }


            Tender.delete(tenderId, (err, result) => {
                if (err) {
                    console.error('Error deleting tender:', err);
                    return res.status(500).send({ message: "Error deleting tender." });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).send({ message: "Tender not found for deletion." });
                }
                res.status(200).send({ message: "Tender deleted successfully!" });
            });
        });
    },

    // Vendor/Admin: Search and view active tenders
    searchTenders: (req, res) => {
        const { keywords, category, location, min_budget, max_budget, sort_by, order_by, status } = req.query;

        // Admins can search for any status, others only 'active'
        const allowedStatuses = req.user.user_type === 'admin' ? ['draft', 'active', 'closed', 'approved', 'rejected'] : ['active'];
        let actualStatus = status && allowedStatuses.includes(status) ? status : 'active';
        if (req.user.user_type === 'admin' && !status) { // Admin default is to see all if no status specified
            actualStatus = null; // Don't filter by status if admin and no status provided
        }


        const filters = {
            keywords,
            category,
            location,
            min_budget,
            max_budget,
            status: actualStatus,
            sort_by: sort_by || 'created_at',
            order_by: order_by || 'DESC'
        };

        Tender.search(filters, (err, tenders) => {
            if (err) {
                console.error('Error searching tenders:', err);
                return res.status(500).send({ message: "Error searching tenders." });
            }
            res.status(200).send(tenders.map(tender => {
                if (tender.attachments) {
                    tender.attachments = JSON.parse(tender.attachments);
                }
                return tender;
            }));
        });
    },

    // Vendor/Admin: Get full details of a specific tender
    getTenderDetails: (req, res) => {
        const { id } = req.params;
        Tender.getById(id, (err, tenders) => {
            if (err) {
                console.error('Error fetching tender details:', err);
                return res.status(500).send({ message: "Error fetching tender details." });
            }
            if (tenders.length === 0) {
                return res.status(404).send({ message: "Tender not found." });
            }
            const tender = tenders[0];

            // Only allow viewing 'draft' tenders if user is the client or an admin
            if (tender.status === 'draft' && req.user.id !== tender.client_id && req.user.user_type !== 'admin') {
                return res.status(403).send({ message: "You are not authorized to view this tender." });
            }

            if (tender.attachments) {
                tender.attachments = JSON.parse(tender.attachments);
            }
            res.status(200).send(tender);
        });
    },

    // Admin: Moderate/Approve/Reject tenders
    moderateTender: (req, res) => {
        const tenderId = req.params.id;
        const { status } = req.body; // Expected status: 'approved', 'rejected', 'active', 'closed'

        if (!status || !['active', 'approved', 'rejected', 'closed', 'draft'].includes(status)) {
            return res.status(400).send({ message: "Invalid status provided. Must be 'active', 'approved', 'rejected', 'closed', or 'draft'." });
        }

        Tender.update(tenderId, { status }, (err, result) => {
            if (err) {
                console.error('Error moderating tender:', err);
                return res.status(500).send({ message: "Error moderating tender." });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "Tender not found for moderation." });
            }
            res.status(200).send({ message: `Tender status updated to ${status} successfully!` });
        });
    },

    // Admin: Edit any tender (similar to updateTender, but no client_id check)
    adminEditTender: [
        upload.array('attachments', 5),
        (req, res) => {
            const tenderId = req.params.id;
            const { title, description, category, budget_range, deadline, location, contact_info, status, existingAttachments } = req.body;

            Tender.getById(tenderId, (err, tenders) => {
                if (err) {
                    console.error('Error fetching tender for admin edit:', err);
                    return res.status(500).send({ message: "Error fetching tender." });
                }
                if (tenders.length === 0) {
                    return res.status(404).send({ message: "Tender not found." });
                }

                let updatedAttachments = [];
                if (existingAttachments) {
                    try {
                        updatedAttachments = JSON.parse(existingAttachments);
                    } catch (e) {
                        console.warn("Invalid existingAttachments JSON:", existingAttachments);
                    }
                }
                const newAttachments = req.files ? req.files.map(file => `/uploads/tenders/${file.filename}`) : [];
                updatedAttachments = updatedAttachments.concat(newAttachments);

                const updateData = {
                    title, description, category, budget_range, deadline, location, contact_info,
                    attachments: JSON.stringify(updatedAttachments),
                    status: status || tenders[0].status
                };

                Tender.update(tenderId, updateData, (err, result) => {
                    if (err) {
                        console.error('Error admin editing tender:', err);
                        return res.status(500).send({ message: "Error editing tender." });
                    }
                    if (result.affectedRows === 0) {
                        return res.status(404).send({ message: "Tender not found for update." });
                    }
                    res.status(200).send({ message: "Tender updated by Admin successfully!" });
                });
            });
        }
    ],

    // Admin: Delete any tender (similar to deleteTender, but no client_id check)
    adminDeleteTender: (req, res) => {
        const tenderId = req.params.id;

        Tender.getById(tenderId, (err, tenders) => {
            if (err) {
                console.error('Error fetching tender for admin deletion:', err);
                return res.status(500).send({ message: "Error fetching tender." });
            }
            if (tenders.length === 0) {
                return res.status(404).send({ message: "Tender not found." });
            }
            const tender = tenders[0];

            if (tender.attachments) {
                try {
                    const attachments = JSON.parse(tender.attachments);
                    attachments.forEach(filePath => {
                        const fullPath = path.join(__dirname, '..', filePath);
                        fs.unlink(fullPath, (unlinkErr) => {
                            if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                                console.warn(`Failed to delete old attachment: ${fullPath}`, unlinkErr);
                            }
                        });
                    });
                } catch (e) {
                    console.error('Error parsing attachments for deletion (admin):', e);
                }
            }

            Tender.delete(tenderId, (err, result) => {
                if (err) {
                    console.error('Error admin deleting tender:', err);
                    return res.status(500).send({ message: "Error deleting tender." });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).send({ message: "Tender not found for deletion." });
                }
                res.status(200).send({ message: "Tender deleted by Admin successfully!" });
            });
        });
    }
};

module.exports = tenderController;