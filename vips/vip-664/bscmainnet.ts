import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// VIP-664 [BNB Chain] List vhUSDT, vhUSDC and vhU in the Venus Core Pool.

const { bscmainnet } = NETWORK_ADDRESSES;

// Capped ERC4626 oracles, deployed from VenusProtocol/oracle under the vh-erc4626-oracles tag with
// every cap argument zeroed. The first three commands per market arm them.
export const VHUSDT_ORACLE = "0x50a998cf59Fe719129702125C9078b0B429DA6E7";
export const VHUSDC_ORACLE = "0x85aa49526287F06cb36d57121BC7abAF58a8787a";
export const VHU_ORACLE = "0x5b3735F362ed89b51FBe244509e398BFDDaC8da9";

// VBep20Delegator markets, deployed from VenusProtocol/venus-protocol. Each was constructed with
// admin = NormalTimelock, an initial exchange rate of 1e34, the interest rate model below and the
// VBep20Delegate implementation 0xCDfea50f7CECCB24Fe804657DB8E6c93b689941e already used by the pool.
export const VVHUSDT = "0xc0768948e668B7BacFf8b4BD1BaBe0eD2b512d3c";
export const VVHUSDC = "0xb1AB0399766997C5d66a30b2f2055277B7FA5D6C";
export const VVHU = "0x80a5694441810d2b871BEeD644b6d16D113ce06E";

// ERC4626 assets of the three vaults. The VTreasury holds these, not the vhTokens, so the bootstrap
// withdraws the asset and mints the shares from the vault instead of withdrawing shares directly.
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";

export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const BORROW_ACTION = 2; // Comptroller Action enum: BORROW

export const { RESILIENT_ORACLE } = bscmainnet;

// Already deployed: the plain JumpRateModel carrying exactly these params (base 0, multiplier 9%,
// jump 200%, kink 50%) at 70,080,000 blocks per year, live on the vPT-clisBNB-25JUN2026 market. No
// new interest rate model is deployed for these markets.
//
// Deliberately not 0x1Ef3b851CE40B663dBbF91B86A4EE51A4a0999C5, the address vasBNB and vslisBNB use.
// That one is a CheckpointView: a fallback proxy that forwards every call to the pre- or
// post-migration model depending on block.timestamp. It exists so markets that predate the
// blocks-per-year change keep continuous historical rates, which a market listed now does not have.
export const JUMP_RATE_MODEL = "0x6463ab803FF081616ac4daC31B9B66854cc28Bc0";

// Capped ERC4626 oracle. Price = underlying resilient price x capped vault exchange rate, the
// asBNB/slisBNB design. The instances are deployed with the cap zeroed, so this VIP arms it.
// Order is load-bearing: setSnapshot must precede setGrowthRate, because updateSnapshot() on an
// oracle whose snapshotMaxExchangeRate is still 0 collapses the cap to snapshotGap alone. Same
// three commands in the same order as VIP-530.
export const CAPO_GROWTH_RATE_PER_YEAR = parseUnits("0.05", 18);
export const CAPO_SNAPSHOT_INTERVAL = 30 * 24 * 60 * 60;
// One snapshot interval of growth, the ratio VIP-530 applied to every asset it armed:
// 5% * 30/365 = 0.41%.
export const CAPO_SNAPSHOT_GAP_BPS = BigNumber.from(41);
// Vault exchange rates below were read at block 117780230 (2026-08-24T09:00:19Z).
export const CAPO_SEED_TIMESTAMP = 1787562019;

export const snapshotGap = (exchangeRate: BigNumber) => exchangeRate.mul(CAPO_SNAPSHOT_GAP_BPS).div(10000);
export const seededSnapshot = (exchangeRate: BigNumber) => exchangeRate.add(snapshotGap(exchangeRate));

