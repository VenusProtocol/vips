import { proposeVIP } from "../src/transactions";

const vipNumber = process.env.VIP_NUMBER; // Replace with the VIP number you want to propose in env
(async () => {
  const tx = await proposeVIP(vipNumber);
  console.log(tx);
})();
