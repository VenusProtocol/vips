import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;
export const BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
export const SFrxETHOracle = "0x61EB836afA467677e6b403D504fe69D6940e7996";
const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

export const vip042 = () => {
  return makeProposal([
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: SFrxETHOracle,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },

    // Revoke unnecessary permissions from Guardian

    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", sepolia.GUARDIAN],
    },

    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", sepolia.GUARDIAN],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [SFrxETHOracle, "setMaxAllowedPriceDifference(uint256)", sepolia.GUARDIAN],
    },
    // Revoke wrong permissions on sepolia
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.GUARDIAN, "unpause()", ethers.constants.AddressZero],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.GUARDIAN, "pause()", ethers.constants.AddressZero],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.GUARDIAN, "setOracle(address,address,uint8)", ethers.constants.AddressZero],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.GUARDIAN, "enableOracle(address,uint8,bool)", ethers.constants.AddressZero],
    },

    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.GUARDIAN, "setTokenConfig(TokenConfig)", ethers.constants.AddressZero],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.GUARDIAN, "setDirectPrice(address,uint256)", ethers.constants.AddressZero],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.GUARDIAN, "setValidateConfig(ValidateConfig)", ethers.constants.AddressZero],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.GUARDIAN, "setMaxStalePeriod(string,uint256)", ethers.constants.AddressZero],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.GUARDIAN, "setSymbolOverride(string,string)", ethers.constants.AddressZero],
    },
    {
      target: SEPOLIA_ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [sepolia.GUARDIAN, "setUnderlyingPythOracle(address)", ethers.constants.AddressZero],
    },
  ]);
};

export default vip042;
