import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// Deployed contract addresses on BSC Testnet
export const DEVIATION_SENTINEL = " 0x9245d72712548707809D66848e63B8E2B169F3c1";
export const SENTINEL_ORACLE = "0xa4f2B03919BAAdCA80C31406412C7Ee059A579D3";

// Access Control Manager
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

// Keeper address that can call functions in the contracts
export const KEEPER_ADDRESS = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

export const vip900Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-900 Configure DeviationSentinel and SentinelOracle on BSC Testnet",
    description: `#### Summary

This VIP configures the DeviationSentinel and SentinelOracle contracts on BSC Testnet by:

1. Accepting ownership of both contracts
2. Granting permissions for the keeper address (${KEEPER_ADDRESS}) to call functions in both contracts
3. Granting permissions for DeviationSentinel to call required functions on all comptrollers (both isolated pools and core pool)

#### Description

**DeviationSentinel** monitors price deviations between the ResilientOracle and SentinelOracle. When significant deviations are detected, it can pause specific market actions (borrow, mint) and adjust collateral factors to protect the protocol.

**SentinelOracle** is an aggregator oracle that routes price requests to appropriate DEX oracles and supports direct price overrides.

**Permissions being granted:**

For the keeper address on DeviationSentinel:
- setTrustedKeeper(address,bool)
- setTokenConfig(address,(uint8,bool))
- setTokenMonitoringEnabled(address,bool)
- resetMarketState(address)

For the keeper address on SentinelOracle:
- setTokenOracleConfig(address,address)
- setDirectPrice(address,uint256)

For DeviationSentinel on any Comptroller:
- setActionsPaused(address[],uint8[],bool) - to pause/unpause borrow and mint actions
- setCollateralFactor(address,uint256,uint256) - for isolated pools
- setCollateralFactor(uint96,address,uint256,uint256) - for core pool with emode groups

#### References

- [VIP Pull Request](https://github.com/VenusProtocol/vips/pull/658)
- [DeviationSentinel Contract](https://testnet.bscscan.com/address/${DEVIATION_SENTINEL})
- [SentinelOracle Contract](https://testnet.bscscan.com/address/${SENTINEL_ORACLE})
- [Keeper Address](https://testnet.bscscan.com/address/${KEEPER_ADDRESS})`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // ========================================
      // Accept ownership of all contracts
      // ========================================

      // Accept ownership of DeviationSentinel
      {
        target: DEVIATION_SENTINEL,
        signature: "acceptOwnership()",
        params: [],
      },

      // Accept ownership of SentinelOracle
      {
        target: SENTINEL_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },

      // ========================================
      // Grant permissions for DeviationSentinel
      // ========================================

      // Keeper permissions on DeviationSentinel
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [DEVIATION_SENTINEL, "setTrustedKeeper(address,bool)", KEEPER_ADDRESS],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [DEVIATION_SENTINEL, "setTokenConfig(address,(uint8,bool))", KEEPER_ADDRESS],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [DEVIATION_SENTINEL, "setTokenMonitoringEnabled(address,bool)", KEEPER_ADDRESS],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [DEVIATION_SENTINEL, "resetMarketState(address)", KEEPER_ADDRESS],
      },

      // ========================================
      // Grant permissions for SentinelOracle
      // ========================================

      // Keeper permissions on SentinelOracle
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SENTINEL_ORACLE, "setTokenOracleConfig(address,address)", KEEPER_ADDRESS],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SENTINEL_ORACLE, "setDirectPrice(address,uint256)", KEEPER_ADDRESS],
      },

      // ========================================
      // Grant DeviationSentinel permissions on Comptrollers
      // ========================================

      // Allow DeviationSentinel to pause/unpause actions on any comptroller
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setActionsPaused(address[],uint8[],bool)", DEVIATION_SENTINEL],
      },

      // Allow DeviationSentinel to set collateral factor on any comptroller (isolated pools)
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setCollateralFactor(address,uint256,uint256)", DEVIATION_SENTINEL],
      },

      // Allow DeviationSentinel to set collateral factor on any comptroller (core pool with poolId)
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
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

export default vip900Testnet;
