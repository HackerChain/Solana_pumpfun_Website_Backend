import mongoose, { Document, Schema } from 'mongoose';

// Interfaces
interface ISaleRule {
  percent: number;
  revenue: number;
}

interface IThresholdRule {
  percent: number;
  flag: boolean;
}

interface IStopSell {
  percent: number;
  lossLimit: number;
}

interface IBotConfig extends Document {
  // Main
  isRunning: boolean;
  workingHours: {
    start: string;
    end: string;
  };

  // Buy Rules
  buy: {
    mcMinLimit: number;
    mcMaxLimit: number;
    investmentPerToken: number;
    uniqueTicker: boolean;
    xScoreThreshold: boolean;
    noMint: boolean;
    blacklist: boolean;
    burnt: boolean;
    top10: IThresholdRule;
    insiders: IThresholdRule;
    holders: IThresholdRule;
  };

  // Sell Rules
  sell: {
    saleRules: ISaleRule[];
    stopSell: IStopSell;
  };
}

// Schema
const BotConfigSchema = new Schema<IBotConfig>({
  // Main
  isRunning: { type: Boolean, default: false },
  workingHours: {
    start: { type: String, default: '05:00' },
    end: { type: String, default: '21:30' }
  },

  // Buy Rules
  buy: {
    mcMinLimit: { type: Number, default: 1000 },
    mcMaxLimit: { type: Number, default: 10000 },
    investmentPerToken: { type: Number, default: 100 },
    uniqueTicker: { type: Boolean, default: true },
    xScoreThreshold: { type: Boolean, default: true },
    noMint: { type: Boolean, default: true },
    blacklist: { type: Boolean, default: true },
    burnt: { type: Boolean, default: true },
    top10: {
      percent: { type: Number, default: 50 },
      flag: { type: Boolean, default: true }
    },
    insiders: {
      percent: { type: Number, default: 30 },
      flag: { type: Boolean, default: true }
    },
    holders: {
      percent: { type: Number, default: 20 },
      flag: { type: Boolean, default: true }
    }
  },

  // Sell Rules
  sell: {
    saleRules: [{
      percent: { type: Number, default: 10 },
      revenue: { type: Number, default: 20 }
    }],
    stopSell: {
      percent: { type: Number, default: 5 },
      lossLimit: { type: Number, default: 10 }
    }
  }
});


const BotConfig = mongoose.model<IBotConfig>('BotConfig', BotConfigSchema);
export default BotConfig;
