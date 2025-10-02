# Indexer Setup Guide for PolyPuls3

## Why Use an Indexer?

Direct smart contract queries are inefficient for:
- Filtering data by user (e.g., "show only MY projects")
- Searching and sorting
- Historical data and analytics
- Pagination of large datasets

An indexer listens to blockchain events and stores them in a database for fast querying.

## Option 1: The Graph (Recommended for Production)

### Overview
- Most popular blockchain indexing protocol
- Decentralized infrastructure
- GraphQL API
- Free tier available

### Setup Steps

1. **Install Graph CLI**
```bash
npm install -g @graphprotocol/graph-cli
```

2. **Initialize Subgraph**
```bash
graph init --protocol polygon \
  --from-contract 0xfc0323F3c5eD271564Ca8F3d4C5FfAD32D553893 \
  --network polygon-amoy \
  --contract-name PolyPuls3 \
  polypuls3-subgraph
```

3. **Update schema.graphql**
```graphql
type Project @entity {
  id: ID!
  projectId: BigInt!
  creator: Bytes!
  name: String!
  description: String!
  tags: String!
  createdAt: BigInt!
  isActive: Boolean!
}

type Poll @entity {
  id: ID!
  pollId: BigInt!
  creator: Bytes!
  question: String!
  options: [String!]!
  createdAt: BigInt!
  expiresAt: BigInt!
  rewardPool: BigInt!
  isActive: Boolean!
  totalResponses: BigInt!
}

type Survey @entity {
  id: ID!
  surveyId: BigInt!
  creator: Bytes!
  projectId: BigInt!
  title: String!
  description: String!
  questions: [String!]!
  createdAt: BigInt!
  expiresAt: BigInt!
  rewardPool: BigInt!
  isActive: Boolean!
  totalResponses: BigInt!
}
```

4. **Deploy to The Graph Studio**
```bash
cd polypuls3-subgraph
graph auth --studio <DEPLOY_KEY>
graph codegen && graph build
graph deploy --studio polypuls3
```

5. **Query from Frontend**
```typescript
const query = `
  query GetUserProjects($creator: Bytes!) {
    projects(where: { creator: $creator, isActive: true }) {
      id
      projectId
      name
      description
      tags
      createdAt
    }
  }
`

const response = await fetch(SUBGRAPH_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query,
    variables: { creator: walletAddress }
  })
})
```

### Resources
- Docs: https://thegraph.com/docs/en/
- Studio: https://thegraph.com/studio/

---

## Option 2: Ponder (Easiest for Development)

### Overview
- TypeScript-native
- Open source
- Runs locally or deploys to Railway/Vercel
- No GraphQL knowledge required

### Setup Steps

1. **Install Ponder**
```bash
npm create ponder@latest
cd ponder-polypuls3
```

2. **Configure ponder.config.ts**
```typescript
import { createConfig } from "@ponder/core";
import { http } from "viem";
import { PolyPuls3ABI } from "./abis/PolyPuls3";

export default createConfig({
  networks: {
    polygonAmoy: {
      chainId: 80002,
      transport: http(process.env.PONDER_RPC_URL_80002),
    },
  },
  contracts: {
    PolyPuls3: {
      abi: PolyPuls3ABI,
      address: "0xfc0323F3c5eD271564Ca8F3d4C5FfAD32D553893",
      network: "polygonAmoy",
      startBlock: 12345678, // Your deployment block
    },
  },
});
```

3. **Define Schema (src/schema.ts)**
```typescript
import { onchainTable } from "@ponder/core";

export const project = onchainTable("project", (t) => ({
  id: t.text().primaryKey(),
  projectId: t.bigint().notNull(),
  creator: t.hex().notNull(),
  name: t.text().notNull(),
  description: t.text(),
  tags: t.text(),
  createdAt: t.bigint().notNull(),
  isActive: t.boolean().notNull(),
}));
```

4. **Index Events (src/index.ts)**
```typescript
import { ponder } from "@/generated";

ponder.on("PolyPuls3:ProjectCreated", async ({ event, context }) => {
  await context.db.project.create({
    id: `${event.args.projectId}`,
    data: {
      projectId: event.args.projectId,
      creator: event.args.creator,
      name: event.args.name,
      createdAt: event.block.timestamp,
      // ... fetch full project data
    },
  });
});
```

5. **Run Ponder**
```bash
ponder dev
```

6. **Query API**
```typescript
// Built-in REST API at http://localhost:42069
const projects = await fetch('http://localhost:42069/project', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
```

### Resources
- Docs: https://ponder.sh
- GitHub: https://github.com/ponder-sh/ponder

---

## Option 3: Goldsky (Fastest Setup)

### Overview
- Managed infrastructure
- Instant sync
- Mirror subgraphs from The Graph
- Has free tier

### Setup Steps

1. Sign up at https://goldsky.com
2. Deploy existing subgraph or use Mirror feature
3. Get instant API endpoint

### Resources
- Docs: https://docs.goldsky.com/

---

## Option 4: Envio (High Performance)

### Overview
- HyperSync for ultra-fast indexing
- TypeScript config
- Multi-chain support

### Setup Steps

1. **Install Envio CLI**
```bash
npm i -g envio
```

2. **Initialize**
```bash
envio init
```

3. **Configure config.yaml**
```yaml
name: polypuls3
networks:
  - id: 80002
    start_block: 12345678
    contracts:
      - name: PolyPuls3
        address: "0xfc0323F3c5eD271564Ca8F3d4C5FfAD32D553893"
```

### Resources
- Docs: https://docs.envio.dev/

---

## Comparison Table

| Feature | The Graph | Ponder | Goldsky | Envio |
|---------|-----------|--------|---------|-------|
| Difficulty | Medium | Easy | Easiest | Medium |
| Free Tier | Yes | Yes | Yes | Yes |
| Decentralized | Yes | No | No | No |
| Local Dev | Yes | Yes | No | Yes |
| TypeScript Native | No | Yes | No | Yes |
| Production Ready | ✅ | ✅ | ✅ | ✅ |

## Recommendation

- **For hackathons/MVPs**: Use **Ponder** (easiest TypeScript setup)
- **For production dApps**: Use **The Graph** (most mature, decentralized)
- **For quick prototypes**: Use **Goldsky** (instant deployment)
- **For high performance**: Use **Envio** (HyperSync is very fast)

## Next Steps

1. Choose an indexer based on your needs
2. Follow setup guide above
3. Update frontend to query indexer instead of direct contract calls
4. Deploy indexer to production
