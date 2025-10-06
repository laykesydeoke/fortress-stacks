'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ExternalLink, Wallet } from 'lucide-react';
import { getSBTCProtocol } from '@/lib/sbtc-protocol';

interface RealWalletData {
  stxBalance: number;
  sbtcBalance: number;
  totalSent: number;
  totalReceived: number;
  transactionCount: number;
}

export function RealDataDemo({ walletAddress }: { walletAddress?: string }) {
  const [realData, setRealData] = useState<RealWalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRealData = async () => {
    if (!walletAddress) {
      setError('No wallet connected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching REAL data for:', walletAddress);

      // Fetch real balance data
      const balanceResponse = await fetch(
        `https://api.testnet.hiro.so/extended/v1/address/${walletAddress}/balances`
      );

      if (!balanceResponse.ok) {
        throw new Error(`Balance fetch failed: ${balanceResponse.status}`);
      }

      const balanceData = await balanceResponse.json();

      // Fetch real transaction data
      const txResponse = await fetch(
        `https://api.testnet.hiro.so/extended/v1/address/${walletAddress}/transactions?limit=50`
      );

      if (!txResponse.ok) {
        throw new Error(`Transaction fetch failed: ${txResponse.status}`);
      }

      const txData = await txResponse.json();

      // Process real data using the updated sBTC protocol service
      const stxBalance = parseInt(balanceData.stx.balance) / 1000000; // Convert microSTX to STX
      
      // Use the sBTC protocol service for proper balance fetching
      const sbtcProtocol = getSBTCProtocol();
      const sbtcBalance = await sbtcProtocol.getSBTCBalance(walletAddress);
      const totalSent = parseInt(balanceData.stx.total_sent) / 1000000;
      const totalReceived = parseInt(balanceData.stx.total_received) / 1000000;
      const transactionCount = txData.results?.length || 0;

      const realWalletData: RealWalletData = {
        stxBalance,
        sbtcBalance,
        totalSent,
        totalReceived,
        transactionCount
      };

      setRealData(realWalletData);
      console.log('✅ REAL DATA FETCHED:', realWalletData);

    } catch (err) {
      console.error('❌ Real data fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch real data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchRealData();
    }
  }, [walletAddress]);

  if (!walletAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Real Blockchain Data</span>
          </CardTitle>
          <CardDescription>Connect your wallet to see real data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No wallet connected. Connect your Stacks wallet to see real blockchain data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Real Blockchain Data</span>
            {realData && <Badge variant="secondary">Live Data</Badge>}
          </div>
          <Button onClick={fetchRealData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          Fetched directly from Stacks API for address: {walletAddress.slice(0, 8)}...
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Fetching real data from Stacks blockchain...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">❌ {error}</p>
            <Button onClick={fetchRealData} variant="outline" size="sm" className="mt-2">
              Try Again
            </Button>
          </div>
        )}

        {realData && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium mb-2">✅ Real Data Successfully Fetched!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">STX Balance</h4>
                <p className="text-2xl font-bold text-blue-700">{realData.stxBalance.toFixed(6)} STX</p>
                <p className="text-sm text-blue-600">${(realData.stxBalance * 2.5).toFixed(2)} USD</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900">sBTC Balance</h4>
                <p className="text-2xl font-bold text-orange-700">{realData.sbtcBalance.toFixed(6)} sBTC</p>
                <p className="text-sm text-orange-600">${(realData.sbtcBalance * 65000).toFixed(2)} USD</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">Total Received</h4>
                <p className="text-xl font-bold text-green-700">{realData.totalReceived.toFixed(6)} STX</p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-900">Total Sent</h4>
                <p className="text-xl font-bold text-red-700">{realData.totalSent.toFixed(6)} STX</p>
              </div>
            </div>

            <div className="p-4 bg-transparent border border-gray-600 rounded-lg">
              <h4 className="font-semibold mb-2 text-white">Transaction Activity</h4>
              <p className="text-gray-300">Recent Transactions: <span className="font-bold text-white">{realData.transactionCount}</span></p>
              <p className="text-gray-300">Net Balance: <span className="font-bold text-white">{(realData.totalReceived - realData.totalSent).toFixed(6)} STX</span></p>
            </div>

            <div className="flex items-center justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => window.open(`https://explorer.stacks.co/address/${walletAddress}?chain=testnet`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Stacks Explorer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
