import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const LIQUIDATOR = "0x55AEABa76ecf144031Ef64E222166eb28Cb4865F";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";

export const vip151Testnet = () => {
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
        params: [LIQUIDATOR, "unrestrictLiquidation(address)", NORMAL_TIMELOCK],
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
        params: [LIQUIDATOR, "removeFromAllowlist(address,address)", NORMAL_TIMELOCK],
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
        params: [LIQUIDATOR, "setPendingRedeemChunkLength(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: LIQUIDATOR,
        signature: "acceptOwnership()",
        params: [],
      },

      {
        target: LIQUIDATOR,
        signature: "setPendingRedeemChunkLength(uint256)",
        params: [10],
      },

      {
        target: LIQUIDATOR,
        signature: "resumeForceVAILiquidate()",
        params: [],
      },
      {
        target: COMPTROLLER,
        signature: "_setLiquidatorContract(address)",
        params: [LIQUIDATOR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
