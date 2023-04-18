import { TxBuilder } from "@morpho-labs/gnosis-tx-builder";
import Ajv from "ajv";
import fs from "fs/promises";

import { loadProposal, proposeVIP } from "../src/transactions";
import { proposalSchema } from "../src/utils";

const readline = require("readline-sync");

const safeAddress = "0x12341234123412341234123412341232412341234";

let vipNumber: string;
let governorAddress: string | null;
let transactionType: string;

function processInputs(): Promise<void> {
  return new Promise(resolve => {
    vipNumber = readline.question("Number of the VIP to propose => ");
    transactionType = readline.question("Type of the proposal txBuilder/venusApp => ");
    governorAddress = readline.question("Address of the governance contract (optional, press enter to skip) => ");
    if (!governorAddress) {
      governorAddress = null;
    }
    resolve();
  });
}

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

const createProposal = async () => {
  await processInputs();
  let result;
  if (transactionType === "txBuilder") {
    result = await processTxBuilder();
  } else {
    result = await processVenusAppProposal();
  }
  console.log(result);
  await fs.writeFile(`${transactionType}.json`, result);
};

createProposal();
