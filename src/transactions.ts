import { ethers } from "hardhat";

import { getCalldatas } from "./utils";
import GOVERNOR_BRAVO_DELEGATE_ABI from "./vip-framework/abi/governorBravoDelegateAbi.json";

const DEFAULT_GOVERNOR_PROXY = "0x5573422A1a59385C247ec3a66B93B7C08eC2f8f2";

export const loadProposal = async (num: string) => {
  const x = await import("../vips/vip-174/vip-174-testnet");
  console.log("----------------------------XXX", x);
  return x["vip174Testnet"]();
};

export const proposeVIP = async (vipNumber: string) => {
  const proposal = await loadProposal(vipNumber);
  console.log("----------------------------proposal", proposal);

  const [proposer] = await ethers.getSigners();
  const governorProxy = await ethers.getContractAt(GOVERNOR_BRAVO_DELEGATE_ABI, DEFAULT_GOVERNOR_PROXY);

  const { targets, signatures, values, meta } = proposal;

  await governorProxy
    .connect(proposer)
    .propose(targets, values, signatures, getCalldatas(proposal), JSON.stringify(meta), proposal.type);

  // await governorProxy
  //   .connect(proposer)
  //   .castVote(296, 1);
};

proposeVIP(130);
