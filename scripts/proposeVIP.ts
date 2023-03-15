import { proposeVIP } from "../src/transactions";

const vipNumber = 101; // Replace with the VIP number you want to propose
(async () => {
  const tx = await proposeVIP(vipNumber);
  //currently unused
  tx;
})();
