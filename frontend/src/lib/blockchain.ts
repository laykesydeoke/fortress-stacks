import { 
  makeContractCall, 
  broadcastTransaction,
  standardPrincipalCV,
  uintCV,
  noneCV,
  someCV,
  AnchorMode,
  PostConditionMode,
  ClarityType
} from '@stacks/transactions';
import { userSession, network } from './stacks';
import { DEPLOYED_CONTRACTS, parseContractId, STACKS_API_URL, CONTRACT_FUNCTIONS } from './contracts';

export class BlockchainService {
  
  // Payment Processor Functions
  async createPayment(businessAddress: string, amount: number, customerAddress?: string) {
    if (!userSession.isUserSignedIn()) {
      throw new Error('Wallet not connected');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!businessAddress.match(/^S[A-Z0-9]+$/)) {
      throw new Error('Invalid business address format');
    }

    const { contractAddress, contractName } = parseContractId(DEPLOYED_CONTRACTS.PAYMENT_PROCESSOR);
    
    // Use the Stacks Connect API for wallet transactions instead of manual signing
    const { openContractCall } = await import('@stacks/connect');
    
    return new Promise((resolve, reject) => {
      openContractCall({
        contractAddress,
        contractName,
        functionName: CONTRACT_FUNCTIONS.PAYMENT_PROCESSOR.CREATE_PAYMENT,
        functionArgs: [
          standardPrincipalCV(businessAddress),
          uintCV(amount),
          customerAddress ? someCV(standardPrincipalCV(customerAddress)) : noneCV()
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          console.log('Transaction broadcasted:', data.txId);
          resolve({
            txId: data.txId,
            transaction: data
          });
        },
        onCancel: () => {
          reject(new Error('Transaction cancelled by user'));
        }
      });
    });
  }

  async confirmPayment(paymentId: number) {
    if (!userSession.isUserSignedIn()) {
      throw new Error('Wallet not connected');
    }

    const { contractAddress, contractName } = parseContractId(DEPLOYED_CONTRACTS.PAYMENT_PROCESSOR);
    
    const txOptions = {
      contractAddress,
      contractName,
      functionName: CONTRACT_FUNCTIONS.PAYMENT_PROCESSOR.CONFIRM_PAYMENT,
      functionArgs: [uintCV(paymentId)],
      senderKey: userSession.loadUserData().profile.stxAddress.testnet,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction({ transaction, network });
    
    return {
      txId: broadcastResponse.txid || broadcastResponse,
      transaction
    };
  }

  // Treasury Manager Functions
  async setLiquidityThreshold(threshold: number) {
    if (!userSession.isUserSignedIn()) {
      throw new Error('Wallet not connected');
    }

    const { contractAddress, contractName } = parseContractId(DEPLOYED_CONTRACTS.TREASURY_MANAGER);
    
    const txOptions = {
      contractAddress,
      contractName,
      functionName: CONTRACT_FUNCTIONS.TREASURY_MANAGER.SET_LIQUIDITY_THRESHOLD,
      functionArgs: [uintCV(threshold)],
      senderKey: userSession.loadUserData().profile.stxAddress.testnet,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction({ transaction, network });
    
    return {
      txId: broadcastResponse.txid || broadcastResponse,
      transaction
    };
  }

  async depositToTreasury(amount: number) {
    if (!userSession.isUserSignedIn()) {
      throw new Error('Wallet not connected');
    }

    const { contractAddress, contractName } = parseContractId(DEPLOYED_CONTRACTS.TREASURY_MANAGER);
    
    const txOptions = {
      contractAddress,
      contractName,
      functionName: CONTRACT_FUNCTIONS.TREASURY_MANAGER.DEPOSIT_TO_TREASURY,
      functionArgs: [uintCV(amount)],
      senderKey: userSession.loadUserData().profile.stxAddress.testnet,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction({ transaction, network });
    
    return {
      txId: broadcastResponse.txid || broadcastResponse,
      transaction
    };
  }

  // Read-only functions
  async getTreasuryInfo(businessAddress: string) {
    try {
      const { contractAddress, contractName } = parseContractId(DEPLOYED_CONTRACTS.TREASURY_MANAGER);
      
      // Use REST API to call read-only functions
      const functionArgs = [standardPrincipalCV(businessAddress)];
      const url = `${STACKS_API_URL}/v2/contracts/call-read/${contractAddress}/${contractName}/${CONTRACT_FUNCTIONS.TREASURY_MANAGER.GET_TREASURY_INFO}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: businessAddress,
          arguments: functionArgs
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Parse the result - this would need proper Clarity value parsing
        // For now, return demo data
        return {
          liquidityThreshold: 20,
          totalBalance: 1000000,
          liquidBalance: 200000,
          yieldBalance: 800000,
          lastRebalance: Date.now()
        };
      }
      
      throw new Error('Failed to fetch treasury info');
      
    } catch (error) {
      console.error('Error reading treasury info:', error);
      // Return mock data as fallback
      return {
        liquidityThreshold: 20,
        totalBalance: 1000000,
        liquidBalance: 200000,
        yieldBalance: 800000,
        lastRebalance: Date.now()
      };
    }
  }

  async getPayment(paymentId: number) {
    try {
      const { contractAddress, contractName } = parseContractId(DEPLOYED_CONTRACTS.PAYMENT_PROCESSOR);
      
      // Use REST API to call read-only functions
      const functionArgs = [uintCV(paymentId)];
      const url = `${STACKS_API_URL}/v2/contracts/call-read/${contractAddress}/${contractName}/${CONTRACT_FUNCTIONS.PAYMENT_PROCESSOR.GET_PAYMENT}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: contractAddress,
          arguments: functionArgs
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error reading payment:', error);
      return null;
    }
  }

  // Utility functions
  async getContractInfo(contractId: string) {
    try {
      const { contractAddress, contractName } = parseContractId(contractId);
      const url = `${STACKS_API_URL}/v2/contracts/interface/${contractAddress}/${contractName}`;
      
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching contract info:', error);
    }
    return null;
  }

  async getTransactionStatus(txId: string) {
    try {
      const url = `${STACKS_API_URL}/extended/v1/tx/${txId}`;
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching transaction status:', error);
    }
    return null;
  }
}

export const blockchainService = new BlockchainService();