import { proposeVIP } from "../src/transactions";
import { setForkBlock } from "../src/utils";

const vipNumber = 101; // Replace with the VIP number you want to propose
const options = {}; // Optional testing options

(async () => {
  await setForkBlock(26107552);
  const tx = await proposeVIP(vipNumber, options);
  console.log(tx);
})();
