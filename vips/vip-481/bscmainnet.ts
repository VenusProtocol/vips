import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const OPBNBMAINNET_VTOKEN_BEACON = "0xfeD1d3a13597c5aBc893Af41ED5cb17e64c847c7";
export const OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION = "0x8Fa6460437F6Ba76808C93108F2134c5D6394D94";
export const OPBNBMAINNET_NEW_XVS_VAULT_IMPLEMENTATION = "0x785BEF8B6dB40E86fA3749b44cD67C14945E2a71";
export const OPBNBMAINNET_XVS_VAULT_PROXY = "0x7dc969122450749A8B0777c0e324522d67737988";
export const OPBNBMAINNET_XVS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const OPBNBMAINNET_RATE_MODEL_SETTER = "0x2953eBE898E964a38533A28B898265dc5d788aa8";
const OPBNBMAINNET_NEW_BLOCK_RATE = 63072000;

export const vip481 = () => {
  const meta = {
    version: "v2",
    title:
      "Reduce the distribution speeds and upgrade implementations considering the update of the blockrate on BNB and OPBNB Chain",
    description: ``,
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
      {
        target: OPBNBMAINNET_XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [OPBNBMAINNET_NEW_XVS_VAULT_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_NEW_XVS_VAULT_IMPLEMENTATION,
        signature: "_become(address)",
        params: [OPBNBMAINNET_XVS_VAULT_PROXY],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_XVS_VAULT_PROXY,
          "setBlocksPerYear(uint256)",
          NETWORK_ADDRESSES.opbnbmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.opbnbmainnet,
      },
      // set new block rate in xvs vault
      {
        target: OPBNBMAINNET_XVS_VAULT_PROXY,
        signature: "setBlocksPerYear(uint256)",
        params: [OPBNBMAINNET_NEW_BLOCK_RATE],
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

export default vip481;
