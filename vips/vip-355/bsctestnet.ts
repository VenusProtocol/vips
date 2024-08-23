import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumsepolia, sepolia, opbnbtestnet } = NETWORK_ADDRESSES;
export const ARBITRUM_SEPOLIA_BOUND_VALIDATOR = "0xfe6bc1545Cc14C131bacA97476D6035ffcC0b889";
export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const SEPOLIA_BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
export const SFrxETHOracle = "0x61EB836afA467677e6b403D504fe69D6940e7996";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const OPBNBTESTNET_BOUND_VALIDATOR = "0x049537Bb065e6253e9D8D08B45Bf6b753657A746";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const ARBITRUM_SEPOLIA_POOL_REGISTRY = "0xf93Df3135e0D555185c0BC888073374cA551C5fE";
export const SEPOLIA_POOL_REGISTRY = "0x758f5715d817e02857Ba40889251201A5aE3E186";
export const OPBNBTESTNET_POOL_REGISTRY = "0x560eA4e1cC42591E9f5F5D83Ad2fd65F30128951";

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
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumsepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumsepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumsepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumsepolia.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          arbitrumsepolia.XVS_VAULT_PROXY,
          "add(address,uint256,address,uint256,uint256)",
          arbitrumsepolia.GUARDIAN,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [arbitrumsepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          arbitrumsepolia.XVS_VAULT_PROXY,
          "setRewardAmountPerBlockOrSecond(address,uint256)",
          arbitrumsepolia.GUARDIAN,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          arbitrumsepolia.XVS_VAULT_PROXY,
          "setWithdrawalLockingPeriod(address,uint256,uint256)",
          arbitrumsepolia.GUARDIAN,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLiquidationIncentive(uint256)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setForcedLiquidation(address,bool)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReserveFactor(uint256)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_POOL_REGISTRY,
          "addPool(string,address,uint256,uint256,uint256)",
          arbitrumsepolia.GUARDIAN,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_POOL_REGISTRY, "addMarket(AddMarketInput)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_POOL_REGISTRY, "setPoolName(address,string)", arbitrumsepolia.GUARDIAN],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          ARBITRUM_SEPOLIA_POOL_REGISTRY,
          "updatePoolMetadata(address,VenusPoolMetaData)",
          arbitrumsepolia.GUARDIAN,
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [sepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [sepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [sepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [sepolia.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [SEPOLIA_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [SFrxETHOracle, "setMaxAllowedPriceDifference(uint256)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "set(address,uint256,uint256)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [sepolia.XVS_VAULT_PROXY, "setWithdrawalLockingPeriod(address,uint256,uint256)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLiquidationIncentive(uint256)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setForcedLiquidation(address,bool)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReserveFactor(uint256)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [SEPOLIA_POOL_REGISTRY, "addPool(string,address,uint256,uint256,uint256)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [SEPOLIA_POOL_REGISTRY, "addMarket(AddMarketInput)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [SEPOLIA_POOL_REGISTRY, "setPoolName(address,string)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [SEPOLIA_POOL_REGISTRY, "updatePoolMetadata(address,VenusPoolMetaData)", sepolia.GUARDIAN],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [opbnbtestnet.RESILIENT_ORACLE, "setOracle(address,address,uint8)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [opbnbtestnet.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [OPBNBTESTNET_BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "add(address,uint256,address,uint256,uint256)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [opbnbtestnet.XVS_VAULT_PROXY, "set(address,uint256,uint256)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          opbnbtestnet.XVS_VAULT_PROXY,
          "setRewardAmountPerBlockOrSecond(address,uint256)",
          opbnbtestnet.GUARDIAN,
        ],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          opbnbtestnet.XVS_VAULT_PROXY,
          "setWithdrawalLockingPeriod(address,uint256,uint256)",
          opbnbtestnet.GUARDIAN,
        ],
        dstChainId: LzChainId.opbnbtestnet,
      },

      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCloseFactor(uint256)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setLiquidationIncentive(uint256)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setMinLiquidatableCollateral(uint256)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setForcedLiquidation(address,bool)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolSeizeShare(uint256)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReserveFactor(uint256)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [OPBNBTESTNET_POOL_REGISTRY, "addPool(string,address,uint256,uint256,uint256)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [OPBNBTESTNET_POOL_REGISTRY, "addMarket(AddMarketInput)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [OPBNBTESTNET_POOL_REGISTRY, "setPoolName(address,string)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [OPBNBTESTNET_POOL_REGISTRY, "updatePoolMetadata(address,VenusPoolMetaData)", opbnbtestnet.GUARDIAN],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip355;
