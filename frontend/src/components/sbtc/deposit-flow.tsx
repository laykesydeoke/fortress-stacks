'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, RefreshCw, Bitcoin, Info, TrendingUp } from 'lucide-react';
import { getSBTCProtocol } from '@/lib/sbtc-protocol';
import { isUserSignedIn, getUserData } from '@/lib/stacks';

interface DepositFlowProps {
  onDepositComplete?: (amount: number) => void;
}

export function DepositFlow({ onDepositComplete }: DepositFlowProps) {
  const [sbtcBalance, setSbtcBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  
  const sbtcProtocol = getSBTCProtocol();
  const user = isUserSignedIn() ? getUserData() : null;
  const stacksAddress = user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet;

  // Load current sBTC balance
  const loadBalance = async () => {
    if (!stacksAddress) return;
    
    setLoadingBalance(true);
    try {
      const balance = await sbtcProtocol.getSBTCBalance(stacksAddress);
      setSbtcBalance(balance);
      console.log('✅ Current sBTC balance:', balance);
    } catch (error) {
      console.error('Failed to load sBTC balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (stacksAddress) {
      loadBalance();
    }
  }, [stacksAddress]);

  if (!isUserSignedIn() || !stacksAddress) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Please connect your wallet to access sBTC bridge</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <img src="/fortress-logo.png" alt="FortressStacks" className="h-8 w-8" />
          <span>Bridge BTC → sBTC</span>
          <Badge variant="secondary">Official Bridge</Badge>
        </CardTitle>
        <CardDescription>
          Convert Bitcoin to sBTC using the official Stacks bridge
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current sBTC Balance */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-orange-900">Current sBTC Balance</h4>
              <p className="text-2xl font-bold text-orange-700">
                {loadingBalance ? '...' : sbtcBalance.toFixed(8)} sBTC
              </p>
              <p className="text-sm text-orange-600">
                ${(sbtcBalance * 65000).toFixed(2)} USD (estimated)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadBalance}
              disabled={loadingBalance}
            >
              <RefreshCw className={`h-4 w-4 ${loadingBalance ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Bridge Information */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Official sBTC Bridge:</strong> Use the official Stacks bridge to convert your Bitcoin to sBTC. 
            This is the secure, audited way to bridge Bitcoin onto Stacks.
          </AlertDescription>
        </Alert>

        {/* Bridge Actions */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Go to Official Bridge */}
            <Button 
              onClick={() => window.open('https://app.stacks.co', '_blank')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Official Bridge
            </Button>

            {/* Get Testnet Assets */}
            <Button 
              onClick={() => sbtcProtocol.requestFromFaucet()}
              variant="outline"
              className="w-full"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Get Testnet sBTC
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-transparent border border-gray-600 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-white">How to Bridge:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-gray-300">
              <li>Click "Open Official Bridge" above</li>
              <li>Connect your Bitcoin and Stacks wallets</li>
              <li>Enter the amount of Bitcoin to bridge</li>
              <li>Confirm the transaction in your Bitcoin wallet</li>
              <li>Wait for confirmations (10-30 minutes)</li>
              <li>Return here and refresh to see your sBTC balance</li>
            </ol>
          </div>

          {/* Network Info */}
          <div className="text-xs text-gray-300 bg-transparent border border-blue-500/30 rounded-lg p-3">
            <p><strong className="text-white">Network:</strong> Stacks Testnet</p>
            <p><strong className="text-white">Your Address:</strong> {stacksAddress}</p>
            <p><strong className="text-white">Bridge Type:</strong> Official sBTC Protocol ✅</p>
          </div>
        </div>

        {/* Refresh Balance Button */}
        <Button 
          onClick={loadBalance} 
          variant="ghost" 
          className="w-full"
          disabled={loadingBalance}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loadingBalance ? 'animate-spin' : ''}`} />
          Refresh sBTC Balance
        </Button>
      </CardContent>
    </Card>
  );
}