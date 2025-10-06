import { AppConfig, UserSession, showConnect, openSTXTransfer, openContractCall } from '@stacks/connect';
import { StacksNetwork, STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const network = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
  ? STACKS_MAINNET 
  : STACKS_TESTNET;

export const connectWallet = () => {
  console.log('🔗 Connecting wallet...');
  
  try {
    showConnect({
      appDetails: {
        name: 'FortressStacks Treasury',
        icon: window.location.origin + '/fortress-logo.png',
      },
      redirectTo: window.location.pathname,
      onFinish: () => {
        console.log('✅ Wallet connected successfully');
        window.location.reload();
      },
      onCancel: () => {
        console.log('❌ Wallet connection cancelled');
      },
      userSession,
    });
  } catch (error) {
    console.error('💥 showConnect failed:', error);
    throw error;
  }
};

export const getUserData = () => {
  return userSession.loadUserData();
};

export const isUserSignedIn = () => {
  return userSession.isUserSignedIn();
};

export const signOut = () => {
  userSession.signUserOut();
  window.location.reload();
};

export const checkWalletAvailability = () => {
  const wallets = {
    leather: !!(window as any)?.LeatherProvider,
    xverse: !!(window as any)?.XverseProviders,
    hiro: !!(window as any)?.HiroWalletProvider,
    okx: !!(window as any)?.okxwallet?.stacks,
    asigna: !!(window as any)?.AsignaProvider
  };
  
  console.log('🔍 Wallet detection:', wallets);
  
  const availableWallets = Object.entries(wallets)
    .filter(([_, available]) => available)
    .map(([name, _]) => name);
    
  if (availableWallets.length === 0) {
    console.warn('❌ No Stacks wallets detected! Please install Leather, Xverse, or Hiro wallet.');
    return false;
  }
  
  console.log(`✅ Found ${availableWallets.length} wallet(s):`, availableWallets);
  return true;
};

// Direct wallet operations for testing
export const testSTXTransfer = async (recipient: string, amount: string, memo?: string) => {
  console.log('🧪 Testing STX transfer:', { recipient, amount, memo });
  
  return new Promise((resolve, reject) => {
    openSTXTransfer({
      recipient,
      amount, // in microSTX
      memo: memo || 'FortressStacks test transfer',
      network,
      appDetails: {
        name: 'FortressStacks Treasury',
        icon: window.location.origin + '/fortress-logo.png',
      },
      onFinish: (data) => {
        console.log('✅ STX transfer successful:', data);
        resolve(data.txId);
      },
      onCancel: () => {
        console.log('❌ STX transfer cancelled');
        reject(new Error('Transaction cancelled by user'));
      }
    });
  });
};

export const testContractCall = async (contractAddress: string, contractName: string, functionName: string, functionArgs: any[] = []) => {
  console.log('🧪 Testing contract call:', { contractAddress, contractName, functionName });
  
  return new Promise((resolve, reject) => {
    try {
      openContractCall({
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        network,
        appDetails: {
          name: 'FortressStacks Treasury',
          icon: window.location.origin + '/fortress-logo.png',
        },
        onFinish: (data) => {
          console.log('✅ Contract call successful:', data);
          resolve(data.txId);
        },
        onCancel: () => {
          console.log('❌ Contract call cancelled');
          reject(new Error('Transaction cancelled by user'));
        }
      });
    } catch (error) {
      console.error('💥 Contract call failed:', error);
      reject(error);
    }
  });
};