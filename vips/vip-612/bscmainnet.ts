import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// ================================================================================
// ===== SolvBTC Oracle Setup =====
// ================================================================================
export const SOLVBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";

export const CHAINLINK_SOLVBTC_CONFIG = {
  oldFeed: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
  oldMaxStalePeriod: 100,
  newFeed: "0xf93b9B23c46331704EC550c24CB4110975057863", // Chainlink ER feed
  maxStalePeriod: 86700, // 24h + 5min
};

export const REDSTONE_SOLVBTC_CONFIG = {
  oldFeed: "0xF5F641fF3c7E39876A76e77E84041C300DFa4550",
  oldMaxStalePeriod: 21900,
  newFeed: "0x8D89d6c114193154f111D7C83299D285C9cC5BBC", // RedStone cross-market
  maxStalePeriod: 21900, // 6h + 5min
};

export const FUNDAMENTAL_SOLVBTC_CONFIG = {
  oldFeed: ethers.constants.AddressZero,
  oldMaxStalePeriod: 0,
  newFeed: "0x77471661568DC65d4574EAd9544DfF1e618Adfb2", // Solv self-reported rate
  maxStalePeriod: 86700, // 24h + 5min
};

export const SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE = "0x4521589226ef07d9805936de42F1ACF394B2B221"; // ChainlinkOracle proxy (Ownable2Step)
export const SOLVBTC_ONE_JUMP_FUNDAMENTAL_ORACLE = "0x1f785B1AFE0808d69d1188db9e47b7B9Dd95ab09"; // CorrelatedTokenOracle (fundamental rate)
export const SOLVBTC_ONE_JUMP_CHAINLINK_ORACLE = "0x3f4bC081E749032cffF29dcA2E8408Ec375e745A"; // OneJumpOracle (Chainlink ER)
export const SOLVBTC_ONE_JUMP_REDSTONE_ORACLE = "0xA3E6F08e3C1baD83e1971909483F27Cdd19937FC"; // OneJumpOracle (RedStone cross-market)

export const SOLVBTC_RESILIENT_ORACLE_CONFIG = {
  old: {
    oracles: [bscmainnet.REDSTONE_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero] as [
      string,
      string,
      string,
    ],
    enableFlagsForOracles: [true, true, false] as [boolean, boolean, boolean],
    cachingEnabled: false,
  },
  new: {
    oracles: [
      SOLVBTC_ONE_JUMP_FUNDAMENTAL_ORACLE,
      SOLVBTC_ONE_JUMP_CHAINLINK_ORACLE,
      SOLVBTC_ONE_JUMP_REDSTONE_ORACLE,
    ] as [string, string, string],
    enableFlagsForOracles: [true, true, false] as [boolean, boolean, boolean],
    cachingEnabled: false,
  },
};

// ================================================================================
// ===== U Oracle Update =====
// ================================================================================
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";

export const USDT_CHAINLINK_ORACLE = "0x22Dc2BAEa32E95AB07C2F5B8F63336CbF61aB6b8";
export const ATLAS_ORACLE = "0x9E6928Ec418948ceb9f1cd9872fD312b13D841D0";

export const CHAINLINK_U_CONFIG = {
  asset: U,
  oldFeed: "0xaD8b4e59A7f25B68945fAf0f3a3EAF027832FFB0",
  newFeed: "0x2Ab73dc1C8A23bcDDb4850Ff811850E0d2a0c72f",
  maxStalePeriod: 86700,
};

export const ATLAS_U_CONFIG = {
  asset: U,
  feed: "0x14a20EAFffadA4d78aFEeF1185E7317CF98f6A1F",
  maxStalePeriod: 86700,
};

export const U_RESILIENT_ORACLE_CONFIG = {
  old: {
    oracles: [USDT_CHAINLINK_ORACLE, bscmainnet.CHAINLINK_ORACLE, ethers.constants.AddressZero],
    enableFlagsForOracles: [true, true, false],
    cachingEnabled: false,
  },
  new: {
    oracles: [bscmainnet.CHAINLINK_ORACLE, ATLAS_ORACLE, ethers.constants.AddressZero],
    enableFlagsForOracles: [true, true, false],
    cachingEnabled: false,
  },
};

// ================================================================================
// ===== XVS Base Reward Grant =====
// ================================================================================
// Q1 2026: 90 days × 308.7 XVS/day = 27,783 XVS
// Q2 2026: 91 days × 308.7 XVS/day = 28,092 XVS
// Total outstanding: 55,875 XVS
export const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const XVS_GRANT_AMOUNT = parseUnits("55875", 18);

