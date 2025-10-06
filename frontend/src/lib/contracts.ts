// Contract utilities for FortressStacks Treasury

// Real sBTC Contract addresses for working MVP
export const OFFICIAL_SBTC_CONTRACTS = {
  // Your deployed sBTC token contract on testnet
  SBTC_TOKEN: 'ST381F1FY7JNH8MWAD1MMRQ8BPKV3BQ06N6H0JRAE.sbtc-token',
  SBTC_DEPOSIT: 'ST3A5HQKQM3T3BV1MCZ45S6Q729V8355BQ0W0NP2V.sbtc-deposit', 
  SBTC_WITHDRAWAL: 'ST3A5HQKQM3T3BV1MCZ45S6Q729V8355BQ0W0NP2V.sbtc-withdrawal',
  SBTC_REGISTRY: 'ST3A5HQKQM3T3BV1MCZ45S6Q729V8355BQ0W0NP2V.sbtc-registry',
} as const;

export const DEPLOYED_CONTRACTS = {
  PAYMENT_PROCESSOR: process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_CONTRACT || 'ST381F1FY7JNH8MWAD1MMRQ8BPKV3BQ06N6H0JRAE.payment-processor',
  TREASURY_MANAGER: process.env.NEXT_PUBLIC_TREASURY_MANAGER_CONTRACT || 'ST381F1FY7JNH8MWAD1MMRQ8BPKV3BQ06N6H0JRAE.treasury-manager',
  YIELD_STRATEGY: process.env.NEXT_PUBLIC_YIELD_STRATEGY_CONTRACT || 'ST381F1FY7JNH8MWAD1MMRQ8BPKV3BQ06N6H0JRAE.yield-strategy'
} as const;

export const STACKS_API_URL = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
  ? 'https://api.hiro.so' 
  : 'https://api.testnet.hiro.so';

export const SBTC_FUNCTIONS = {
  TOKEN: {
    TRANSFER: 'transfer',
    GET_BALANCE: 'get-balance',
    GET_TOTAL_SUPPLY: 'get-total-supply',
    GET_NAME: 'get-name',
    GET_SYMBOL: 'get-symbol',
    GET_DECIMALS: 'get-decimals'
  }
} as const;

export function parseContractId(contractId: string) {
  const [contractAddress, contractName] = contractId.split('.');
  return { contractAddress, contractName };
}

export function getContractUrl(contractId: string) {
  const { contractAddress, contractName } = parseContractId(contractId);
  const baseUrl = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
    ? 'https://explorer.stacks.co' 
    : 'https://explorer.stacks.co/?chain=testnet';
  return `${baseUrl}/txid/${contractAddress}.${contractName}`;
}

// Contract function signatures
export const CONTRACT_FUNCTIONS = {
  PAYMENT_PROCESSOR: {
    CREATE_PAYMENT: 'create-payment',
    CONFIRM_PAYMENT: 'confirm-payment',
    GET_PAYMENT: 'get-payment',
    REFUND_PAYMENT: 'refund-payment'
  },
  TREASURY_MANAGER: {
    SET_LIQUIDITY_THRESHOLD: 'set-liquidity-threshold',
    DEPOSIT_TO_TREASURY: 'deposit-to-treasury',
    WITHDRAW_LIQUIDITY: 'withdraw-liquidity',
    EMERGENCY_WITHDRAW_ALL: 'emergency-withdraw-all',
    GET_TREASURY_INFO: 'get-treasury-info',
    CALCULATE_OPTIMAL_ALLOCATION: 'calculate-optimal-allocation'
  },
  YIELD_STRATEGY: {
    CREATE_STRATEGY: 'create-strategy',
    DEPOSIT_TO_STRATEGY: 'deposit-to-strategy',
    HARVEST_YIELD: 'harvest-yield',
    WITHDRAW_FROM_STRATEGY: 'withdraw-from-strategy',
    DEACTIVATE_STRATEGY: 'deactivate-strategy',
    GET_STRATEGY: 'get-strategy',
    GET_BUSINESS_STRATEGIES: 'get-business-strategies',
    CALCULATE_TOTAL_YIELD: 'calculate-total-yield'
  }
} as const;