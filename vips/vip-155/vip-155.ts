import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const LIQUIDATOR = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const PROXY_ADMIN = "0x2b40B43AC5F7949905b0d2Ed9D6154a8ce06084a";
const VENUS_GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";

export const vip155 = (data?: string) => {
  const meta = {
    version: "v2",
    title: "VIP-Liquidator Upgrades",
    description: `
    Update the implementation of liquidator to use ACM instead of onlyOwner
    `,
    forDescription: "I agree that Venus Protocol should proceed with the Liquidator Upgrades",
    againstDescription: "I do not think that Venus Protocol should proceed with the Liquidator Upgrades",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Liquidator Upgrades or not",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "restrictLiquidation(address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "restrictLiquidation(address)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "restrictLiquidation(address)", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "restrictLiquidation(address)", VENUS_GUARDIAN],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "unrestrictLiquidation(address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "unrestrictLiquidation(address)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "unrestrictLiquidation(address)", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "unrestrictLiquidation(address)", VENUS_GUARDIAN],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "addToAllowlist(address,address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "addToAllowlist(address,address)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "addToAllowlist(address,address)", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "addToAllowlist(address,address)", VENUS_GUARDIAN],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "removeFromAllowlist(address,address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "removeFromAllowlist(address,address)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "removeFromAllowlist(address,address)", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "removeFromAllowlist(address,address)", VENUS_GUARDIAN],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "setTreasuryPercent(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "setMinLiquidatableVAI(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "pauseForceVAILiquidate()", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "pauseForceVAILiquidate()", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "pauseForceVAILiquidate()", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "pauseForceVAILiquidate()", VENUS_GUARDIAN],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "resumeForceVAILiquidate()", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "resumeForceVAILiquidate()", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "resumeForceVAILiquidate()", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "resumeForceVAILiquidate()", VENUS_GUARDIAN],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR, "setPendingRedeemChunkLength(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: PROXY_ADMIN,
        signature: "upgradeAndCall(address,address,bytes)",
        params: [LIQUIDATOR, "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96", data],
      },

      {
        target: LIQUIDATOR,
        signature: "setPendingRedeemChunkLength(uint256)",
        params: [10],
      },

      {
        target: LIQUIDATOR,
        signature: "setMinLiquidatableVAI(uint256)",
        params: [parseUnits("1000", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
