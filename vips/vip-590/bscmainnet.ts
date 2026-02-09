import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// Deployed contract addresses on BSC Mainnet
export const DEVIATION_SENTINEL = "0x6599C15cc8407046CD91E5c0F8B7f765fF914870";
export const SENTINEL_ORACLE = "0x58eae0Cf4215590E19860b66b146C5d539cb6f14";
export const UNISWAP_ORACLE = "0x8FD05458faf220B2324c4BFbb29DBC4B3CF6f23f";
export const PANCAKESWAP_ORACLE = "0x44B72078240A3509979faF450085Fa818401D32E";
export const CORE_POOL_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

// GUARDIAN address
export const GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";

// Keeper address
export const KEEPER_ADDRESS = "0x57fa23f591203f61cef84a7bc892df69ca95c86e";

// Token addresses
export const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";

// PancakeSwap pool for CAKE
export const CAKE_PCS_POOL = "0x7f51c8AaA6B0599aBd16674e2b17FEc7a9f674A1";

// Access Control Manager
export const ACM = bscmainnet.ACCESS_CONTROL_MANAGER;

export const GOVERNANCE_TIMELOCKS = [
  bscmainnet.NORMAL_TIMELOCK,
  bscmainnet.FAST_TRACK_TIMELOCK,
  bscmainnet.CRITICAL_TIMELOCK,
];

