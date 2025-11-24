export class MockDexRouter {
    // Simulate network delay helper
    private async sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  
    async getQuotes(token: string, amount: number) {
      await this.sleep(300); // Simulate network roundtrip
      
      const basePrice = token === 'SOL' ? 145.50 : 20.00;
      const variance = () => (Math.random() * 0.05) - 0.025; // +/- 2.5%
  
      const raydiumPrice = basePrice * (1 + variance());
      const meteoraPrice = basePrice * (1 + variance());
  
      return {
        raydium: { price: raydiumPrice, liquidity: 100000 },
        meteora: { price: meteoraPrice, liquidity: 80000 },
        best: raydiumPrice < meteoraPrice ? 'raydium' : 'meteora',
        bestPrice: Math.min(raydiumPrice, meteoraPrice)
      };
    }
  
    async executeSwap(dex: string, amount: number) {
      await this.sleep(2000); // Simulate on-chain transaction time
      
      // 5% chance of failure
      if (Math.random() < 0.05) {
        throw new Error('Slippage tolerance exceeded');
      }
  
      return {
        txHash: '5x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      };
    }
  }
  
  export const dexRouter = new MockDexRouter();