import { ethers } from "hardhat";

import { getCalldatas } from "../src/utils";
import GOVERNOR_BRAVO_DELEGATE_ABI from "../src/vip-framework/abi/governorBravoDelegateAbi.json";

const readline = require("readline-sync");

const DEFAULT_GOVERNOR_PROXY = "0x5573422a1a59385c247ec3a66b93b7c08ec2f8f2";

export const loadProposal = async (num: string) => {
  const x = await import(`../vips/vip-${num}/vip-${num}-testnet.ts`);
  return x[`vip${num}Testnet`]();
};

export const proposeTestnetVIP = async () => {
  const vipNumber = readline.question("Number of the VIP to propose => ");
  const proposal = await loadProposal(vipNumber);

  const { targets, signatures, values, meta } = proposal;

  const governorProxy = await ethers.getContractAt(GOVERNOR_BRAVO_DELEGATE_ABI, DEFAULT_GOVERNOR_PROXY);

  const tx = await governorProxy.propose(
    targets,
    values,
    signatures,
    getCalldatas(proposal),
    JSON.stringify(meta),
    proposal.type,
  );
  await tx.wait();
};
