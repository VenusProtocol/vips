import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// New deployments
export const EBRAKE = "0x73f0d19A34e466286f909346F2EF08A18D0228D2";
export const NEW_DEVIATION_SENTINEL_IMPL = "0x10716E3Bde7770BD84C4A3d7EC06BB0885C0a891";

// Existing testnet addresses
export const DEVIATION_SENTINEL = "0x9245d72712548707809D66848e63B8E2B169F3c1";
export const PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

export const vip661Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-661 Configure EBrake-integrated DeviationSentinel on BSC Testnet",
    description: `#### Summary

This VIP configures the EBrake-integrated DeviationSentinel system on BSC Testnet by:

1. Upgrading the DeviationSentinel proxy to the new implementation that routes actions through EBrake
2. Granting EBrake permissions on comptrollers (so EBrake can pause actions and set collateral factors)
3. Granting DeviationSentinel permissions on EBrake (so sentinel can trigger emergency actions via EBrake)
4. Revoking old direct comptroller permissions from DeviationSentinel (sentinel now goes through EBrake)

#### Description

**DeviationSentinel** has been refactored to route all emergency actions through the **EBrake** contract instead of calling comptrollers directly. When a price deviation is detected, DeviationSentinel calls EBrake functions (pauseBorrow, pauseSupply, setCFZero), and EBrake in turn calls the appropriate comptroller functions.

This architecture change adds an additional safety layer and standardizes emergency action routing.

#### References

- [DeviationSentinel Proxy](https://testnet.bscscan.com/address/${DEVIATION_SENTINEL})
- [New Implementation](https://testnet.bscscan.com/address/${NEW_DEVIATION_SENTINEL_IMPL})
- [EBrake Contract](https://testnet.bscscan.com/address/${EBRAKE})`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // ========================================
      // 1. Upgrade DeviationSentinel proxy to new implementation
      // ========================================
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [DEVIATION_SENTINEL, NEW_DEVIATION_SENTINEL_IMPL],
      },

      // ========================================
      // 2. Grant EBrake permissions on comptrollers
      // ========================================
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setActionsPaused(address[],uint8[],bool)", EBRAKE],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCollateralFactor(uint96,address,uint256,uint256)", EBRAKE],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setMarketBorrowCaps(address[],uint256[])", EBRAKE],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setMarketSupplyCaps(address[],uint256[])", EBRAKE],
      },

      // ========================================
      // 3. Grant DeviationSentinel permissions on EBrake
      // ========================================
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [EBRAKE, "pauseBorrow(address)", DEVIATION_SENTINEL],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [EBRAKE, "pauseSupply(address)", DEVIATION_SENTINEL],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [EBRAKE, "setCFZero(address)", DEVIATION_SENTINEL],
      },

      // ========================================
      // 4. Revoke old direct comptroller permissions from DeviationSentinel
      // ========================================
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setActionsPaused(address[],uint8[],bool)", DEVIATION_SENTINEL],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setActionsPaused(address[],uint8[],bool)", DEVIATION_SENTINEL],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCollateralFactor(address,uint256,uint256)", DEVIATION_SENTINEL],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [
          ethers.constants.AddressZero,
          "setCollateralFactor(uint96,address,uint256,uint256)",
          DEVIATION_SENTINEL,
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip661Testnet;
