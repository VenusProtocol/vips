import { ethers } from "hardhat";

import { cutParams as params } from "../../simulations/vip-357/utils/cut-params-mainnet.json";
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
export const cutParams = params;

export const vip357 = () => {
  const meta = {
    version: "v2",
    title: "VIP-357 Unlist Market",
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
        target: UNITROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[vLUNA, vUST, vCAN], [0, 1, 2, 3, 4, 5, 6, 7, 8], true],
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

export default vip357;
