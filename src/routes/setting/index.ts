import { Router } from "express";
import { BotConfigService } from "../../service/botConfigService";
import logger from "../../logs/logger";

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

export default router;
