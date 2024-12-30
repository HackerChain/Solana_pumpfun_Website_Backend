import BotConfig from "../models/BotConfig";
import logger from "../logs/logger";

export class BotConfigService {
  // Create new configuration
  static async createConfig(configData: any) {
    try {
      const config = new BotConfig(configData);
      await config.save();
      logger.info("Bot configuration created successfully");
      return config;
    } catch (error: any) {
      logger.error(`Error creating bot config: ${error.message}`);
      throw error;
    }
  }

  // Get configuration
  static async getConfig() {
    try {
      const config = await BotConfig.findOne();
      if (!config) {
        throw new Error("Bot configuration not found");
      }
      return config;
    } catch (error: any) {
      logger.error(`Error fetching bot config: ${error.message}`);
      throw error;
    }
  }

  // Update configuration
  static async updateConfig(configData: any) {
    try {
      const config = await BotConfig.findOneAndUpdate(
        {},
        { $set: configData },
        { new: true, upsert: true }
      );
      logger.info("Bot configuration updated successfully");
      return config;
    } catch (error: any) {
      logger.error(`Error updating bot config: ${error.message}`);
      throw error;
    }
  }

  // Update specific field
  static async updateField(field: string, value: any) {
    try {
      const update = { [field]: value };
      const config = await BotConfig.findOneAndUpdate(
        {},
        { $set: update },
        { new: true }
      );
      logger.info(`Bot configuration field ${field} updated successfully`);
      return config;
    } catch (error: any) {
      logger.error(`Error updating bot config field: ${error.message}`);
      throw error;
    }
  }
}
