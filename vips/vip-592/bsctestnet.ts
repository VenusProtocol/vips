import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet, sepolia, arbitrumsepolia, basesepolia, opsepolia, unichainsepolia, zksyncsepolia } =
  NETWORK_ADDRESSES;
export const CORE_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const RISK_ORACLE = "0x4DEA4D1A9F6101D4adacE89f16064D780D2F241d";
export const RISK_STEWARD_RECEIVER = "0x2F6eb64826f3A067eBFFb5909De7AA4e0Cb31b81";
export const MARKETCAP_STEWARD = "0xecC583037338D1EFE2C15bb2c6ac81E0294375C2";
export const COLLATERALFACTORS_STEWARD = "0xBf821F512EA224201108303cc6dA200391Eb38aC";
export const IRM_STEWARD = "0xE7AcaF3d6CeBA793d94f867FFCE0A1e9a6b3977C";

// SEPOLIA
export const SEPOLIA_DESTINATION_STEWARD_RECEIVER = "0x5675112bf79C66d8CEbe48C40f25e9Dd6576c4e6";
export const SEPOLIA_MC_STEWARD = "0xcD598bDcfF0433395918512359745f83F5730C49";
export const SEPOLIA_CF_STEWARD = "0xBe9174A13577B016280aEc20a3b369C5BA272241";
export const SEPOLIA_IRM_STEWARD = "0xa7E80c303f2EcF9436F11Da14C512B09B44854f4";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SEPOLIA_COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";

// ARBITRUM_SEPOLIA
export const ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER = "0xCbab4C50D8458958515763dA4Db0Ba74769a5653";
export const ARBITRUM_SEPOLIA_MC_STEWARD = "0x284d000665296515280a4fB066a887EFF6A3bD9E";
export const ARBITRUM_SEPOLIA_CF_STEWARD = "0xC1eCF5Ee6B2F43194359c02FB460B31e4494895d";
export const ARBITRUM_SEPOLIA_IRM_STEWARD = "0x5675112bf79C66d8CEbe48C40f25e9Dd6576c4e6";
export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const ARBITRUM_SEPOLIA_COMPTROLLER = "0x006D44b6f5927b3eD83bD0c1C36Fb1A3BaCaC208";

// BASE_SEPOLIA
export const BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER = "0xCbab4C50D8458958515763dA4Db0Ba74769a5653";
export const BASE_SEPOLIA_MC_STEWARD = "0x284d000665296515280a4fB066a887EFF6A3bD9E";
export const BASE_SEPOLIA_CF_STEWARD = "0xC1eCF5Ee6B2F43194359c02FB460B31e4494895d";
export const BASE_SEPOLIA_IRM_STEWARD = "0x5675112bf79C66d8CEbe48C40f25e9Dd6576c4e6";
export const BASE_SEPOLIA_ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const BASE_SEPOLIA_COMPTROLLER = "0x272795dd6c5355CF25765F36043F34014454Eb5b";

// OPTIMISUM_SEPOLIA
export const OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER = "0xCbab4C50D8458958515763dA4Db0Ba74769a5653";
export const OP_SEPOLIA_MC_STEWARD = "0x284d000665296515280a4fB066a887EFF6A3bD9E";
export const OP_SEPOLIA_CF_STEWARD = "0xC1eCF5Ee6B2F43194359c02FB460B31e4494895d";
export const OP_SEPOLIA_IRM_STEWARD = "0x5675112bf79C66d8CEbe48C40f25e9Dd6576c4e6";
export const OP_SEPOLIA_ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const OP_SEPOLIA_COMPTROLLER = "0x59d10988974223B042767aaBFb6D926863069535";

// UNICHAIN_SEPOLIA
export const UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER = "0xCbab4C50D8458958515763dA4Db0Ba74769a5653";
export const UNICHAIN_SEPOLIA_MC_STEWARD = "0x284d000665296515280a4fB066a887EFF6A3bD9E";
export const UNICHAIN_SEPOLIA_CF_STEWARD = "0xC1eCF5Ee6B2F43194359c02FB460B31e4494895d";
export const UNICHAIN_SEPOLIA_IRM_STEWARD = "0x5675112bf79C66d8CEbe48C40f25e9Dd6576c4e6";
export const UNICHAIN_SEPOLIA_ACM = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";
export const UNICHAIN_SEPOLIA_COMPTROLLER = "0xFeD3eAA668a6179c9E5E1A84e3A7d6883F06f7c1";

