# Polygon Chain Indexer Framework Setup for PolyPuls3

## Overview

Polygon's Chain Indexer Framework is an **open-source, TypeScript-based** framework specifically built for EVM blockchains. It uses **Kafka** for data streaming and provides complete control over your indexing infrastructure.

### Key Benefits
- ✅ **Cost Savings** - Reduce reliance on expensive RPC providers
- ✅ **Complete Control** - Own your data pipeline
- ✅ **Real-time Processing** - Event-driven architecture
- ✅ **Scalable** - Built on Kafka for high throughput
- ✅ **TypeScript Native** - Perfect for your Next.js app

## Architecture

The framework has 3 main layers:

1. **Block Producers** - Fetch and publish raw block data to Kafka
2. **Transformers** - Convert blocks into domain-specific events (your polls, surveys, projects)
3. **Consumers** - Process events and store in your database

```
Polygon Amoy → Block Producer → Kafka → Transformer → Consumer → PostgreSQL → Your API
```

---

## Installation & Setup

### Prerequisites

1. **Kafka** (local or managed)
   ```bash
   # Option 1: Local Kafka with Docker
   docker run -d --name kafka -p 9092:9092 apache/kafka:latest

   # Option 2: Use Confluent Cloud (managed Kafka)
   # Sign up at https://confluent.cloud
   ```

2. **Database** (PostgreSQL recommended)
   ```bash
   docker run -d --name postgres -p 5432:5432 \
     -e POSTGRES_PASSWORD=postgres \
     postgres:15
   ```

### Step 1: Install Chain Indexer Framework

```bash
cd /Users/east/workspace/polygon/polypuls3-app
mkdir indexer
cd indexer
npm init -y
npm install @maticnetwork/chain-indexer-framework
npm install pg kafkajs ethers dotenv typescript ts-node
npm install -D @types/node @types/pg
```

### Step 2: Setup TypeScript Configuration

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Step 3: Create Environment Configuration

Create `.env`:
```env
# Polygon Amoy RPC
RPC_ENDPOINT=https://rpc-amoy.polygon.technology
RPC_WS_ENDPOINT=wss://rpc-amoy.polygon.technology

# Contract Address
POLYPULS3_CONTRACT=0xfc0323F3c5eD271564Ca8F3d4C5FfAD32D553893
DEPLOYMENT_BLOCK=12345678

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=polypuls3-indexer

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=polypuls3
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Topics
BLOCKS_TOPIC=polypuls3-blocks
EVENTS_TOPIC=polypuls3-events
```

### Step 4: Setup Database Schema

Create `src/db/schema.sql`:
```sql
-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_id BIGINT UNIQUE NOT NULL,
    creator VARCHAR(42) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tags TEXT,
    created_at BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    block_number BIGINT NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    indexed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_creator ON projects(creator);
CREATE INDEX idx_projects_is_active ON projects(is_active);

-- Polls Table
CREATE TABLE IF NOT EXISTS polls (
    id SERIAL PRIMARY KEY,
    poll_id BIGINT UNIQUE NOT NULL,
    creator VARCHAR(42) NOT NULL,
    question TEXT NOT NULL,
    options TEXT[] NOT NULL,
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    reward_pool NUMERIC(78, 0) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    total_responses BIGINT DEFAULT 0,
    block_number BIGINT NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    indexed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_polls_creator ON polls(creator);
CREATE INDEX idx_polls_is_active ON polls(is_active);

-- Surveys Table
CREATE TABLE IF NOT EXISTS surveys (
    id SERIAL PRIMARY KEY,
    survey_id BIGINT UNIQUE NOT NULL,
    creator VARCHAR(42) NOT NULL,
    project_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    questions TEXT[] NOT NULL,
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    reward_pool NUMERIC(78, 0) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    total_responses BIGINT DEFAULT 0,
    block_number BIGINT NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    indexed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_surveys_creator ON surveys(creator);
CREATE INDEX idx_surveys_project ON surveys(project_id);
CREATE INDEX idx_surveys_is_active ON surveys(is_active);

-- Poll Responses Table
CREATE TABLE IF NOT EXISTS poll_responses (
    id SERIAL PRIMARY KEY,
    poll_id BIGINT NOT NULL,
    respondent VARCHAR(42) NOT NULL,
    option_index INTEGER NOT NULL,
    timestamp BIGINT NOT NULL,
    reward_claimed BOOLEAN DEFAULT false,
    block_number BIGINT NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    indexed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(poll_id, respondent)
);

CREATE INDEX idx_poll_responses_poll ON poll_responses(poll_id);
CREATE INDEX idx_poll_responses_respondent ON poll_responses(respondent);
```

### Step 5: Create Block Producer

