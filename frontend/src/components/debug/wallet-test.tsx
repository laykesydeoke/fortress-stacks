'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function WalletTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const testWallet = async () => {
    setTesting(true);
    setResult('Testing...');
    
    try {
      console.log('🔍 Testing wallet popup...');
      
      // Check if user is signed in first
      const { isUserSignedIn } = await import('@/lib/stacks');
      if (!isUserSignedIn()) {
        setResult('❌ Please connect your wallet first');
        setTesting(false);
        return;
      }

      const { openContractCall } = await import('@stacks/connect');
      const { network } = await import('@/lib/stacks');
      
      console.log('🌐 Using network:', network);
      
      // Simple test with well-known contract (PoX)
      const testPromise = new Promise<string>((resolve, reject) => {
        openContractCall({
          contractAddress: 'SP000000000000000000002Q6VF78',
          contractName: 'pox-4',
          functionName: 'get-pox-info',
          functionArgs: [],
          network,
          appDetails: {
            name: 'FortressStacks Treasury Test',
            icon: `${window.location.origin}/favicon.ico`,
          },
          onFinish: (data) => {
            console.log('✅ Wallet test successful!', data);
            resolve(`✅ SUCCESS! Wallet popup worked. TX: ${data.txId}`);
          },
          onCancel: () => {
            console.log('❌ User cancelled transaction');
            resolve('❌ Cancelled by user (but popup appeared!)');
          }
        });
        
        console.log('🔗 openContractCall executed - wallet should popup now!');
      });

      // Race with timeout
      const timeoutPromise = new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve('⏰ No wallet popup appeared - check popup blockers or wallet extension');
        }, 8000);
      });

      const result = await Promise.race([testPromise, timeoutPromise]);
      setResult(result);

    } catch (error) {
      console.error('💥 Test failed:', error);
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🔧 Wallet Test</CardTitle>
        <CardDescription>
          Test if wallet popup appears
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testWallet}
          disabled={testing}
          className="w-full cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Testing Wallet...
            </span>
          ) : (
            '🔧 Test Wallet Popup'
          )}
        </Button>
        
        {result && (
          <div className="p-3 bg-muted rounded text-sm">
            {result}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>This will test if your wallet extension responds to contract calls.</p>
          <p>If no popup appears:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check popup blockers</li>
            <li>Make sure Leather/Xverse is installed</li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}