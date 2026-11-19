import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ADAPTERS } from "../vip-681/bscmainnet";
import { REMOTE_CHAINS, RESET_POOL_CF_SNAPSHOT } from "./config";

// ===================================================================================================
// VIP-683 [BNB Chain, Ethereum, Arbitrum One, Base]
//   Part 1: Noon Capital sUSN Fixed Rate Vault
//   Part 2: CAPO update on BSC Core
//   Part 3: EBrake per-pool CF snapshot reset
// ===================================================================================================

// ===================================================================================================
// Part 1: Noon Capital sUSN Fixed Rate Vault
// ===================================================================================================

export const { RESILIENT_ORACLE, CHAINLINK_ORACLE } = NETWORK_ADDRESSES.bscmainnet;
// VIP-681's new AdapterFRV (VIP-681 is executed). Since its FRV beacon upgrade, a resource left on the old
// adapter (0x1824…657c) makes the U Hub's totalAssets() revert.
export const ADAPTER_FRV = ADAPTERS.FRV.new;

export const INSTITUTIONAL_VAULT_CONTROLLER = "0x6D9e91cB766259af42619c14c994E694E57e6E85";
export const LIQUIDATION_ADAPTER = "0x17A6222fB8b4b6D852cA54f5bc376a6A2c6224Bd";
export const U_FRV_SOURCE = "0x30908eddB9E94add7AC9944a0adda66d80B89143";

export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666"; // loan (supply) asset, 18 dec
export const SUSN = "0xdA67B4284609d2d48e5d10cfAc411572727dc1eD"; // collateral, Hyperlane-bridged Staked USN, 18 dec

// Stork's on-chain verifier and the sUSN feed it stores: the sUSN -> USN exchange rate, 18 dec, pushed hourly.
export const STORK = "0x7D06cc8210228365896A3cc8Aac88c5551529112";
export const SUSN_STORK_FEED_ID = "0x77003d6da8f95711efa901495c607c987dfaedd55d24c6f935286f2851ed915e";
// Venus's StorkChainlinkAdapter (oracle repo): serves the price from Stork's sUSN feed through the Chainlink
// interface, so the ChainlinkOracle uses it as sUSN's feed.
export const SUSN_STORK_FEED = "0xBa0331C346280A20c6b67C43512466030bAf13E0";
export const MAX_STALE_PERIOD = 3900; // 1h heartbeat + 5min

// controller.predictVaultAddress(INSTITUTION_OPERATOR) at institutionNonce 0; re-derive if a vault is
// created for this operator, or the vault implementation changes, before execution.
export const INSTITUTION_OPERATOR = "0x7e03eA3852489D3A3326ac51c1f81dFd8b1d3705";
export const NOON_VAULT = "0x6859D261da1eF6D7dBdB1AE612B358b881346B12";

// Whitelisted on the adapter for both liquidation paths, for every institutional vault.
export const LIQUIDATOR_BOT = "0x95780F943b6361FB11eEd893cf1237Dd9B3F54AF";
export const OPS_FUND_MULTISIG = "0xdc6E047f665c3Db94292Bb7fB412B25370db2029"; // Venus Operational Fund Multisig

export const FIXED_APY = 600; // 6% (bps)
export const RESERVE_FACTOR = parseUnits("0.1", 18); // 10% -> 5.4% supply APY
export const MIN_BORROW_CAP = parseUnits("10", 18);
export const MAX_BORROW_CAP = parseUnits("1000000", 18);
export const MIN_SUPPLIER_DEPOSIT = 0;
export const OPEN_DURATION = 86400; // 1 day
export const LOCK_DURATION = 2592000; // 30 days
export const SETTLEMENT_WINDOW = 259200; // 3 days

export const IDEAL_COLLATERAL_AMOUNT = parseUnits("1152073.71", 18);
export const MARGIN_RATE = parseUnits("1", 18); // 100%: all collateral is posted before the vault opens
export const POSITION_TOKEN_ID = 0;

