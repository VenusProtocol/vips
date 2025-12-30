import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const OPBNBMAINNET_VTOKEN_BEACON = "0xfeD1d3a13597c5aBc893Af41ED5cb17e64c847c7";
export const OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION = "0x8778088536607917cBb5F1428988fe7088daE971";
export const OPBNBMAINNET_XVS_VAULT_PROXY = "0x7dc969122450749A8B0777c0e324522d67737988";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";

export const OPBNBMAINNET_RATE_MODEL_SETTER = "0x5305CB5Dc76281d7e895aC4E492435167D5A95b1";

export const NEW_OPBNB_BLOCK_RATE = 126144000;

export interface SpeedRecord {
  market: string;
  symbol: string;
  supplySideSpeed: string;
  borrowSideSpeed: string;
}

export const vip580 = () => {
  const meta = {
    version: "v2",
    title: "VIP-580 Fourier Hardfork OPBNB",
    description: `#### Summary`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: OPBNBMAINNET_VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbmainnet,
      },

      // set new block rate in xvs vault
      {
        target: OPBNBMAINNET_XVS_VAULT_PROXY,
        signature: "setBlocksPerYear(uint256)",
        params: [NEW_OPBNB_BLOCK_RATE],
        dstChainId: LzChainId.opbnbmainnet,
      },

      // update interest rate models
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", OPBNBMAINNET_RATE_MODEL_SETTER],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_RATE_MODEL_SETTER,
        signature: "run()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", OPBNBMAINNET_RATE_MODEL_SETTER],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip580;
