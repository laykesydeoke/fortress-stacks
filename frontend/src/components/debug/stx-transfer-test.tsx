'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isUserSignedIn, getUserData, testSTXTransfer } from '@/lib/stacks';

export function STXTransferTest() {
  const [amount, setAmount] = useState('0.001');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleSTXTransfer = async () => {
    if (!isUserSignedIn()) {
      setResult('❌ Please connect your wallet first');
      return;
    }

    const isValidStacksAddress = (address: string): boolean => {
      if (!address) return false;
      // Testnet addresses can be 40 or 41 chars (ST + 38-39 chars), mainnet: S + 40 chars = 41 total
      const trimmed = address.trim();
      return /^ST[A-Z0-9]{38,39}$|^S[A-Z0-9]{40}$/.test(trimmed);
    };

    if (!recipient || !isValidStacksAddress(recipient)) {
      setResult('❌ Please enter a valid Stacks address (testnet: ST..., mainnet: S...)');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setResult('❌ Please enter a valid amount');
      return;
    }

    setLoading(true);
    setResult('Testing STX transfer...');

    try {
      const amountMicroSTX = Math.floor(parseFloat(amount) * 1000000);
      
      // Use the centralized function
      const txId = await testSTXTransfer(recipient, amountMicroSTX.toString(), 'FortressStacks STX transfer test');
      setResult(`✅ SUCCESS! STX transfer worked. TX: ${txId}`);

    } catch (error) {
      console.error('💥 STX transfer test failed:', error);
      
      if (error instanceof Error && error.message === 'Transaction cancelled by user') {
        setResult('❌ Cancelled by user (but popup appeared!)');
      } else {
        setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const user = isUserSignedIn() ? getUserData() : null;
  const userAddress = user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet;

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧪 STX Transfer Test</CardTitle>
        <CardDescription>Test wallet popup with simple STX transfer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userAddress && (
          <div className="p-3 bg-transparent border border-green-500/30 rounded text-xs">
            <p className="text-white"><strong>Connected:</strong> {userAddress.slice(0, 8)}...</p>
          </div>
        )}

        <div>
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Stacks address (starts with S)"
            className="font-mono"
          />
        </div>

        <div>
          <Label htmlFor="amount">Amount (STX)</Label>
          <Input
            id="amount"
            type="number"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleSTXTransfer}
          disabled={loading || !recipient || !amount || !isUserSignedIn()}
          className="w-full cursor-pointer bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Testing...
            </span>
          ) : (
            '🚀 Test STX Transfer'
          )}
        </Button>
        
        {result && (
          <div className="p-3 bg-muted rounded text-sm">
            {result}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Purpose:</strong> Verify wallet popup works before trying sBTC</p>
          <p>If this works, then sBTC should work too with the right contract function</p>
        </div>
      </CardContent>
    </Card>
  );
}