// ZKSYNC_SEPOLIA
export const ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER = "0xAA087d8427F3DF6eb2225C3B889Cf888Bef374ac";
export const ZK_SEPOLIA_MC_STEWARD = "0x0eb731161a5F4CAf533A4bb28E0Cef3d2d136b14";
export const ZK_SEPOLIA_CF_STEWARD = "0xa156C9e7ED294CC6888212352A541fc512ef13F5";
export const ZK_SEPOLIA_IRM_STEWARD = "0xEBdcF6518FCd8Cf70d64c5908463279030f6f0f0";
export const ZK_SEPOLIA_ACM = "0xD07f543d47c3a8997D6079958308e981AC14CD01";
export const ZK_SEPOLIA_COMPTROLLER = "0xC527DE08E43aeFD759F7c0e6aE85433923064669";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const SEPOLIA_ACM_AGGREGATOR = "0x0653830c55035d678e1287b2d4550519fd263d0e";
export const ARBITRUMSEPOLIA_ACM_AGGREGATOR = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";
export const BASESEPOLIA_ACM_AGGREGATOR = "0xd82A217713F6c61f3ed4199cdEEDfbB80e5E4562";
export const OPTEMISUMSEPOLIA_ACM_AGGREGATOR = "0xEEeF13364fD22b8eA6932A9ed337e2638f8E0eD6";
export const UNICHAINSEPOLIA_ACM_AGGREGATOR = "0xb0067C9CD83B00DE781e9b456Bf0Fec86D687Bb2";
export const ZKSYNCSEPOLIA_ACM_AGGREGATOR = "0x920Bb18c4bd4D7bc41Bf39933BCAa3D078641502";

export const SEPOLIA_ACM_AGR_INDEX = 6;
export const ARBITRUMSEPOLIA_ACM_AGR_INDEX = 5;
export const BASESEPOLIA_ACM_AGR_INDEX = 4;
export const OPSEPOLIA_ACM_AGR_INDEX = 2;
export const UNICHAINSEPOLIA_ACM_AGR_INDEX = 5;
export const ZKSYNCSEPOLIA_ACM_AGR_INDEX = 2;

export const SEPOLIA_PERMISSIONS = buildRemoteChainPermissions({
  DESTINATION_STEWARD_RECEIVER: SEPOLIA_DESTINATION_STEWARD_RECEIVER,

  NORMAL_TIMELOCK: sepolia.NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK: sepolia.FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK: sepolia.CRITICAL_TIMELOCK,
  GUARDIAN: sepolia.GUARDIAN,

  MC_STEWARD: SEPOLIA_MC_STEWARD,
  CF_STEWARD: SEPOLIA_CF_STEWARD,
  IRM_STEWARD: SEPOLIA_IRM_STEWARD,

  COMPTROLLER: SEPOLIA_COMPTROLLER,
});

export const ARBITRUMSEPOLIA_PERMISSIONS = buildRemoteChainPermissions({
  DESTINATION_STEWARD_RECEIVER: ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER,

  NORMAL_TIMELOCK: arbitrumsepolia.NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK: arbitrumsepolia.FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK: arbitrumsepolia.CRITICAL_TIMELOCK,
  GUARDIAN: arbitrumsepolia.GUARDIAN,

  MC_STEWARD: ARBITRUM_SEPOLIA_MC_STEWARD,
  CF_STEWARD: ARBITRUM_SEPOLIA_CF_STEWARD,
  IRM_STEWARD: ARBITRUM_SEPOLIA_IRM_STEWARD,

  COMPTROLLER: ARBITRUM_SEPOLIA_COMPTROLLER,
});

export const BASESEPOLIA_PERMISSIONS = buildRemoteChainPermissions({
  DESTINATION_STEWARD_RECEIVER: BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER,

  NORMAL_TIMELOCK: basesepolia.NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK: basesepolia.FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK: basesepolia.CRITICAL_TIMELOCK,
  GUARDIAN: basesepolia.GUARDIAN,

  MC_STEWARD: BASE_SEPOLIA_MC_STEWARD,
  CF_STEWARD: BASE_SEPOLIA_CF_STEWARD,
  IRM_STEWARD: BASE_SEPOLIA_IRM_STEWARD,

  COMPTROLLER: BASE_SEPOLIA_COMPTROLLER,
});

