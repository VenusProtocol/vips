import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";
import { LzChainId, ProposalType } from "src/types";
import { ethers } from "hardhat";

const { arbitrumone, ethereum, opbnbmainnet } = NETWORK_ADDRESSES;
export const ARBITRUM_ONE_BOUND_VALIDATOR = "0x2245FA2420925Cd3C2D889Ddc5bA1aefEF0E14CF";
export const ARBITRUM_ONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ETHEREUM_BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";
export const SFrxETHOracle = "0x5E06A5f48692E4Fff376fDfCA9E4C0183AAADCD1";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const OPBNBMAINNET_BOUND_VALIDATOR = "0xd1f80C371C6E2Fa395A5574DB3E3b4dAf43dadCE";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const ARBITRUM_ONE_POOL_REGISTRY = "0x382238f07Bc4Fe4aA99e561adE8A4164b5f815DA";
export const ETHEREUM_POOL_REGISTRY = "0x61CAff113CCaf05FFc6540302c37adcf077C5179";
export const OPBNBMAINNET_POOL_REGISTRY = "0x345a030Ad22e2317ac52811AC41C1A63cfa13aEe";

const vip355 = () => {
  const meta = {
    version: "v2",
    title: "VIP-355",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Revoke Permissions
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "setOracle(address,address,uint8)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumone.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumone.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumone.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumone.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumone.XVS_VAULT_PROXY, "set(address,uint256,uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumone.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          arbitrumone.XVS_VAULT_PROXY,
          "setWithdrawalLockingPeriod(address,uint256,uint256)",
          arbitrumone.GUARDIAN,
        ],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLiquidationIncentive(uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setForcedLiquidation(address,bool)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReserveFactor(uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_POOL_REGISTRY, "addPool(string,address,uint256,uint256,uint256)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_POOL_REGISTRY, "addMarket(AddMarketInput)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_POOL_REGISTRY, "setPoolName(address,string)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ONE_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_ONE_POOL_REGISTRY, "updatePoolMetadata(address,VenusPoolMetaData)", arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "setOracle(address,address,uint8)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethereum.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethereum.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethereum.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [SFrxETHOracle, "setMaxAllowedPriceDifference(uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "set(address,uint256,uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethereum.XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLiquidationIncentive(uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setForcedLiquidation(address,bool)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReserveFactor(uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_POOL_REGISTRY, "addPool(string,address,uint256,uint256,uint256)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_POOL_REGISTRY, "addMarket(AddMarketInput)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_POOL_REGISTRY, "setPoolName(address,string)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ETHEREUM_POOL_REGISTRY, "updatePoolMetadata(address,VenusPoolMetaData)", ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "setOracle(address,address,uint8)", opbnbmainnet.GUARDIAN],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [opbnbmainnet.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", opbnbmainnet.GUARDIAN],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [OPBNBMAINNET_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", opbnbmainnet.GUARDIAN],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [opbnbmainnet.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", opbnbmainnet.GUARDIAN],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [opbnbmainnet.XVS_VAULT_PROXY, "set(address,uint256,uint256)", opbnbmainnet.GUARDIAN],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [opbnbmainnet.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", opbnbmainnet.GUARDIAN],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          opbnbmainnet.XVS_VAULT_PROXY,
          "setWithdrawalLockingPeriod(address,uint256,uint256)",
          opbnbmainnet.GUARDIAN,
        ],
        dstChainId: LzChainId.opbnbmainnet,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", opbnbmainnet.GUARDIAN],
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLiquidationIncentive(uint256)", opbnbmainnet.GUARDIAN],
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", opbnbmainnet.GUARDIAN],
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setForcedLiquidation(address,bool)", opbnbmainnet.GUARDIAN],
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", opbnbmainnet.GUARDIAN],
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReserveFactor(uint256)", opbnbmainnet.GUARDIAN],
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", opbnbmainnet.GUARDIAN],
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", opbnbmainnet.GUARDIAN],
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [OPBNBMAINNET_POOL_REGISTRY, "addPool(string,address,uint256,uint256,uint256)", opbnbmainnet.GUARDIAN],
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [OPBNBMAINNET_POOL_REGISTRY, "addMarket(AddMarketInput)", opbnbmainnet.GUARDIAN],
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [OPBNBMAINNET_POOL_REGISTRY, "setPoolName(address,string)", opbnbmainnet.GUARDIAN],
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [OPBNBMAINNET_POOL_REGISTRY, "updatePoolMetadata(address,VenusPoolMetaData)", opbnbmainnet.GUARDIAN],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip355;