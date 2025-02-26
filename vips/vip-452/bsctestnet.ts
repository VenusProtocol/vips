import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { berachainbartio } = NETWORK_ADDRESSES;

export const OMNICHAIN_PROPOSAL_SENDER = "0xCfD34AEB46b1CB4779c945854d405E91D27A1899";
export const MAX_DAILY_LIMIT = 100;
export const OMNICHAIN_EXECUTOR_OWNER = "0x94ba324b639F2C4617834dFcF45EA23188a17124";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0x1ba10ca9a744131aD8428D719767816A693c3b71";
export const ACM = "0xEf368e4c1f9ACC9241E66CD67531FEB195fF7536";
export const TREASURY = "0xF2f878a9cF9a43409F673CfA17B4F1E9D8169211";
export const BOUND_VALIDATOR = "0x24C815d92f5F084E3679ceD7c51c2033784AaC06";
export const MOCK_USDCe = "0x0A912ebEc8D4a35568C1BFE368AD68A548597906";
export const WETH = "0x5A4bcFa0cf7f029bb5A62Cd52a24F7B2d0C18d2A";
export const WBERA = "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8";
export const XVS = "0x75A3668f0b0d06E45601C883b0c66f7Dd2364208";

const vip452 = () => {
  const meta = {
    version: "v2",
    title: "VIP-452",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.berachainbartio, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.berachainbartio, berachainbartio.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [3],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: TREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },

      {
        target: berachainbartio.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [berachainbartio.XVS, parseUnits("7", 18)],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [WETH, parseUnits("3000", 18)],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [WBERA, parseUnits("6", 18)],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [MOCK_USDCe, parseUnits("1", 18)],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3])[])",
        params: [
          [
            [
              berachainbartio.XVS,
              [berachainbartio.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
            ],
            [
              WETH,
              [berachainbartio.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
            ],
            [
              WBERA,
              [berachainbartio.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
            ],
            [
              MOCK_USDCe,
              [berachainbartio.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
            ],
          ],
        ],
        dstChainId: LzChainId.berachainbartio,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip452;
