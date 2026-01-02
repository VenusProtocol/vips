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
export const DESTINATION_RECEIVER_STEWARD = "0x5675112bf79C66d8CEbe48C40f25e9Dd6576c4e6";
export const SEPOLIA_MC_STEWARD = "0xcD598bDcfF0433395918512359745f83F5730C49";
export const SEPOLIA_CF_STEWARD = "0x1d100DAD71E56776bA3BdA3ec36D776BCE512B84";
export const SEPOLIA_IRM_STEWARD = "0x96834aF3d481C3f70dd31a4a3fe7607C2FC6Aa5b";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SEPOLIA_COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const SEPOLIA_EID = 40161;

export const WHITELISTED_EXECUTORS = ["0xe2a089cA69a90f1E27E723EFD339Cff4c4701AcC"]; // testing wallets
export const RISK_PARAMETER_SENDER = ["0xe2a089cA69a90f1E27E723EFD339Cff4c4701AcC"]; // testing wallet
export const UPDATE_TYPES = ["SupplyCap", "BorrowCap", "CollateralFactor", "IRM"];
export const TEN_MINUTES = 600;
export const FIVE_MINUTES = 300;

export const vip600 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-600 Risk-Steward Phase-2",
    description: `VIP-600 Risk-Steward Phase-2 enable for BSC and sepolia network`,
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

      // DSR
      {
        target: DESTINATION_RECEIVER_STEWARD,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[0], SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: DESTINATION_RECEIVER_STEWARD,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[1], SEPOLIA_MC_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: DESTINATION_RECEIVER_STEWARD,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[2], SEPOLIA_CF_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: DESTINATION_RECEIVER_STEWARD,
        signature: "setRiskParameterConfig(string,address,uint256)",
        params: [UPDATE_TYPES[3], SEPOLIA_IRM_STEWARD, TEN_MINUTES],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: DESTINATION_RECEIVER_STEWARD,
        signature: "setRemoteDelay(uint256)",
        params: [FIVE_MINUTES],
        dstChainId: LzChainId.sepolia,
      },

      ...WHITELISTED_EXECUTORS.map(executor => {
        return {
          target: DESTINATION_RECEIVER_STEWARD,
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

      // Wire bridge connection
      {
        target: RISK_STEWARD_RECEIVER,
        signature: "setPeer(uint32,bytes32)",
        params: [SEPOLIA_EID, ethers.utils.hexZeroPad(DESTINATION_RECEIVER_STEWARD, 32)],
      },
      {
        target: DESTINATION_RECEIVER_STEWARD,
        signature: "setPeer(uint32,bytes32)",
        params: [BSCTESTNET_EID, ethers.utils.hexZeroPad(RISK_STEWARD_RECEIVER, 32)],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip600;
