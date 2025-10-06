'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { DEPLOYED_CONTRACTS, STACKS_API_URL } from '@/lib/contracts';

interface ContractStatus {
  address: string;
  name: string;
  status: 'deployed' | 'pending' | 'error';
  lastChecked?: Date;
}

export function ContractStatus() {
  const [contracts, setContracts] = useState<ContractStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkContractStatus();
  }, []);

  const checkContractStatus = async () => {
    setLoading(true);
    const contractsToCheck = [
      { id: DEPLOYED_CONTRACTS.PAYMENT_PROCESSOR, name: 'Payment Processor' },
      { id: DEPLOYED_CONTRACTS.TREASURY_MANAGER, name: 'Treasury Manager' },
      { id: DEPLOYED_CONTRACTS.YIELD_STRATEGY, name: 'Yield Strategy' }
    ];

    const statuses: ContractStatus[] = [];

    for (const contract of contractsToCheck) {
      try {
        const [contractAddress, contractName] = contract.id.split('.');
        const url = `${STACKS_API_URL}/v2/contracts/interface/${contractAddress}/${contractName}`;
        
        const response = await fetch(url);
        const isDeployed = response.ok;

        statuses.push({
          address: contract.id,
          name: contract.name,
          status: isDeployed ? 'deployed' : 'error',
          lastChecked: new Date()
        });
      } catch (error) {
        statuses.push({
          address: contract.id,
          name: contract.name,
          status: 'error',
          lastChecked: new Date()
        });
      }
    }

    setContracts(statuses);
    setLoading(false);
  };

  const getStatusIcon = (status: ContractStatus['status']) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: ContractStatus['status']) => {
    const variants = {
      deployed: 'default',
      pending: 'secondary',
      error: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getExplorerUrl = (contractAddress: string) => {
    return `https://explorer.stacks.co/address/${contractAddress}?chain=testnet`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Contract Status</CardTitle>
          <CardDescription>Checking deployment status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Smart Contract Status
          <Button onClick={checkContractStatus} variant="outline" size="sm">
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Live status of deployed contracts on Stacks Testnet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contracts.map((contract) => (
          <div key={contract.address} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(contract.status)}
              <div>
                <div className="font-medium">{contract.name}</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {contract.address}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusBadge(contract.status)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(getExplorerUrl(contract.address.split('.')[0]), '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Network:</span>
            <span className="font-medium">Stacks Testnet</span>
          </div>
          <div className="flex justify-between">
            <span>Deployer:</span>
            <span className="font-mono text-xs">ST3A5HQKQM3T3BV1MCZ45S6Q729V8355BQ0W0NP2V</span>
          </div>
          <div className="flex justify-between">
            <span>Last Updated:</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}