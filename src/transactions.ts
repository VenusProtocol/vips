import { ethers } from "hardhat";

import { getCalldatas } from "./utils";

const DEFAULT_GOVERNOR_PROXY = "0x2d56dC077072B53571b8252008C60e945108c75a";

export const loadProposal = async (path: string) => {
  const proposalModule = await import(`../vips/${path}`);
  const proposalCreated = await proposalModule.default();
  const proposal = {
    signatures: proposalCreated.signatures,
    targets: proposalCreated.targets,
    params: proposalCreated.params,
    values: proposalCreated.values,
    meta: proposalCreated.meta,
    type: proposalCreated.type,
  };

  return proposal;
};

export const proposeVIP = async (vipPath: string, governorProxyAddress?: string) => {
  const proposal = await loadProposal(vipPath);

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
