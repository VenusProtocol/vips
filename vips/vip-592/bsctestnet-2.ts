import { ethers } from "hardhat";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const CORE_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const RISK_ORACLE = "0x4DEA4D1A9F6101D4adacE89f16064D780D2F241d";
export const RISK_STEWARD_RECEIVER = "0x2F6eb64826f3A067eBFFb5909De7AA4e0Cb31b81";
export const MARKETCAP_STEWARD = "0xecC583037338D1EFE2C15bb2c6ac81E0294375C2";
export const COLLATERALFACTORS_STEWARD = "0xBf821F512EA224201108303cc6dA200391Eb38aC";
export const IRM_STEWARD = "0xE7AcaF3d6CeBA793d94f867FFCE0A1e9a6b3977C";
export const BSCTESTNET_EID = 40102;

export const DEFI_COMPTROLLER = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
export const vUSDT_DEFI = "0x80CC30811e362aC9aB857C3d7875CbcCc0b65750";
export const vBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe";

// SEPOLIA
export const SEPOLIA_DESTINATION_STEWARD_RECEIVER = "0x5675112bf79C66d8CEbe48C40f25e9Dd6576c4e6";
export const SEPOLIA_MC_STEWARD = "0xcD598bDcfF0433395918512359745f83F5730C49";
export const SEPOLIA_CF_STEWARD = "0xBe9174A13577B016280aEc20a3b369C5BA272241";
export const SEPOLIA_IRM_STEWARD = "0xa7E80c303f2EcF9436F11Da14C512B09B44854f4";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SEPOLIA_COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const SEPOLIA_EID = 40161;

// ARBITRUM_SEPOLIA
export const ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER = "0xCbab4C50D8458958515763dA4Db0Ba74769a5653";
export const ARBITRUM_SEPOLIA_MC_STEWARD = "0x284d000665296515280a4fB066a887EFF6A3bD9E";
export const ARBITRUM_SEPOLIA_CF_STEWARD = "0xC1eCF5Ee6B2F43194359c02FB460B31e4494895d";
export const ARBITRUM_SEPOLIA_IRM_STEWARD = "0x5675112bf79C66d8CEbe48C40f25e9Dd6576c4e6";
export const ARBITRUM_SEPOLIA_EID = 40231;

// BASE_SEPOLIA
export const BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER = "0xCbab4C50D8458958515763dA4Db0Ba74769a5653";
export const BASE_SEPOLIA_MC_STEWARD = "0x284d000665296515280a4fB066a887EFF6A3bD9E";
export const BASE_SEPOLIA_CF_STEWARD = "0xC1eCF5Ee6B2F43194359c02FB460B31e4494895d";
export const BASE_SEPOLIA_IRM_STEWARD = "0x5675112bf79C66d8CEbe48C40f25e9Dd6576c4e6";
export const BASE_SEPOLIA_EID = 40245;

// OPTIMISM_SEPOLIA
export const OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER = "0xCbab4C50D8458958515763dA4Db0Ba74769a5653";
export const OP_SEPOLIA_MC_STEWARD = "0x284d000665296515280a4fB066a887EFF6A3bD9E";
export const OP_SEPOLIA_CF_STEWARD = "0xC1eCF5Ee6B2F43194359c02FB460B31e4494895d";
export const OP_SEPOLIA_IRM_STEWARD = "0x5675112bf79C66d8CEbe48C40f25e9Dd6576c4e6";
export const OP_SEPOLIA_EID = 40232;

// UNICHAIN_SEPOLIA
export const UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER = "0xCbab4C50D8458958515763dA4Db0Ba74769a5653";
export const UNICHAIN_SEPOLIA_MC_STEWARD = "0x284d000665296515280a4fB066a887EFF6A3bD9E";
export const UNICHAIN_SEPOLIA_CF_STEWARD = "0xC1eCF5Ee6B2F43194359c02FB460B31e4494895d";
export const UNICHAIN_SEPOLIA_IRM_STEWARD = "0x5675112bf79C66d8CEbe48C40f25e9Dd6576c4e6";
export const UNICHAIN_SEPOLIA_EID = 40333;

// ZKSYNC_SEPOLIA
export const ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER = "0xAA087d8427F3DF6eb2225C3B889Cf888Bef374ac";
export const ZK_SEPOLIA_MC_STEWARD = "0x0eb731161a5F4CAf533A4bb28E0Cef3d2d136b14";
export const ZK_SEPOLIA_CF_STEWARD = "0xa156C9e7ED294CC6888212352A541fc512ef13F5";
export const ZK_SEPOLIA_IRM_STEWARD = "0xEBdcF6518FCd8Cf70d64c5908463279030f6f0f0";
export const ZK_SEPOLIA_EID = 40305;

