import { PrismaClient } from '@prisma/client';
import { StacksService } from './stacks.service';
export declare class TreasuryService {
    private prisma;
    private stacksService;
    constructor(prisma: PrismaClient, stacksService: StacksService);
    createBusiness(data: {
        name: string;
        email: string;
        walletAddress: string;
        liquidityThreshold?: number;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        walletAddress: string;
        liquidityThreshold: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getBusinessByWallet(walletAddress: string): Promise<({
        payments: {
            id: string;
            createdAt: Date;
            businessId: string;
            amount: number;
            currency: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            transactionHash: string | null;
            customerEmail: string | null;
            description: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            confirmedAt: Date | null;
        }[];
        yieldStrategies: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            totalEarned: number;
            allocation: number;
            currentAPY: number;
            protocol: string;
        }[];
    } & {
        id: string;
        name: string;
        email: string;
        walletAddress: string;
        liquidityThreshold: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    processPayment(data: {
        businessId: string;
        amount: number;
        customerEmail?: string;
        description?: string;
    }): Promise<{
        transactionHash: string | import("@stacks/transactions").TxBroadcastResultOk;
        id: string;
        createdAt: Date;
        businessId: string;
        amount: number;
        currency: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        customerEmail: string | null;
        description: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        confirmedAt: Date | null;
    }>;
    confirmPayment(paymentId: string): Promise<{
        id: string;
        createdAt: Date;
        businessId: string;
        amount: number;
        currency: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        transactionHash: string | null;
        customerEmail: string | null;
        description: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        confirmedAt: Date | null;
    }>;
    rebalanceTreasury(businessId: string): Promise<{
        id: string;
        createdAt: Date;
        businessId: string;
        amount: number;
        status: import("@prisma/client").$Enums.OperationStatus;
        transactionHash: string | null;
        operationType: import("@prisma/client").$Enums.TreasuryOpType;
        sourceAddress: string | null;
        targetAddress: string | null;
        executedAt: Date | null;
    }>;
    getDashboardData(businessId: string): Promise<{
        business: {
            payments: {
                id: string;
                createdAt: Date;
                businessId: string;
                amount: number;
                currency: string;
                status: import("@prisma/client").$Enums.PaymentStatus;
                transactionHash: string | null;
                customerEmail: string | null;
                description: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                confirmedAt: Date | null;
            }[];
            treasuryOperations: {
                id: string;
                createdAt: Date;
                businessId: string;
                amount: number;
                status: import("@prisma/client").$Enums.OperationStatus;
                transactionHash: string | null;
                operationType: import("@prisma/client").$Enums.TreasuryOpType;
                sourceAddress: string | null;
                targetAddress: string | null;
                executedAt: Date | null;
            }[];
            yieldStrategies: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                businessId: string;
                totalEarned: number;
                allocation: number;
                currentAPY: number;
                protocol: string;
            }[];
        } & {
            id: string;
            name: string;
            email: string;
            walletAddress: string;
            liquidityThreshold: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        treasury: {
            liquidBalance: number;
            yieldBalance: number;
            totalBalance: number;
            liquidityThreshold: number;
            currentAPY: number;
            projectedYield: number;
        };
        analytics: {
            totalPaymentsAmount: number;
            totalPaymentsCount: number;
            totalYieldEarned: number;
            averagePayment: number;
        };
    }>;
    createYieldStrategy(businessId: string, data: {
        protocol: string;
        allocation: number;
        currentAPY: number;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        totalEarned: number;
        allocation: number;
        currentAPY: number;
        protocol: string;
    }>;
}
//# sourceMappingURL=treasury.service.d.ts.map