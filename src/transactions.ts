import { ethers } from "hardhat";

import { getCalldatas } from "./utils";

const DEFAULT_GOVERNOR_PROXY = "0x2d56dC077072B53571b8252008C60e945108c75a";

export const loadProposal = async (num: string) => {
  const x = await import(`../vips/vip-${num}.ts`);
  num = num.replace("-testnet", "Testnet");
  return x[`vip${num}`]();
};

export const proposeVIP = async (vipNumber: string, governorProxyAddress?: string) => {
  const proposal = await loadProposal(vipNumber);

  const { targets, signatures, values, meta } = proposal;

  const params = [targets, values, signatures, getCalldatas(proposal), JSON.stringify(meta), proposal.type];
  let functionSignature = "function propose(address[],uint256[],string[],bytes[],string,uint8)";

  if (proposal.type === undefined || proposal.type === null) {
    functionSignature = "function propose(address[],uint256[],string[],bytes[],string)";
    params.pop();
  }

  return {
    target: governorProxyAddress ?? DEFAULT_GOVERNOR_PROXY,
    calldata: new ethers.utils.Interface([functionSignature]).encodeFunctionData("propose", params),
  };
};
