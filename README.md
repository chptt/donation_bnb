# ChainGive — Decentralized Donation Platform on BNB Chain

A full-stack blockchain-based donation platform built on BNB Smart Chain Testnet. Creators launch campaigns, donors support them transparently, and everyone can track impact through a live leaderboard.

## 🌟 Features

### Core Functionality
- **Campaign Creation**: Creators can launch fundraising campaigns with goals, deadlines, and categories
- **Transparent Donations**: All donations are recorded on BNB Chain with instant transfers to creators
- **Live Leaderboard**: Real-time rankings for top campaigns (by funds raised or donor count) and top donors
- **Wallet Integration**: MetaMask wallet connection with automatic network switching
- **Dashboard Analytics**: Platform-wide and user-specific statistics with donation trends
- **Role-Based Access**: Separate experiences for donors, creators, and admins

### Advanced Features
- Campaign filtering by category, status, and search
- Sorting by newest, most funded, or ending soon
- Progress bars and countdown timers
- Donation history with transaction verification
- Profile management with wallet linking
- Image uploads for campaigns and avatars
- Responsive design for mobile and desktop

## 🛠 Tech Stack

### Blockchain
- **Solidity ^0.8.20**: Smart contract development
- **Hardhat**: Development environment and testing
- **ethers.js v6**: Blockchain interaction
- **BNB Chain Testnet**: Deployment network (Chain ID: 97)

### Backend
- **Node.js + Express.js**: REST API server
- **MongoDB + Mongoose**: Database and ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **Multer**: File uploads
- **express-validator**: Request validation

### Frontend
- **Next.js 15** with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **ethers.js**: Web3 integration
- **React Hook Form + Zod**: Form validation
- **Recharts**: Data visualization
- **Sonner**: Toast notifications
- **Lucide React**: Icons

## 📁 Project Structure

```
chaingive/
├── blockchain/              # Smart contracts & deployment
│   ├── contracts/
│   │   └── ChainGive.sol   # Main donation contract
│   ├── scripts/
│   │   └── deploy.js       # Deployment script
│   ├── test/
│   │   └── ChainGive.test.js
│   └── hardhat.config.js
│
├── backend/                 # Express API server
│   └── src/
│       ├── controllers/     # Request handlers
│       ├── models/          # MongoDB schemas
│       ├── routes/          # API endpoints
│       ├── middleware/      # Auth, validation, errors
│       ├── config/          # DB connection
│       └── server.js        # Entry point
│
└── frontend/                # Next.js application
    ├── app/                 # Pages (App Router)
    │   ├── page.tsx         # Landing page
    │   ├── login/
    │   ├── register/
    │   ├── explore/         # Browse campaigns
    │   ├── campaigns/
    │   │   ├── [id]/        # Campaign details
    │   │   └── create/      # Create campaign
    │   ├── dashboard/       # User dashboard
    │   ├── leaderboard/     # Rankings
    │   └── profile/         # User profile
    ├── components/
    │   ├── ui/              # Reusable UI components
    │   ├── layout/          # Navbar, Footer
    │   ├── campaign/        # Campaign card, donate modal
    │   ├── dashboard/       # Stats, charts, activity
    │   └── leaderboard/     # Leaderboard table
    ├── context/             # Auth & Wallet providers
    ├── hooks/               # Custom React hooks
    ├── lib/                 # Utils, API client, constants
    └── types/               # TypeScript interfaces
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+ and npm
- MongoDB running locally or connection URI
- MetaMask browser extension
- BNB Testnet BNB (get from [faucet](https://testnet.bnbchain.org/faucet-smart))

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd chaingive

# Install blockchain dependencies
cd blockchain
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### Blockchain (.env)
```bash
cd blockchain
cp .env.example .env
# Edit .env and add:
# - DEPLOYER_PRIVATE_KEY (your wallet private key with testnet BNB)
# - BSC_TESTNET_RPC (optional, defaults to public RPC)
```

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env and configure:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (random secure string)
# - CONTRACT_ADDRESS (will be filled after deployment)
```

#### Frontend (.env.local)
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local and configure:
# - NEXT_PUBLIC_CONTRACT_ADDRESS (will be filled after deployment)
```

### 3. Deploy Smart Contract

```bash
cd blockchain

# Compile contracts
npm run compile

# Run tests (optional)
npm test

# Deploy to BNB Testnet
npm run deploy:testnet

# Copy the deployed contract address from output
# Update CONTRACT_ADDRESS in backend/.env and frontend/.env.local
```

The deployment script automatically copies the ABI to both frontend and backend.

### 4. Start Backend Server

```bash
cd backend

# Make sure MongoDB is running
# Then start the server
npm run dev

# Server runs on http://localhost:5000
```

### 5. Start Frontend

```bash
cd frontend

# Start development server
npm run dev