export const vip612 = () => {
  const meta = {
    version: "v2",
    title: "VIP-612 [BNB Chain] SolvBTC Oracle Setup + U Oracle Switch to Dedicated Feeds + XVS Base Reward Grant",
    description: `## Summary

This VIP performs three independent actions on BNB Chain:

### 1. SolvBTC Oracle Setup

Configures a three-tier resilient oracle for SolvBTC/USD pricing using the OneJump pattern
(SolvBTC/BTC rate × BTCB/USD = SolvBTC/USD):
- **MAIN**: CorrelatedTokenOracle (SolvBTCOneJumpFundamentalOracle) using the Solv self-reported fundamental rate
- **PIVOT**: OneJumpOracle (SolvBTCOneJumpChainlinkOracle) using the Chainlink ER feed
- **FALLBACK**: OneJumpOracle (SolvBTCOneJumpRedStoneOracle) using the RedStone cross-market feed (disabled)

Also grants ACM permissions to the Normal Timelock for the freshly deployed SolvBTCFundamentalChainlinkOracle.

### 2. U Oracle Update (VPD-996)

Venus currently prices U using non-dedicated oracle feeds (USDT Chainlink as MAIN, USD1 Chainlink as PIVOT).
Both Chainlink and Atlas (formerly CMC) have deployed dedicated U/USD feeds on BNB Chain.
This VIP switches to the dedicated feeds:
- **MAIN**: ChainlinkOracle with dedicated Chainlink U/USD feed (0x2Ab73dc1C8A23bcDDb4850Ff811850E0d2a0c72f)
- **PIVOT**: AtlasOracle with dedicated Atlas U/USD feed (0x14a20eafffada4d78afeef1185e7317cf98f6a1f)
- maxStalePeriod: 86,700s (24h + 5min), deviation: 0.5%

### 3. XVS Base Reward Grant (VPD-1024)

The fixed Base Reward allocation of 308.7 XVS/day on BNB Chain has not been funded for any period in 2026.
Last grant was VIP-529 (July 2025), covering through 2025-12-31.

Outstanding amounts:
- Q1 2026: 90 days × 308.7 = 27,783 XVS
- Q2 2026: 91 days × 308.7 = 28,092 XVS
- Total: 55,875 XVS

This VIP calls _grantXVS on the Core Pool Comptroller to transfer 55,875 XVS directly to XVSStore.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ================================================================================
      // ===== 1. SolvBTC Oracle Setup =====
      // ================================================================================

      {
        target: SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [[[SOLVBTC, FUNDAMENTAL_SOLVBTC_CONFIG.newFeed, FUNDAMENTAL_SOLVBTC_CONFIG.maxStalePeriod]]],
      },
      {
        target: bscmainnet.CHAINLINK_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [[[SOLVBTC, CHAINLINK_SOLVBTC_CONFIG.newFeed, CHAINLINK_SOLVBTC_CONFIG.maxStalePeriod]]],
      },
      {
        target: bscmainnet.REDSTONE_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [[[SOLVBTC, REDSTONE_SOLVBTC_CONFIG.newFeed, REDSTONE_SOLVBTC_CONFIG.maxStalePeriod]]],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            [
              SOLVBTC,
              SOLVBTC_RESILIENT_ORACLE_CONFIG.new.oracles,
              SOLVBTC_RESILIENT_ORACLE_CONFIG.new.enableFlagsForOracles,
              SOLVBTC_RESILIENT_ORACLE_CONFIG.new.cachingEnabled,
            ],
          ],
        ],
      },

      // ================================================================================
      // ===== 2. U Oracle Update =====
      // ================================================================================

      {
        target: ATLAS_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ATLAS_ORACLE, "setTokenConfig(TokenConfig)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ATLAS_ORACLE, "setDirectPrice(address,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.CHAINLINK_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [[[CHAINLINK_U_CONFIG.asset, CHAINLINK_U_CONFIG.newFeed, CHAINLINK_U_CONFIG.maxStalePeriod]]],
      },
      {
        target: ATLAS_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [[[ATLAS_U_CONFIG.asset, ATLAS_U_CONFIG.feed, ATLAS_U_CONFIG.maxStalePeriod]]],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            [
              U,
              U_RESILIENT_ORACLE_CONFIG.new.oracles,
              U_RESILIENT_ORACLE_CONFIG.new.enableFlagsForOracles,
              U_RESILIENT_ORACLE_CONFIG.new.cachingEnabled,
            ],
          ],
        ],
      },

      // ================================================================================
      // ===== 3. XVS Base Reward Grant =====
      // ================================================================================

      {
        target: bscmainnet.UNITROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [XVS_STORE, XVS_GRANT_AMOUNT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip612;
