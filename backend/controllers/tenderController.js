// controllers/tenderController.js
const Tender = require('../models/Tender');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure Multer for file uploads (existing logic)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/tenders';
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const tenderController = {
    // --- Client Functions (Omitted for brevity, assumed unchanged) ---
    createTender: [
        upload.array('attachments', 5),
        /* ... existing logic ... */
    ],
    getClientTenders: (req, res) => { /* ... existing logic ... */ },
    updateTender: [
        upload.array('attachments', 5),
        /* ... existing logic ... */
    ],
    deleteTender: (req, res) => { /* ... existing logic ... */ },
    publishTender: (req, res) => { /* ... existing logic ... */ },
    extendDeadline: (req, res) => { /* ... existing logic ... */ },
    closeTender: (req, res) => { /* ... existing logic ... */ },
    archiveTender: (req, res) => { /* ... existing logic ... */ },

    // -----------------------------------------------------

    // --- NEW Vendor Specific Function ---

    /**
     * Vendor: Get all ACTIVE tenders in descending order (for the main feed).
     * Fulfills the 'Show all tenders in descending order to vendor' requirement.
     */
    getAllActiveTendersVendor: (req, res) => {
        // Authorization check is handled by middleware (authorizeRoles(['vendor']))
        
        Tender.findAllActive((err, tenders) => {
            if (err) {
                console.error('Error fetching all active tenders for vendor:', err);
                return res.status(500).send({ message: "Error fetching tender feed." });
            }

            const safeTenders = tenders.map(tender => {
                if (tender.attachments) {
                    tender.attachments = JSON.parse(tender.attachments);
                }
                // Crucial for vendors: Hide sensitive contact info on the listing page
                delete tender.contact_info; 
                return tender;
            });

            res.status(200).send(safeTenders);
        });
    },

    // --- Vendor/Admin Functions (Modified for enhanced vendor behavior) ---

    // Vendor/Admin: Search and view active tenders (Updated status filter)
    searchTenders: (req, res) => {
        const { keywords, category, location, min_budget, max_budget, sort_by, order_by, status, posting_date_start, posting_date_end } = req.query;

        const isVendor = req.user.user_type === 'vendor';
        
        // Define allowed statuses based on user role
        let allowedStatuses = ['active'];
        if (req.user.user_type === 'admin') {
            allowedStatuses = ['draft', 'active', 'closed', 'approved', 'rejected', 'archived'];
        }

        // Determine the status filter: Vendors are locked to 'active' unless an admin is searching.
        let actualStatus = null;
        if (status && allowedStatuses.includes(status)) {
             actualStatus = status;
        } else if (isVendor) {
            // If vendor and no status specified (or invalid status specified), default to 'active'
            actualStatus = 'active'; 
        } else if (req.user.user_type === 'admin') {
            // Admin allows null status to view all statuses if not filtered
            actualStatus = status || null;
        }


        const filters = {
            keywords, category, location, min_budget, max_budget,
            status: actualStatus, // Use determined status
            posting_date_start, posting_date_end,
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
                // Hide contact info from vendors on the search results list
                delete tender.contact_info; 
                return tender;
            }));
        });
    },

    /**
     * Vendor/Admin: Get full details of a specific tender
     * Fulfills the 'Show single tender to vendor' requirement, with strict authorization.
     */
    getTenderDetails: (req, res) => {
        const { id } = req.params;
        const isVendor = req.user.user_type === 'vendor';
        
        Tender.getById(id, (err, tenders) => {
            if (err) {
                console.error('Error fetching tender details:', err);
                return res.status(500).send({ message: "Error fetching tender details." });
            }
            if (tenders.length === 0) {
                return res.status(404).send({ message: "Tender not found." });
            }
            const tender = tenders[0];

            // 1. VENDOR Authorization Check: Must be 'active'
            if (isVendor && tender.status !== 'active') {
                 return res.status(403).send({ message: "You are not authorized to view this tender. Only active tenders are visible." });
            }
            
            // 2. CLIENT/ADMIN Authorization Check: Drafts are only visible to owner/admin
            if (tender.status === 'draft' && req.user.id !== tender.client_id && req.user.user_type !== 'admin') {
                return res.status(403).send({ message: "You are not authorized to view this tender." });
            }

            // Data formatting
            if (tender.attachments) {
                tender.attachments = JSON.parse(tender.attachments);
            }

            res.status(200).send(tender);
        });
    },

    // --- Admin Functions (Omitted for brevity, assumed unchanged) ---
    getAllTendersAdmin: (req, res) => { /* ... existing logic ... */ },
    moderateTender: (req, res) => { /* ... existing logic ... */ },
    adminEditTender: [
        upload.array('attachments', 5),
        /* ... existing logic ... */
    ],
    adminDeleteTender: (req, res) => { /* ... existing logic ... */ }
};

module.exports = tenderController;