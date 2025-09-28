# GridSmart Energy - BlockDAG Hackathon Project

## Overview
GridSmart Energy is a blockchain-powered mobile and web application that predicts transformer overload and prevents costly power failures. Built for the BlockDAG Hackathon, it incentivizes users to reduce electricity usage during peak times and enables peer-to-peer energy trading.

## Problem Statement
- Transformer failures cost Eskom R2.8 billion per incident
- Peak load periods cause grid instability
- Lack of real-time consumer incentives for load reduction
- No efficient P2P energy trading mechanism

## Solution
GridSmart Energy provides:
1. **Real-time Transformer Monitoring** - Live tracking of transformer load with predictive analytics
2. **Incentive System** - Users earn BDAG tokens for reducing consumption during peak times
3. **P2P Energy Trading** - Solar users can sell excess energy to neighbors
4. **BlockDAG Integration** - All transactions secured on BlockDAG blockchain

## Tech Stack
- **Frontend:** React Native (Expo) for mobile/web
- **Blockchain:** BlockDAG Network (EVM-compatible)
- **Smart Contracts:** Solidity
- **Web3 Integration:** ethers.js
- **Deployment:** Vercel (web), Expo (mobile)

## BlockDAG Network Configuration
```javascript
Network: BlockDAG Testnet
RPC URL: https://rpc-testnet-v2.blockdag.network
Chain ID: 20000
Explorer: https://awakening.bdagscan.com
Symbol: BDAG
```

## Features

### 1. Home Screen
- Real-time transformer load gauge
- BlockDAG network status indicator
- Peak time alerts with incentive rates
- User energy consumption metrics

### 2. Incentives Screen
- Active reduction events
- Commitment interface (reduce X kWh, earn Y BDAG)
- Earnings history and statistics
- Real-time reward calculations

### 3. Trading Screen
- Available energy offers from solar producers
- Buy/sell energy interface
- Price discovery mechanism
- Transaction history

### 4. Wallet Screen
- BlockDAG wallet connection
- Balance display
- Transaction activity feed
- Performance statistics

## Smart Contracts

### GridSmartIncentives.sol
Manages energy reduction commitments and rewards:
- `commitReduction(uint256 kwhAmount)` - User commits to reduce consumption
- `fulfillCommitment()` - Validates reduction and distributes rewards
- `claimRewards()` - Users claim accumulated BDAG tokens

### EnergyTrading.sol
Facilitates P2P energy trading:
- `createSellOrder()` - Solar producers list excess energy
- `createBuyOrder()` - Consumers request energy
- `executeTrade()` - Matches orders and settles payments

## Installation & Setup

### Prerequisites
- Node.js >= 20.16.0
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Local Development
```bash
# Clone repository
git clone https://github.com/yourusername/GridSmartEnergy.git
cd GridSmartEnergy

# Install dependencies
npm install

# Start development server
npm start

# For web
npm run web

# For mobile (requires Expo Go app)
npm run android  # or npm run ios
```

### Build for Production
```bash
# Build web version
npx expo export --platform web --output-dir dist

# Deploy to Vercel
vercel --prod
```

## Project Structure
```
GridSmartEnergy/
├── src/
│   ├── screens/        # App screens
│   ├── components/     # Reusable components
│   ├── services/       # BlockDAG integration
│   └── styles/         # Theme and styling
├── contracts/          # Solidity smart contracts
├── dist/              # Web build output
└── App.tsx            # Main app entry point
```

## BlockDAG Integration Details

### Hybrid Approach
Due to testnet faucet limitations, we implemented a hybrid solution:
- **Read Operations:** Direct connection to BlockDAG RPC
- **Write Operations:** Simulated transactions with proper formatting
- **Explorer Links:** All transactions link to BlockDAG explorer

### Key Services
- `blockdagService.js` - Main blockchain interface
- `contractConfig.js` - Contract ABIs and addresses
- `dataSimulator.js` - Mock data generation for demo

## Demo Flow

1. **Connect Wallet** - App connects to BlockDAG network
2. **Monitor Load** - Real-time transformer load updates
3. **Commit Reduction** - User commits to reduce 2kWh
4. **Earn Rewards** - Receive 5 BDAG tokens (2.5 BDAG/kWh)
5. **Trade Energy** - Buy/sell excess solar energy
6. **Track Performance** - View earnings and impact

## Deployment

### Vercel Deployment
The app is configured for automatic deployment to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Create `.env` file:
```
REACT_APP_BLOCKDAG_RPC=https://rpc-testnet-v2.blockdag.network
REACT_APP_CHAIN_ID=20000
```

## Testing

```bash
# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run typecheck
```

## Team
- **Team Size:** 2 members
- **Hackathon:** BlockDAG Hackathon 2025

## License
MIT

## Contact
For questions or support, please open an issue on GitHub.

## Acknowledgments
- BlockDAG Network for blockchain infrastructure
- Expo team for React Native framework
- Hackathon organizers and mentors