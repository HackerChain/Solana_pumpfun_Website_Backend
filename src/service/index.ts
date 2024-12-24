import { fetch_all_data_from_pumpfun } from "./CoindataService";

export const getDatafromPumpfun = async () => {
  const data = await fetch_all_data_from_pumpfun();
  return data;
};

// Execute the async function
// export const da = async () => {
//   const data = await getDatafromPumpfun();
//   return data;
//   // console.log(data["15m"]);
//   // console.log(data["3h"]);
//   // console.log(data["6h"]);
// };
