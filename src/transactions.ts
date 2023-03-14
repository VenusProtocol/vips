import { ContractInterface } from "ethers";
import { ethers } from "hardhat";

import { Proposal } from "./types";
import { getCalldatas, initMainnetUser } from "./utils";
import GOVERNOR_BRAVO_DELEGATE_ABI from "./vip-framework/abi/governorBravoDelegateAbi.json";

const DEFAULT_PROPOSER_ADDRESS = "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D";
const DEFAULT_GOVERNOR_PROXY = "0x2d56dC077072B53571b8252008C60e945108c75a";

export interface Options {
  governorAbi?: ContractInterface;
  governorProxyAddress?: string;
  proposer?: string;
}

const loadProposal = async (num: number) => {
  const x = await import(`../vips/vip-${num}.ts`);
  return x[`vip${num}`]();
};

const initGovernor = async (options: Options = {}) => {
  let proposer;
  const network = await ethers.provider.getNetwork();
  if (network.chainId == 31337) {
    const proposerAddress = options.proposer ?? DEFAULT_PROPOSER_ADDRESS;
    proposer = await initMainnetUser(proposerAddress, ethers.utils.parseEther("1.0"));
  } else {
    [proposer] = await ethers.getSigners();
  }
  const governorProxy = await ethers.getContractAt(
    options.governorAbi ?? GOVERNOR_BRAVO_DELEGATE_ABI,
    options.governorProxyAddress ?? DEFAULT_GOVERNOR_PROXY,
  );

  return { governorProxy, proposer };
};

export const proposeVIP = async (vipNumber: number, options: Options = {}) => {
  let proposal: Proposal;
  const { governorProxy, proposer } = await initGovernor(options);

  try {
    proposal = await loadProposal(vipNumber);
  } catch {
    return "Meta Data Not Available";
  }
  const { targets, signatures, values, meta } = proposal;
  let tx;
  if (proposal.type === undefined || proposal.type === null) {
    tx = await governorProxy
      .connect(proposer)
      .propose(targets, values, signatures, getCalldatas(proposal), JSON.stringify(meta));
  } else {
    tx = await governorProxy
      .connect(proposer)
      .propose(targets, values, signatures, getCalldatas(proposal), JSON.stringify(meta), proposal.type);
  }
  await tx.wait();
  return { targets: targets, calldata: getCalldatas(proposal) };
};