// Oracle Dynamic Protection Mode / "E-brake" (DeviationBoundedOracle, see VIP-617).
export const DEVIATION_BOUNDED_ORACLE = "0xc79Cb7efEBd121DC4B39eA141C214606595D665A";
export const DBO_COOLDOWN_PERIOD = 3600; // 1h rolling window
// vhTokens are ~$1 stablecoin-correlated, so VIP-633's 16.67% equity trigger is not reused.
// Contract bounds: trigger in [MIN_THRESHOLD 5e16, MAX_THRESHOLD 50e16], reset non-zero and below
// trigger, cooldown > 0.
export const DBO_TRIGGER_THRESHOLD = parseUnits("0.05", 18); // 5% — the contract minimum
export const DBO_RESET_THRESHOLD = parseUnits("0.02", 18); // 2%

export type MarketSpec = {
  vToken: {
    address: string;
    name: string;
    symbol: string;
    underlying: { address: string; symbol: string; decimals: number };
    decimals: number;
    exchangeRate: BigNumber;
    comptroller: string;
    isLegacyPool: boolean;
  };
  // The vault's ERC4626 asset, held by the VTreasury and spent to mint the bootstrap shares.
  asset: { address: string; symbol: string; decimals: number };
  // Set in each vToken's constructor, so the proposal never writes it; the simulation asserts it.
  rateModel: string;
  interestRateModel: {
    model: "jump";
    baseRatePerYear: string;
    multiplierPerYear: string;
    jumpMultiplierPerYear: string;
    kink: string;
  };
  oracle: {
    // Capped ERC4626Oracle instance registered as the ResilientOracle main source for the vhToken.
    address: string;
    // Live vault exchange rate the growth cap is seeded from.
    seedExchangeRate: BigNumber;
  };
  riskParameters: {
    collateralFactor: BigNumber;
    liquidationThreshold: BigNumber;
    liquidationIncentive: BigNumber;
    reserveFactor: BigNumber;
    supplyCap: BigNumber;
    borrowCap: BigNumber;
  };
  initialSupply: {
    // vhToken shares minted from the vault and then supplied to the market.
    amount: BigNumber;
    // Asset withdrawn from the VTreasury to pay for those shares.
    assetAmount: BigNumber;
    vTokenReceiver: string;
    vTokensToBurn: BigNumber;
  };
};

// exchangeRate scale = 18 + underlyingDecimals(24) - vTokenDecimals(8) = 34.
// Rationale for the risk parameters (CF == LT, the 82.5/80/75 split, the IRM on a non-borrowable
// market) is in the VIP description below.
const EXCHANGE_RATE = parseUnits("1", 34);
const SUPPLY_CAP = parseUnits("10000000", 24); // _setMarketSupplyCaps takes an underlying amount, not USD
const LIQUIDATION_INCENTIVE = parseUnits("1.1", 18); // 10%
const RESERVE_FACTOR = parseUnits("0.1", 18); // 10% (inert while borrow is paused)
const BOOTSTRAP_AMOUNT = parseUnits("10", 24); // 10 vhToken shares, ~$10 of collateral (24 dec)
// Asset withdrawn from the VTreasury to mint those shares. At the authoring block previewMint(10e24)
// costs 10.009332 USDT, 10.010878 USDC and 10.008173 U; 10.2 leaves ~1.9% of exchange-rate headroom
// so the vault mint cannot under-fund if the vaults accrue between proposal and execution. The
// unspent remainder, under 0.2 of each asset, stays with the Normal Timelock.
const BOOTSTRAP_ASSET_AMOUNT = parseUnits("10.2", 18);
// vTokensMinted = amount * 1e18 / exchangeRate = 10e24 * 1e18 / 1e34 = 10e8; burn 10%.
const BOOTSTRAP_BURN = parseUnits("1", 8);

