"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const treasury_service_1 = require("../services/treasury.service");
const stacks_service_1 = require("../services/stacks.service");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const stacksService = new stacks_service_1.StacksService();
const treasuryService = new treasury_service_1.TreasuryService(prisma, stacksService);
// Create new business
router.post('/', async (req, res) => {
    try {
        const { name, email, walletAddress, liquidityThreshold } = req.body;
        // Validation
        if (!name || !email || !walletAddress) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const business = await treasuryService.createBusiness({
            name,
            email,
            walletAddress,
            liquidityThreshold
        });
        res.status(201).json({
            success: true,
            data: business
        });
    }
    catch (error) {
        console.error('Business creation error:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Business with this email or wallet already exists' });
        }
        res.status(500).json({ error: 'Failed to create business' });
    }
});
// Get business by wallet address
router.get('/wallet/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const business = await treasuryService.getBusinessByWallet(address);
        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }
        res.json({
            success: true,
            data: business
        });
    }
    catch (error) {
        console.error('Get business error:', error);
        res.status(500).json({ error: 'Failed to fetch business' });
    }
});
// Get business dashboard data
router.get('/:businessId/dashboard', async (req, res) => {
    try {
        const { businessId } = req.params;
        const dashboardData = await treasuryService.getDashboardData(businessId);
        res.json({
            success: true,
            data: dashboardData
        });
    }
    catch (error) {
        console.error('Dashboard data error:', error);
        if (error.message === 'Business not found') {
            return res.status(404).json({ error: 'Business not found' });
        }
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});
// Trigger treasury rebalancing
router.post('/:businessId/rebalance', async (req, res) => {
    try {
        const { businessId } = req.params;
        const operation = await treasuryService.rebalanceTreasury(businessId);
        res.json({
            success: true,
            data: operation
        });
    }
    catch (error) {
        console.error('Rebalancing error:', error);
        if (error.message === 'Business not found') {
            return res.status(404).json({ error: 'Business not found' });
        }
        res.status(500).json({ error: 'Failed to rebalance treasury' });
    }
});
// Create yield strategy
router.post('/:businessId/yield-strategies', async (req, res) => {
    try {
        const { businessId } = req.params;
        const { protocol, allocation, currentAPY } = req.body;
        if (!protocol || allocation === undefined || currentAPY === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const strategy = await treasuryService.createYieldStrategy(businessId, {
            protocol,
            allocation,
            currentAPY
        });
        res.status(201).json({
            success: true,
            data: strategy
        });
    }
    catch (error) {
        console.error('Yield strategy creation error:', error);
        res.status(500).json({ error: 'Failed to create yield strategy' });
    }
});
exports.default = router;
//# sourceMappingURL=businesses.js.map