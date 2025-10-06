'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink, 
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { blockchainService } from '@/lib/blockchain';
import { stacksAPI, StacksTransaction } from '@/lib/stacks-api';
import { api } from '@/lib/api';
import { isUserSignedIn } from '@/lib/stacks';
import { DEPLOYED_CONTRACTS } from '@/lib/contracts';

interface Transaction {
  id: string;
  type: 'payment' | 'deposit' | 'withdrawal' | 'rebalance';
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  txId?: string;
  timestamp: Date;
  description: string;
  fromAddress?: string;
  toAddress?: string;
}

interface TransactionHistoryProps {
  businessId: string;
  businessAddress?: string;
}

export function TransactionHistory({ businessId, businessAddress }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchTransactions();
  }, [businessId, businessAddress]);

  // Helper function to convert Stacks transactions to our format
  const convertStacksTransaction = (tx: StacksTransaction, userAddress: string): Transaction | null => {
    try {
      const baseTransaction = {
        id: tx.tx_id,
        status: tx.tx_status === 'success' ? 'confirmed' as const : 
                tx.tx_status === 'pending' ? 'pending' as const : 'failed' as const,
        txId: tx.tx_id,
        timestamp: stacksAPI.formatBlockTime(tx.burn_block_time),
        fromAddress: tx.sender_address
      };

      // Handle different transaction types
      if (tx.tx_type === 'contract_call' && tx.contract_call) {
        const contractId = tx.contract_call.contract_id;
        const functionName = tx.contract_call.function_name;

        // Payment processor transactions
        if (contractId === DEPLOYED_CONTRACTS.PAYMENT_PROCESSOR) {
          if (functionName === 'create-payment') {
            return {
              ...baseTransaction,
              type: 'payment',
              amount: 0.001, // Would need to parse from function args
              description: 'Payment created',
              toAddress: userAddress
            };
          }
          if (functionName === 'confirm-payment') {
            return {
              ...baseTransaction,
              type: 'payment',
              amount: 0.001, // Would need to parse from function args
              description: 'Payment confirmed',
              toAddress: userAddress
            };
          }
        }

        // Treasury manager transactions
        if (contractId === DEPLOYED_CONTRACTS.TREASURY_MANAGER) {
          if (functionName === 'deposit-to-treasury') {
            return {
              ...baseTransaction,
              type: 'deposit',
              amount: 0.1, // Would need to parse from function args
              description: 'Treasury deposit',
              toAddress: userAddress
            };
          }
          if (functionName === 'withdraw-liquidity') {
            return {
              ...baseTransaction,
              type: 'withdrawal',
              amount: 0.05, // Would need to parse from function args
              description: 'Liquidity withdrawal',
              fromAddress: userAddress
            };
          }
        }

        // Generic contract call
        return {
          ...baseTransaction,
          type: 'rebalance',
          amount: 0,
          description: `Contract call: ${functionName}`,
          toAddress: contractId
        };
      }

      // Token transfers
      if (tx.tx_type === 'token_transfer' && tx.token_transfer) {
        const isReceiving = tx.token_transfer.recipient_address === userAddress;
        const amount = stacksAPI.microStxToStx(tx.token_transfer.amount);
        
        return {
          ...baseTransaction,
          type: isReceiving ? 'deposit' : 'withdrawal',
          amount: amount,
          description: isReceiving ? 'STX received' : 'STX sent',
          toAddress: tx.token_transfer.recipient_address,
          fromAddress: tx.sender_address
        };
      }

      return null;
    } catch (error) {
      console.error('Error converting transaction:', error);
      return null;
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (businessAddress) {
        try {
          console.log('Fetching real transactions from Stacks API...');
          
          // Get all transactions for the business address
          const addressTransactions = await stacksAPI.getAddressTransactions(businessAddress, 50);
          
          // Get contract-specific transactions
          const contractTransactions = await Promise.all([
            stacksAPI.getContractTransactions(DEPLOYED_CONTRACTS.PAYMENT_PROCESSOR),
            stacksAPI.getContractTransactions(DEPLOYED_CONTRACTS.TREASURY_MANAGER),
            stacksAPI.getContractTransactions(DEPLOYED_CONTRACTS.YIELD_STRATEGY)
          ]);

          // Convert Stacks transactions to our format
          let allTransactions: Transaction[] = [];

          // Process address transactions
          addressTransactions.forEach((tx: StacksTransaction) => {
            const transaction = convertStacksTransaction(tx, businessAddress);
            if (transaction) {
              allTransactions.push(transaction);
            }
          });

          // Process contract transactions
          contractTransactions.flat().forEach((tx: StacksTransaction) => {
            const transaction = convertStacksTransaction(tx, businessAddress);
            if (transaction && !allTransactions.find(t => t.id === transaction.id)) {
              allTransactions.push(transaction);
            }
          });

          if (allTransactions.length > 0) {
            // Sort by timestamp (newest first)
            allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setTransactions(allTransactions);
            console.log(`Loaded ${allTransactions.length} real transactions`);
            return;
          }
        } catch (blockchainError) {
          console.warn('Stacks API fetch failed:', blockchainError);
          setError('Could not fetch real transactions. Using demo data.');
        }
      }

      // Fallback to demo data
      const demoTransactions = getDemoTransactions();
      setTransactions(demoTransactions);
      if (!businessAddress) {
        setError('Connect wallet to see real transaction history.');
      }
      
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transaction history. Using demo data.');
      setTransactions(getDemoTransactions());
    } finally {
      setLoading(false);
    }
  };


  const getDemoTransactions = (): Transaction[] => {
    return [
      {
        id: '1',
        type: 'payment',
        amount: 0.05,
        status: 'confirmed',
        txId: '0x1234567890abcdef1234567890abcdef12345678',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        description: 'Payment received',
        fromAddress: 'ST1CUSTOMER123...',
        toAddress: businessAddress
      },
      {
        id: '2',
        type: 'rebalance',
        amount: 0.8,
        status: 'confirmed',
        txId: '0xabcdef1234567890abcdef1234567890abcdef12',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        description: 'Auto-rebalance: 80% to yield strategies',
        toAddress: businessAddress
      },
      {
        id: '3',
        type: 'payment',
        amount: 0.025,
        status: 'pending',
        txId: '0x567890abcdef1234567890abcdef1234567890ab',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        description: 'Payment pending confirmation',
        fromAddress: 'ST2CUSTOMER456...',
        toAddress: businessAddress
      },
      {
        id: '4',
        type: 'deposit',
        amount: 1.0,
        status: 'confirmed',
        txId: '0x90abcdef1234567890abcdef1234567890abcdef',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        description: 'Initial treasury deposit',
        toAddress: businessAddress
      }
    ];
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      confirmed: 'default',
      pending: 'secondary',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'payment':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-blue-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'rebalance':
        return <RefreshCw className="h-4 w-4 text-purple-600" />;
    }
  };

  const formatAmount = (amount: number, type: Transaction['type']) => {
    const sign = type === 'withdrawal' ? '-' : '+';
    return `${sign}${amount.toFixed(6)} sBTC`;
  };

  const getExplorerUrl = (txId: string) => {
    return `https://explorer.stacks.co/txid/${txId}?chain=testnet`;
  };

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Loading transaction data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Transaction History
          <Button onClick={fetchTransactions} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          Track payments, deposits, and treasury operations
          {businessAddress && isUserSignedIn() && (
            <span className="block text-xs mt-1">
              <Badge variant="secondary" className="text-xs">Real-time blockchain data</Badge>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-8 w-8 mx-auto mb-2" />
            <p>No transactions found</p>
            <p className="text-xs">Complete your first payment to see transactions here</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(tx.type)}
                      <span className="capitalize">{tx.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tx.description}</div>
                      {tx.fromAddress && (
                        <div className="text-xs text-muted-foreground font-mono">
                          From: {tx.fromAddress.slice(0, 8)}...{tx.fromAddress.slice(-4)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatAmount(tx.amount, tx.type)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(tx.status)}
                      {getStatusBadge(tx.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tx.timestamp.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {tx.txId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getExplorerUrl(tx.txId!), '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {transactions.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm">
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}