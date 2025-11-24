import WebSocket from 'ws';

// Colors for console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

async function runConcurrentDemo() {
  console.log(`${colors.cyan}🔌 Connecting to WebSocket...${colors.reset}`);
  const ws = new WebSocket('ws://localhost:3000/ws');

  ws.on('open', async () => {
    console.log(`${colors.green}✅ Connected! Preparing to fire 5 concurrent orders...${colors.reset}\n`);

    // Submit 5 orders at once to test concurrency
    const orders = [
      { type: 'market', side: 'buy', token: 'SOL', amount: 10 },
      { type: 'market', side: 'sell', token: 'USDC', amount: 500 },
      { type: 'market', side: 'buy', token: 'SOL', amount: 50 },
      { type: 'market', side: 'buy', token: 'RAY', amount: 100 },
      { type: 'limit', side: 'sell', token: 'SOL', amount: 5 } 
    ];

    console.log(`${colors.yellow}🚀 BLASTING 5 ORDERS SIMULTANEOUSLY...${colors.reset}`);
    
    await Promise.all(orders.map(async (order, index) => {
      const res = await fetch('http://localhost:3000/api/orders/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      const data = await res.json();
      console.log(`📦 [HTTP] Submitted Order #${index + 1}: ID ${data.orderId}`);
    }));
  });

  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    const shortId = msg.orderId.substring(0, 5);

    if (msg.status === 'pending')   
      console.log(`${colors.yellow}🟡 [${shortId}] PENDING   ${colors.reset} -> Queued`);
    else if (msg.status === 'routing')   
      console.log(`${colors.blue}🔍 [${shortId}] ROUTING   ${colors.reset} -> Compare Raydium vs Meteora`);
    else if (msg.status === 'building')  
      console.log(`${colors.cyan}🏗️  [${shortId}] BUILDING  ${colors.reset} -> Route: ${msg.dex.toUpperCase()} ($${msg.price.toFixed(2)})`);
    else if (msg.status === 'submitted') 
      console.log(`${colors.reset}🚀 [${shortId}] SUBMITTED ${colors.reset} -> Tx Sent...`);
    else if (msg.status === 'confirmed') 
      console.log(`${colors.green}✅ [${shortId}] CONFIRMED ${colors.reset} -> Tx: ${msg.txHash}`);
    else if (msg.status === 'failed') 
      console.log(`${colors.red}❌ [${shortId}] FAILED    ${colors.reset} -> ${msg.error}`);
  });
}

runConcurrentDemo();