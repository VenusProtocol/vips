import { TxBuilder } from "@morpho-labs/gnosis-tx-builder";
import Ajv from "ajv";
import fs from "fs/promises";

import { loadProposal, proposeVIP } from "../src/transactions";
import { proposalSchema } from "../src/utils";

const safeAddress = "0x12341234123412341234123412341232412341234";
const vipNumber = process.env.VIP_NUMBER;
const governorAddress = process.env.GOVERNOR_ADDRESS;
const type = process.env.TRANSACTION_TYPE;

const processJson = async data => {
  return JSON.stringify(data, null, 2);
};

const processTxBuilder = async () => {
  const result = await proposeVIP(vipNumber, governorAddress);
  const transactions = [
    {
      to: result.target,
      value: "0",
      data: result.calldata,
    },
  ];
  const batchJson = TxBuilder.batch(safeAddress, transactions);
  return processJson(batchJson);
};

const processVenusAppProposal = async () => {
  const proposal = await loadProposal(vipNumber);
  const validate = new Ajv().compile(proposalSchema);
  const isValid = validate(proposal);

  if (isValid) {
    return processJson(proposal);
  } else {
    console.error(validate.errors);
  }
};

const createProposal = async type => {
  let result;
  if (type === "txBuilder") {
    result = await processTxBuilder();
  } else {
    result = await processVenusAppProposal();
  }
  console.log(result);
  await fs.writeFile(`${type}.json`, result);
};

createProposal(type);
