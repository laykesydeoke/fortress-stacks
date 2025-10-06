'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { TreasuryOverview } from '@/components/dashboard/treasury-overview';
import { PaymentHistory } from '@/components/dashboard/payment-history';
import { TransactionHistory } from '@/components/dashboard/transaction-history';
import { YieldStrategyManager } from '@/components/dashboard/yield-strategy-manager';
import { SettingsTab } from '@/components/dashboard/settings-tab';
import { RealDataDemo } from '@/components/dashboard/real-data-demo';
import { ContractStatus } from '@/components/contract-status';
import { DepositFlow } from '@/components/sbtc/deposit-flow';
import { CheckoutWidget } from '@/components/payment/checkout-widget';
import { ConnectionTest } from '@/components/debug/connection-test';
import { STXTransferTest } from '@/components/debug/stx-transfer-test';
import { WalletDiagnostic } from '@/components/debug/wallet-diagnostic';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { isUserSignedIn, getUserData, connectWallet, signOut } from '@/lib/stacks';
import { api } from '@/lib/api';
import Link from 'next/link';
import { 
  Bitcoin, 
  Home, 
  ArrowLeftRight, 
  TrendingUp, 
  Receipt, 
  FileText, 
  Settings, 
  LogOut,
  ArrowLeft,
  Wallet,
  BarChart3,
  DollarSign
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<unknown>(null);
  const [businessId, setBusinessId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [treasuryData, setTreasuryData] = useState<unknown>(null);

  useEffect(() => {
    setIsClient(true);
    
    if (isUserSignedIn()) {
      const userData = getUserData();
      setUser(userData);
      initializeBusiness(userData);
    } else {
      setLoading(false);
    }
  }, []);

  const initializeBusiness = async (userData: any) => {
    try {
      const walletAddress = userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet;
      
      // For this demo, we'll skip the API calls and use the wallet address as business ID
      console.log('Using wallet address as business ID (API backend not required)');
      setBusinessId(walletAddress || 'demo-business');
      
    } catch (error) {
      console.error('Failed to initialize business, using fallback:', error);
      // Fallback to using wallet address as business ID
      const walletAddress = userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet;
      setBusinessId(walletAddress || 'demo-business');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state during hydration
  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center web3-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-bitcoin-neon mx-auto mb-4"></div>
          <div className="text-neon-bitcoin text-lg font-semibold">Loading Treasury Dashboard...</div>
        </div>
      </div>
    );
  }

  if (!isUserSignedIn()) {
    return (
      <div className="web3-bg min-h-screen">
        <div className="flex items-center justify-center min-h-screen px-6">
          <div className="neon-card text-center max-w-md w-full">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-bitcoin-neon to-stacks-neon flex items-center justify-center mx-auto mb-8">
              <img src="/fortress-logo.png" alt="FortressStacks" className="w-24 h-24" />
            </div>
            
            <h1 className="text-3xl font-bold text-hologram mb-4">sBTC Treasury</h1>
            <p className="text-gray-300 mb-8 text-lg">
              Connect your Stacks wallet to access professional treasury management
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={connectWallet}
                className="btn-bitcoin w-full text-lg px-8 py-4"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </button>
              
              <Link href="/">
                <button className="btn-ghost w-full text-lg px-8 py-4">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="web3-bg min-h-screen">
      {/* Header */}
      <header className="relative">
        {/* Top Navigation Bar */}
        <div className="nav-web3 px-4 sm:px-6 py-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="nav-link flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="web3-glass rounded-xl px-3 py-2">
                <p className="text-xs text-gray-400">Connected</p>
                <p className="font-mono text-white text-sm">
                  {(user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet)?.slice(0, 8)}...
                </p>
              </div>
              <button onClick={signOut} className="btn-ghost px-6 py-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Disconnect</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Title Section */}
        <div className="px-4 sm:px-6 py-6 bg-gradient-to-r from-transparent via-bitcoin-neon/5 to-stacks-neon/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-bitcoin-neon to-stacks-neon flex items-center justify-center">
                <img src="/fortress-logo.png" alt="FortressStacks" className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">FortressStacks Command Center</h1>
                <p className="text-gray-300 text-sm">Modern treasury, ancient discipline</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Fixed positioning to avoid overlap */}
      <div className="tab-navigation sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full bg-transparent p-0 h-auto flex justify-start overflow-x-auto tab-container">
              <div className="flex space-x-2 min-w-max pb-1">
                <TabsTrigger 
                  value="overview" 
                  className="nav-link flex items-center space-x-2 px-4 py-3 whitespace-nowrap data-[state=active]:text-bitcoin-neon data-[state=active]:bg-bitcoin-neon/10 data-[state=active]:border-b-2 data-[state=active]:border-purple-400"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sbtc" 
                  className="nav-link flex items-center space-x-2 px-4 py-3 whitespace-nowrap data-[state=active]:text-bitcoin-neon data-[state=active]:bg-bitcoin-neon/10 data-[state=active]:border-b-2 data-[state=active]:border-green-400"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>sBTC Bridge</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="strategies" 
                  className="nav-link flex items-center space-x-2 px-4 py-3 whitespace-nowrap data-[state=active]:text-stacks-neon data-[state=active]:bg-stacks-neon/10 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Strategies</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="transactions" 
                  className="nav-link flex items-center space-x-2 px-4 py-3 whitespace-nowrap data-[state=active]:text-cyber-blue data-[state=active]:bg-cyan-500/10 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Transactions</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="contracts" 
                  className="nav-link flex items-center space-x-2 px-4 py-3 whitespace-nowrap data-[state=active]:text-cyber-green data-[state=active]:bg-green-500/10 data-[state=active]:border-b-2 data-[state=active]:border-green-400"
                >
                  <FileText className="w-4 h-4" />
                  <span>Contracts</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="nav-link flex items-center space-x-2 px-4 py-3 whitespace-nowrap data-[state=active]:text-cyber-purple data-[state=active]:bg-purple-500/10 data-[state=active]:border-b-2 data-[state=active]:border-purple-400"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </div>
            </TabsList>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <TabsContent value="overview" className="space-y-8">
            {/* Real Data Demo - Actually Works */}
            <div className="neon-card">
              <RealDataDemo 
                walletAddress={user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet}
              />
            </div>
            
            {/* Original Treasury Overview */}
            {businessId ? (
              <div className="neon-card">
                <TreasuryOverview 
                  businessId={businessId} 
                  businessAddress={user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet}
                />
              </div>
            ) : (
              <div className="neon-card p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin-500 mx-auto mb-4"></div>
                <p className="text-white/70">Loading treasury data...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sbtc" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Deposit BTC → sBTC */}
              <div className="card-bitcoin">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <img src="/fortress-logo.png" alt="FortressStacks" className="w-10 h-10" />
                    <span>Convert BTC → sBTC</span>
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Deposit Bitcoin to mint sBTC tokens via the official bridge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DepositFlow
                    onDepositComplete={(amount) => {
                      console.log('Deposit completed:', amount);
                      // Refresh treasury data when deposit completes
                      if (businessId) {
                        window.location.reload();
                      }
                    }}
                  />
                </CardContent>
              </div>
              
              {/* Test Payment Widget */}
              <div className="card-stacks">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-stacks-400" />
                    <span>Test sBTC Payment</span>
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Demo: Send sBTC to test the payment functionality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="web3-glass rounded-xl p-4 bg-stacks-500/10">
                    <h4 className="font-medium text-white mb-2">Demo Scenario:</h4>
                    <p className="text-white/70 text-sm mb-3">
                      You&apos;re testing a payment to a demo coffee shop for a premium coffee blend
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/80">Premium Coffee Blend (1kg)</span>
                      <span className="font-semibold text-stacks-400">0.001 sBTC</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="web3-glass rounded-lg p-3 text-xs text-white/60 bg-blue-500/10 border border-blue-500/20">
                      <strong className="text-blue-400">💡 How to test:</strong>
                      <ol className="mt-1 ml-4 list-decimal space-y-1">
                        <li>Make sure you have sBTC tokens (check balance above)</li>
                        <li>Enter amount (e.g., 0.001)</li>
                        <li>Click &quot;Pay&quot; → Xverse wallet should pop up</li>
                        <li>Approve transaction</li>
                        <li>Success! You&apos;ve sent sBTC</li>
                      </ol>
                    </div>
                    
                    <CheckoutWidget
                      defaultRecipient=""
                      allowCustomRecipient={true}
                      onSuccess={(txId, amount, recipient) => {
                        console.log('Payment successful:', txId);
                        alert(`🎉 Payment successful!\n\nSent ${amount} sBTC to ${recipient}\nTransaction ID: ${txId}\n\nYou can view this transaction on the Stacks Explorer.`);
                      }}
                      onError={(error) => {
                        console.error('Payment error:', error);
                        alert(`❌ Payment failed: ${error}\n\nCheck the browser console for more details.`);
                      }}
                    />
                  </div>
                </CardContent>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-8">
            <div className="grid xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                {businessId ? (
                  <div className="neon-card">
                    <YieldStrategyManager 
                      businessId={businessId}
                      businessAddress={user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet}
                      availableBalance={0.2} // This would come from treasury data
                    />
                  </div>
                ) : (
                  <div className="neon-card p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin-500 mx-auto mb-4"></div>
                    <p className="text-white/70">Loading yield strategies...</p>
                  </div>
                )}
              </div>
              <div className="xl:col-span-1 space-y-4">
                <div className="neon-card">
                  <WalletDiagnostic />
                </div>
                <div className="neon-card">
                  <STXTransferTest />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-8">
            {businessId ? (
              <div className="neon-card">
                <TransactionHistory 
                  businessId={businessId}
                  businessAddress={user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet}
                />
              </div>
            ) : (
              <div className="neon-card p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin-500 mx-auto mb-4"></div>
                <p className="text-white/70">Loading transaction history...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contracts" className="space-y-8">
            <div className="neon-card">
              <ContractStatus />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <div className="neon-card">
              <SettingsTab 
                user={user}
                businessId={businessId}
                businessAddress={user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet}
              />
            </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}