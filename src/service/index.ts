import { fetch_all_data_from_pumpfun } from "./CoindataService";

const fetchData = async () => {
  const data = await fetch_all_data_from_pumpfun();
  return data;
};

// Execute the async function
const getData = async () => {
  const data = await fetchData();
  console.log(data["15m"]);
  console.log(data["3h"]);
  console.log(data["6h"]);
};

getData();
