'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Wallet, CreditCard } from 'lucide-react';
import { isUserSignedIn, connectWallet, getUserData } from '@/lib/stacks';
import { getSBTCProtocol } from '@/lib/sbtc-protocol';

interface CheckoutWidgetProps {
  onSuccess?: (txId: string, amount: number, recipient: string) => void;
  onError?: (error: string) => void;
  defaultRecipient?: string;
  allowCustomRecipient?: boolean;
}

export function CheckoutWidget({ 
  onSuccess,
  onError,
  defaultRecipient = '',
  allowCustomRecipient = true
}: CheckoutWidgetProps) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [sbtcBalance, setSbtcBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [testMode, setTestMode] = useState(false);

  const sbtcProtocol = getSBTCProtocol();
  const user = isUserSignedIn() ? getUserData() : null;
  const userAddress = user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet;

  // Check wallet connection and load balance
  useEffect(() => {
    setIsClient(true);
    const connected = isUserSignedIn();
    setWalletConnected(connected);
    
    if (connected && userAddress) {
      loadSbtcBalance();
    }
  }, [userAddress]);

  // Load user's sBTC balance
  const loadSbtcBalance = async () => {
    if (!userAddress) return;
    
    setLoadingBalance(true);
    try {
      console.log('Loading sBTC balance for:', userAddress);
      const balance = await sbtcProtocol.getSBTCBalance(userAddress);
      console.log('sBTC balance loaded:', balance);
      setSbtcBalance(balance);
    } catch (error) {
      console.error('Failed to load sBTC balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const isValidStacksAddress = (address: string): boolean => {
    if (!address) return false;
    // Testnet addresses can be 40 or 41 chars (ST + 38-39 chars), mainnet: S + 40 chars = 41 total
    const trimmed = address.trim();
    const isValid = /^ST[A-Z0-9]{38,39}$|^S[A-Z0-9]{40}$/.test(trimmed);
    console.log('Address validation:', { 
      original: address, 
      trimmed, 
      length: trimmed.length, 
      isValid, 
      isTestnet: trimmed.startsWith('ST'),
      regexTestST: /^ST[A-Z0-9]{38,39}$/.test(trimmed),
      regexTestS: /^S[A-Z0-9]{40}$/.test(trimmed)
    });
    return isValid;
  };

  // Debug the button disable conditions
  const getButtonDisableReason = () => {
    if (loading) return 'Loading...';
    if (!amount) return 'No amount entered';
    if (parseFloat(amount) <= 0) return 'Amount must be > 0';
    if (!testMode && parseFloat(amount) > sbtcBalance) return 'Insufficient sBTC balance';
    if (!recipient) return 'No recipient address';
    if (!isValidStacksAddress(recipient)) return 'Invalid Stacks address format';
    if (!walletConnected || !userAddress) return 'Wallet not connected';
    return null; // Button should be enabled
  };

  const handlePayment = async () => {
    console.log('💰 Processing REAL payment...');
    
    // Check wallet availability first
    const { checkWalletAvailability } = await import('@/lib/stacks');
    if (!checkWalletAvailability()) {
      onError?.('No Stacks wallet detected! Please install Leather, Xverse, or Hiro wallet.');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      onError?.('Please enter a valid amount');
      return;
    }

    if (!recipient || !isValidStacksAddress(recipient)) {
      onError?.('Please enter a valid Stacks address (starts with S)');
      return;
    }

    if (!walletConnected || !userAddress) {
      onError?.('Please connect your wallet first');
      return;
    }

    const amountNum = parseFloat(amount);
    
    // Balance check depends on test mode
    if (testMode) {
      // For STX test mode, we'll skip balance check since we're just testing wallet popup
      console.log('🧪 Test mode: skipping balance check');
    } else {
      if (amountNum > sbtcBalance) {
        onError?.(`Insufficient sBTC balance. You have ${sbtcBalance.toFixed(8)} sBTC`);
        return;
      }
    }

    setLoading(true);

    try {
      let transactionId: string;
      
      if (testMode) {
        // Test with STX transfer first to verify wallet popup
        console.log('🧪 Using STX test mode');
        transactionId = await sbtcProtocol.testSTXTransfer(amountNum, recipient);
      } else {
        // REAL sBTC transfer using official contract
        console.log('💰 Using real sBTC transfer');
        transactionId = await sbtcProtocol.transferSBTC(amountNum, recipient);
      }
      
      console.log('✅ Payment successful:', transactionId);
      setTxId(transactionId);
      onSuccess?.(transactionId, amountNum, recipient);
      
      // Refresh balance after payment
      setTimeout(loadSbtcBalance, 2000);
      
    } catch (error) {
      console.error('💥 Payment failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset payment form
  const resetForm = () => {
    setAmount('');
    setEmail('');
    setDescription('');
    setRecipient(defaultRecipient);
    setTxId(null);
    loadSbtcBalance();
  };

  if (!isClient) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-pulse">Loading payment widget...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>FortressStacks Payment</span>
        </CardTitle>
        <CardDescription>
          Professional sBTC payments with real blockchain integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!walletConnected ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Wallet className="h-8 w-8" />
              <span>Connect your wallet to pay</span>
            </div>
            <Button onClick={connectWallet} className="w-full">
              Connect Wallet
            </Button>
          </div>
        ) : txId ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="h-8 w-8" />
              <span className="font-semibold">Payment Successful!</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Transaction ID:
              </p>
              <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                {txId}
              </p>
            </div>
            <Button onClick={resetForm} variant="outline" className="w-full">
              Make Another Payment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Balance Display */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Your sBTC Balance:</span>
              <div className="flex items-center space-x-2">
                {loadingBalance ? (
                  <div className="animate-pulse">Loading...</div>
                ) : (
                  <span className="font-semibold">{sbtcBalance.toFixed(8)} sBTC</span>
                )}
                <Button variant="ghost" size="sm" onClick={loadSbtcBalance}>
                  Refresh
                </Button>
              </div>
            </div>

            {sbtcBalance === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need sBTC tokens to make payments.{' '}
                  <button 
                    onClick={() => sbtcProtocol.requestFromFaucet()}
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    Get testnet sBTC from faucet
                  </button>
                </AlertDescription>
              </Alert>
            )}

            {/* Payment Form */}
            <div className="space-y-4">
              {/* Recipient Address - DYNAMIC, NOT HARDCODED */}
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder=""
                  disabled={loading}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the Stacks address to send to (testnet: starts with 'ST', mainnet: starts with 'S')
                </p>
              </div>

              {/* Test Mode Toggle */}
              <div className="flex items-center space-x-2 p-3 bg-transparent border border-blue-500/30 rounded-lg">
                <input
                  type="checkbox"
                  id="testMode"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="cursor-pointer"
                />
                <Label htmlFor="testMode" className="cursor-pointer text-sm text-white">
                  Test Mode (use STX instead of sBTC to verify wallet popup works)
                </Label>
              </div>

              <div>
                <Label htmlFor="amount">Amount ({testMode ? 'STX' : 'sBTC'})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.00000001"
                  min="0.00000001"
                  max={sbtcBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.001"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {sbtcBalance.toFixed(8)} sBTC
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this payment for?"
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Debug Info */}
              {getButtonDisableReason() && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <strong>Button disabled:</strong> {getButtonDisableReason()}
                </div>
              )}

              <Button 
                onClick={handlePayment} 
                disabled={!!getButtonDisableReason()}
                className="w-full cursor-pointer bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </span>
                ) : testMode ? (
                  `🧪 Test Transfer ${amount || '0'} STX`
                ) : (
                  `💳 Pay ${amount || '0'} sBTC`
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Network Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="text-xs">
            {process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'Mainnet' : 'Testnet'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}