export const OPSEPOLIA_PERMISSIONS = buildRemoteChainPermissions({
  DESTINATION_STEWARD_RECEIVER: OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER,

  NORMAL_TIMELOCK: opsepolia.NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK: opsepolia.FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK: opsepolia.CRITICAL_TIMELOCK,
  GUARDIAN: opsepolia.GUARDIAN,

  MC_STEWARD: OP_SEPOLIA_MC_STEWARD,
  CF_STEWARD: OP_SEPOLIA_CF_STEWARD,
  IRM_STEWARD: OP_SEPOLIA_IRM_STEWARD,

  COMPTROLLER: OP_SEPOLIA_COMPTROLLER,
});

export const UNICHAINSEPOLIA_PERMISSIONS = buildRemoteChainPermissions({
  DESTINATION_STEWARD_RECEIVER: UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER,

  NORMAL_TIMELOCK: unichainsepolia.NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK: unichainsepolia.FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK: unichainsepolia.CRITICAL_TIMELOCK,
  GUARDIAN: unichainsepolia.GUARDIAN,

  MC_STEWARD: UNICHAIN_SEPOLIA_MC_STEWARD,
  CF_STEWARD: UNICHAIN_SEPOLIA_CF_STEWARD,
  IRM_STEWARD: UNICHAIN_SEPOLIA_IRM_STEWARD,

  COMPTROLLER: UNICHAIN_SEPOLIA_COMPTROLLER,
});

export const ZKSYNCSEPOLIA_PERMISSIONS = buildRemoteChainPermissions({
  DESTINATION_STEWARD_RECEIVER: ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER,

  NORMAL_TIMELOCK: zksyncsepolia.NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK: zksyncsepolia.FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK: zksyncsepolia.CRITICAL_TIMELOCK,
  GUARDIAN: zksyncsepolia.GUARDIAN,

  MC_STEWARD: ZK_SEPOLIA_MC_STEWARD,
  CF_STEWARD: ZK_SEPOLIA_CF_STEWARD,
  IRM_STEWARD: ZK_SEPOLIA_IRM_STEWARD,

  COMPTROLLER: ZK_SEPOLIA_COMPTROLLER,
});

export interface RemoteChainPermissionsConfig {
  DESTINATION_STEWARD_RECEIVER: string;

  NORMAL_TIMELOCK: string;
  FAST_TRACK_TIMELOCK: string;
  CRITICAL_TIMELOCK: string;
  GUARDIAN: string;

  MC_STEWARD: string;
  CF_STEWARD: string;
  IRM_STEWARD: string;

  COMPTROLLER: string;
}

// REMOTE CHIAN PERMISSIONS
export function buildRemoteChainPermissions(chain: RemoteChainPermissionsConfig): [string, string, string][] {
  return [
    // =====================
    // DRSR – setRiskParameterConfig
    // =====================
    [chain.DESTINATION_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256)", chain.NORMAL_TIMELOCK],
    [chain.DESTINATION_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256)", chain.FAST_TRACK_TIMELOCK],
    [chain.DESTINATION_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256)", chain.GUARDIAN],

    // =====================
    // DRSR – setConfigActive
    // =====================
    [chain.DESTINATION_STEWARD_RECEIVER, "setConfigActive(string,bool)", chain.NORMAL_TIMELOCK],
    [chain.DESTINATION_STEWARD_RECEIVER, "setConfigActive(string,bool)", chain.FAST_TRACK_TIMELOCK],
    [chain.DESTINATION_STEWARD_RECEIVER, "setConfigActive(string,bool)", chain.CRITICAL_TIMELOCK],
    [chain.DESTINATION_STEWARD_RECEIVER, "setConfigActive(string,bool)", chain.GUARDIAN],

    // =====================
    // DRSR – setRemoteDelay
    // =====================
    [chain.DESTINATION_STEWARD_RECEIVER, "setRemoteDelay(uint256)", chain.NORMAL_TIMELOCK],
    [chain.DESTINATION_STEWARD_RECEIVER, "setRemoteDelay(uint256)", chain.FAST_TRACK_TIMELOCK],
    [chain.DESTINATION_STEWARD_RECEIVER, "setRemoteDelay(uint256)", chain.GUARDIAN],

    // =====================
    // DRSR – setWhitelistedExecutor
    // =====================
    [chain.DESTINATION_STEWARD_RECEIVER, "setWhitelistedExecutor(address,bool)", chain.NORMAL_TIMELOCK],
    [chain.DESTINATION_STEWARD_RECEIVER, "setWhitelistedExecutor(address,bool)", chain.FAST_TRACK_TIMELOCK],
    [chain.DESTINATION_STEWARD_RECEIVER, "setWhitelistedExecutor(address,bool)", chain.CRITICAL_TIMELOCK],
    [chain.DESTINATION_STEWARD_RECEIVER, "setWhitelistedExecutor(address,bool)", chain.GUARDIAN],

    // =====================
    // REMOTE RS – MC
    // =====================
    [chain.MC_STEWARD, "setSafeDeltaBps(uint256)", chain.NORMAL_TIMELOCK],
    [chain.MC_STEWARD, "setSafeDeltaBps(uint256)", chain.FAST_TRACK_TIMELOCK],
    [chain.MC_STEWARD, "setSafeDeltaBps(uint256)", chain.GUARDIAN],

    // =====================
    // REMOTE RS – CF
    // =====================
    [chain.CF_STEWARD, "setSafeDeltaBps(uint256)", chain.NORMAL_TIMELOCK],
    [chain.CF_STEWARD, "setSafeDeltaBps(uint256)", chain.FAST_TRACK_TIMELOCK],
    [chain.CF_STEWARD, "setSafeDeltaBps(uint256)", chain.GUARDIAN],

    // =====================
    // REMOTE MARKET CAP STEWARD
    // =====================
    [chain.COMPTROLLER, "setMarketBorrowCaps(address[],uint256[])", chain.MC_STEWARD],
    [chain.COMPTROLLER, "setMarketSupplyCaps(address[],uint256[])", chain.MC_STEWARD],

    // =====================
    // REMOTE CF STEWARD
    // =====================
    [chain.COMPTROLLER, "setCollateralFactor(address,uint256,uint256)", chain.CF_STEWARD],

    // =====================
    // REMOTE IRM STEWARD
    // =====================
    [ethers.constants.AddressZero, "setInterestRateModel(address)", chain.IRM_STEWARD],
  ];
}