export const vip590 = () => {
  const meta = {
    version: "v2",
    title: "VIP-590 [BNB Chain] Enable Emergency Brake in Venus Core",
    description: `## Summary

This VIP will enable **Emergency Brake** function in Venus core through configuring **DeviationSentinel**, **SentinelOracle**, **UniswapOracle**, and **PancakeSwapOracle** on BNB Chain mainnet. The goal is to enable automated deviation monitoring, trusted keeper operations, and oracle configuration while ensuring governance retains full control.

If approved, this VIP will:

- Governance accept ownership of all four contracts
- Grant keeper and governance timelocks the required permissions on DeviationSentinel
- Grant keeper permissions on SentinelOracle and DEX oracles
- Allow DeviationSentinel to pause actions and adjust collateral factors across comptrollers
- Whitelist governance timelocks as trusted keepers
- Enable Emergency Brake for $CAKE with PancakeSwap pool, 20% deviation threshold

## What This VIP Enables

**DeviationSentinel**

- Monitors price deviations between ResilientOracle and SentinelOracle
- Can pause mint/borrow actions and adjust CFs when deviations exceed thresholds

**SentinelOracle**

- Routes price queries to DEX oracles
- Supports direct price overrides (keeper-set)

**UniswapOracle / PancakeSwapOracle**

- Provide TWAP prices from Uniswap V3 / PancakeSwap V3 pools

#### References

- [VIP Pull Request](https://github.com/VenusProtocol/vips/pull/666/)
- [DeviationSentinel Contract](https://bscscan.com/address/${DEVIATION_SENTINEL})
- [SentinelOracle Contract](https://bscscan.com/address/${SENTINEL_ORACLE})
- [UniswapOracle Contract](https://bscscan.com/address/${UNISWAP_ORACLE})
- [PancakeSwapOracle Contract](https://bscscan.com/address/${PANCAKESWAP_ORACLE})`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // ========================================
      // Accept ownership of all contracts
      // ========================================

      // Accept ownership of DeviationSentinel, SentinelOracle, UniswapOracle, and PancakeSwapOracle
      ...[DEVIATION_SENTINEL, SENTINEL_ORACLE, UNISWAP_ORACLE, PANCAKESWAP_ORACLE].map((contract: string) => ({
        target: contract,
        signature: "acceptOwnership()",
        params: [],
      })),

      // ========================================
      // Grant permissions for DeviationSentinel
      // ========================================

      // Grant GUARDIAN and governance timelocks permission to configure token deviation thresholds on DeviationSentinel
      ...[GUARDIAN, ...GOVERNANCE_TIMELOCKS].map((account: string) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [DEVIATION_SENTINEL, "setTokenConfig(address,(uint8,bool))", account],
      })),

      // Grant GUARDIAN and governance timelocks permissions to manage keepers, monitoring, and market state on DeviationSentinel
      ...[GUARDIAN, ...GOVERNANCE_TIMELOCKS].flatMap((account: string) => [
        {
          target: ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [DEVIATION_SENTINEL, "setTrustedKeeper(address,bool)", account],
        },
        {
          target: ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [DEVIATION_SENTINEL, "setTokenMonitoringEnabled(address,bool)", account],
        },
        {
          target: ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [DEVIATION_SENTINEL, "resetMarketState(address)", account],
        },
      ]),

      // Whitelist Keeper, GUARDIAN and governance timelocks as trusted keepers so VIPs can call handleDeviation after parameter changes
      ...[KEEPER_ADDRESS, GUARDIAN, ...GOVERNANCE_TIMELOCKS].map((timelock: string) => ({
        target: DEVIATION_SENTINEL,
        signature: "setTrustedKeeper(address,bool)",
        params: [timelock, true],
      })),

      // ========================================
      // Grant permissions for SentinelOracle
      // ========================================

      // Grant GUARDIAN and governance timelocks permission to configure token-to-oracle mappings on SentinelOracle
      ...[GUARDIAN, ...GOVERNANCE_TIMELOCKS].map((account: string) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SENTINEL_ORACLE, "setTokenOracleConfig(address,address)", account],
      })),

      // Grant GUARDIAN and governance timelocks permission to set direct prices on SentinelOracle
      ...[GUARDIAN, ...GOVERNANCE_TIMELOCKS].map((account: string) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SENTINEL_ORACLE, "setDirectPrice(address,uint256)", account],
      })),

      // ========================================
      // Grant permissions for DEX Oracles
      // ========================================

      // Grant GUARDIAN and governance timelocks permission to configure TWAP pool settings on UniswapOracle
      ...[GUARDIAN, ...GOVERNANCE_TIMELOCKS].map((account: string) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNISWAP_ORACLE, "setPoolConfig(address,address)", account],
      })),

      // Grant GUARDIAN and governance timelocks permission to configure TWAP pool settings on PancakeSwapOracle
      ...[GUARDIAN, ...GOVERNANCE_TIMELOCKS].map((account: string) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PANCAKESWAP_ORACLE, "setPoolConfig(address,address)", account],
      })),

      // ========================================
      // Grant DeviationSentinel permissions on Comptrollers
      // ========================================

      // Grant DeviationSentinel permission to pause/unpause borrow and mint actions on any comptroller
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_POOL_COMPTROLLER, "setActionsPaused(address[],uint8[],bool)", DEVIATION_SENTINEL],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_POOL_COMPTROLLER, "_setActionsPaused(address[],uint8[],bool)", DEVIATION_SENTINEL],
      },
      // Grant DeviationSentinel permission to set collateral factor on core pool comptroller (with emode poolId)
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [CORE_POOL_COMPTROLLER, "setCollateralFactor(uint96,address,uint256,uint256)", DEVIATION_SENTINEL],
      },

      // ========================================
      // Configure CAKE token
      // ========================================

      // Set CAKE pool config on PancakeSwapOracle
      {
        target: PANCAKESWAP_ORACLE,
        signature: "setPoolConfig(address,address)",
        params: [CAKE, CAKE_PCS_POOL],
      },

      // Set CAKE deviation threshold (20%) on DeviationSentinel
      {
        target: DEVIATION_SENTINEL,
        signature: "setTokenConfig(address,(uint8,bool))",
        params: [CAKE, [20, true]],
      },

      // set config in sentinel oracle
      {
        target: SENTINEL_ORACLE,
        signature: "setTokenOracleConfig(address,address)",
        params: [CAKE, PANCAKESWAP_ORACLE],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip590;