export const LIQUIDATION_THRESHOLD = parseUnits("0.86", 18);
export const LIQUIDATION_INCENTIVE = parseUnits("1.1", 18); // 10% bonus
export const LATE_PENALTY_RATE = parseUnits("1.1", 18); // 10% late penalty

export const VAULT_NAME = "FRV Noon sUSN 16NOV2026 30";
export const VAULT_SYMBOL = "FRV-nn-16NOV2026-30";
export const INSTITUTION_NAME = "Noon Capital";

export const vaultConfig = [
  U, // supplyAsset
  FIXED_APY, // fixedAPY (bps)
  RESERVE_FACTOR, // reserveFactor
  MIN_BORROW_CAP, // minBorrowCap
  MAX_BORROW_CAP, // maxBorrowCap
  MIN_SUPPLIER_DEPOSIT, // minSupplierDeposit
  OPEN_DURATION, // openDuration
  LOCK_DURATION, // lockDuration
  SETTLEMENT_WINDOW, // settlementWindow
];
export const instConfig = [
  SUSN, // collateralAsset
  IDEAL_COLLATERAL_AMOUNT, // idealCollateralAmount
  MARGIN_RATE, // marginRate
  INSTITUTION_OPERATOR, // institutionOperator
  POSITION_TOKEN_ID, // positionTokenId (overwritten)
];
export const riskConfig = [
  LIQUIDATION_THRESHOLD, // liquidationThreshold
  LIQUIDATION_INCENTIVE, // liquidationIncentive
  LATE_PENALTY_RATE, // latePenaltyRate
];

// ===================================================================================================
// Part 2: CAPO update on BSC Core, per Allez Labs: growth rate = highest 15-day annualised yield over the past
// year, rounded up to the next 0.5%, 2% floor (sUSDe set to 15%, above the formula's 5.5%). slisBNB and
// asBNB also get a snapshot gap of one month of growth at the new rate (17 bps).
// ===================================================================================================

// setGrowthRate sets the growth rate and the snapshot interval together; the interval stays 30 days.
export const CAPO_SNAPSHOT_INTERVAL = 30 * 24 * 60 * 60;
export const CAPO_SNAPSHOT_GAP_BPS = 17;

export const SUSDE_ORACLE_MAIN = "0x2B2895104f958E1EC042E6Ba5cbfeCbAD3C5beDb";
export const SUSDE_ORACLE_PIVOT = "0xA67F01322AF8EBa444D788Ee398775b446de51a0";
export const WBETH_ORACLE = "0x49938fc72262c126eb5D4BdF6430C55189AEB2BA";
export const SLISBNB_ORACLE = "0xDDE6446E66c786afF4cd3D183a908bCDa57DF9c1";
export const ASBNB_ORACLE = "0x652B90D1d45a7cD5BE82c5Fb61a4A00bA126dde5";

export const CAPO_GROWTH_RATES = [
  { name: "sUSDe (main)", oracle: SUSDE_ORACLE_MAIN, annualGrowthRate: parseUnits("0.15", 18) },
  { name: "sUSDe (pivot)", oracle: SUSDE_ORACLE_PIVOT, annualGrowthRate: parseUnits("0.15", 18) },
  { name: "WBETH", oracle: WBETH_ORACLE, annualGrowthRate: parseUnits("0.03", 18) },
  { name: "slisBNB", oracle: SLISBNB_ORACLE, annualGrowthRate: parseUnits("0.02", 18) },
  { name: "asBNB", oracle: ASBNB_ORACLE, annualGrowthRate: parseUnits("0.02", 18) },
];

