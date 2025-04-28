import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const OPBNBTESTNET_VTOKEN_BEACON = "0xcc633492097078Ae590C0d11924e82A23f3Ab3E2";
export const OPBNBTESTNET_NEW_VTOKEN_IMPLEMENTATION = "0x25E034878C9873D780f2D82D22A25481aA8c74F6";
export const OPBNBTESTNET_NEW_XVS_VAULT_IMPLEMENTATION = "0x6E09f32F94B2d5056431710BA3eEF75aed40C3b1";
export const OPBNBTESTNET_XVS_VAULT_PROXY = "0xB14A0e72C5C202139F78963C9e89252c1ad16f01";
export const OPBNBTESTNET_XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const OPBNBTESTNET_RATE_MODEL_SETTER = "0x9Ed9e848cE1467a6959c0f28538C46252852180A";
const OPBNBTESTNET_NEW_BLOCK_RATE = 63072000;

export const vip481 = () => {
  const meta = {
    version: "v2",
    title:
      "Reduce the distribution speeds and upgrade implementations considering the update of the blockrate on opBNB Chain",
    description: ``,
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
      {
        target: OPBNBTESTNET_XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [OPBNBTESTNET_NEW_XVS_VAULT_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_NEW_XVS_VAULT_IMPLEMENTATION,
        signature: "_become(address)",
        params: [OPBNBTESTNET_XVS_VAULT_PROXY],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_VAULT_PROXY,
          "setBlocksPerYear(uint256)",
          NETWORK_ADDRESSES.opbnbtestnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.opbnbtestnet,
      },
      // set new block rate in xvs vault
      {
        target: OPBNBTESTNET_XVS_VAULT_PROXY,
        signature: "setBlocksPerYear(uint256)",
        params: [OPBNBTESTNET_NEW_BLOCK_RATE],
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

export default vip481;
