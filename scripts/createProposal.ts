import { TxBuilder } from "@morpho-labs/gnosis-tx-builder";
import Ajv from "ajv";
import { BigNumber } from "ethers";
import fs from "fs/promises";
import { network } from "hardhat";
import readline from "readline-sync";
import { buildMultiSigTx, getSafeAddress, loadMultisigTx } from "src/multisig/utils";
import { loadProposal, proposeVIP } from "src/transactions";
import { SUPPORTED_NETWORKS } from "src/types";
import { getCalldatas, proposalSchema } from "src/utils";

const safeAddress = "0x12341234123412341234123412341232412341234";

let vipPath: string;
let governorAddress: string;
let transactionType: string;

function processInputs(): Promise<void> {
  return new Promise(resolve => {
    vipPath = readline.question(
      "Path relative to ./vips directory to the VIP to propose e.g. vip-244/bscmainnet (if using gnosisTXBuilder press enter to skip ) => ",
    );
    transactionType = readline.question("Type of the proposal txBuilder/venusApp/bsc/gnosisTXBuilder => ");
    governorAddress = readline.question("Address of the governance contract (optional, press enter to skip) => ");
    if (!governorAddress) {
      governorAddress = "";
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
  const result = await proposeVIP(vipPath, governorAddress);
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

export const processGnosisTxBuilder = async () => {
  const safeAddress = getSafeAddress(network.name as SUPPORTED_NETWORKS);

  const multisigVipPath = readline.question(
    "Multisig VIP Path (located at ./multisig/proposals/<path>) to process => ",
  );

  const proposal = await loadMultisigTx(multisigVipPath);
  const multisigTx = await buildMultiSigTx(proposal);
  const batchJson = TxBuilder.batch(safeAddress, multisigTx, { chainId: network.config.chainId });

  const result = await processJson(batchJson);
  if ((network.name === "zksyncsepolia" || network.name === "zksyncmainnet") && result) {
    await fs.writeFile("gnosisTXBuilder.json", result);
    return;
  }
  return result;
};

const processVenusAppProposal = async () => {
  const proposal = await loadProposal(vipPath);
  const validate = new Ajv().compile(proposalSchema);
  const isValid = validate(proposal);

  if (isValid) {
    return processJson(proposal);
  } else {
    console.error(validate.errors);
  }
};

const processBscProposal = async () => {
  const proposal = await loadProposal(vipPath);
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
  if (result) {
    await fs.writeFile(`${transactionType}.json`, result);
  }
};

export default createProposal;
