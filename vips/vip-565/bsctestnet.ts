import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const OPBNBTESTNET_VTOKEN_BEACON = "0xcc633492097078Ae590C0d11924e82A23f3Ab3E2";
export const OPBNBTESTNET_NEW_VTOKEN_IMPLEMENTATION = "0x34Baee433141Be2bc9e5A8058799EA4FaBbAa525";
export const OPBNBTESTNET_XVS_VAULT_PROXY = "0xB14A0e72C5C202139F78963C9e89252c1ad16f01";
export const OPBNBTESTNET_XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

export const OPBNBTESTNET_RATE_MODEL_SETTER = "0xA36b1d464A15C7eD74A162aa74E7cF0760bd166B";

export const NEW_OPBNB_BLOCK_RATE = 126144000;

export interface SpeedRecord {
  market: string;
  symbol: string;
  supplySideSpeed: string;
  borrowSideSpeed: string;
}

export const vip565 = () => {
  const meta = {
    version: "v2",
    title: "VIP-562 Fourier Hardfork OPBNB",
    description: `#### Summary`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: OPBNBTESTNET_VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [OPBNBTESTNET_NEW_VTOKEN_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbtestnet,
      },

      // set new block rate in xvs vault
      {
        target: OPBNBTESTNET_XVS_VAULT_PROXY,
        signature: "setBlocksPerYear(uint256)",
        params: [NEW_OPBNB_BLOCK_RATE],
        dstChainId: LzChainId.opbnbtestnet,
      },

      // update interest rate models
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", OPBNBTESTNET_RATE_MODEL_SETTER],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_RATE_MODEL_SETTER,
        signature: "run()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", OPBNBTESTNET_RATE_MODEL_SETTER],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip565;