export const vip600 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-600 Risk-Steward Phase-1",
    description: `VIP-600 Risk-Steward Phase-1 Grant ACM Permissions`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // RISK ORACLE
      ...[bsctestnet.NORMAL_TIMELOCK, bsctestnet.GUARDIAN].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_ORACLE, "addAuthorizedSender(address)", timelock],
        };
      }),
      ...[
        bsctestnet.NORMAL_TIMELOCK,
        bsctestnet.FAST_TRACK_TIMELOCK,
        bsctestnet.CRITICAL_TIMELOCK,
        bsctestnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_ORACLE, "removeAuthorizedSender(address)", timelock],
        };
      }),
      ...[bsctestnet.NORMAL_TIMELOCK, bsctestnet.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_ORACLE, "addUpdateType(string)", timelock],
        };
      }),
      ...[
        bsctestnet.NORMAL_TIMELOCK,
        bsctestnet.FAST_TRACK_TIMELOCK,
        bsctestnet.CRITICAL_TIMELOCK,
        bsctestnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_ORACLE, "setUpdateTypeActive(string,bool)", timelock],
        };
      }),

      // RSR
      ...[bsctestnet.NORMAL_TIMELOCK, bsctestnet.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256,uint256)", timelock],
        };
      }),
      ...[
        bsctestnet.NORMAL_TIMELOCK,
        bsctestnet.FAST_TRACK_TIMELOCK,
        bsctestnet.CRITICAL_TIMELOCK,
        bsctestnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_STEWARD_RECEIVER, "setConfigActive(string,bool)", timelock],
        };
      }),
      ...[
        bsctestnet.NORMAL_TIMELOCK,
        bsctestnet.FAST_TRACK_TIMELOCK,
        bsctestnet.CRITICAL_TIMELOCK,
        bsctestnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_STEWARD_RECEIVER, "setWhitelistedExecutor(address,bool)", timelock],
        };
      }),
      ...[
        bsctestnet.NORMAL_TIMELOCK,
        bsctestnet.FAST_TRACK_TIMELOCK,
        bsctestnet.CRITICAL_TIMELOCK,
        bsctestnet.GUARDIAN,
      ].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [RISK_STEWARD_RECEIVER, "setPaused(bool)", timelock],
        };
      }),

      // RS
      ...[bsctestnet.NORMAL_TIMELOCK, bsctestnet.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [MARKETCAP_STEWARD, "setSafeDeltaBps(uint256)", timelock],
        };
      }),
      ...[bsctestnet.NORMAL_TIMELOCK, bsctestnet.FAST_TRACK_TIMELOCK].map(timelock => {
        return {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [COLLATERALFACTORS_STEWARD, "setSafeDeltaBps(uint256)", timelock],
        };
      }),

      // MARKETCAP_STEWARD
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])", MARKETCAP_STEWARD],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])", MARKETCAP_STEWARD],
      },

      // CF_STEWARD
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_COMPTROLLER, "setCollateralFactor(uint96,address,uint256,uint256)", COLLATERALFACTORS_STEWARD],
      },

      // IRM_STEWARD
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", IRM_STEWARD],
      },

      // ACM ON REMOTE CHAINS
      // SEPOLIA
      {
        target: SEPOLIA_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, SEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [SEPOLIA_ACM_AGR_INDEX],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, SEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.sepolia,
      },

      // ARBITRUM_SEPOLIA
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ARBITRUMSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUMSEPOLIA_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [ARBITRUMSEPOLIA_ACM_AGR_INDEX],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ARBITRUMSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      // BASE_SEPOLIA
      {
        target: BASE_SEPOLIA_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, BASESEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: BASESEPOLIA_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [BASESEPOLIA_ACM_AGR_INDEX],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: BASE_SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, BASESEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.basesepolia,
      },

      // OPTIMISM_SEPOLIA
      {
        target: OP_SEPOLIA_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPTEMISUMSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OPTEMISUMSEPOLIA_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [OPSEPOLIA_ACM_AGR_INDEX],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OP_SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPTEMISUMSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.opsepolia,
      },

      // UNICHAIN_SEPOLIA
      {
        target: UNICHAIN_SEPOLIA_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, UNICHAINSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: UNICHAINSEPOLIA_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [UNICHAINSEPOLIA_ACM_AGR_INDEX],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: UNICHAIN_SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, UNICHAINSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.unichainsepolia,
      },

      // ZKSYNC_SEPOLIA
      {
        target: ZK_SEPOLIA_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNCSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZKSYNCSEPOLIA_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [ZKSYNCSEPOLIA_ACM_AGR_INDEX],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZK_SEPOLIA_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNCSEPOLIA_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncsepolia,
      },

      // accept ownerships
      // SEPOLIA
      ...[SEPOLIA_DESTINATION_STEWARD_RECEIVER, SEPOLIA_MC_STEWARD, SEPOLIA_CF_STEWARD, SEPOLIA_IRM_STEWARD].map(
        target => {
          return {
            target,
            signature: "acceptOwnership()",
            params: [],
            dstChainId: LzChainId.sepolia,
          };
        },
      ),

      // ARBITRUM_SEPOLIA
      ...[
        ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        ARBITRUM_SEPOLIA_MC_STEWARD,
        ARBITRUM_SEPOLIA_CF_STEWARD,
        ARBITRUM_SEPOLIA_IRM_STEWARD,
      ].map(target => {
        return {
          target,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumsepolia,
        };
      }),

      // BASE_SEPOLIA
      ...[
        BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        BASE_SEPOLIA_MC_STEWARD,
        BASE_SEPOLIA_CF_STEWARD,
        BASE_SEPOLIA_IRM_STEWARD,
      ].map(target => {
        return {
          target,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.basesepolia,
        };
      }),

      // OPTIMISM_SEPOLIA
      ...[
        OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        OP_SEPOLIA_MC_STEWARD,
        OP_SEPOLIA_CF_STEWARD,
        OP_SEPOLIA_IRM_STEWARD,
      ].map(target => {
        return {
          target,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opsepolia,
        };
      }),

      // UNICHAIN_SEPOLIA
      ...[
        UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        UNICHAIN_SEPOLIA_MC_STEWARD,
        UNICHAIN_SEPOLIA_CF_STEWARD,
        UNICHAIN_SEPOLIA_IRM_STEWARD,
      ].map(target => {
        return {
          target,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.unichainsepolia,
        };
      }),

      // ZKSYNC_SEPOLIA
      ...[
        ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        ZK_SEPOLIA_MC_STEWARD,
        ZK_SEPOLIA_CF_STEWARD,
        ZK_SEPOLIA_IRM_STEWARD,
      ].map(target => {
        return {
          target,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.zksyncsepolia,
        };
      }),

      ...[RISK_ORACLE, RISK_STEWARD_RECEIVER, MARKETCAP_STEWARD, COLLATERALFACTORS_STEWARD, IRM_STEWARD].map(target => {
        return {
          target,
          signature: "acceptOwnership()",
          params: [],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip600;