// Market — vhUSDT
export const MARKET_VHUSDT: MarketSpec = {
  vToken: {
    address: VVHUSDT,
    name: "Venus vhUSDT",
    symbol: "vvhUSDT",
    underlying: {
      address: "0x18AfDACF30F8671021dec4b78297E39d2FE87226",
      symbol: "vhUSDT",
      decimals: 24,
    },
    decimals: 8,
    exchangeRate: EXCHANGE_RATE,
    comptroller: bscmainnet.UNITROLLER,
    isLegacyPool: true,
  },
  asset: { address: USDT, symbol: "USDT", decimals: 18 },
  rateModel: JUMP_RATE_MODEL,
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.09",
    jumpMultiplierPerYear: "2",
    kink: "0.5",
  },
  oracle: { address: VHUSDT_ORACLE, seedExchangeRate: parseUnits("1.000933217619977068", 18) },
  riskParameters: {
    collateralFactor: parseUnits("0.8", 18),
    liquidationThreshold: parseUnits("0.8", 18),
    liquidationIncentive: LIQUIDATION_INCENTIVE,
    reserveFactor: RESERVE_FACTOR,
    supplyCap: SUPPLY_CAP,
    borrowCap: parseUnits("0", 24), // borrowing disabled at launch
  },
  initialSupply: {
    amount: BOOTSTRAP_AMOUNT,
    assetAmount: BOOTSTRAP_ASSET_AMOUNT,
    vTokenReceiver: bscmainnet.VTREASURY,
    vTokensToBurn: BOOTSTRAP_BURN,
  },
};

// Market — vhUSDC
export const MARKET_VHUSDC: MarketSpec = {
  vToken: {
    address: VVHUSDC,
    name: "Venus vhUSDC",
    symbol: "vvhUSDC",
    underlying: {
      address: "0x9D2D9592cF8DFbf59107fAab703d08494BE14617",
      symbol: "vhUSDC",
      decimals: 24,
    },
    decimals: 8,
    exchangeRate: EXCHANGE_RATE,
    comptroller: bscmainnet.UNITROLLER,
    isLegacyPool: true,
  },
  asset: { address: USDC, symbol: "USDC", decimals: 18 },
  rateModel: JUMP_RATE_MODEL,
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.09",
    jumpMultiplierPerYear: "2",
    kink: "0.5",
  },
  oracle: { address: VHUSDC_ORACLE, seedExchangeRate: parseUnits("1.001087844692385500", 18) },
  riskParameters: {
    collateralFactor: parseUnits("0.825", 18),
    liquidationThreshold: parseUnits("0.825", 18),
    liquidationIncentive: LIQUIDATION_INCENTIVE,
    reserveFactor: RESERVE_FACTOR,
    supplyCap: SUPPLY_CAP,
    borrowCap: parseUnits("0", 24), // borrowing disabled at launch
  },
  initialSupply: {
    amount: BOOTSTRAP_AMOUNT,
    assetAmount: BOOTSTRAP_ASSET_AMOUNT,
    vTokenReceiver: bscmainnet.VTREASURY,
    vTokensToBurn: BOOTSTRAP_BURN,
  },
};

// Market — vhU
export const MARKET_VHU: MarketSpec = {
  vToken: {
    address: VVHU,
    name: "Venus vhU",
    symbol: "vvhU",
    underlying: {
      address: "0x0e5AA174d4F31b757a237eb1999DE151596788B0",
      symbol: "vhU",
      decimals: 24,
    },
    decimals: 8,
    exchangeRate: EXCHANGE_RATE,
    comptroller: bscmainnet.UNITROLLER,
    isLegacyPool: true,
  },
  asset: { address: U, symbol: "U", decimals: 18 },
  rateModel: JUMP_RATE_MODEL,
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.09",
    jumpMultiplierPerYear: "2",
    kink: "0.5",
  },
  oracle: { address: VHU_ORACLE, seedExchangeRate: parseUnits("1.000817329117253330", 18) },
  riskParameters: {
    collateralFactor: parseUnits("0.75", 18),
    liquidationThreshold: parseUnits("0.75", 18),
    liquidationIncentive: LIQUIDATION_INCENTIVE,
    reserveFactor: RESERVE_FACTOR,
    supplyCap: SUPPLY_CAP,
    borrowCap: parseUnits("0", 24), // borrowing disabled at launch
  },
  initialSupply: {
    amount: BOOTSTRAP_AMOUNT,
    assetAmount: BOOTSTRAP_ASSET_AMOUNT,
    vTokenReceiver: bscmainnet.VTREASURY,
    vTokensToBurn: BOOTSTRAP_BURN,
  },
};

