'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isUserSignedIn, getUserData, connectWallet } from '@/lib/stacks';

export function ConnectionTest() {
  const [isClient, setIsClient] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    checkConnection();
  }, []);

  const checkConnection = () => {
    try {
      const connected = isUserSignedIn();
      if (connected) {
        const userData = getUserData();
        setUser(userData);
        setConnectionStatus('✅ Wallet connected successfully');
      } else {
        setConnectionStatus('❌ No wallet connected');
      }
    } catch (error) {
      setConnectionStatus(`❌ Connection error: ${error}`);
    }
  };

  const testBasicWalletCall = async () => {
    try {
      console.log('🔍 Testing basic wallet interaction...');
      
      if (!isUserSignedIn()) {
        setConnectionStatus('❌ Please connect wallet first');
        return;
      }

      const { openSTXTransfer } = await import('@stacks/connect');
      const { network } = await import('@/lib/stacks');
      
      // Test simple STX transfer (0 amount) to same address
      const userData = getUserData();
      const address = userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet;
      
      if (!address) {
        setConnectionStatus('❌ No address found in user data');
        return;
      }

      openSTXTransfer({
        recipient: address, // Send to self with 0 amount
        amount: '1', // 1 microSTX (minimal amount)
        memo: 'FortressStacks wallet test',
        network,
        appDetails: {
          name: 'FortressStacks Treasury',
          icon: `${window.location.origin}/favicon.ico`,
        },
        onFinish: (data) => {
          console.log('✅ STX transfer test successful!', data);
          setConnectionStatus(`✅ Wallet popup works! TX: ${data.txId}`);
        },
        onCancel: () => {
          console.log('❌ User cancelled');
          setConnectionStatus('❌ Cancelled (but popup appeared!)');
        }
      });

    } catch (error) {
      console.error('💥 Wallet test failed:', error);
      setConnectionStatus(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🔌 Connection Test</CardTitle>
        <CardDescription>Debug wallet connection and popup functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button onClick={checkConnection} variant="outline" className="w-full">
            Check Connection Status
          </Button>
          
          {!isUserSignedIn() ? (
            <Button onClick={connectWallet} className="w-full">
              Connect Wallet
            </Button>
          ) : (
            <Button 
              onClick={testBasicWalletCall} 
              className="w-full cursor-pointer bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            >
              🧪 Test Wallet Popup
            </Button>
          )}
        </div>
        
        {connectionStatus && (
          <div className="p-3 bg-muted rounded text-sm">
            {connectionStatus}
          </div>
        )}

        {user && (
          <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
            <p><strong>Connected Address:</strong></p>
            <p className="font-mono">{user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet}</p>
            <p><strong>Profile:</strong> {user?.username || 'No username'}</p>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
          <p><strong>Troubleshooting:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Make sure Leather or Xverse wallet is installed</li>
            <li>Check for popup blockers</li>
            <li>Try refreshing the page</li>
            <li>Check browser console for errors</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}