// setSnapshotGap only takes effect at the next scheduled refresh, up to 30 days later: the current
// snapshot keeps the old gap until then. So the slisBNB and asBNB snapshots are reset here, to the
// exchange rate read at CAPO_SEED_BLOCK plus the new gap, stamped with that block's time (2026-11-19T08:03:27Z).
export const CAPO_SEED_BLOCK = 134468000;
export const CAPO_SEED_TIMESTAMP = 1795075407;
export const CAPO_RESEEDS = [
  { name: "slisBNB", oracle: SLISBNB_ORACLE, seedExchangeRate: BigNumber.from("1039639897220465804") },
  { name: "asBNB", oracle: ASBNB_ORACLE, seedExchangeRate: BigNumber.from("1027512203878882689") },
];

export const capoSnapshotGap = (exchangeRate: BigNumber) => exchangeRate.mul(CAPO_SNAPSHOT_GAP_BPS).div(10000);
export const capoSeededSnapshot = (exchangeRate: BigNumber) => exchangeRate.add(capoSnapshotGap(exchangeRate));

// ===================================================================================================
// Part 3: EBrake per-pool CF snapshot reset (Cantina Apex VENU1-91). The new build adds
// resetCFSnapshot(address,uint96); the same build goes to Ethereum, Arbitrum One and Base, where it reverts.
// ===================================================================================================

