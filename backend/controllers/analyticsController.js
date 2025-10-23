const Tender = require('../models/Tender');
const Proposal = require('../models/Proposal');
// const User = require('../models/User'); // Conceptual User model

const analyticsController = {
    /**
     * getPlatformStats
     * Description: Provides Admins with dashboards and reports on platform usage.
     * Access: Admin
     */
    getPlatformStats: async (req, res) => {
        const stats = {};
        
        // Helper function to promisify queries (or use Promise wrappers if available)
        const runQuery = (modelMethod, ...args) => {
            return new Promise((resolve, reject) => {
                modelMethod(...args, (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            });
        };
        
        try {
            // 1. Tender Stats
            const tenderStatuses = await runQuery(Tender.countTendersByStatus);
            stats.tender_counts = tenderStatuses;
            stats.tenders_posted_last_30_days = (await runQuery(Tender.countTendersPostedLast30Days))[0].count;

            // 2. Proposal Stats
            const proposalStatuses = await runQuery(Proposal.countProposalsByStatus);
            stats.proposal_counts = proposalStatuses;
            
            // 3. User Stats (Conceptual - requires User Model implementation)
            // stats.user_counts = await runQuery(User.countUsersByTypeAndStatus);
            
            // Placeholder for User stats
            stats.user_counts = [
                { user_type: 'client', is_active: 1, count: 50 },
                { user_type: 'vendor', is_active: 1, count: 200 }
            ];

            res.status(200).send(stats);

        } catch (error) {
            console.error('Error fetching platform analytics:', error);
            res.status(500).send({ message: "Error generating analytics report." });
        }
    }
};

module.exports = analyticsController;