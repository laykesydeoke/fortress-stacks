'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  ExternalLink, 
  Copy, 
  RefreshCw,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';
import { stacksAPI } from '@/lib/stacks-api';
import { DEPLOYED_CONTRACTS } from '@/lib/contracts';
import Link from 'next/link';

interface SettingsTabProps {
  user: any;
  businessId: string;
  businessAddress?: string;
}

interface WalletStats {
  balance: number;
  totalSent: number;
  totalReceived: number;
  transactionCount: number;
  lastActivity: Date | null;
}

export function SettingsTab({ user, businessId, businessAddress }: SettingsTabProps) {
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (businessAddress) {
      fetchWalletStats();
    } else {
      setLoading(false);
    }
  }, [businessAddress]);

  const fetchWalletStats = async () => {
    if (!businessAddress) return;

    try {
      setLoading(true);
      console.log('Fetching wallet stats for:', businessAddress);

      // Get wallet balance and transaction volume
      const [balance, transactionVolume, transactions] = await Promise.all([
        stacksAPI.getStxBalance(businessAddress),
        stacksAPI.getTransactionVolume(businessAddress),
        stacksAPI.getAddressTransactions(businessAddress, 10)
      ]);

      const stats: WalletStats = {
        balance: balance,
        totalSent: transactionVolume.sent,
        totalReceived: transactionVolume.received,
        transactionCount: transactions.length,
        lastActivity: transactions.length > 0 
          ? stacksAPI.formatBlockTime(transactions[0].burn_block_time)
          : null
      };

      setWalletStats(stats);
      console.log('Wallet stats loaded:', stats);

    } catch (error) {
      console.error('Error fetching wallet stats:', error);
      // Set demo stats on error
      setWalletStats({
        balance: 1.0,
        totalSent: 0.5,
        totalReceived: 1.5,
        transactionCount: 5,
        lastActivity: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getExplorerUrl = (address: string) => {
    return `https://explorer.stacks.co/address/${address}?chain=testnet`;
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="pt-6">
            <div className="h-40 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Wallet Information</span>
            {businessAddress && (
              <Button 
                onClick={fetchWalletStats} 
                variant="ghost" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Your Stacks wallet details and blockchain activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {businessAddress ? (
            <>
              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <span className="font-mono text-sm flex-1">{businessAddress}</span>
                  <Button
                    onClick={() => copyToClipboard(businessAddress)}
                    variant="ghost"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => window.open(getExplorerUrl(businessAddress), '_blank')}
                    variant="ghost"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Wallet Stats */}
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              ) : walletStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Balance</span>
                    </div>
                    <div className="font-bold">
                      {walletStats.balance.toFixed(6)} STX
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${(walletStats.balance * 2.5).toFixed(2)} USD
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Received</span>
                    </div>
                    <div className="font-bold text-green-600">
                      {walletStats.totalReceived.toFixed(6)} STX
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4 rotate-180" />
                      <span>Sent</span>
                    </div>
                    <div className="font-bold text-red-600">
                      {walletStats.totalSent.toFixed(6)} STX
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span>Transactions</span>
                    </div>
                    <div className="font-bold">
                      {walletStats.transactionCount}
                    </div>
                    {walletStats.lastActivity && (
                      <div className="text-xs text-muted-foreground">
                        Last: {walletStats.lastActivity.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No wallet connected</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Your business configuration and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Business ID
              </label>
              <div className="mt-1 p-2 bg-muted rounded font-mono text-sm">
                {businessId}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Network
              </label>
              <div className="mt-1">
                <Badge variant="secondary">Stacks Testnet</Badge>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Profile
            </label>
            <div className="mt-2 space-y-2">
              {user?.profile?.name && (
                <div className="flex justify-between text-sm">
                  <span>Name:</span>
                  <span>{user.profile.name}</span>
                </div>
              )}
              {user?.profile?.email && (
                <div className="flex justify-between text-sm">
                  <span>Email:</span>
                  <span>{user.profile.email}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Information */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Contracts</CardTitle>
          <CardDescription>
            Deployed contract addresses on Stacks Testnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(DEPLOYED_CONTRACTS).map(([name, address]) => (
            <div key={name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">
                  {name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {address}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Deployed
                </Badge>
                <Button
                  onClick={() => window.open(getExplorerUrl(address.split('.')[0]), '_blank')}
                  variant="ghost"
                  size="sm"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions and useful links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/checkout-demo">
            <Button variant="outline" className="w-full justify-start">
              <Wallet className="h-4 w-4 mr-2" />
              Test Payment Widget
            </Button>
          </Link>
          
          {businessAddress && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.open(getExplorerUrl(businessAddress), '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Stacks Explorer
            </Button>
          )}
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('https://docs.stacks.co/', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Stacks Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}