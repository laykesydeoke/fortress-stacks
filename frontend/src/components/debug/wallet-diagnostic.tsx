'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function WalletDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [testing, setTesting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setTesting(true);
    const results: any = {};

    try {
      // Check if we're on client side
      results.clientSide = typeof window !== 'undefined';
      
      // Check for wallet extensions
      results.hasLeather = !!(window as any)?.LeatherProvider;
      results.hasXverse = !!(window as any)?.XverseProviders;
      results.hasHiro = !!(window as any)?.HiroWalletProvider;
      
      // Check Stacks Connect availability
      try {
        const { showConnect } = await import('@stacks/connect');
        results.stacksConnectAvailable = !!showConnect;
      } catch (e) {
        results.stacksConnectAvailable = false;
        results.stacksConnectError = e instanceof Error ? e.message : 'Unknown error';
      }

      // Check network configuration
      try {
        const { network } = await import('@/lib/stacks');
        results.networkConfig = {
          isMainnet: network.chainId === 1,
          chainId: network.chainId,
          version: network.version
        };
      } catch (e) {
        results.networkConfigError = e instanceof Error ? e.message : 'Unknown error';
      }

      // Check user session
      try {
        const { isUserSignedIn, getUserData } = await import('@/lib/stacks');
        results.userSignedIn = isUserSignedIn();
        if (results.userSignedIn) {
          const userData = getUserData();
          results.userAddress = userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet;
          results.userProfile = !!userData?.profile;
        }
      } catch (e) {
        results.userSessionError = e instanceof Error ? e.message : 'Unknown error';
      }

      // Check environment variables
      results.envVars = {
        network: process.env.NEXT_PUBLIC_NETWORK,
        sbtcContract: process.env.NEXT_PUBLIC_SBTC_CONTRACT
      };

      setDiagnostics(results);
    } catch (error) {
      results.generalError = error instanceof Error ? error.message : 'Unknown error';
      setDiagnostics(results);
    } finally {
      setTesting(false);
    }
  };

  const testWalletConnection = async () => {
    try {
      console.log('🔍 Testing wallet connection...');
      
      // Test 1: Basic showConnect
      const { showConnect } = await import('@stacks/connect');
      const { userSession } = await import('@/lib/stacks');
      
      showConnect({
        appDetails: {
          name: 'FortressStacks Diagnostic',
          icon: window.location.origin + '/favicon.ico',
        },
        redirectTo: window.location.pathname,
        onFinish: () => {
          console.log('✅ showConnect finished');
          runDiagnostics();
        },
        onCancel: () => {
          console.log('❌ showConnect cancelled');
        },
        userSession,
      });

    } catch (error) {
      console.error('💥 Wallet connection test failed:', error);
    }
  };

  const testContractCall = async () => {
    try {
      console.log('🔍 Testing contract call...');
      
      if (!diagnostics.userSignedIn) {
        alert('Please connect wallet first');
        return;
      }

      const { openContractCall } = await import('@stacks/connect');
      const { network } = await import('@/lib/stacks');
      
      // Test with a simple read-only function
      openContractCall({
        contractAddress: 'SP000000000000000000002Q6VF78',
        contractName: 'pox-4',
        functionName: 'get-pox-info',
        functionArgs: [],
        network,
        appDetails: {
          name: 'FortressStacks Diagnostic',
          icon: window.location.origin + '/favicon.ico',
        },
        onFinish: (data) => {
          console.log('✅ Contract call successful:', data);
          alert(`✅ Contract call worked! TX: ${data.txId}`);
        },
        onCancel: () => {
          console.log('❌ Contract call cancelled');
          alert('❌ Cancelled (but popup appeared!)');
        }
      });

    } catch (error) {
      console.error('💥 Contract call test failed:', error);
      alert(`❌ Contract call failed: ${error}`);
    }
  };

  if (!isClient) {
    return <div>Loading diagnostics...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔧 Wallet Diagnostics</CardTitle>
        <CardDescription>Debug wallet connection issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button onClick={runDiagnostics} variant="outline" className="w-full">
            {testing ? 'Running...' : 'Run Diagnostics'}
          </Button>
          
          {!diagnostics.userSignedIn ? (
            <Button onClick={testWalletConnection} className="w-full">
              Test Wallet Connection
            </Button>
          ) : (
            <Button onClick={testContractCall} className="w-full cursor-pointer bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
              🧪 Test Contract Call
            </Button>
          )}
        </div>

        {/* Diagnostic Results */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span>Client Side:</span>
              <Badge variant={diagnostics.clientSide ? "default" : "destructive"}>
                {diagnostics.clientSide ? "✅" : "❌"}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span>User Signed In:</span>
              <Badge variant={diagnostics.userSignedIn ? "default" : "secondary"}>
                {diagnostics.userSignedIn ? "✅" : "❌"}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span>Leather Wallet:</span>
              <Badge variant={diagnostics.hasLeather ? "default" : "secondary"}>
                {diagnostics.hasLeather ? "✅" : "❌"}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span>Xverse Wallet:</span>
              <Badge variant={diagnostics.hasXverse ? "default" : "secondary"}>
                {diagnostics.hasXverse ? "✅" : "❌"}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span>Stacks Connect:</span>
              <Badge variant={diagnostics.stacksConnectAvailable ? "default" : "destructive"}>
                {diagnostics.stacksConnectAvailable ? "✅" : "❌"}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span>Network Config:</span>
              <Badge variant={diagnostics.networkConfig ? "default" : "destructive"}>
                {diagnostics.networkConfig ? "✅" : "❌"}
              </Badge>
            </div>
          </div>

          {diagnostics.userAddress && (
            <div className="p-2 bg-transparent border border-green-500/30 rounded">
              <p className="text-white"><strong>Address:</strong> {diagnostics.userAddress}</p>
            </div>
          )}

          {diagnostics.networkConfig && (
            <div className="p-2 bg-transparent border border-blue-500/30 rounded">
              <p className="text-white"><strong>Network:</strong> Chain ID {diagnostics.networkConfig.chainId}</p>
              <p className="text-white"><strong>Testnet:</strong> {!diagnostics.networkConfig.isMainnet ? "✅" : "❌"}</p>
            </div>
          )}

          {diagnostics.envVars && (
            <div className="p-2 bg-transparent border border-gray-500/30 rounded">
              <p className="text-white"><strong>Network Env:</strong> {diagnostics.envVars.network || 'undefined'}</p>
              <p className="text-white"><strong>sBTC Contract:</strong> {diagnostics.envVars.sbtcContract ? '✅' : '❌'}</p>
            </div>
          )}

          {/* Error Messages */}
          {diagnostics.stacksConnectError && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800">
              <p><strong>Stacks Connect Error:</strong> {diagnostics.stacksConnectError}</p>
            </div>
          )}

          {diagnostics.userSessionError && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800">
              <p><strong>User Session Error:</strong> {diagnostics.userSessionError}</p>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p><strong>Quick Fixes:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>If no wallet detected: Install Leather or Xverse extension</li>
            <li>If Stacks Connect failed: Check console for import errors</li>
            <li>If signed in but no address: Try disconnecting and reconnecting</li>
            <li>If contract calls fail: Check network configuration</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}