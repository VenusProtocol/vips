import Ajv from "ajv";
import { BigNumber } from "ethers";
import fs from "fs/promises";
import hre from "hardhat";
import { loadProposal } from "src/transactions";
import { proposalSchema } from "src/utils";

const vipPath = process.env.VIP_PATH!;
const outFile = process.env.OUT_FILE || "venusApp.json";

// CRITICAL: `hardhat run` does not set FORKED_NETWORK (unlike the `propose` /
// `createProposal` / `test` tasks). Without this, getOmnichainProposalSenderAddress()
// falls through to the testnet address and cross-chain `values` (LayerZero gas
// fees) are all zero.
(hre as any).FORKED_NETWORK = hre.network.name;

const processJson = (data: any) => {
  const convert = (obj: any) => {
    for (const key in obj) {
      if (obj[key] instanceof BigNumber || typeof obj[key] === "bigint") {
        obj[key] = obj[key].toString();
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        convert(obj[key]);
      }
    }
  };
  convert(data);
  return JSON.stringify(data, null, 2);
};

async function main() {
  const proposal = await loadProposal(vipPath);
  const validate = new Ajv().compile(proposalSchema);
  if (!validate(proposal)) {
    console.error("Validation failed:", validate.errors);
    process.exit(1);
  }
  const result = processJson(proposal);
  await fs.writeFile(outFile, result);
  console.log(`${outFile} generated successfully`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