const { ACCESS_CONTROL_MANAGER, FAST_TRACK_TIMELOCK, GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bscmainnet;

export const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const EBRAKE = "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec";
export const NEW_EBRAKE_IMPLEMENTATION = "0x0e18f3CA31080fBeF44378372Ec8602fA64cBC63";

// The accounts that already hold resetCFSnapshot(address) on EBrake
export const RESET_GRANTEES = [GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK];

export const vip683 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-683 [BNB Chain, Ethereum, Arbitrum One, Base] List the Noon Capital sUSN Fixed-Term Institutional Loan Vault, Update CAPO Parameters and Add the EBrake Per-Pool Snapshot Reset",
    description: `#### Summary

1. **Noon Capital vault (BNB Chain).** Lists a 30-day fixed-term vault for Noon Capital: up to 1,000,000 U at a 6% fixed APY, collateralised by 1,152,073.71 sUSN, priced from a new Stork feed.
2. **CAPO update (BNB Chain).** Tightens the CAPO parameters of sUSDe, WBETH, slisBNB and asBNB, following Allez Labs.
3. **EBrake per-pool snapshot reset (BNB Chain, Ethereum, Arbitrum One, Base).** Lets governance clear the collateral factor snapshot of a single pool (Cantina Apex VENU1-91).

#### Part 1: Noon Capital sUSN Fixed-Term Institutional Loan Vault

**Oracle.** sUSN is priced from Stork's hourly sUSN feed (ID ${SUSN_STORK_FEED_ID}) on ${STORK}: the sUSN → USN rate of the Ethereum Staked USN vault, ≈1.2365 at authoring. The StorkChainlinkAdapter ${SUSN_STORK_FEED} serves it to the ChainlinkOracle, sUSN's only ResilientOracle source. maxStalePeriod is 3,900s; Stork's own 1-hour limit fires first.

**Vault terms.**

- Vault: ${NOON_VAULT} · Share: ${VAULT_NAME} (${VAULT_SYMBOL})
- Loan asset: U (${U}) · Collateral: sUSN (${SUSN})
- Institution operator: ${INSTITUTION_OPERATOR}
- Fixed APY: 6% · Reserve factor: 10% (5.4% supply APY)
- Borrow cap: min 10 U / max 1,000,000 U · Minimum supplier deposit: none
- Open: 1 day · Lock: 30 days · Settlement window: 3 days
- Collateral: 1,152,073.71 sUSN (≈ $1,428,571 at $1.24) · Margin rate: 100%
- Liquidation threshold: 86% · Liquidation incentive: 10% · Late penalty: 10%

At the full drawdown the loan is ≈70% of the collateral value. With the coupon (≈1,004,932 U) it reaches the 86% threshold if sUSN falls ≈18%, to ≈$1.014. The 80% margin call (≈$1.090) is monitored off-chain.

**Liquidators.** The LiquidationAdapter (${LIQUIDATION_ADAPTER}) whitelists the liquidator bot ${LIQUIDATOR_BOT} and the Venus Operational Fund Multisig ${OPS_FUND_MULTISIG} for liquidate and liquidateOverdueVault, on every institutional vault.

**Liquidity Hub.** The vault becomes a resource of the U Hub's FRV source (${U_FRV_SOURCE}) behind the AdapterFRV ${ADAPTER_FRV}.

**Considerations.**

- USN is valued at $1, so a USN depeg would not lower sUSN's price. Noon issues sUSN and borrows against it.
- If the feed is over 1 hour old, sUSN pricing reverts, blocking drawdown, collateral withdrawal during Lock and liquidations.
- Noon can pause sUSN on BNB Chain or blacklist any address, the vault included.
- Half of the 10% liquidation incentive goes to the protocol.

#### Part 2: CAPO Parameters

The growth rates were set when yields were higher, so the caps no longer bind closely. Per Allez Labs, the growth rate becomes the highest 15-day annualised yield of the past year, rounded up to 0.5%, with a 2% floor (sUSDe: 15%, above the formula's 5.5%). slisBNB and asBNB get a snapshot gap of one month's growth (0.17%). The snapshot interval stays 30 days.

- sUSDe main ${SUSDE_ORACLE_MAIN}: growth 28.27% → 15%, gap unchanged (2.2%)
- sUSDe pivot ${SUSDE_ORACLE_PIVOT}: growth 28.27% → 15%, gap unchanged (2.2%)
- WBETH ${WBETH_ORACLE}: growth 4.64% → 3%, gap unchanged (0.38%)
- slisBNB ${SLISBNB_ORACLE}: growth 5% → 2%, gap 0.35% → 0.17%
- asBNB ${ASBNB_ORACLE}: growth 5% → 2%, gap 2.5% → 0.17%

A new gap only applies at the next snapshot refresh, so the slisBNB and asBNB snapshots are reset to the rate at block ${CAPO_SEED_BLOCK} plus the new gap:

- slisBNB: snapshot ${capoSeededSnapshot(CAPO_RESEEDS[0].seedExchangeRate).toString()}, gap ${capoSnapshotGap(
      CAPO_RESEEDS[0].seedExchangeRate,
    ).toString()}
- asBNB: snapshot ${capoSeededSnapshot(CAPO_RESEEDS[1].seedExchangeRate).toString()}, gap ${capoSnapshotGap(
      CAPO_RESEEDS[1].seedExchangeRate,
    ).toString()}

#### Part 3: EBrake Per-Pool Collateral Factor Snapshot Reset

resetCFSnapshot(address) clears a market's CF snapshot in every pool, so restoring one pool also erases the baseline of pools that stay tightened (Cantina Apex VENU1-91, Low). The new EBrake build adds resetCFSnapshot(address,uint96) to clear one pool; nothing else changes. Ethereum, Arbitrum One and Base get the same build, where the new function reverts.

- BNB Chain: ${EBRAKE} → ${NEW_EBRAKE_IMPLEMENTATION}
${REMOTE_CHAINS.map(c => `- ${c.name}: ${c.eBrake} → ${c.newImplementation}`).join("\n")}

#### Permissions

Parts 1 and 2 need none: the Normal Timelock already holds every function. Part 3 grants ${RESET_POOL_CF_SNAPSHOT} on BNB Chain to the Guardian and the Normal and Fast-track Timelocks, the holders of resetCFSnapshot(address).

#### Actions

**Part 1: Noon Capital vault (BNB Chain)**

1. Register the sUSN Stork adapter on the ChainlinkOracle (${CHAINLINK_ORACLE}): setTokenConfig(sUSN, ${SUSN_STORK_FEED}, 3900).
2. Price sUSN on the ResilientOracle (${RESILIENT_ORACLE}) with the ChainlinkOracle as its single main source.
3. Create the Noon Capital vault on the InstitutionalVaultController (${INSTITUTIONAL_VAULT_CONTROLLER}): createVault(...).
4. Whitelist the liquidator bot and the Venus Operational Fund Multisig on the LiquidationAdapter: setLiquidatorWhitelist and setSettlerWhitelist for each.
5. Register the vault as a resource on the U Hub's FRV source (${U_FRV_SOURCE}): addResource(${NOON_VAULT}, ${ADAPTER_FRV}).

**Part 2: CAPO update (BNB Chain)**

6. Set the new CAPO growth rates, with the 30-day snapshot interval, on the sUSDe main and pivot, WBETH, slisBNB and asBNB oracles: setGrowthRate.
7. Set the new snapshot gap on the slisBNB and asBNB oracles: setSnapshotGap.
8. Reset the slisBNB and asBNB snapshots with the new gap: setSnapshot.

**Part 3: EBrake (BNB Chain, Ethereum, Arbitrum One, Base)**

9. Upgrade the EBrake proxy on BNB Chain to the new implementation.
10. Grant ${RESET_POOL_CF_SNAPSHOT} on EBrake to the Guardian and the Normal and Fast-track Timelocks.
11. Upgrade EBrake to the same build on Ethereum, Arbitrum One and Base.

#### Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Must precede createVault, which reverts unless the ResilientOracle prices sUSN.
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[SUSN, SUSN_STORK_FEED, MAX_STALE_PERIOD]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            SUSN,
            [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },

      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature:
          "createVault((address,uint256,uint256,uint256,uint256,uint256,uint40,uint40,uint40)," +
          "(address,uint256,uint256,address,uint256),(uint256,uint256,uint256),string,string,string)",
        params: [vaultConfig, instConfig, riskConfig, VAULT_NAME, VAULT_SYMBOL, INSTITUTION_NAME],
      },

      // liquidate (health factor) is gated by the liquidator whitelist, liquidateOverdueVault by the settler one.
      ...[LIQUIDATOR_BOT, OPS_FUND_MULTISIG].flatMap(liquidator => [
        {
          target: LIQUIDATION_ADAPTER,
          signature: "setLiquidatorWhitelist(address,bool)",
          params: [liquidator, true],
        },
        {
          target: LIQUIDATION_ADAPTER,
          signature: "setSettlerWhitelist(address,bool)",
          params: [liquidator, true],
        },
      ]),

      {
        target: U_FRV_SOURCE,
        signature: "addResource(address,address)",
        params: [NOON_VAULT, ADAPTER_FRV],
      },

      // CAPO update
      ...CAPO_GROWTH_RATES.map(({ oracle, annualGrowthRate }) => ({
        target: oracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [annualGrowthRate, CAPO_SNAPSHOT_INTERVAL],
      })),
      ...CAPO_RESEEDS.flatMap(({ oracle, seedExchangeRate }) => [
        {
          target: oracle,
          signature: "setSnapshotGap(uint256)",
          params: [capoSnapshotGap(seedExchangeRate)],
        },
        {
          target: oracle,
          signature: "setSnapshot(uint256,uint256)",
          params: [capoSeededSnapshot(seedExchangeRate), CAPO_SEED_TIMESTAMP],
        },
      ]),

      // EBrake: upgrade on BNB Chain
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [EBRAKE, NEW_EBRAKE_IMPLEMENTATION],
      },

      // EBrake: per-pool snapshot reset permission
      ...RESET_GRANTEES.map(account => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [EBRAKE, RESET_POOL_CF_SNAPSHOT, account],
      })),

      // EBrake: upgrade on Ethereum, Arbitrum One and Base
      ...REMOTE_CHAINS.map(chain => ({
        target: chain.proxyAdmin,
        signature: "upgrade(address,address)",
        params: [chain.eBrake, chain.newImplementation],
        dstChainId: chain.dstChainId,
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip683;
