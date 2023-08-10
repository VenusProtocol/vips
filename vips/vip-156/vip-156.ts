import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const FEE_OUT = 100; // 10bps
export const FEE_IN = 0;
export const BASE_RATE_MANTISSA = parseUnits("0.04", 18); // 4%
export const VAI_MINT_CAP = parseUnits("5000000", 18);
export const USDT_FUNDING_AMOUNT = parseUnits("219000", 18);
export const GUARDIAN_WALLET = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const PSM_USDT = "0xC138aa4E424D1A8539e8F38Af5a754a2B7c3Cc36";
const USDT = "0x55d398326f99059ff775485246999027b3197955";

export const vip156 = () => {
  const meta = {
    version: "v2",
    title: "VIP-156 Add Peg Stability (USDT)",
    description: `
       Add the Peg Stability Contract as an admin in the VAI contract: VAI.rely(pegStabilityAddress)
       Setting fee OUT to 10bps.
       Grant the Normal timelock contracts role to change the feeIn and feeOut, vaiMintCap, comptroller, venusTreasury variables within the PSM instance.
       Grant the Critical and Fast-track timelock contracts roles to pause and resume the created PSM instance.
       Increasing VAI baseRate from 1% to 4%.
       Funding 219,000 USDT from Treasury to PSM.
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
        params: [PSM_USDT, "setFeeIn(uint256)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setFeeIn(uint256)", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setFeeOut(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setFeeOut(uint256)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setFeeOut(uint256)", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setVAIMintCap(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setVAIMintCap(uint256)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setVAIMintCap(uint256)", CRITICAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setOracle(address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "setVenusTreasury(address)", NORMAL_TIMELOCK],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "pause()", NORMAL_TIMELOCK],
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
        params: [PSM_USDT, "pause()", GUARDIAN_WALLET],
      },

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "resume()", NORMAL_TIMELOCK],
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
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSM_USDT, "resume()", GUARDIAN_WALLET],
      },

      {
        target: PSM_USDT,
        signature: "setFeeIn(uint256)",
        params: [FEE_IN],
      },

      {
        target: PSM_USDT,
        signature: "setFeeOut(uint256)",
        params: [FEE_OUT],
      },

      {
        target: PSM_USDT,
        signature: "setVAIMintCap(uint256)",
        params: [VAI_MINT_CAP],
      },

      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setBaseRate(uint256)",
        params: [BASE_RATE_MANTISSA],
      },

      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_FUNDING_AMOUNT, NORMAL_TIMELOCK],
      },

      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [PSM_USDT, USDT_FUNDING_AMOUNT],
      },

      {
        target: PSM_USDT,
        signature: "swapStableForVAI(address,uint256)",
        params: [TREASURY, USDT_FUNDING_AMOUNT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
