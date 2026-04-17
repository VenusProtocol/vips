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
    enableFlagsForOracles: [true, true, true] as [boolean, boolean, boolean],
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

// ================================================================================
// ===== Allez Labs Quarterly Payment =====
// ================================================================================
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const ALLEZ_LABS = "0x1757564C8C9a2c3cbE12620ea21B97d6E149F98e";
export const ALLEZ_LABS_USDT_AMOUNT = parseUnits("105000", 18);

export const vip612 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-612 [BNB Chain] 2026 Week 16 VIP: solvBTC & U Oracle Upgrades, Allez Labs Q2 Payment & XVS Vault Base Reward Top-up",
    description: `#### Summary

This VIP bundles four protocol actions on BNB Chain:

1. **Switch solvBTC oracle** from RedStone market price feed to a manipulation-resistant CorrelatedTokenOracle (RedStone exchange rate feed), replace BinanceOracle PIVOT with Chainlink Exchange Rate feed, and add a RedStone cross-market FALLBACK — upgrading from Tier 2 to Full (3 oracles).
2. **Switch U oracle** from non-dedicated Chainlink USDT/USD1 feeds to dedicated Chainlink U/USD (MAIN) and Atlas U/USD (PIVOT) feeds.
3. **Transfer $105,000 USDT** from Venus Treasury to Allez Labs for Q2 2026 risk management services.
4. **Fund XVS Vault base rewards** by calling _grantXVS to transfer ~55,875 XVS from the Core Pool Comptroller to the XVS Store, covering Q1–Q2 2026.

#### Description

#### 1. [BNB Chain] solvBTC Oracle Switch to Exchange Rate Feed

**Context**

solvBTC has low spot trading volume on BSC DEXs, making the current RedStone market price feed vulnerable to manipulation. Solv has requested switching to exchange rate feeds. Chainlink ER feed is now live on BNB Chain.

**Current Configuration**

- MAIN: RedStoneOracle, RS:SolvBTC (0xF5F6...a550), deviation 0.5%, heartbeat 6h, max_stale 21,900s
- PIVOT: BinanceOracle, BN:SOLVBTC, deviation 1.0%, heartbeat 12h, max_stale 43,500s
- FALLBACK: N/A

**Proposed Configuration**

- MAIN: CorrelatedTokenOracle, [RS:SolvBTC_FUNDAMENTAL](https://app.redstone.finance/app/feeds/bnb-chain/solvbtc_fundamental/), address 0x77471661568DC65d4574EAd9544DfF1e618Adfb2, deviation 0.01%, heartbeat 24h, max_stale 86,700s
- PIVOT: ChainlinkOracle, CL:solvBTC/BTC Exchange Rate, address 0xf93b9B23c46331704EC550c24CB4110975057863, deviation 1.0%, heartbeat 24h, max_stale 86,700s
- FALLBACK: RedStoneOracle, SolvBTC/BTC cross-market (~14 CEX), address 0x8D89d6c114193154f111D7C83299D285C9cC5BBC, deviation 0.5%, heartbeat 6h, max_stale 21,900s

Tier: Full (MAIN + PIVOT + FALLBACK)

**Key Changes**

- MAIN: RedStone SolvBTC_FUNDAMENTAL exchange rate feed via CorrelatedTokenOracle — immune to spot market manipulation
- PIVOT: Chainlink solvBTC/BTC Exchange Rate feed — replaces BinanceOracle to align with Solv's migration away from market rate feeds
- FALLBACK: RedStone cross-market feed aggregating ~14 CEX sources — provides market price backup
- max_stale = provider heartbeat + 300s (consistent with protocol-wide oracle audit recommendation)

**Actions**

- Configure CorrelatedTokenOracle for solvBTC with SolvBTC_FUNDAMENTAL feed
- Set MAIN oracle to CorrelatedTokenOracle, max_stale = 86,700s
- Set PIVOT oracle to ChainlinkOracle with solvBTC/BTC ER feed, max_stale = 86,700s
- Configure FALLBACK oracle to RedStoneOracle with SolvBTC/BTC cross-market feed, max_stale = 21,900s

#### 2. [BNB Chain] U Oracle — Switch to Dedicated Feeds

**Context**

Venus currently prices U using non-dedicated oracles (Chainlink USDT and USD1 as proxies). Both Chainlink and Atlas (formerly CMC) have now deployed dedicated U/USD feeds on BNB Chain.

**Current Configuration**

- MAIN: ChainlinkOracle (capped), Stabilized USDT Price Feed (non-dedicated), address 0xF884002406Ac6Fd93FF5C989506220f781A97eEA, max_stale 100s
- PIVOT: ChainlinkOracle, USD1/USD (non-dedicated), max_stale 86,700s
- FALLBACK: N/A

Tier: 2 (MAIN + PIVOT only)

**Proposed Configuration**

- MAIN: ChainlinkOracle, [U/USD (dedicated)](https://data.chain.link/feeds/bsc/mainnet/u-usd), address 0x2Ab73dc1C8A23bcDDb4850Ff811850E0d2a0c72f, deviation 0.5%, heartbeat 24h, max_stale 86,700s
- PIVOT: Atlas (formerly CMC), [U/USD (dedicated)](https://bscscan.com/address/0x14a20eafffada4d78afeef1185e7317cf98f6a1f), address 0x14a20eafffada4d78afeef1185e7317cf98f6a1f, deviation 0.5%, heartbeat 24h, max_stale 86,700s

Tier: 2 (MAIN + PIVOT)

**Actions**

- Set MAIN oracle to ChainlinkOracle with dedicated U/USD feed, max_stale = 86,700s
- Set PIVOT oracle to Atlas with dedicated U/USD feed, max_stale = 86,700s

#### 3. [BNB Chain] Allez Labs Q2 2026 Risk Services Payment

**Context**

Allez Labs provides risk management services to Venus Protocol. Per the contract terms, fees are paid quarterly in advance starting Q2 2026. This is the payment covering Q2 2026 (26 April 2026 – 25 July 2026).

**Transfer Details**

- Amount: 105,000 USDT
- Source: Venus Treasury (0xf322942f644a996a617bd29c16bd7d231d9f35e9)
- Destination: Allez Labs (0x1757564C8C9a2c3cbE12620ea21B97d6E149F98e)
- Period: Q2 2026 (April – July)
- Basis: $35,000/month × 3 months

**Actions**

- Direct Transfer 105,000 USDT from Venus Treasury to Allez Labs at 0x1757564C8C9a2c3cbE12620ea21B97d6E149F98e

#### 4. [BNB Chain] Fund XVS Vault Base Rewards for H1 2026

The fixed Base Reward allocation of 308.7 XVS/day on BNB Chain has not been funded from the Core Pool Comptroller since [VIP-529](https://app.venus.io/#/governance/proposal/529?chainId=56) (July 2025), which only covered through 2025-12-31. Both Q1 and Q2 2026 base rewards are outstanding.

**Outstanding Amount**

- Q1 2026: 90 days × 308.7 = 27,783 XVS
- Q2 2026: 91 days × 308.7 = 28,092 XVS
- Total: ~55,875 XVS

**Actions**

- Call _grantXVS(XVS_STORE, ~55,875) on the Core Pool Comptroller to transfer XVS to the [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359)

#### Voting options

- **For** — Execute this proposal
- **Against** — Do not execute this proposal
- **Abstain** — Indifferent to execution`,
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

      // ================================================================================
      // ===== 4. Allez Labs Quarterly Payment =====
      // ================================================================================

      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, ALLEZ_LABS_USDT_AMOUNT, ALLEZ_LABS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip612;
