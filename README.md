# 🚀 Solana Order Execution Engine (Mock)

A high-performance, asynchronous order execution engine built with Node.js, Fastify, and BullMQ. This system mimics a Solana DEX router, handling order queuing, price routing (Raydium vs. Meteora), and real-time WebSocket updates.

## 📋 Features

*   **Hybrid Architecture:** REST API for order submission + WebSockets for real-time status streaming.
*   **Asynchronous Processing:** Uses **BullMQ** (Redis) to decouple HTTP ingress from heavy order processing logic.
*   **Concurrency Control:** Limits execution to 10 concurrent orders to prevent rate-limiting, with automatic exponential backoff.
*   **Mock DEX Routing:** Simulates network latency (2-3s) and price variance between Raydium and Meteora.
*   **Robust Data:** PostgreSQL for persistent order history and Redis for active queue management.

## 🛠️ Tech Stack

*   **Runtime:** Node.js + TypeScript
*   **Server:** Fastify (w/ @fastify/websocket)
*   **Queue:** BullMQ + Redis
*   **Database:** PostgreSQL (via Drizzle ORM)
*   **Containerization:** Docker & Docker Compose

## 🏗️ Architecture

```mermaid
graph LR
    Client[Client] -- POST /execute --> API[Fastify API]
    Client -- WebSocket --> WS[WebSocket Server]
    API -- Add Job --> Queue[Redis Queue]
    Queue -- Process --> Worker[Order Worker]
    Worker -- Query --> Router[Mock DEX Router]
    Worker -- Update DB --> Postgres[(PostgreSQL)]
    Worker -- Pub Event --> RedisPub[Redis Pub/Sub]
    RedisPub -- Sub Event --> WS
    WS -- Push Update --> Client