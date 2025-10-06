export declare class StacksService {
    private network;
    private contractAddress;
    constructor();
    createPayment(businessAddress: string, amount: number, customerAddress?: string): Promise<{
        txId: string | import("@stacks/transactions").TxBroadcastResultOk;
        transaction: import("@stacks/transactions").StacksTransactionWire;
    }>;
    depositToTreasury(businessPrivateKey: string, amount: number): Promise<{
        txId: string | import("@stacks/transactions").TxBroadcastResultOk;
        transaction: import("@stacks/transactions").StacksTransactionWire;
    }>;
    setLiquidityThreshold(businessPrivateKey: string, threshold: number): Promise<{
        txId: string | import("@stacks/transactions").TxBroadcastResultOk;
        transaction: import("@stacks/transactions").StacksTransactionWire;
    }>;
    getTreasuryInfo(businessAddress: string): Promise<{
        liquidityThreshold: number;
        totalBalance: number;
        liquidBalance: number;
        yieldBalance: number;
        lastRebalance: number;
    }>;
    generateWalletAddress(): {
        address: string;
        privateKey: string;
    };
}
//# sourceMappingURL=stacks.service.d.ts.map