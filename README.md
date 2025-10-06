# FortressStacks

**Command the Bitcoin balance sheet**

Institutional-grade command center for Bitcoin treasuries built on Stacks, unifying live payments, automated policies, and yield governance under a single secure roof.

## 🎯 What is FortressStacks?

FortressStacks is the fortified command center where Bitcoin cash flow meets disciplined governance. It combines responsive Stacks wallet experiences, policy automation, and live intelligence to keep operators ahead of risk and opportunity:

1. **Real sBTC Integration**: Direct integration with official sBTC protocol on Stacks
2. **Policy-Driven Treasury**: Automated threshold-based rebalancing and optimization
3. **Professional Checkout**: Dynamic payment widget for businesses and individuals
4. **Live Blockchain Data**: Real-time balance tracking and transaction monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 22 LTS
- Stacks wallet (Leather or Xverse)
- Testnet STX and sBTC for testing

### Installation

```bash
# Clone and install
git clone <repository-url>
cd sbtc-treasury-manager/frontend
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local: NEXT_PUBLIC_NETWORK=testnet

# Start development
npm run dev
```

### Get Test Assets
1. Visit [Hiro Platform Faucet](https://platform.hiro.so/faucet)
2. Get testnet STX and sBTC
3. Connect your wallet to FortressStacks
4. Start using real sBTC transfers

## 🎮 Core Features

### ✅ Real sBTC Payments
- Uses official sBTC token contract (`SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token`) and deployed treasury contracts
- Dynamic recipient addresses (no hardcoded business addresses)
- Post-conditions for transaction safety
- Real testnet/mainnet integration

### ✅ Professional Checkout Widget
- Real-time sBTC balance fetching
- Stacks address validation
- Transaction status tracking
- Explorer integration

### ✅ Treasury Policies (MVP)
- Two-bucket strategy: Operating ↔ Reserve addresses
- Threshold-based automated transfers
- Real sBTC movements via SIP-010 transfers
- No fake/dummy transactions

### ✅ Honest Bridge UX
- Links to official sBTC bridge at [app.stacks.co](https://app.stacks.co)
- Testnet faucet integration for development
- No fake bridging UI that misleads users

## 🛠️ Technical Architecture

### Frontend Stack
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Stacks Connect** for wallet integration

### Blockchain Integration
- **Real sBTC Contract**: `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token`
- **Treasury Contracts**: Deployed on testnet with address `ST381F1FY7JNH8MWAD1MMRQ8BPKV3BQ06N6H0JRAE`
- **Hiro Stacks API**: For balance and transaction data
- **SIP-010 Transfers**: Standard fungible token operations
- **Post-conditions**: Transaction safety and exact amounts

### Network Support
- **Testnet**: Full functionality with test assets
- **Mainnet**: Ready for production (when configured)

## 📋 Usage Examples

### Make an sBTC Payment
```typescript
// Connect wallet first
await connectWallet();

// Use the payment widget
<CheckoutWidget
  defaultRecipient="ST1ABC...XYZ"
  allowCustomRecipient={true}
  onSuccess={(txId, amount, recipient) => {
    console.log(`Sent ${amount} sBTC to ${recipient}`);
    console.log(`Transaction: ${txId}`);
  }}
/>
```

### Check sBTC Balance
```typescript
import { getSBTCProtocol } from '@/lib/sbtc-protocol';

const sbtc = getSBTCProtocol();
const balance = await sbtc.getSBTCBalance('ST1ABC...XYZ');
console.log(`Balance: ${balance} sBTC`);
```

### Treasury Policy Example
```typescript
// Simple two-bucket policy
const policy = {
  enabled: true,
  thresholdMinor: 5_000_000n, // 0.05 sBTC in satoshis
  reserveAddress: 'ST1RESERVE...XYZ'
};

// When balance > threshold, transfer excess to reserve
// This uses real SIP-010 transfers with post-conditions
```

## 🔒 Security Features

- **Post-conditions**: Every sBTC transfer includes exact amount enforcement
- **Address validation**: Stacks principal format checking
- **Network isolation**: Environment-based contract addresses
- **No private key handling**: All signing through connected wallets

## 🌐 Environment Configuration

### Testnet (Default)
```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_SBTC_CONTRACT=SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
NEXT_PUBLIC_PAYMENT_PROCESSOR_CONTRACT=ST381F1FY7JNH8MWAD1MMRQ8BPKV3BQ06N6H0JRAE.payment-processor
NEXT_PUBLIC_TREASURY_MANAGER_CONTRACT=ST381F1FY7JNH8MWAD1MMRQ8BPKV3BQ06N6H0JRAE.treasury-manager
NEXT_PUBLIC_YIELD_STRATEGY_CONTRACT=ST381F1FY7JNH8MWAD1MMRQ8BPKV3BQ06N6H0JRAE.yield-strategy
```

### Mainnet (When Ready)
```env
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_SBTC_CONTRACT=TBD_when_live
```

## 📚 Key Resources

- [sBTC Documentation](https://docs.stacks.co/stacks-101/sbtc)
- [SIP-010 Token Standard](https://docs.stacks.co/stacks-101/tokens)
- [Stacks Connect](https://github.com/hirosystems/stacks-wallet-web)
- [Hiro Platform](https://platform.hiro.so)

## ⚠️ Important Notes

- **Testnet Only for Development**: Use testnet assets until mainnet is configured
- **Real Transactions**: All transfers use actual blockchain transactions
- **Official Contracts**: Only uses official sBTC protocol contracts
- **No Custodial Features**: Users maintain control of their Bitcoin/sBTC

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Submit pull request with clear description

## 📞 Support

For questions, issues, or contributions:
- Open a GitHub issue
- Check existing documentation
- Test on testnet first

---

**FortressStacks** — Command the Bitcoin balance sheet.