Create `src/producer.ts`:
```typescript
import { BlockPollerProducer } from "@maticnetwork/chain-indexer-framework/block_producers/block_polling_producer";
import * as dotenv from "dotenv";

dotenv.config();

const startBlock = parseInt(process.env.DEPLOYMENT_BLOCK || "0");

const producer = new BlockPollerProducer({
  startBlock,
  rpcWsEndpoints: [process.env.RPC_WS_ENDPOINT!],
  topic: process.env.BLOCKS_TOPIC!,
  maxReOrgDepth: 128,
  maxRetries: 5,
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID!,
    brokers: [process.env.KAFKA_BROKERS!],
  },
});

async function start() {
  console.log(`Starting Block Producer from block ${startBlock}...`);
  await producer.start();
  console.log("Block Producer started successfully!");
}

start().catch(console.error);
```

### Step 6: Create Event Transformer

Create `src/transformer.ts`:
```typescript
import { ethers } from "ethers";
import { Kafka } from "kafkajs";
import * as dotenv from "dotenv";
import PolyPuls3ABI from "../lib/contracts/PolyPuls3ABI.json";

dotenv.config();

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID!,
  brokers: [process.env.KAFKA_BROKERS!],
});

const consumer = kafka.consumer({ groupId: "polypuls3-transformer" });
const producer = kafka.producer();

const iface = new ethers.Interface(PolyPuls3ABI);
const CONTRACT_ADDRESS = process.env.POLYPULS3_CONTRACT!.toLowerCase();

async function start() {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: process.env.BLOCKS_TOPIC!, fromBeginning: true });

  console.log("Transformer listening for blocks...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const block = JSON.parse(message.value!.toString());

        // Process each transaction in the block
        for (const tx of block.transactions || []) {
          if (tx.to?.toLowerCase() !== CONTRACT_ADDRESS) continue;
          if (!tx.logs) continue;

          // Parse logs for events
          for (const log of tx.logs) {
            if (log.address?.toLowerCase() !== CONTRACT_ADDRESS) continue;

            try {
              const parsedLog = iface.parseLog({
                topics: log.topics,
                data: log.data,
              });

              if (!parsedLog) continue;

              // Create event object
              const event = {
                eventName: parsedLog.name,
                args: parsedLog.args,
                blockNumber: block.number,
                transactionHash: tx.hash,
                logIndex: log.logIndex,
                timestamp: block.timestamp,
              };

              // Send to events topic
              await producer.send({
                topic: process.env.EVENTS_TOPIC!,
                messages: [
                  {
                    key: `${tx.hash}-${log.logIndex}`,
                    value: JSON.stringify(event),
                  },
                ],
              });

              console.log(`Transformed event: ${parsedLog.name}`);
            } catch (err) {
              // Skip non-contract logs
            }
          }
        }
      } catch (error) {
        console.error("Error transforming block:", error);
      }
    },
  });
}

start().catch(console.error);
```

### Step 7: Create Event Consumer

Create `src/consumer.ts`:
```typescript
import { Kafka } from "kafkajs";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID!,
  brokers: [process.env.KAFKA_BROKERS!],
});

const consumer = kafka.consumer({ groupId: "polypuls3-consumer" });

const db = new Pool({
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT!),
  database: process.env.DATABASE_NAME!,
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
});

async function handleProjectCreated(event: any) {
  const { projectId, creator, name } = event.args;

  await db.query(
    `INSERT INTO projects (project_id, creator, name, description, tags, created_at, block_number, transaction_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (project_id) DO NOTHING`,
    [
      projectId.toString(),
      creator.toLowerCase(),
      name,
      "", // Will be fetched separately
      "", // Will be fetched separately
      event.timestamp,
      event.blockNumber,
      event.transactionHash,
    ]
  );

  console.log(`Indexed project #${projectId}: ${name}`);
}

async function handlePollCreated(event: any) {
  const { pollId, creator, question, rewardPool } = event.args;

  await db.query(
    `INSERT INTO polls (poll_id, creator, question, options, created_at, expires_at, reward_pool, block_number, transaction_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (poll_id) DO NOTHING`,
    [
      pollId.toString(),
      creator.toLowerCase(),
      question,
      [], // Will be fetched from contract
      event.timestamp,
      0, // Will be fetched from contract
      rewardPool.toString(),
      event.blockNumber,
      event.transactionHash,
    ]
  );

  console.log(`Indexed poll #${pollId}: ${question}`);
}

async function handlePollResponse(event: any) {
  const { pollId, respondent, optionIndex } = event.args;

  await db.query(
    `INSERT INTO poll_responses (poll_id, respondent, option_index, timestamp, block_number, transaction_hash)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (poll_id, respondent) DO NOTHING`,
    [
      pollId.toString(),
      respondent.toLowerCase(),
      optionIndex.toString(),
      event.timestamp,
      event.blockNumber,
      event.transactionHash,
    ]
  );

  // Update poll total responses
  await db.query(
    `UPDATE polls SET total_responses = total_responses + 1 WHERE poll_id = $1`,
    [pollId.toString()]
  );

  console.log(`Indexed response for poll #${pollId} from ${respondent}`);
}

