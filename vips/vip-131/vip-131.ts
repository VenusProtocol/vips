import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const PSM_USDT = "0x93dB3f46e1DC91c2b9D8Bc7443790bB4699c0E81";
const BASE_RATE_MANTISSA = parseUnits("2.72", 18);

export const vip131 = () => {
  const meta = {
    version: "v2",
    title: "VIP-131 Add Peg Stability (USDT)",
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
