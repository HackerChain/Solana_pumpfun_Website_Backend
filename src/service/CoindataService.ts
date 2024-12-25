import { HEADER } from "../config/config";
import logger from "../logs/logger";
import { updateDataProcess } from "../utils";

const baseURL = "https://frontend-api.pump.fun/coins/featured/";

interface PumpFunParams {
  timeWindow: string;
  limit: number;
  offset: number;
}

const fetch_from_pumpfun = async ({
  timeWindow,
  limit,
  offset,
}: PumpFunParams) => {
  const url = `${baseURL}${timeWindow}?limit=${limit}&offset=${offset}&includeNsfw=false`;
  // console.log("fetch_from_pumpfun url:", url);
  try {
    const response = await fetch(url, HEADER);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error: any) {
    console.error("Error fetching from pump.fun:", error.message);
    logger.critical("Error fetching from pump.fun: " + error);
    return null;
  }
};

const TimeArray = ["15m", "3h", "6h"];

const LIMIT = 50;
const SIZE = 200;

export const fetch_all_data_from_pumpfun = async () => {
  const data: { [key: string]: any[] } = {
    "15m": [],
    "3h": [],
    "6h": [],
  };

  for (const time of TimeArray) {
    for (let i = 0; i <= SIZE; i += LIMIT) {
      const result = await fetch_from_pumpfun({
        timeWindow: time,
        limit: LIMIT,
        offset: i,
      });
      const result_data = await updateDataProcess(result);
      // console.log("result:", result);
      if (result_data) {
        data[time].push(...result_data);
      }
    }
  }

  return data;
};
