import { TxBuilder } from "@morpho-labs/gnosis-tx-builder";
import Ajv from "ajv";
import { BigNumber } from "ethers";
import fs from "fs/promises";
import { network } from "hardhat";

import { buildMultiSigTx, getSafeAddress, loadMultisigTx } from "../src/multisig/utils";
import { loadProposal, proposeVIP } from "../src/transactions";
import { getCalldatas, proposalSchema } from "../src/utils";

const readline = require("readline-sync");

const safeAddress = "0x12341234123412341234123412341232412341234";

let vipNumber: string;
let governorAddress: string | null;
let transactionType: string;

function processInputs(): Promise<void> {
  return new Promise(resolve => {
    vipNumber = readline.question("Number of the VIP to propose (if using gnosisTXBuilder press enter to skip ) => ");
    transactionType = readline.question("Type of the proposal txBuilder/venusApp/bsc/gnosisTXBuilder => ");
    governorAddress = readline.question("Address of the governance contract (optional, press enter to skip) => ");
    if (!governorAddress) {
      governorAddress = null;
    }
    resolve();
  });
}

type JsonObject = { [key: string]: any };

const processJson = async (data: JsonObject) => {
  const convertBigNumberToString = (obj: JsonObject) => {
    for (const key in obj) {
      if (obj[key] instanceof BigNumber) {
        obj[key] = obj[key].toString(10); // Convert BigNumber to decimal representation
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        convertBigNumberToString(obj[key]); // Recursively convert nested objects
      }
    }
  };

  convertBigNumberToString(data);
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

const processGnosisTxBuilder = async () => {
  const safeAddress = getSafeAddress(network.name);

  const txID = readline.question("Multisig VIP ID (located at ./multisig/proposals/vip-{id}) to process => ");

  const proposal = await loadMultisigTx(txID, network.name);
  const multisigTx = await buildMultiSigTx(proposal);
  const batchJson = TxBuilder.batch(safeAddress, multisigTx, { chainId: network.config.chainId });

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

const processBscProposal = async () => {
  const proposal = await loadProposal(vipNumber);
  const data = {
    targets: proposal.targets,
    signatures: proposal.signatures,
    values: proposal.values,
    calldata: getCalldatas(proposal),
    description: processJson(proposal.meta),
    type: proposal.type,
  };

  return processJson(data);
};

const createProposal = async () => {
  await processInputs();
  let result;
  if (transactionType === "txBuilder") {
    result = await processTxBuilder();
  } else if (transactionType === "venusApp") {
    result = await processVenusAppProposal();
  } else if (transactionType === "gnosisTXBuilder") {
    result = await processGnosisTxBuilder();
  } else {
    result = await processBscProposal();
  }
  console.log(result);
  await fs.writeFile(`${transactionType}.json`, result);
};

createProposal();