export const WHITELISTED_EXECUTORS = ["0xe2a089cA69a90f1E27E723EFD339Cff4c4701AcC"]; // testing account
export const RISK_PARAMETER_SENDER = ["0xe2a089cA69a90f1E27E723EFD339Cff4c4701AcC"]; // testing account
export const UPDATE_TYPES = ["supplyCap", "borrowCap", "collateralFactors", "interestRateModel"];
export const TEN_MINUTES = 600;
export const FIVE_MINUTES = 300;

export const vip600 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-600 Risk-Steward Phase-2",
    description: `VIP-600 Risk-Steward Phase-2 enable for BSC and all remote testnet networks`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Risk Oracle
      ...RISK_PARAMETER_SENDER.map(senders => {
        return {
          target: RISK_ORACLE,
          signature: "addAuthorizedSender(address)",
          params: [senders],
        };
      }),

      ...UPDATE_TYPES.map(updateType => {
        return {
          target: RISK_ORACLE,
          signature: "addUpdateType(string)",
          params: [updateType],
        };
      }),

      // RSR
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256,uint256)",
        params: [UPDATE_TYPES[0], MARKETCAP_STEWARD, TEN_MINUTES, FIVE_MINUTES],
      },
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256,uint256)",
        params: [UPDATE_TYPES[1], MARKETCAP_STEWARD, TEN_MINUTES, FIVE_MINUTES],
      },
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256,uint256)",
        params: [UPDATE_TYPES[2], COLLATERALFACTORS_STEWARD, TEN_MINUTES, FIVE_MINUTES],
      },
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256,uint256)",
        params: [UPDATE_TYPES[3], IRM_STEWARD, TEN_MINUTES, FIVE_MINUTES],
      },

      ...WHITELISTED_EXECUTORS.map(executor => {
        return {
          target: RISK_STEWARD_RECEIVER,
          signature: "setWhitelistedExecutor(address,bool)",
          params: [executor, true],
        };
      }),

      {
        target: MARKETCAP_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000], // 40%
      },
      {
        target: COLLATERALFACTORS_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000],
      },

      // SEPOLIA DSR
      {
        target: SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[0], SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[1], SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[2], SEPOLIA_CF_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[3], SEPOLIA_IRM_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRemoteDelay(uint256)",
        params: [FIVE_MINUTES],
        dstChainId: LzChainId.sepolia,
      },

      ...WHITELISTED_EXECUTORS.map(executor => {
        return {
          target: SEPOLIA_DESTINATION_STEWARD_RECEIVER,
          signature: "setWhitelistedExecutor(address,bool)",
          params: [executor, true],
          dstChainId: LzChainId.sepolia,
        };
      }),
      {
        target: SEPOLIA_MC_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_CF_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000],
        dstChainId: LzChainId.sepolia,
      },

      // ARBITRUM_SEPOLIA DSR
      {
        target: ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[0], ARBITRUM_SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[1], ARBITRUM_SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[2], ARBITRUM_SEPOLIA_CF_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[3], ARBITRUM_SEPOLIA_IRM_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRemoteDelay(uint256)",
        params: [FIVE_MINUTES],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      ...WHITELISTED_EXECUTORS.map(executor => {
        return {
          target: ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
          signature: "setWhitelistedExecutor(address,bool)",
          params: [executor, true],
          dstChainId: LzChainId.arbitrumsepolia,
        };
      }),
      {
        target: ARBITRUM_SEPOLIA_MC_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_CF_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      // BASE_SEPOLIA DSR
      {
        target: BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[0], BASE_SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[1], BASE_SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[2], BASE_SEPOLIA_CF_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[3], BASE_SEPOLIA_IRM_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRemoteDelay(uint256)",
        params: [FIVE_MINUTES],
        dstChainId: LzChainId.basesepolia,
      },
      ...WHITELISTED_EXECUTORS.map(executor => {
        return {
          target: BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
          signature: "setWhitelistedExecutor(address,bool)",
          params: [executor, true],
          dstChainId: LzChainId.basesepolia,
        };
      }),
      {
        target: BASE_SEPOLIA_MC_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: BASE_SEPOLIA_CF_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000],
        dstChainId: LzChainId.basesepolia,
      },

      // OPTIMISM_SEPOLIA DSR
      {
        target: OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[0], OP_SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[1], OP_SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[2], OP_SEPOLIA_CF_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[3], OP_SEPOLIA_IRM_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRemoteDelay(uint256)",
        params: [FIVE_MINUTES],
        dstChainId: LzChainId.opsepolia,
      },
      ...WHITELISTED_EXECUTORS.map(executor => {
        return {
          target: OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
          signature: "setWhitelistedExecutor(address,bool)",
          params: [executor, true],
          dstChainId: LzChainId.opsepolia,
        };
      }),
      {
        target: OP_SEPOLIA_MC_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: OP_SEPOLIA_CF_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000],
        dstChainId: LzChainId.opsepolia,
      },

      // UNICHAIN_SEPOLIA DSR
      {
        target: UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[0], UNICHAIN_SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[1], UNICHAIN_SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[2], UNICHAIN_SEPOLIA_CF_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[3], UNICHAIN_SEPOLIA_IRM_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRemoteDelay(uint256)",
        params: [FIVE_MINUTES],
        dstChainId: LzChainId.unichainsepolia,
      },
      ...WHITELISTED_EXECUTORS.map(executor => {
        return {
          target: UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
          signature: "setWhitelistedExecutor(address,bool)",
          params: [executor, true],
          dstChainId: LzChainId.unichainsepolia,
        };
      }),
      {
        target: UNICHAIN_SEPOLIA_MC_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: UNICHAIN_SEPOLIA_CF_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000],
        dstChainId: LzChainId.unichainsepolia,
      },

      // ZKSYNC_SEPOLIA DSR
      {
        target: ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[0], ZK_SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[1], ZK_SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[2], ZK_SEPOLIA_CF_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[3], ZK_SEPOLIA_IRM_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setRemoteDelay(uint256)",
        params: [FIVE_MINUTES],
        dstChainId: LzChainId.zksyncsepolia,
      },
      ...WHITELISTED_EXECUTORS.map(executor => {
        return {
          target: ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
          signature: "setWhitelistedExecutor(address,bool)",
          params: [executor, true],
          dstChainId: LzChainId.zksyncsepolia,
        };
      }),
      {
        target: ZK_SEPOLIA_MC_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZK_SEPOLIA_CF_STEWARD,
        signature: "setSafeDeltaBps(uint256)",
        params: [4000],
        dstChainId: LzChainId.zksyncsepolia,
      },

      // Wire bridge connection
      // SEPOLIA
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [SEPOLIA_EID, ethers.utils.hexZeroPad(SEPOLIA_DESTINATION_STEWARD_RECEIVER, 32)],
      },
      {
        target: SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [BSCTESTNET_EID, ethers.utils.hexZeroPad(RISK_STEWARD_RECEIVER, 32)],
        dstChainId: LzChainId.sepolia,
      },

      // ARBITRUM_SEPOLIA
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [ARBITRUM_SEPOLIA_EID, ethers.utils.hexZeroPad(ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER, 32)],
      },
      {
        target: ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [BSCTESTNET_EID, ethers.utils.hexZeroPad(RISK_STEWARD_RECEIVER, 32)],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      // BASE_SEPOLIA
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [BASE_SEPOLIA_EID, ethers.utils.hexZeroPad(BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER, 32)],
      },
      {
        target: BASE_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [BSCTESTNET_EID, ethers.utils.hexZeroPad(RISK_STEWARD_RECEIVER, 32)],
        dstChainId: LzChainId.basesepolia,
      },

      // OPTIMISM_SEPOLIA
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [OP_SEPOLIA_EID, ethers.utils.hexZeroPad(OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER, 32)],
      },
      {
        target: OP_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [BSCTESTNET_EID, ethers.utils.hexZeroPad(RISK_STEWARD_RECEIVER, 32)],
        dstChainId: LzChainId.opsepolia,
      },

      // UNICHAIN_SEPOLIA
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [UNICHAIN_SEPOLIA_EID, ethers.utils.hexZeroPad(UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER, 32)],
      },
      {
        target: UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [BSCTESTNET_EID, ethers.utils.hexZeroPad(RISK_STEWARD_RECEIVER, 32)],
        dstChainId: LzChainId.unichainsepolia,
      },

      // ZKSYNC_SEPOLIA
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [ZK_SEPOLIA_EID, ethers.utils.hexZeroPad(ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER, 32)],
      },
      {
        target: ZK_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [BSCTESTNET_EID, ethers.utils.hexZeroPad(RISK_STEWARD_RECEIVER, 32)],
        dstChainId: LzChainId.zksyncsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip600;
