import { Router } from "express";
import logger from "../../logs/logger";
import { getDatafromPumpfun } from "../../service";

const router = Router();

router.get("/:time", async (req, res) => {
  console.log("Received request for time window:", req.params.time);
  try {
    const { time } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const tmpData = await getDatafromPumpfun();
    const timeData = tmpData[time] || [];
    const paginatedData = timeData.slice(offset, offset + limit);

    logger.info(
      `Returning ${paginatedData.length} records for time window: ${time}`
    );

    res.json({
      data: paginatedData,
      total: timeData.length,
      offset,
      limit,
    });
  } catch (error: any) {
    logger.error(`Error fetching coin data: ${error.message}`);
    res.status(500).json({ message: "Error fetching coin data" });
  }
});

export default router;
