import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE = "0xEF4e53a9A4565ef243A2f0ee9a7fc2410E1aA623";
export const BINANCE_ORACLE = "0x496B6b03469472572C47bdB407d5549b244a74F2";
export const BOUND_VALIDATOR = "0x049537Bb065e6253e9D8D08B45Bf6b753657A746";
export const DEFAULT_PROXY_ADMIN = "0xB1281ADC816fba7df64B798D7A0BC4bd2a6d42f4";

export const RESILIENT_ORACLE_IMPLEMENTATION = "0x2fD256De0E5e783A51d3a661bCD5D04f1aF6E243";
export const BINANCE_ORACLE_IMPLEMENTATION = "0xCFbE7121c4Fb550502854B8c69f88f817D34AaB2";
export const BOUND_VALIDATOR_IMPLEMENTATION = "0x73b615e88fDAe39fb8ED12d0dFeFBCDF5BA0E312";

export const vip495 = () => {
  const meta = {
    version: "v2",
    title: "",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE, RESILIENT_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BINANCE_ORACLE, BINANCE_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR, BOUND_VALIDATOR_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip495;
