import { TxBuilder } from "@morpho-labs/gnosis-tx-builder";
import fs from "fs";

import { proposeVIP } from "../src/transactions";

const safeAddress = "0x12341234123412341234123412341232412341234";
const vipNumber = process.env.VIP_NUMBER; // Replace with the VIP number you want to send in env
const governorAddress = process.env.GOVERNOR_ADDRESS;

(async () => {
  const result = await proposeVIP(vipNumber, governorAddress);
  const transactions = [
    {
      to: result.target,
      value: "0",
      data: result.calldata,
    },
  ];
  const batchJson = TxBuilder.batch(safeAddress, transactions);
  fs.writeFileSync("batchTx.json", JSON.stringify(batchJson, null, 2));
  console.log(JSON.stringify(batchJson, null, 2));
})();
