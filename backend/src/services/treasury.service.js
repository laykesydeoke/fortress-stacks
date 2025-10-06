"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreasuryService = void 0;
const client_1 = require("@prisma/client");
const stacks_service_1 = require("./stacks.service");
class TreasuryService {
    prisma;
    stacksService;
    constructor(prisma, stacksService) {
        this.prisma = prisma;
        this.stacksService = stacksService;
    }
    async createBusiness(data) {
        return this.prisma.business.create({
            data: {
                name: data.name,
                email: data.email,
                walletAddress: data.walletAddress,
                liquidityThreshold: data.liquidityThreshold || 0.2
            }
        });
    }
    async getBusinessByWallet(walletAddress) {
        return this.prisma.business.findUnique({
            where: { walletAddress },
            include: {
                payments: { take: 5, orderBy: { createdAt: 'desc' } },
                yieldStrategies: { where: { isActive: true } }
            }
        });
    }
    async processPayment(data) {
        // Create payment record
        const payment = await this.prisma.payment.create({
            data: {
                businessId: data.businessId,
                amount: data.amount,
                status: 'PENDING',
                customerEmail: data.customerEmail,
                description: data.description
            },
            include: {
                business: true
            }
        });
        // Create smart contract payment
        try {
            const contractResult = await this.stacksService.createPayment(payment.business.walletAddress, Math.floor(data.amount * 1000000), // Convert to microunits
            undefined // Customer address would come from wallet connection
            );
            // Update payment with transaction hash
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    transactionHash: contractResult.txId,
                    metadata: { contractPaymentId: contractResult.transaction }
                }
            });
            return { ...payment, transactionHash: contractResult.txId };
        }
        catch (error) {
            // Update payment status to failed
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' }
            });
            throw error;
        }
    }
    async confirmPayment(paymentId) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { business: true }
        });
        if (!payment) {
            throw new Error('Payment not found');
        }
        // Update payment status
        const updatedPayment = await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'CONFIRMED',
                confirmedAt: new Date()
            }
        });
        // Trigger treasury rebalancing
        await this.rebalanceTreasury(payment.businessId);
        return updatedPayment;
    }
    async rebalanceTreasury(businessId) {
        const business = await this.prisma.business.findUnique({
            where: { id: businessId },
            include: { yieldStrategies: true }
        });
        if (!business) {
            throw new Error('Business not found');
        }
        // Get current treasury state from blockchain
        const treasuryInfo = await this.stacksService.getTreasuryInfo(business.walletAddress);
        // Record rebalancing operation
        const operation = await this.prisma.treasuryOperation.create({
            data: {
                businessId: businessId,
                operationType: 'REBALANCE',
                amount: 0, // Amount will be determined by smart contract
                status: 'PENDING'
            }
        });
        // For MVP, we simulate rebalancing completion
        await this.prisma.treasuryOperation.update({
            where: { id: operation.id },
            data: {
                status: 'COMPLETED',
                executedAt: new Date()
            }
        });
        return operation;
    }
    async getDashboardData(businessId) {
        const business = await this.prisma.business.findUnique({
            where: { id: businessId },
            include: {
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                treasuryOperations: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                yieldStrategies: {
                    where: { isActive: true }
                }
            }
        });
        if (!business) {
            throw new Error('Business not found');
        }
        // Calculate analytics
        const totalPayments = await this.prisma.payment.aggregate({
            where: {
                businessId: businessId,
                status: 'CONFIRMED'
            },
            _sum: { amount: true },
            _count: true
        });
        const totalYieldEarned = await this.prisma.yieldStrategy.aggregate({
            where: { businessId: businessId },
            _sum: { totalEarned: true }
        });
        // Get treasury info from blockchain
        const treasuryInfo = await this.stacksService.getTreasuryInfo(business.walletAddress);
        return {
            business,
            treasury: {
                liquidBalance: treasuryInfo.liquidBalance / 1000000, // Convert from microsBTC
                yieldBalance: treasuryInfo.yieldBalance / 1000000,
                totalBalance: treasuryInfo.totalBalance / 1000000,
                liquidityThreshold: treasuryInfo.liquidityThreshold / 100,
                currentAPY: 8.5, // Mock APY
                projectedYield: (treasuryInfo.yieldBalance / 1000000) * 0.085 / 12 // Monthly projection
            },
            analytics: {
                totalPaymentsAmount: totalPayments._sum.amount || 0,
                totalPaymentsCount: totalPayments._count,
                totalYieldEarned: totalYieldEarned._sum.totalEarned || 0,
                averagePayment: totalPayments._count > 0
                    ? (totalPayments._sum.amount || 0) / totalPayments._count
                    : 0
            }
        };
    }
    async createYieldStrategy(businessId, data) {
        return this.prisma.yieldStrategy.create({
            data: {
                businessId,
                protocol: data.protocol,
                allocation: data.allocation,
                currentAPY: data.currentAPY
            }
        });
    }
}
exports.TreasuryService = TreasuryService;
//# sourceMappingURL=treasury.service.js.map