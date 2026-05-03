# Prompt-Wars 2 — VoteIQ Election Assistant 🇮🇳

VoteIQ is a premium, AI-powered election guide designed to simplify the democratic process in India. Now integrated with a **Full-Stack Blockchain Voting System**, VoteIQ provides a secure, transparent, and immutable platform for decentralized voting.

![VoteIQ Header](https://raw.githubusercontent.com/ankushsingh003/Prompt-Wars/main/voteiq-app/src/assets/hero.png) 

## 🌟 Key Features

### ⛓️ Fully Decentralized Voting
VoteIQ has transitioned from a simulation to a production-grade blockchain dApp.
- **On-Chain Immutability**: Every vote is recorded on the **Polygon (Mumbai)** network.
- **Smart Contract Enforcement**: Solidity-based rules ensure one-wallet-one-vote.
- **Gasless Transactions**: Integrated backend relay allows voters to cast votes without needing MATIC (gas fees paid by the system).
- **Live Ledger**: Real-time on-chain result tracking directly from the Polygon smart contract.

### 🤖 AI-Powered Assistant (VoteIQ Bot)
Powered by **Google Gemini**, the VoteIQ assistant answers complex questions about India's electoral system in plain English. Ask about:
- Voter registration and EPIC cards.
- Difference between Lok Sabha and Vidhan Sabha.
- How EVMs and VVPATs work.
- The Model Code of Conduct (MCC).

### 🗳️ Step-by-Step Process Guide
A comprehensive breakdown of the 8 critical stages of the Indian election process, from announcement to government formation.

### 📅 Official Election Timeline
A dynamic, scroll-animated timeline that visualizes the typical 60–75 day election calendar, highlighting major milestones like Polling Day and Counting Day.

### 🧠 Interactive Election Quiz
Test your democratic knowledge with a full-fledged quiz. Includes instant feedback and a detailed scoring system.

## 🚀 Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/)
- **Web3 Library**: [Ethers.js v6](https://docs.ethers.org/v6/)
- **Wallet**: [MetaMask](https://metamask.io/)
- **Build Tool**: [Vite](https://vitejs.dev/)

### Blockchain
- **Language**: Solidity 0.8.24
- **Framework**: [Hardhat](https://hardhat.org/)
- **Network**: Polygon (Mumbai Testnet)
- **Security**: OpenZeppelin Contracts

### Backend
- **Server**: Node.js + Express
- **Database**: MongoDB (Voter Registry)
- **Services**: Ethers.js Relayer (Gasless transactions)

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ankushsingh003/Prompt-Wars.git
   cd Prompt-Wars
   ```

2. **Blockchain Setup**:
   ```bash
   cd blockchain
   npm install
   # Configure .env with ALCHEMY_POLYGON_URL and PRIVATE_KEY
   npx hardhat run scripts/deploy.js --network mumbai
   ```

3. **Backend Setup**:
   ```bash
   cd ../backend
   npm install
   # Configure .env with MONGODB_URI, ALCHEMY_URL, and RELAYER_PRIVATE_KEY
   node app.js
   ```

4. **Frontend Setup**:
   ```bash
   cd ../voteiq-app
   npm install
   # Add Gemini API key in src/App.jsx
   npm run dev
   ```

## 📁 Project Structure

```text
├── blockchain/             # Smart Contract Workspace (Hardhat)
│   ├── contracts/          # Solidity Contracts (VotingContract.sol)
│   └── scripts/            # Deployment & Seed scripts
├── backend/                # Node.js API (Relayer & Auth)
│   ├── routes/             # API Endpoints
│   └── services/           # Blockchain integration logic
├── voteiq-app/             # Modern React Application
│   ├── src/
│   │   ├── components/     # UI Components (VotingPanel.jsx)
│   │   ├── hooks/          # Custom Hooks (useWallet, useVoting)
│   │   └── App.jsx         # Main Logic
└── README.md               # You are here
```

## 🎨 Design Aesthetics
VoteIQ uses a curated "Tricolor" design system inspired by the Indian National Flag:
- **Saffron**: Represents courage and sacrifice.
- **Green**: Represents growth and prosperity.
- **Navy Blue**: Represents the Dharma Chakra (Wheel of Law).
- **Modern UI**: Smooth gradients, glassmorphism, and scroll-triggered animations.

---
Built with ❤️ for **Prompt-Wars Challenge 2** · Powered by **Google Gemini** & **Polygon**