# Frontend runs on http://localhost:3000
```

## 📖 Usage Guide

### For Donors

1. **Register**: Create an account with role "Donor"
2. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask
3. **Browse Campaigns**: Visit "Explore" to see all active campaigns
4. **Donate**: Click on a campaign, enter amount, and confirm transaction
5. **Track Impact**: View your donation history in Dashboard and see your rank on Leaderboard

### For Creators

1. **Register**: Create an account with role "Creator"
2. **Connect Wallet**: Link your MetaMask wallet
3. **Create Campaign**: Fill in details (title, description, target, deadline, image)
4. **Publish On-Chain**: Confirm blockchain transaction to make campaign live
5. **Monitor Progress**: Track donations, donor count, and ranking in Dashboard

### Leaderboard System

The leaderboard is **real and transaction-backed**, not a static demo:

- **Campaign Leaderboard**: Ranks campaigns by total funds raised or donor count
- **Donor Leaderboard**: Ranks donors by total donated amount across all campaigns
- **Auto-refresh**: Updates every 30 seconds
- **Top 3 Podium**: Special highlighting for gold, silver, bronze positions
- **Data Source**: Aggregated from MongoDB, synced from blockchain events

## 🔗 Smart Contract Details

### Main Functions

- `createCampaign(title, metadataURI, targetAmount, deadline)`: Create a new campaign
- `donateToCampaign(campaignId)`: Donate BNB to a campaign (payable)
- `getCampaign(campaignId)`: Retrieve campaign details
- `getAllCampaigns()`: Get all campaigns
- `getCampaignDonations(campaignId)`: Get donation history
- `getTotalDonatedByAddress(donor)`: Get total donated by a wallet

### Events

- `CampaignCreated`: Emitted when a campaign is created
- `DonationReceived`: Emitted when a donation is made

### Platform Fee

The contract charges a 2% platform fee on donations, which goes to the contract owner. The remaining 98% goes directly to the campaign creator.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/link-wallet` - Link wallet address

### Campaigns
- `GET /api/campaigns` - List campaigns (with filters)
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create campaign (creator only)
- `PUT /api/campaigns/:id` - Update campaign
- `GET /api/campaigns/user/my-campaigns` - Get user's campaigns
- `POST /api/campaigns/sync-onchain` - Sync blockchain campaign ID

### Donations
- `POST /api/donations/sync` - Sync donation from blockchain
- `GET /api/donations/user/history` - Get user's donation history
- `GET /api/donations/campaign/:id` - Get campaign donations

### Leaderboard
- `GET /api/leaderboard/campaigns?sortBy=amountRaised&limit=10` - Top campaigns
- `GET /api/leaderboard/donors?limit=10` - Top donors

### Dashboard
- `GET /api/dashboard/summary` - Platform and user stats
- `GET /api/dashboard/activity` - Recent donations and trends

## 🎨 UI/UX Highlights

- **Dark theme** with yellow accent color (BNB branding)
- **Glassmorphism** effects with backdrop blur
- **Smooth animations** and transitions
- **Loading skeletons** for better perceived performance
- **Toast notifications** for user feedback
- **Empty states** with helpful CTAs
- **Responsive grid layouts** that adapt to screen size
- **Progress indicators** for multi-step flows

## 🔐 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT-based authentication with expiry
- Role-based access control
- Request validation with express-validator
- Rate limiting on auth and API routes
- CORS configuration
- Helmet security headers
- Transaction hash verification
- Duplicate donation prevention

## 🧪 Testing

### Smart Contract Tests
```bash
cd blockchain
npm test
```

Tests cover:
- Campaign creation validation
- Donation flow and fund transfers
- Donor count tracking
- Campaign deactivation
- Leaderboard data accuracy

## 🌐 Network Configuration

### BNB Smart Chain Testnet
- **Chain ID**: 97
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **Block Explorer**: https://testnet.bscscan.com
- **Faucet**: https://testnet.bnbchain.org/faucet-smart

The frontend automatically prompts users to switch to BNB Testnet if they're on the wrong network.

## 📊 How Leaderboard Works

1. **Donation Flow**:
   - User donates via MetaMask → Smart contract emits `DonationReceived` event
   - Frontend syncs donation to backend via `/api/donations/sync`
   - Backend updates Campaign and User models

2. **Aggregation**:
   - Campaign leaderboard: Sorted by `amountRaised` or `donorCount` fields
   - Donor leaderboard: MongoDB aggregation pipeline groups by wallet address

3. **Real-time Updates**:
   - Leaderboard auto-refreshes every 30 seconds
   - Dashboard shows live stats
   - All data is transaction-backed and verifiable on-chain

## 🎯 Demo Workflow

1. Start MongoDB, backend, and frontend
2. Register as a Creator
3. Connect MetaMask wallet
4. Create a campaign with details and image
5. Publish campaign on-chain (MetaMask transaction)
6. Register as a Donor (different account/wallet)
7. Browse campaigns and donate
8. Check leaderboard to see rankings update
9. View dashboard for platform analytics

## 🚧 Future Enhancements

- Campaign updates/milestones
- Comment system for campaigns
- Social sharing integration
- Email notifications
- Campaign categories with icons
- Advanced analytics dashboard
- Withdrawal management for creators
- Multi-token support (not just BNB)
- IPFS integration for decentralized image storage

## 📝 License

MIT License - feel free to use this project for learning, portfolios, or internship applications.

## 🙏 Acknowledgments

Built with inspiration from crowdfunding platforms and Web3 donation dApps. Designed to showcase full-stack blockchain development skills for internship applications.

---

**Built on BNB Smart Chain Testnet** | **Powered by Hardhat, Express, Next.js**
