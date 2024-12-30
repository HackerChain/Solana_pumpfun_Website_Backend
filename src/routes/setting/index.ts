import { Router } from "express";
import { BotConfigService } from "../../service/botConfigService";
import logger from "../../logs/logger";
import { CustomRequest } from "../../middleware/auth";
import XScore from "../../models/XScore";

const router = Router();

router.post("/create", async (req, res) => {
  try {
    const config = await BotConfigService.createConfig(req.body);
    res.json(config);
  } catch (error: any) {
    logger.error(`Config creation error: ${error.message}`);
    res.status(500).json({ message: "Error creating configuration" });
  }
});

// Create/Update configuration
router.post("/config", async (req, res) => {
  try {
    const config = await BotConfigService.updateConfig(req.body);
    res.json(config);
  } catch (error: any) {
    logger.error(`Config update error: ${error.message}`);
    res.status(500).json({ message: "Error updating configuration" });
  }
});

// Get configuration
router.get("/config", async (req, res) => {
  try {
    const config = await BotConfigService.getConfig();
    res.json(config);
  } catch (error: any) {
    logger.error(`Config fetch error: ${error.message}`);
    res.status(500).json({ message: "Error fetching configuration" });
  }
});

// Get Xscore stats
router.get("/xscore-stats", async (req: CustomRequest, res) => {
  try {
    const count = await XScore.countDocuments();
    const stats = {
      totalRecords: count,
      lastUpdated: new Date(),
    };
    
    logger.info(`XScore stats accessed: ${count} records`);
    res.json(stats);
  } catch (error: any) {
    logger.error(`Error fetching XScore stats: ${error.message}`);
    res.status(500).json({ message: "Error fetching XScore stats" });
  }
});

export default router;
