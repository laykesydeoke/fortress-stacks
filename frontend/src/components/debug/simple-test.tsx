'use client';

import { useState } from 'react';

export function SimpleTest() {
  const [result, setResult] = useState<string>('');

  const testBasicButton = () => {
    console.log('🔍 Basic button test clicked');
    setResult('✅ Button click works!');
  };

  const testWalletDetection = async () => {
    console.log('🔍 Testing wallet detection...');
    
    try {
      // Check for wallet providers
      const leather = (window as any)?.LeatherProvider;
      const xverse = (window as any)?.XverseProviders;
      const hiro = (window as any)?.HiroWalletProvider;
      
      console.log('Wallet detection:', { leather: !!leather, xverse: !!xverse, hiro: !!hiro });
      
      if (leather) {
        setResult('✅ Leather wallet detected');
      } else if (xverse) {
        setResult('✅ Xverse wallet detected');
      } else if (hiro) {
        setResult('✅ Hiro wallet detected');
      } else {
        setResult('❌ No wallet extensions detected');
      }
    } catch (error) {
      setResult(`❌ Error detecting wallets: ${error}`);
    }
  };

  const testStacksConnect = async () => {
    console.log('🔍 Testing Stacks Connect import...');
    
    try {
      const stacksConnect = await import('@stacks/connect');
      console.log('Stacks Connect imported:', Object.keys(stacksConnect));
      
      if (stacksConnect.showConnect) {
        setResult('✅ Stacks Connect imported successfully');
      } else {
        setResult('❌ showConnect not found in import');
      }
    } catch (error) {
      console.error('Stacks Connect import failed:', error);
      setResult(`❌ Failed to import Stacks Connect: ${error}`);
    }
  };

  const testDirectWalletCall = async () => {
    console.log('🔍 Testing direct wallet call...');
    setResult('Testing direct wallet...');
    
    try {
      // Try to call showConnect directly
      const { showConnect } = await import('@stacks/connect');
      const { userSession } = await import('@/lib/stacks');
      
      console.log('About to call showConnect...');
      
      showConnect({
        appDetails: {
          name: 'FortressStacks Simple Test',
          icon: window.location.origin + '/favicon.ico',
        },
        redirectTo: window.location.pathname,
        onFinish: () => {
          console.log('✅ showConnect finished');
          setResult('✅ Wallet popup worked!');
        },
        onCancel: () => {
          console.log('❌ showConnect cancelled');
          setResult('❌ Wallet popup cancelled');
        },
        userSession,
      });
      
      console.log('showConnect called - popup should appear now');
      
    } catch (error) {
      console.error('💥 Direct wallet call failed:', error);
      setResult(`❌ Direct call failed: ${error}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border space-y-4 max-w-md">
      <h3 className="font-bold text-lg">🔧 Simple Tests</h3>
      
      <div className="space-y-2">
        <button 
          onClick={testBasicButton}
          className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          Test Basic Button
        </button>
        
        <button 
          onClick={testWalletDetection}
          className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
        >
          Test Wallet Detection
        </button>
        
        <button 
          onClick={testStacksConnect}
          className="w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600 cursor-pointer"
        >
          Test Stacks Connect Import
        </button>
        
        <button 
          onClick={testDirectWalletCall}
          className="w-full p-3 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
        >
          Test Direct Wallet Call
        </button>
      </div>
      
      {result && (
        <div className="p-3 bg-gray-100 rounded text-sm">
          {result}
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        <p>This tests basic functionality step by step</p>
        <p>Check browser console for detailed logs</p>
      </div>
    </div>
  );
}