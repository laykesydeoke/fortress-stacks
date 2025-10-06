// Real sBTC Protocol Integration - FortressStacks Treasury
import { OFFICIAL_SBTC_CONTRACTS, SBTC_FUNCTIONS } from './contracts';

export class SBTCProtocolService {
  private network: 'testnet' | 'mainnet';

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
  }
  
  // Get REAL sBTC balance for any address
  async getSBTCBalance(address: string): Promise<number> {
    try {
      console.log('🔍 Fetching REAL sBTC balance for:', address);
      
      const apiUrl = this.network === 'mainnet' 
        ? 'https://api.hiro.so' 
        : 'https://api.testnet.hiro.so';
      
      const response = await fetch(
        `${apiUrl}/extended/v1/address/${address}/balances`
      );

      if (!response.ok) {
        console.warn('Balance fetch failed:', response.status);
        return 0;
      }

      const balanceData = await response.json();
      console.log('📊 Raw balance data:', balanceData);
      
      // Check for sBTC tokens using multiple possible contract formats
      const possibleKeys = [
        `${OFFICIAL_SBTC_CONTRACTS.SBTC_TOKEN}::sbtc-token`,
        `${OFFICIAL_SBTC_CONTRACTS.SBTC_TOKEN}::sbtc`,
        `${OFFICIAL_SBTC_CONTRACTS.SBTC_TOKEN}::token`,
        OFFICIAL_SBTC_CONTRACTS.SBTC_TOKEN
      ];
      
      console.log('🔍 Checking for sBTC with keys:', possibleKeys);
      
      if (balanceData.fungible_tokens) {
        console.log('📝 Available fungible tokens:', Object.keys(balanceData.fungible_tokens));
        
        for (const key of possibleKeys) {
          if (balanceData.fungible_tokens[key]) {
            const balanceStr = balanceData.fungible_tokens[key].balance;
            const balanceSats = parseInt(balanceStr || '0');
            const sbtcBalance = balanceSats / 100000000; // Convert to sBTC
            console.log(`✅ Found sBTC balance with key ${key}:`, sbtcBalance);
            return sbtcBalance;
          }
        }
        
        // Check for any token that might be sBTC
        for (const [tokenKey, tokenData] of Object.entries(balanceData.fungible_tokens)) {
          if (tokenKey.toLowerCase().includes('sbtc') || tokenKey.toLowerCase().includes('bitcoin')) {
            console.log(`🔍 Found potential sBTC token: ${tokenKey}`, tokenData);
            const balanceStr = (tokenData as any).balance;
            const balanceSats = parseInt(balanceStr || '0');
            const sbtcBalance = balanceSats / 100000000;
            console.log(`✅ Using balance from ${tokenKey}:`, sbtcBalance);
            return sbtcBalance;
          }
        }
      }
      
      console.log('ℹ️  No sBTC balance found');
      return 0;
    } catch (error) {
      console.error('❌ Error fetching sBTC balance:', error);
      return 0;
    }
  }

  // Test STX transfer first (for debugging wallet popup)
  async testSTXTransfer(amount: number, recipient: string): Promise<string> {
    try {
      console.log('🧪 Testing STX transfer to verify wallet popup:', { amount, recipient });
      
      const { openSTXTransfer } = await import('@stacks/connect');
      const { network } = await import('@/lib/stacks');

      const amountMicroSTX = Math.floor(amount * 1000000); // Convert STX to microSTX

      return new Promise((resolve, reject) => {
        openSTXTransfer({
          recipient,
          amount: amountMicroSTX.toString(),
          memo: 'FortressStacks test transfer',
          network,
          appDetails: {
            name: 'FortressStacks Treasury',
            icon: window.location.origin + '/encheq-logo.png',
          },
          onFinish: (data) => {
            console.log('✅ STX transfer test successful:', data);
            resolve(data.txId);
          },
          onCancel: () => {
            console.log('❌ STX transfer cancelled by user');
            reject(new Error('Transaction cancelled by user'));
          }
        });
      });
    } catch (error) {
      console.error('💥 STX transfer test failed:', error);
      throw error;
    }
  }

  // Transfer REAL sBTC using SIP-010 standard
  async transferSBTC(amount: number, recipient: string): Promise<string> {
    console.log('🚀 Starting REAL sBTC transfer:', { amount, recipient });
    
    const { isUserSignedIn, getUserData, network } = await import('@/lib/stacks');
    const { openContractCall } = await import('@stacks/connect');
    const { uintCV, standardPrincipalCV, noneCV, PostConditionMode } = await import('@stacks/transactions');
    
    if (!isUserSignedIn()) {
      throw new Error('Please connect your wallet first');
    }

    const userData = getUserData();
    const senderAddress = userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet;

    if (!senderAddress) {
      throw new Error('No sender address found');
    }

    const [contractAddress, contractName] = OFFICIAL_SBTC_CONTRACTS.SBTC_TOKEN.split('.');
    const amountSats = Math.floor(amount * 100000000); // Convert sBTC to satoshis

    console.log('📋 sBTC Contract call details:', {
      contractAddress,
      contractName,
      functionName: 'transfer',
      amountSats,
      recipient,
      sender: senderAddress
    });

    return new Promise((resolve, reject) => {
      openContractCall({
        network,
        contractAddress,
        contractName,
        functionName: 'transfer',
        functionArgs: [
          uintCV(amountSats),
          standardPrincipalCV(senderAddress), // sender
          standardPrincipalCV(recipient), // recipient  
          noneCV() // memo (optional)
        ],
        postConditions: [],
        postConditionMode: PostConditionMode.Allow,
        appDetails: {
          name: 'Encheq Treasury',
          icon: window.location.origin + '/favicon.ico',
        },
        onFinish: (data) => {
          console.log('✅ REAL sBTC transfer successful:', data);
          resolve(data.txId);
        },
        onCancel: () => {
          console.log('❌ Transaction cancelled by user');
          reject(new Error('Transaction cancelled by user'));
        }
      });
    });
  }

  // Get sBTC from testnet faucet
  async requestFromFaucet(): Promise<void> {
    console.log('🚰 Opening sBTC faucet...');
    window.open('https://platform.hiro.so/faucet', '_blank');
  }

  // Check if address has any sBTC for UI feedback
  async hasSBTC(address: string): Promise<boolean> {
    const balance = await this.getSBTCBalance(address);
    return balance > 0;
  }
}

// Export singleton for the appropriate network
export const sbtcProtocol = new SBTCProtocolService(
  process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
);

// Helper function to get the protocol instance
export function getSBTCProtocol(network?: 'testnet' | 'mainnet'): SBTCProtocolService {
  const targetNetwork = network || (process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'mainnet' : 'testnet');
  return new SBTCProtocolService(targetNetwork);
}