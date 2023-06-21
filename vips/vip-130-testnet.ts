import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const VAI_CONTROLLER_PROXY = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
const VAI = "0x5fFbE5302BadED40941A403228E6AD03f93752d9";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const PSM_USDT = "0x2822E0Ac03e64F7BA26e0aCb79EC0B6336e9CA2A";
const BASE_RATE_MANTISSA = parseUnits("2.72", 18);

export const vip130 = () => {
  const meta = {
    version: "v2",
    title: "VIP-130 Add Peg Stability (USDT)",
    description: `
       Add the Peg Stability Contract as an admin in the VAI contract: VAI.rely(pegStabilityAddress)
       Grant the Normal timelock contracts role to change the feeIn and feeOut, vaiMintCap, comptroller, venusTreasury variables within the PSM instance.
       Grant the Critical and Fast-track timelock contracts roles to pause and resume the created PSM instance.
      `,
    forDescription: "I agree that Venus Protocol should proceed with the Add Peg Stability (USDT)",
    againstDescription: "I do not think that Venus Protocol should proceed with the Add Peg Stability (USDT)",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Add Peg Stability (USDT) or not",
  };

  return makeProposal(
    [
      {
        target: PSM_USDT,
        signature: "acceptOwnership()",
        params: [],
      },

      {
        target: VAI,
        signature: "rely(address)",
        params: [PSM_USDT],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setFeeIn(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setFeeOut(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setVaiMintCap(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setComptroller(address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setVenusTreasury(address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "pause()", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "pause()", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "resume()", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "resume()", CRITICAL_TIMELOCK],
      },

      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setBaseRate(uint256)",
        params: [BASE_RATE_MANTISSA],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
