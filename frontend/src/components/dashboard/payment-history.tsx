'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';
  customerEmail?: string;
  description?: string;
  transactionHash?: string;
  createdAt: string;
  confirmedAt?: string;
}

interface PaymentHistoryProps {
  businessId: string;
}

export function PaymentHistory({ businessId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [businessId, page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.getPayments(businessId, page);
      const newPayments = response.data.payments;
      
      if (page === 1) {
        setPayments(newPayments);
      } else {
        setPayments(prev => [...prev, ...newPayments]);
      }
      
      setHasMore(response.data.pagination.page < response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500 text-white';
      case 'PENDING':
        return 'bg-yellow-500 text-white';
      case 'FAILED':
        return 'bg-red-500 text-white';
      case 'REFUNDED':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(6)} sBTC`;
  };

  if (loading && page === 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Recent sBTC payments received</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded-lg animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-48"></div>
                </div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>Recent sBTC payments received</CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No payments found</p>
            <p className="text-sm mt-1">Payments will appear here once you start receiving them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{formatAmount(payment.amount)}</span>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Created: {formatDate(payment.createdAt)}</p>
                    {payment.confirmedAt && (
                      <p>Confirmed: {formatDate(payment.confirmedAt)}</p>
                    )}
                    {payment.customerEmail && (
                      <p>Customer: {payment.customerEmail}</p>
                    )}
                    {payment.description && (
                      <p>Description: {payment.description}</p>
                    )}
                    {payment.transactionHash && (
                      <p className="font-mono text-xs">
                        Tx: {payment.transactionHash.slice(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="text-sm font-medium">
                    ${(payment.amount * 65000).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    USD equivalent
                  </div>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <div className="text-center pt-4">
                <Button 
                  onClick={loadMore} 
                  variant="outline" 
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}