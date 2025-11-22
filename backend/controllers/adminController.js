
const User = require('../models/User');
const Item = require('../models/Item'); // Items represent Tenders

const adminController = {
    getPlatformReports: (req, res) => {
        const reports = {};

        // 1. Get Active Users (Total Registered Users)
        User.countAll((err, userResult) => {
            if (err) {
                console.error('Error fetching user count:', err);
                return res.status(500).send({ message: "Error fetching user data." });
            }
            // userResult is an array of rows, we need the first element
            reports.activeUsers = userResult[0].totalUsers || 0;

            // 2. Get Tenders Posted (Total Items)
            Item.countAll((err, tenderResult) => {
                if (err) {
                    console.error('Error fetching tender count:', err);
                    return res.status(500).send({ message: "Error fetching tender data." });
                }
                reports.tendersPosted = tenderResult[0].totalTenders || 0;

                // 3. Placeholder for Proposals Submitted (Requires a separate Bid/Proposal Model)
                reports.proposalsSubmitted = 0; 

                // Send the consolidated report
                res.status(200).send(reports);
            });
        });
    }
};

module.exports = adminController;
