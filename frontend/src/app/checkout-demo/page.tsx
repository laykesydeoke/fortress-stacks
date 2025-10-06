'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { CheckoutWidget } from '@/components/payment/checkout-widget';
import { SimpleTest } from '@/components/debug/simple-test';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CheckoutDemoPage() {
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Demo business data
  const demoBusiness = {
    id: 'demo-business',
    address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    name: 'Demo Coffee Shop'
  };

  const handlePaymentSuccess = (txId: string, amount: number, recipient: string) => {
    setPaymentSuccess(txId);
    setPaymentError(null);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentSuccess(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <div className="h-4 border-l"></div>
            <h1 className="text-xl font-semibold">FortressStacks Payment Demo</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-2">
              Interactive Demo
            </Badge>
            <h2 className="text-3xl font-bold mb-2">
              FortressStacks Payment Widget
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience our payment widget in action. This demo uses real sBTC transfers on testnet 
              with live blockchain integration.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Demo Scenario */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Demo Scenario: {demoBusiness.name}</CardTitle>
                  <CardDescription>
                    You&apos;re purchasing a premium coffee blend from our demo coffee shop
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Premium Coffee Blend (1kg)</span>
                    <span className="font-semibold">0.001 sBTC</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>• Business Address: {demoBusiness.address.slice(0, 20)}...</p>
                    <p>• Network: Stacks Testnet</p>
                    <p>• Smart Contract: Payment Processor</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What happens after payment?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">1</div>
                    <div>
                      <p className="font-medium">Payment Processing</p>
                      <p className="text-muted-foreground">Your sBTC payment is processed on-chain</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">2</div>
                    <div>
                      <p className="font-medium">Treasury Deposit</p>
                      <p className="text-muted-foreground">Funds are added to the business treasury</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">3</div>
                    <div>
                      <p className="font-medium">Auto-Optimization</p>
                      <p className="text-muted-foreground">Smart contract automatically deploys excess funds to yield protocols</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">4</div>
                    <div>
                      <p className="font-medium">Yield Generation</p>
                      <p className="text-muted-foreground">Business earns yield while maintaining liquidity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Success/Error Messages */}
              {paymentSuccess && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">Payment Successful! ✅</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="text-green-700 mb-2">
                      Your payment has been submitted to the Stacks blockchain.
                    </p>
                    <div className="bg-white p-3 rounded border">
                      <p className="font-medium">Transaction ID:</p>
                      <p className="font-mono text-xs break-all">{paymentSuccess}</p>
                    </div>
                    <p className="text-green-600 mt-2">
                      The business will receive this payment and it will be automatically optimized in their treasury.
                    </p>
                  </CardContent>
                </Card>
              )}

              {paymentError && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800">Payment Failed ❌</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-700 text-sm">{paymentError}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Debug Section */}
            <div className="flex justify-center mb-8">
              <SimpleTest />
            </div>

            {/* Payment Widget */}
            <div className="flex justify-center">
              <CheckoutWidget
                defaultRecipient=""
                allowCustomRecipient={true}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>

          <div className="mt-12 text-center">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Ready to integrate?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Add this payment widget to your website with just a few lines of code
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/dashboard">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                      View Dashboard
                    </button>
                  </Link>
                  <Link href="/">
                    <button className="px-4 py-2 border border-input rounded-md text-sm hover:bg-accent">
                      Learn More
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}