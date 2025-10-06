// Real Stacks blockchain API integration
import { STACKS_API_URL } from './contracts';

export interface StacksTransaction {
  tx_id: string;
  tx_status: 'success' | 'abort_by_response' | 'abort_by_post_condition' | 'pending';
  tx_type: 'contract_call' | 'token_transfer' | 'smart_contract' | 'coinbase' | 'poison_microblock';
  fee_rate: string;
  sender_address: string;
  sponsored: boolean;
  post_condition_mode: string;
  post_conditions: any[];
  anchor_mode: string;
  block_hash: string;
  block_height: number;
  burn_block_time: number;
  burn_block_time_iso: string;
  canonical: boolean;
  microblock_canonical: boolean;
  microblock_hash: string;
  microblock_sequence: number;
  parent_block_hash: string;
  parent_burn_block_time: number;
  parent_burn_block_time_iso: string;
  tx_index: number;
  tx_result: {
    hex: string;
    repr: string;
  };
  contract_call?: {
    contract_id: string;
    function_name: string;
    function_signature: string;
    function_args: any[];
  };
  token_transfer?: {
    recipient_address: string;
    amount: string;
    memo: string;
  };
}

export interface AddressBalance {
  stx: {
    balance: string;
    total_sent: string;
    total_received: string;
    lock_tx_id: string;
    locked: string;
    lock_height: number;
    burnchain_lock_height: number;
    burnchain_unlock_height: number;
  };
  fungible_tokens: Record<string, {
    balance: string;
    total_sent: string;
    total_received: string;
  }>;
  non_fungible_tokens: Record<string, {
    count: string;
    total_sent: string;
    total_received: string;
  }>;
}

export class StacksAPIService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = STACKS_API_URL;
    this.apiKey = process.env.NEXT_PUBLIC_HIRO_API_KEY;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    
    return headers;
  }

  async getAddressTransactions(address: string, limit: number = 50, offset: number = 0): Promise<StacksTransaction[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching address transactions:', error);
      return [];
    }
  }

  async getAddressBalance(address: string): Promise<AddressBalance | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/extended/v1/address/${address}/balances`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching address balance:', error);
      return null;
    }
  }

  async getContractTransactions(contractId: string, limit: number = 50): Promise<StacksTransaction[]> {
    try {
      const [contractAddress, contractName] = contractId.split('.');
      const response = await fetch(
        `${this.baseUrl}/extended/v1/contract/${contractAddress}.${contractName}/transactions?limit=${limit}`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Contract ${contractId} has no transactions yet (404) - this is normal for new contracts`);
          return [];
        }
        throw new Error(`Failed to fetch contract transactions: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.warn(`Contract transactions not available for ${contractId}:`, error);
      return [];
    }
  }

  async getTransaction(txId: string): Promise<StacksTransaction | null> {
    try {
      const response = await fetch(`${this.baseUrl}/extended/v1/tx/${txId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  async getContractInterface(contractId: string) {
    try {
      const [contractAddress, contractName] = contractId.split('.');
      const response = await fetch(
        `${this.baseUrl}/v2/contracts/interface/${contractAddress}/${contractName}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contract interface: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching contract interface:', error);
      return null;
    }
  }

  async callReadOnlyFunction(
    contractId: string,
    functionName: string,
    functionArgs: string[],
    sender: string
  ) {
    try {
      const [contractAddress, contractName] = contractId.split('.');
      const response = await fetch(
        `${this.baseUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender,
            arguments: functionArgs
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to call read-only function: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error calling read-only function:', error);
      return null;
    }
  }

  // Helper function to convert microSTX to STX
  microStxToStx(microStx: string): number {
    return parseInt(microStx) / 1000000;
  }

  // Helper function to format timestamp
  formatBlockTime(burnBlockTime: number): Date {
    return new Date(burnBlockTime * 1000);
  }

  // Get recent transactions for specific contract calls
  async getPaymentTransactions(businessAddress: string, contractId: string): Promise<any[]> {
    try {
      const transactions = await this.getAddressTransactions(businessAddress);
      
      return transactions.filter(tx => 
        tx.tx_type === 'contract_call' && 
        tx.contract_call?.contract_id === contractId &&
        (tx.contract_call?.function_name === 'create-payment' ||
         tx.contract_call?.function_name === 'confirm-payment')
      ).map(tx => ({
        id: tx.tx_id,
        type: tx.contract_call?.function_name === 'create-payment' ? 'payment' : 'confirmation',
        status: tx.tx_status === 'success' ? 'confirmed' : 
                tx.tx_status === 'pending' ? 'pending' : 'failed',
        txId: tx.tx_id,
        timestamp: this.formatBlockTime(tx.burn_block_time),
        blockHeight: tx.block_height,
        fee: this.microStxToStx(tx.fee_rate),
        functionName: tx.contract_call?.function_name,
        functionArgs: tx.contract_call?.function_args || []
      }));
    } catch (error) {
      console.error('Error fetching payment transactions:', error);
      return [];
    }
  }

  // Get STX balance in human readable format
  async getStxBalance(address: string): Promise<number> {
    try {
      const balance = await this.getAddressBalance(address);
      if (!balance) return 0;
      
      return this.microStxToStx(balance.stx.balance);
    } catch (error) {
      console.error('Error fetching STX balance:', error);
      return 0;
    }
  }

  // Get total transaction volume for an address
  async getTransactionVolume(address: string): Promise<{ sent: number; received: number }> {
    try {
      const balance = await this.getAddressBalance(address);
      if (!balance) return { sent: 0, received: 0 };
      
      return {
        sent: this.microStxToStx(balance.stx.total_sent),
        received: this.microStxToStx(balance.stx.total_received)
      };
    } catch (error) {
      console.error('Error fetching transaction volume:', error);
      return { sent: 0, received: 0 };
    }
  }
}

export const stacksAPI = new StacksAPIService();