import { ethers } from "hardhat";

import { cutParams as params } from "../../simulations/vip-361/utils/cut-params-mainnet.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const IL_ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
export const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
export const vLUNA = "0xb91A659E88B51474767CD97EF3196A3e7cEDD2c8";
export const vUST = "0x78366446547D062f45b4C0f320cDaa6d710D87bb";
export const vCAN = "0xeBD0070237a0713E8D94fEf1B728d3d993d290ef";
export const COMPTROLLER_IMPL = "0x7B586Aed00C85d7E32B463DCE094B1faCA7e7e7c";
export const COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
export const GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
export const cutParams = params;
export const vBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
export const vSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
export const vTRXOLD = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
export const vTUSDOLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
export const vXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";

export const vip361 = () => {
  const meta = {
    version: "v2",
    title: "VIP-361 Unlist Market",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "unlistMarket(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "unlistMarket(address)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "unlistMarket(address)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "unlistMarket(address)", GUARDIAN],
      },
      {
        target: IL_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "unlistMarket(address)", NORMAL_TIMELOCK],
      },
      {
        target: IL_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "unlistMarket(address)", FAST_TRACK_TIMELOCK],
      },
      {
        target: IL_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "unlistMarket(address)", CRITICAL_TIMELOCK],
      },
      {
        target: IL_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "unlistMarket(address)", GUARDIAN],
      },
      {
        target: UNITROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[vLUNA, vUST, vCAN], [0, 1, 2, 3, 4, 5, 6, 7, 8], true],
      },
      {
        target: UNITROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[vXVS], [2], true],
      },
      {
        target: UNITROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vBUSD, vSXP, vTRXOLD, vTUSDOLD, vXVS],
          [0, 0, 0, 0, 0],
        ],
      },
      {
        target: UNITROLLER,
        signature: "unlistMarket(address)",
        params: [vLUNA],
      },
      {
        target: UNITROLLER,
        signature: "unlistMarket(address)",
        params: [vUST],
      },
      {
        target: UNITROLLER,
        signature: "unlistMarket(address)",
        params: [vCAN],
      },
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [COMPTROLLER_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip361;
