import config from "../config";
import { fetch_all_data_from_pumpfun } from "./CoindataService";

let now_data: { [key: string]: any[] } = {};
let updating_data: { [key: string]: any[] } = {};
let isUpdating = false;

// Update data periodically
const UPDATE_INTERVAL = config.update_cycle; // 10 seconds

export const startDataUpdate = () => {
  setInterval(async () => {
    if (!isUpdating) {
      // console.log("Updating data...");
      isUpdating = true;
      updating_data = await fetch_all_data_from_pumpfun();

      now_data = updating_data;
      isUpdating = false;
    }
  }, UPDATE_INTERVAL);
};

export const getDatafromPumpfun = async () => {
  // If this is first request, initialize data
  if (Object.keys(now_data).length === 0) {
    now_data = await fetch_all_data_from_pumpfun();
  }
  return now_data;
};

// Start the update cycle when service initializes
