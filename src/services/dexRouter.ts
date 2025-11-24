export class MockDexRouter {
    // Simulate network delay helper
    private async sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  
    async getQuotes(token: string, amount: number) {
      // VARIANCE FIX: Delay between 0.5s and 2.0s
      // This makes some orders finish routing way faster than others
      await this.sleep(500 + Math.random() * 1500);
  
      const basePrice = token === 'SOL' ? 150.00 : 20.00;
      
      // Random variance between -1% and +3%
      const raydiumVar = (Math.random() * 0.04) - 0.01; 
      const meteoraVar = (Math.random() * 0.04) - 0.01;
  
      const raydiumPrice = basePrice * (1 + raydiumVar);
      const meteoraPrice = basePrice * (1 + meteoraVar);
  
      return {
        raydium: { price: raydiumPrice, liquidity: 100000 },
        meteora: { price: meteoraPrice, liquidity: 80000 },
        best: raydiumPrice < meteoraPrice ? 'raydium' : 'meteora',
        bestPrice: Math.min(raydiumPrice, meteoraPrice)
      };
    }
  
    async executeSwap(dex: string, amount: number) {
      // VARIANCE FIX: Delay between 1.0s and 4.0s
      // This ensures execution logs are completely scrambled
      await this.sleep(1000 + Math.random() * 3000); 
      
      if (Math.random() < 0.05) {
        throw new Error('Slippage tolerance exceeded ( > 1%)');
      }
  
      return {
        txHash: '5x' + Math.random().toString(36).substring(2, 15) + '...' + Math.random().toString(36).substring(2, 5),
      };
    }
  }
  
  export const dexRouter = new MockDexRouter();