async function start() {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.EVENTS_TOPIC!, fromBeginning: true });

  console.log("Consumer listening for events...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const event = JSON.parse(message.value!.toString());

        switch (event.eventName) {
          case "ProjectCreated":
            await handleProjectCreated(event);
            break;
          case "PollCreated":
            await handlePollCreated(event);
            break;
          case "PollResponseSubmitted":
            await handlePollResponse(event);
            break;
          case "SurveyCreated":
            // Handle survey creation
            break;
          case "SurveyResponseSubmitted":
            // Handle survey response
            break;
          default:
            console.log(`Unknown event: ${event.eventName}`);
        }
      } catch (error) {
        console.error("Error processing event:", error);
      }
    },
  });
}

start().catch(console.error);
```

### Step 8: Create API Server

Create `src/api.ts`:
```typescript
import express from "express";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

const db = new Pool({
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT!),
  database: process.env.DATABASE_NAME!,
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
});

app.use(express.json());

// Get user's projects
app.get("/api/projects/:creator", async (req, res) => {
  try {
    const { creator } = req.params;
    const result = await db.query(
      "SELECT * FROM projects WHERE creator = $1 AND is_active = true ORDER BY created_at DESC",
      [creator.toLowerCase()]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get user's polls
app.get("/api/polls/:creator", async (req, res) => {
  try {
    const { creator } = req.params;
    const result = await db.query(
      "SELECT * FROM polls WHERE creator = $1 AND is_active = true ORDER BY created_at DESC",
      [creator.toLowerCase()]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch polls" });
  }
});

// Get poll details with responses
app.get("/api/polls/:pollId/details", async (req, res) => {
  try {
    const { pollId } = req.params;

    const pollResult = await db.query("SELECT * FROM polls WHERE poll_id = $1", [pollId]);
    const responsesResult = await db.query(
      "SELECT * FROM poll_responses WHERE poll_id = $1 ORDER BY timestamp DESC",
      [pollId]
    );

    res.json({
      poll: pollResult.rows[0],
      responses: responsesResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch poll details" });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
```

### Step 9: Add Scripts to package.json

```json
{
  "scripts": {
    "setup-db": "psql -h localhost -U postgres -d polypuls3 -f src/db/schema.sql",
    "producer": "ts-node src/producer.ts",
    "transformer": "ts-node src/transformer.ts",
    "consumer": "ts-node src/consumer.ts",
    "api": "ts-node src/api.ts",
    "start-all": "npm run producer & npm run transformer & npm run consumer & npm run api"
  }
}
```

---

## Running the Indexer

### 1. Setup Database
```bash
createdb polypuls3
npm run setup-db
```

### 2. Start All Services
```bash
# Terminal 1: Block Producer
npm run producer

# Terminal 2: Transformer
npm run transformer

# Terminal 3: Consumer
npm run consumer

# Terminal 4: API Server
npm run api
```

Or run all at once:
```bash
npm run start-all
```

### 3. Update Frontend

Update `app/creator/page.tsx` to use the indexer API:
```typescript
const [projects, setProjects] = useState([])

useEffect(() => {
  async function fetchProjects() {
    if (!walletAddress) return

    const res = await fetch(`http://localhost:3001/api/projects/${walletAddress}`)
    const data = await res.json()
    setProjects(data)
  }

  fetchProjects()
}, [walletAddress])
```

---

## Production Deployment

### Option 1: Deploy to Railway
1. Create Railway account
2. Deploy PostgreSQL and Kafka addons
3. Deploy each service as separate Railway service

### Option 2: Deploy to AWS
1. Use Amazon MSK for Kafka
2. Use RDS for PostgreSQL
3. Deploy services on ECS/Fargate

### Option 3: Use Managed Kafka
- **Confluent Cloud**: https://confluent.cloud
- **Upstash Kafka**: https://upstash.com

---

## Monitoring & Maintenance

### Check Indexing Status
```sql
-- Check latest indexed block
SELECT MAX(block_number) FROM projects;

-- Check event counts
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM polls;
SELECT COUNT(*) FROM poll_responses;
```

### Handle Reorgs
The framework handles reorgs automatically with `maxReOrgDepth` configuration.

---

## Resources

- **Official Docs**: https://docs.polygon.technology/tools/chain-indexer-framework/
- **GitHub**: https://github.com/0xPolygon/chain-indexer-framework
- **Polygon Discord**: https://discord.gg/polygon

---

## Comparison with Other Indexers

| Feature | Chain Indexer Framework | The Graph | Ponder |
|---------|------------------------|-----------|--------|
| TypeScript Native | ✅ | ❌ | ✅ |
| Self-hosted | ✅ | ✅ | ✅ |
| Kafka-based | ✅ | ❌ | ❌ |
| Polygon Official | ✅ | ❌ | ❌ |
| Learning Curve | Medium | Medium | Easy |
| Infrastructure | Kafka + DB | Graph Node | Simple |

**Use Chain Indexer Framework if:**
- You want Polygon's official solution
- You need Kafka for other services
- You want complete infrastructure control
- You're building enterprise-scale apps
