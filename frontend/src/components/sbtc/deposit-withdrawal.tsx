'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ExternalLink, 
  Bitcoin, 
  Zap,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { sbtcProtocol, SBTCProtocolService, SBTCOperation } from '@/lib/sbtc-protocol';
import { isUserSignedIn } from '@/lib/stacks';

interface DepositWithdrawalProps {
  userAddress?: string;
  onBalanceChange?: () => void;
}

export function DepositWithdrawal({ userAddress, onBalanceChange }: DepositWithdrawalProps) {
  const [sbtcBalance, setSbtcBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [maxFee, setMaxFee] = useState('10000'); // Default 10k sats
  const [operations, setOperations] = useState<SBTCOperation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userAddress) {
      fetchSbtcBalance();
      fetchRecentOperations();
    }
  }, [userAddress]);

  const fetchSbtcBalance = async () => {
    if (!userAddress) return;
    
    try {
      const balance = await sbtcProtocol.getSBTCBalance(userAddress);
      setSbtcBalance(balance);
    } catch (error) {
      console.error('Error fetching sBTC balance:', error);
    }
  };

  const fetchRecentOperations = async () => {
    // In a real implementation, this would fetch user's recent deposits/withdrawals
    // For now, we'll show example operations
    setOperations([
      {
        id: 'deposit_example_1',
        type: 'deposit',
        status: 'confirmed',
        amount: 0.001,
        bitcoin_tx_id: '1ca44721135c00a170cbec406733f25d9621e0598c011c78246c2fe173c4c9aa',
        stacks_tx_id: '0x' + '1'.repeat(64),
        created_at: new Date(Date.now() - 86400000).toISOString() // 24 hours ago
      }
    ]);
  };

  const handleDeposit = () => {
    // Redirect to official sBTC bridge
    window.open(SBTCProtocolService.getBridgeURL(), '_blank');
  };

  const handleWithdrawal = async () => {
    if (!userAddress || !isUserSignedIn()) {
      setError('Please connect your wallet first');
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid withdrawal amount');
      return;
    }

    if (!bitcoinAddress) {
      setError('Please enter a valid Bitcoin address');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const amount = parseFloat(withdrawAmount);
      const maxFeeAmount = parseInt(maxFee);

      console.log('Initiating sBTC withdrawal...', {
        amount,
        bitcoinAddress,
        maxFeeAmount
      });

      const txId = await sbtcProtocol.initiateWithdrawal(amount, bitcoinAddress, maxFeeAmount);
      
      console.log('✅ Withdrawal initiated:', txId);

      // Add to operations list
      const newOperation: SBTCOperation = {
        id: txId,
        type: 'withdrawal',
        status: 'pending',
        amount: amount,
        stacks_tx_id: txId,
        created_at: new Date().toISOString()
      };

      setOperations(prev => [newOperation, ...prev]);

      // Reset form
      setWithdrawAmount('');
      setBitcoinAddress('');

      // Refresh balance
      setTimeout(() => {
        fetchSbtcBalance();
        onBalanceChange?.();
      }, 1000);

    } catch (error) {
      console.error('Withdrawal failed:', error);
      setError(error instanceof Error ? error.message : 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: SBTCOperation['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(8)} sBTC`;
  };

  const formatBitcoinAmount = (sats: number) => {
    return `${(sats / 100000000).toFixed(8)} BTC`;
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bitcoin className="h-5 w-5 text-orange-500" />
            <span>sBTC Balance</span>
          </CardTitle>
          <CardDescription>
            Your Bitcoin on Stacks - 1:1 peg with Bitcoin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatAmount(sbtcBalance)}
          </div>
          <p className="text-sm text-muted-foreground">
            ≈ ${(sbtcBalance * 65000).toLocaleString()} USD
          </p>
        </CardContent>
      </Card>

      {/* Deposit/Withdrawal Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit & Withdraw sBTC</CardTitle>
          <CardDescription>
            Convert between Bitcoin and sBTC using the official bridge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="deposit">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit">
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Deposit BTC → sBTC
              </TabsTrigger>
              <TabsTrigger value="withdraw">
                <ArrowUpFromLine className="h-4 w-4 mr-2" />
                Withdraw sBTC → BTC
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="bg-muted rounded-lg p-6">
                  <Bitcoin className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Deposit Bitcoin to get sBTC</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use the official sBTC bridge to convert your Bitcoin to sBTC. 
                    Your Bitcoin will be locked and you'll receive sBTC 1:1 on Stacks.
                  </p>
                  
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• Minimum deposit: 0.00001 BTC</p>
                    <p>• Network fee: ~80,000 sats (deducted from minted sBTC)</p>
                    <p>• Processing time: 2-6 Bitcoin confirmations</p>
                    <p>• Wallet required: Leather or Xverse</p>
                  </div>
                </div>

                <Button onClick={handleDeposit} size="lg" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open sBTC Bridge (app.stacks.co)
                </Button>

                <p className="text-xs text-muted-foreground">
                  You'll be redirected to the official sBTC bridge at app.stacks.co
                </p>
              </div>
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="withdraw-amount">Amount to Withdraw (sBTC)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    step="0.00000001"
                    min="0.00001"
                    max={sbtcBalance}
                    placeholder="0.001"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {formatAmount(sbtcBalance)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="bitcoin-address">Bitcoin Address</Label>
                  <Input
                    id="bitcoin-address"
                    placeholder="bc1q... or 1... or 3..."
                    value={bitcoinAddress}
                    onChange={(e) => setBitcoinAddress(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the Bitcoin address where you want to receive your BTC
                  </p>
                </div>

                <div>
                  <Label htmlFor="max-fee">Maximum Network Fee (sats)</Label>
                  <Input
                    id="max-fee"
                    type="number"
                    min="1000"
                    max="100000"
                    placeholder="10000"
                    value={maxFee}
                    onChange={(e) => setMaxFee(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum Bitcoin network fee you're willing to pay (recommended: 10,000-50,000 sats)
                  </p>
                </div>

                <Button 
                  onClick={handleWithdrawal}
                  disabled={loading || !withdrawAmount || !bitcoinAddress || !userAddress}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Initiating Withdrawal...
                    </>
                  ) : (
                    <>
                      <ArrowUpFromLine className="h-4 w-4 mr-2" />
                      Initiate Withdrawal
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Withdrawal requests are processed by sBTC signers</p>
                  <p>• Processing time: 2-6 hours after signing</p>
                  <p>• Bitcoin confirmation: ~10-60 minutes</p>
                  <p>• Network fees are deducted from withdrawal amount</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Operations</CardTitle>
          <CardDescription>
            Your recent sBTC deposits and withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {operations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Bitcoin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No operations yet</p>
              <p className="text-xs">Your deposits and withdrawals will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {operations.map((op) => (
                <div key={op.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(op.status)}
                    <div>
                      <div className="font-medium">
                        {op.type === 'deposit' ? 'BTC → sBTC' : 'sBTC → BTC'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatAmount(op.amount)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant={
                      op.status === 'confirmed' ? 'default' :
                      op.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {op.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(op.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* sBTC Info */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-800">About sBTC</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-orange-700 space-y-2">
          <p>• <strong>1:1 Bitcoin Peg:</strong> 1 sBTC always equals 1 BTC</p>
          <p>• <strong>Programmable:</strong> Use Bitcoin in smart contracts and DeFi</p>
          <p>• <strong>Bitcoin Security:</strong> Secured by Bitcoin's proof-of-work</p>
          <p>• <strong>Fast Transactions:</strong> Instant confirmation on Stacks</p>
          <p>• <strong>SIP-010 Token:</strong> Standard fungible token on Stacks</p>
          <div className="pt-2">
            <Button variant="outline" size="sm" asChild>
              <a 
                href={SBTCProtocolService.getRewardsURL()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-700"
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Earn Rewards with sBTC
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}