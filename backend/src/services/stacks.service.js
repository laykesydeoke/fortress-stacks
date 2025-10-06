"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StacksService = void 0;
const transactions_1 = require("@stacks/transactions");
const network_1 = require("@stacks/network");
class StacksService {
    network;
    contractAddress;
    constructor() {
        this.network = process.env.NODE_ENV === 'production'
            ? new network_1.StacksMainnet()
            : new network_1.StacksTestnet();
        this.contractAddress = process.env.CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    }
    async createPayment(businessAddress, amount, customerAddress) {
        const txOptions = {
            contractAddress: this.contractAddress,
            contractName: 'payment-processor',
            functionName: 'create-payment',
            functionArgs: [
                (0, transactions_1.standardPrincipalCV)(businessAddress),
                (0, transactions_1.uintCV)(amount),
                customerAddress ? (0, transactions_1.someCV)((0, transactions_1.standardPrincipalCV)(customerAddress)) : (0, transactions_1.noneCV)()
            ],
            senderKey: process.env.PRIVATE_KEY || '',
            network: this.network,
            anchorMode: transactions_1.AnchorMode.Any,
        };
        const transaction = await (0, transactions_1.makeContractCall)(txOptions);
        const broadcastResponse = await (0, transactions_1.broadcastTransaction)(transaction, this.network);
        return {
            txId: broadcastResponse.txid || broadcastResponse,
            transaction
        };
    }
    async depositToTreasury(businessPrivateKey, amount) {
        const txOptions = {
            contractAddress: this.contractAddress,
            contractName: 'treasury-manager',
            functionName: 'deposit-to-treasury',
            functionArgs: [(0, transactions_1.uintCV)(amount)],
            senderKey: businessPrivateKey,
            network: this.network,
            anchorMode: transactions_1.AnchorMode.Any,
        };
        const transaction = await (0, transactions_1.makeContractCall)(txOptions);
        const broadcastResponse = await (0, transactions_1.broadcastTransaction)(transaction, this.network);
        return {
            txId: broadcastResponse.txid || broadcastResponse,
            transaction
        };
    }
    async setLiquidityThreshold(businessPrivateKey, threshold) {
        const txOptions = {
            contractAddress: this.contractAddress,
            contractName: 'treasury-manager',
            functionName: 'set-liquidity-threshold',
            functionArgs: [(0, transactions_1.uintCV)(threshold)],
            senderKey: businessPrivateKey,
            network: this.network,
            anchorMode: transactions_1.AnchorMode.Any,
        };
        const transaction = await (0, transactions_1.makeContractCall)(txOptions);
        const broadcastResponse = await (0, transactions_1.broadcastTransaction)(transaction, this.network);
        return {
            txId: broadcastResponse.txid || broadcastResponse,
            transaction
        };
    }
    async getTreasuryInfo(businessAddress) {
        // In a real implementation, this would use Stacks API to read contract state
        // For MVP, we return mock data
        return {
            liquidityThreshold: 20,
            totalBalance: 1000000, // in microsBTC
            liquidBalance: 200000,
            yieldBalance: 800000,
            lastRebalance: Date.now()
        };
    }
    generateWalletAddress() {
        const privateKey = (0, transactions_1.createStacksPrivateKey)();
        const address = (0, transactions_1.getAddressFromPrivateKey)(privateKey.data, this.network.version === transactions_1.TransactionVersion.Mainnet ? transactions_1.TransactionVersion.Mainnet : transactions_1.TransactionVersion.Testnet);
        return {
            address,
            privateKey: privateKey.data
        };
    }
}
exports.StacksService = StacksService;
//# sourceMappingURL=stacks.service.js.map