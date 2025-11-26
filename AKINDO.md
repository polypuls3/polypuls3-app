* Live App: https://polypuls3.vercel.app/
* SDK Demo App: https://p3demo.vercel.app/
* NPM SDK: https://www.npmjs.com/package/@polypuls3/sdk

---

## 🔑 Akindo Buildathon — Key Items

### 🌊 Foundation & Setup (Wave 1–2)

**Goal:** Polygon integration, technical setup, and product-market fit validation

* Deploy smart contracts on Polygon
* Integrate wallet and subgraph
* Validate real user traction and use-case alignment

---

### 🎯 Focus Areas

#### 🤖 AI + Crypto

* On-chain Polls & Surveys powered by AI intelligence
* AI-driven Product-Market Fit insights for data-based decisions

#### 🌐 Infrastructure

* Decentralized **Data & Model Marketplace** for Polls, Surveys, and Insights

---

### ⚡ Why I Joined

**🔄 Existing Project Seeking Scale**
PolyPuls3 already has a working MVP and live users.
We’re joining to:

* Migrate and expand to **Polygon** for serious growth
* Leverage ecosystem tools and **VC exposure**
* Demonstrate measurable **scaling progress**, not just a new start

Existing Projects in Other Chains:
* NERO: https://dpolls.app/
* ICP:  https://icp.dpolls.ai
* VeChain: https://vepulse.dpolls.ai
* TON: https://ton.dpolls.ai.
---

### ⏳ Submission Checklist

1. 📝 Submit existing product on **AKINDO**
2. 🔧 Optimize for **Polygon integration**
3. 🚀 Align with **AI + Crypto** and **Infrastructure** tracks
4. 📈 Build and scale in **waves**, showing progress every two weeks

> 💬 *This Buildathon measures our scaling ability — not our starting point. We’re bringing our existing project, making it Polygon-native, and transforming it into a market-ready product.*

---



## 🧩 What it does

**PolyPuls3** is a decentralized polls and survey dApp built on **Polygon** that incentivizes authentic community feedback using on-chain rewards.
Users can **create**, **fund**, and **respond** to polls entirely on-chain. Respondents earn **POL tokens** instantly when they answer, while creators gain verifiable insights — all transparently stored on the blockchain.

---

## 💡 The problem it solves

Traditional feedback platforms are centralized, opaque, and unrewarding.

* Poll creators pay for access to their own audiences.
* Respondents rarely benefit from contributing.
* Data integrity depends on closed-source algorithms.

PolyPuls3 solves this by making feedback **trustless, transparent, and incentivized**, giving both creators and respondents tangible value for their participation.

---

## ⚙️ How we built it

We started by designing a modular **Solidity smart contract** that handles:

* Poll creation and storage
* ERC-20 token reward distribution
* Fund claiming and result tracking

Then, we connected it to a **React + Next.js frontend** powered by **viem** and **wagmi** for wallet connections, and **Polygon Mumbai** as our primary testnet.
The UI was built for both web and mobile users to easily create or answer polls with one click.

---

## 🧠 Technologies I used

* **Solidity** — smart contracts for polls, responses, and rewards
* **Polygon (Mumbai)** — testnet deployment
* **React / Next.js** — frontend framework
* **Viem + Wagmi** — EVM wallet integration
* **Hardhat** — smart contract development and testing
* **Pinata / IPFS** — decentralized metadata storage

---

## 🚧 Challenges I ran into

* Managing **gas optimization** and **contract size limits** while keeping modular logic
* Handling **real-time reward distribution** without relying on a backend
* Ensuring **cross-chain extensibility** for future reward funding in multiple tokens (e.g., USDC, MATIC)
* Balancing **UX simplicity** with **on-chain complexity**

---

## 🎯 What we learned

* Building fully on-chain interactions forces you to design around **user experience trade-offs**.
* Polygon’s ecosystem tools (viem, wagmi, QuickNode, etc.) make development faster but require precise **contract-to-UI synchronization**.
* Incentivized participation drastically improves **response quality** and **engagement rates**.

---

## 🚀 What's next for PolyPuls3

* **Multi-token support:** Allow funding with stablecoins like USDC.
* **Analytics dashboard:** On-chain visualization of results and engagement metrics.
* **DAO integrations:** Let DAOs run internal polls transparently.
* **Cross-chain deployment:** Expand to Base, Arbitrum, and zkEVM.
* **PolyPuls3 SDK:** Enable other dApps to integrate incentivized polling into their communities.