export const MARKETS: MarketSpec[] = [MARKET_VHUSDT, MARKET_VHUSDC, MARKET_VHU];

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const vTokensMinted = (m: MarketSpec) => convertAmountToVTokens(m.initialSupply.amount, m.vToken.exchangeRate);

export const vTokensRemaining = (m: MarketSpec) => vTokensMinted(m).sub(m.initialSupply.vTokensToBurn);

// Size limit, simulation only. hardhat-ethers pins every contract call to a 29,000,000 gas limit
// and ethers adds the calldata cost on top, so the simulated propose() is rejected once this
// proposal's own bytes cost more than 1,000,000 gas. Nothing like it applies on chain: propose()
// really uses 9.8M against BNB Chain's 16,777,216 per-tx cap. Today the simulated figure is
// 29,929,560, about 70,000 gas under the limit, which is room for roughly 1,000 more description
// characters. Add many more commands or description text and the simulation stops proposing.
export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain] List vhUSDT, vhUSDC and vhU markets in the Venus Core Pool",
    description: `#### Summary

If passed, this VIP will list three non-borrowable collateral markets in the Venus Core Pool on BNB Chain, backed by Venus Hub receipt tokens (vhTokens, ERC4626, 24 decimals), with borrowing paused at launch: **Venus vhUSDT (vvhUSDT)**, **Venus vhUSDC (vvhUSDC)** and **Venus vhU (vvhU)**.

#### Description

For each new market this VIP will:

- Arm the growth cap on the vhToken's capped **ERC4626Oracle** (snapshot, growth rate, snapshot gap) and register it in the ResilientOracle as the single price source. It prices the vhToken as *underlying resilient price × capped vault exchange rate*, the design the live asBNB and slisBNB oracles use.
- Add the market to the Core Pool Comptroller and set the supply cap, borrow cap (0), collateral factor, liquidation threshold, liquidation incentive and reserve factor
- Set the AccessControlManager, ProtocolShareReserve and reduce-reserves block delta on the vToken
- Provide bootstrap liquidity (see below) and pause borrowing, since the markets are collateral-only
- Enable Oracle Dynamic Protection Mode / "E-brake" (DeviationBoundedOracle, see VIP-617) with a stable-appropriate 5% deviation trigger

#### Risk parameters

All three markets share the same interest rate model (base 0%, multiplier 9%, jump multiplier 200%, kink 50%); rates are inert while borrowing is paused.

| Market | Collateral factor | Liquidation threshold | Liquidation incentive | Reserve factor | Supply cap | Borrow cap | E-brake trigger / reset |
|---|---|---|---|---|---|---|---|
| vvhUSDT | 80% | 80% | 10% | 10% | 10,000,000 vhUSDT | 0 | 5% / 2% |
| vvhUSDC | 82.5% | 82.5% | 10% | 10% | 10,000,000 vhUSDC | 0 | 5% / 2% |
| vvhU | 75% | 75% | 10% | 10% | 10,000,000 vhU | 0 | 5% / 2% |

- **Interest rate model.** A vToken requires an IRM at construction even though these markets are non-borrowable, so the three markets were deployed pointing at [0x6463ab803FF081616ac4daC31B9B66854cc28Bc0](https://bscscan.com/address/0x6463ab803FF081616ac4daC31B9B66854cc28Bc0), which already carries these exact parameters at 70,080,000 blocks per year and backs the vPT-clisBNB-25JUN2026 market. No new model is deployed and this VIP does not set one, since each market already holds the intended address. It is inert while borrowing is paused, which is what the listing checklist's "IRM not needed" refers to.
- **Collateral factor equals liquidation threshold** on all three markets, as approved: the vhTokens are ~$1 stablecoin-correlated assets priced through a growth-capped oracle with the E-brake enabled, so no CF-to-LT buffer is applied and a position at the maximum LTV sits at the liquidation boundary by design.
- **The collateral factors differ (82.5% vhUSDC, 80% vhUSDT, 75% vhU)** — approved per-asset values, ordered by the maturity and market depth of each underlying peg (USDC > USDT > USD1/U). vhU/USD1, the newest and least liquid, carries the most conservative factor.
- **Supply caps are denominated in the underlying token amount, not USD.** Each cap is 10,000,000 vhTokens (24 decimals), roughly $10M of collateral exposure at the current ~$1 vault price.
- **Reserve factor (10%), vTokenReceiver (VTreasury) and the bootstrap amount (10 vhToken shares, ~$10 per market)** were not in the listing template and follow the standard Core-pool convention.
- **Protocol seize share is not settable on the Core pool.** The legacy Core vToken has no \`protocolSeizeShare\` getter or setter, and its \`seize\` moves the whole seized amount to the liquidator. The protocol's cut is taken by the Liquidator contract's treasury percentage, which is pool wide rather than per market, so there is nothing for a listing VIP to set.

#### Capped oracle

The three oracles were deployed with every cap argument zeroed, as the asBNB oracle was, so this VIP arms each with \`setSnapshot\`, \`setGrowthRate\` and \`setSnapshotGap\` — the same commands in the same order as VIP-530. The timelocks already hold these permissions (VIP-517), so no new ACM grants are needed.

| | Growth rate | Snapshot interval | Snapshot gap | Seeded exchange rate |
|---|---|---|---|---|
| vhUSDT | 5%/yr | 30 days | 41 bps (0.004103826192241905) | 1.005037043812218973 |
| vhUSDC | 5%/yr | 30 days | 41 bps (0.004104460163238780) | 1.005192304855624280 |
| vhU | 5%/yr | 30 days | 41 bps (0.004103351049380738) | 1.004920680166634068 |

- **5%/yr leaves ~2.5x headroom over observed yield.** Between blocks 116836175 and 117780230 (4.92 days) the exchange rates grew at an annualised 2.10% (vhUSDT), 2.02% (vhUSDC) and 2.03% (vhU). The cap matches what asBNB and slisBNB have run since VIP-605.
- **The 41 bps gap is one snapshot interval of capped growth** (5% x 30/365 = 0.41%), the ratio VIP-530 applied to every asset it armed. It sits on top of the growth allowance accruing from the snapshot timestamp, so drift between authoring and execution does not cap the price at listing.

#### Underlying tokens

Read from BNB Chain at block 117780230, which is also the oracle snapshot timestamp, and matching the listing template. All three vaults report ~1.0009 assets per share, so each 10,000,000-share supply cap is worth roughly $10M.

| Token | Address | ERC4626 asset | Resilient price of the asset |
|---|---|---|---|
| Venus Hub USDT (vhUSDT) | [0x18AfDACF30F8671021dec4b78297E39d2FE87226](https://bscscan.com/address/0x18AfDACF30F8671021dec4b78297E39d2FE87226) | USDT | $0.9998 |
| Venus Hub USDC (vhUSDC) | [0x9D2D9592cF8DFbf59107fAab703d08494BE14617](https://bscscan.com/address/0x9D2D9592cF8DFbf59107fAab703d08494BE14617) | USDC | $0.9999 |
| Venus Hub U (vhU) | [0x0e5AA174d4F31b757a237eb1999DE151596788B0](https://bscscan.com/address/0x0e5AA174d4F31b757a237eb1999DE151596788B0) | U | $0.9995 |

#### Bootstrap liquidity

The VTreasury holds the three ERC4626 assets but none of the vhTokens, so this VIP does not withdraw shares. Per market it withdraws the asset, mints exactly 10 vhToken shares from the Venus Hub vault, supplies them to the new market, burns 10% of the resulting vTokens and sends the remaining 9 to the VTreasury. Every approval it grants is reset to zero in the same proposal, no vTokens are left with the Timelock, and no prior funding of the VTreasury is required.

| Market | Withdrawn from VTreasury | VTreasury balance | Shares minted | Cost at block 117780230 |
|---|---|---|---|---|
| vvhUSDT | 10.2 USDT | 698,092.13 USDT | 10 vhUSDT | 10.009332 USDT |
| vvhUSDC | 10.2 USDC | 58,609.10 USDC | 10 vhUSDC | 10.010878 USDC |
| vvhU | 10.2 U | 213,189.18 U | 10 vhU | 10.008173 U |

The withdrawal is 10.2 rather than the exact cost because the vault exchange rate rises continuously; the extra ~1.9% keeps the mint funded if the vaults accrue between the proposal and its execution. The unspent remainder, under 0.2 of each asset, stays with the Normal Timelock.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      MARKETS.flatMap(m => [
        // Arm the growth cap before the price source goes live. Order is load-bearing (see above).
        {
          target: m.oracle.address,
          signature: "setSnapshot(uint256,uint256)",
          params: [seededSnapshot(m.oracle.seedExchangeRate), CAPO_SEED_TIMESTAMP],
        },
        {
          target: m.oracle.address,
          signature: "setGrowthRate(uint256,uint256)",
          params: [CAPO_GROWTH_RATE_PER_YEAR, CAPO_SNAPSHOT_INTERVAL],
        },
        {
          target: m.oracle.address,
          signature: "setSnapshotGap(uint256)",
          params: [snapshotGap(m.oracle.seedExchangeRate)],
        },

        // Oracle configuration — single source: the capped ERC4626Oracle for the vhToken.
        // The ERC4626Oracle reads the underlying (USDT/USDC/USD1) price from the ResilientOracle
        // itself and applies the growth-rate cap on the vault exchange rate, so no extra feed
        // configuration is required.
        {
          target: RESILIENT_ORACLE,
          signature: "setTokenConfig((address,address[3],bool[3],bool))",
          params: [
            [
              m.vToken.underlying.address,
              [m.oracle.address, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
          ],
        },

        // Add market
        {
          target: m.vToken.comptroller,
          signature: "_supportMarket(address)",
          params: [m.vToken.address],
        },
      ]),

      // Caps and the borrow pause take market arrays, so all three markets go in one call each
      // rather than three. The Comptroller loops over the array and still emits one event per
      // market. They must follow every _supportMarket above (the Comptroller rejects an unlisted
      // market) and precede the bootstrap mint below (a fresh market's supply cap is 0, which
      // would make mint revert).
      [
        {
          target: bscmainnet.UNITROLLER,
          signature: "_setMarketSupplyCaps(address[],uint256[])",
          params: [MARKETS.map(m => m.vToken.address), MARKETS.map(m => m.riskParameters.supplyCap)],
        },
        // Explicit, though a fresh market already defaults to 0: the borrow cap is a stated risk
        // parameter, and relying on a default is what hid the unarmed price cap.
        {
          target: bscmainnet.UNITROLLER,
          signature: "_setMarketBorrowCaps(address[],uint256[])",
          params: [MARKETS.map(m => m.vToken.address), MARKETS.map(m => m.riskParameters.borrowCap)],
        },
        // Pause borrowing on all three markets at launch (collateral-only markets).
        {
          target: bscmainnet.UNITROLLER,
          signature: "setActionsPaused(address[],uint8[],bool)",
          params: [MARKETS.map(m => m.vToken.address), [BORROW_ACTION], true],
        },
      ],

      MARKETS.flatMap(m => [
        {
          target: m.vToken.address,
          signature: "setAccessControlManager(address)",
          params: [bscmainnet.ACCESS_CONTROL_MANAGER],
        },
        {
          target: m.vToken.address,
          signature: "setProtocolShareReserve(address)",
          params: [PROTOCOL_SHARE_RESERVE],
        },
        {
          target: m.vToken.address,
          signature: "setReduceReservesBlockDelta(uint256)",
          params: [REDUCE_RESERVES_BLOCK_DELTA],
        },
        {
          target: m.vToken.address,
          signature: "_setReserveFactor(uint256)",
          params: [m.riskParameters.reserveFactor],
        },
        {
          target: m.vToken.comptroller,
          signature: "setCollateralFactor(address,uint256,uint256)",
          params: [m.vToken.address, m.riskParameters.collateralFactor, m.riskParameters.liquidationThreshold],
        },
        {
          target: m.vToken.comptroller,
          signature: "setLiquidationIncentive(address,uint256)",
          params: [m.vToken.address, m.riskParameters.liquidationIncentive],
        },

        // Bootstrap liquidity. The VTreasury holds the ERC4626 assets (USDT, USDC, U) but no vhTokens,
        // so the shares are minted here rather than withdrawn: pull the asset, mint exactly
        // BOOTSTRAP_AMOUNT shares from the vault, then supply those shares to the new market. The
        // timelock never hands the shares back to the VTreasury in between, since it would only have
        // to withdraw them again. Every approval is reset to 0 afterwards.
        {
          target: bscmainnet.VTREASURY,
          signature: "withdrawTreasuryBEP20(address,uint256,address)",
          params: [m.asset.address, m.initialSupply.assetAmount, bscmainnet.NORMAL_TIMELOCK],
        },
        {
          target: m.asset.address,
          signature: "approve(address,uint256)",
          params: [m.vToken.underlying.address, m.initialSupply.assetAmount],
        },
        // mint(shares, receiver) rather than deposit(assets, receiver): it pins the share count, so
        // the fixed amounts in every command that follows can never miss by a rounding step.
        {
          target: m.vToken.underlying.address,
          signature: "mint(uint256,address)",
          params: [m.initialSupply.amount, bscmainnet.NORMAL_TIMELOCK],
        },
        {
          target: m.asset.address,
          signature: "approve(address,uint256)",
          params: [m.vToken.underlying.address, 0],
        },
        {
          target: m.vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [m.vToken.address, m.initialSupply.amount],
        },
        {
          target: m.vToken.address,
          signature: "mint(uint256)",
          params: [m.initialSupply.amount],
        },
        {
          target: m.vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [m.vToken.address, 0],
        },
        // Burn a slice of vTokens.
        {
          target: m.vToken.address,
          signature: "transfer(address,uint256)",
          params: [ethers.constants.AddressZero, m.initialSupply.vTokensToBurn],
        },
        // Transfer remaining vTokens to the receiver (VTreasury).
        {
          target: m.vToken.address,
          signature: "transfer(address,uint256)",
          params: [m.initialSupply.vTokenReceiver, vTokensRemaining(m)],
        },

        // Enable Oracle Dynamic Protection Mode / "E-brake" (DBO) for the vhToken with a 5% deviation
        // trigger. Must stay last: setTokenConfig seeds minPrice and maxPrice from
        // RESILIENT_ORACLE.getPrice(asset), so it reverts unless the capped oracle is already
        // registered above. The seeding is why no separate bounds command is needed.
        {
          target: DEVIATION_BOUNDED_ORACLE,
          signature: "setTokenConfig((address,uint64,uint256,uint256,bool,bool))",
          params: [
            [
              m.vToken.underlying.address,
              DBO_COOLDOWN_PERIOD,
              DBO_TRIGGER_THRESHOLD,
              DBO_RESET_THRESHOLD,
              true, // enableBoundedPricing
              false, // enableCaching
            ],
          ],
        },
      ]),
    ].flat(),
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
