import { BigNumber, constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// VIP-664 [BNB Chain] List vhUSDT, vhUSDC and vhU in the Venus Core Pool.
// The oracle and vToken addresses below are filled once the deploy PRs land; until then the
// simulation cannot execute. Remaining prerequisites are tracked in the PR description.

const { bscmainnet } = NETWORK_ADDRESSES;

// TODO(deploy): fill after the capped ERC4626Oracle instances are deployed on BNB Chain.
export const VHUSDT_ORACLE = constants.AddressZero;
export const VHUSDC_ORACLE = constants.AddressZero;
export const VHU_ORACLE = constants.AddressZero;

// TODO(deploy): fill after the vTokens are deployed on BNB Chain.
export const VVHUSDT = constants.AddressZero;
export const VVHUSDC = constants.AddressZero;
export const VVHU = constants.AddressZero;

export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const BORROW_ACTION = 2; // Comptroller Action enum: BORROW

export const { RESILIENT_ORACLE } = bscmainnet;

// Already deployed; backs vasBNB and vslisBNB with these exact params (base 0, multiplier 9%,
// jump 200%, kink 50%), so no new interest rate model is deployed for these markets.
export const JUMP_RATE_MODEL = "0x1Ef3b851CE40B663dBbF91B86A4EE51A4a0999C5";

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
// Vault exchange rates below were read at block 116836175 (2026-08-19T10:57:40Z).
export const CAPO_SEED_TIMESTAMP = 1787137060;

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
    amount: BigNumber;
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
const BOOTSTRAP_AMOUNT = parseUnits("100", 24); // ~$100 of underlying (24 dec)
// vTokensMinted = amount * 1e18 / exchangeRate = 100e24 * 1e18 / 1e34 = 100e8; burn 10%.
const BOOTSTRAP_BURN = parseUnits("10", 8);

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
  rateModel: JUMP_RATE_MODEL,
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.09",
    jumpMultiplierPerYear: "2",
    kink: "0.5",
  },
  oracle: { address: VHUSDT_ORACLE, seedExchangeRate: parseUnits("1.000650000021349262", 18) },
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
  rateModel: JUMP_RATE_MODEL,
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.09",
    jumpMultiplierPerYear: "2",
    kink: "0.5",
  },
  oracle: { address: VHUSDC_ORACLE, seedExchangeRate: parseUnits("1.000815629493107489", 18) },
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
  rateModel: JUMP_RATE_MODEL,
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.09",
    jumpMultiplierPerYear: "2",
    kink: "0.5",
  },
  oracle: { address: VHU_ORACLE, seedExchangeRate: parseUnits("1.000544217035461378", 18) },
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

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain] List vhUSDT, vhUSDC and vhU markets in the Venus Core Pool",
    description: `#### Summary

If passed, this VIP will list three new non-borrowable collateral markets in the Venus Core Pool on BNB Chain, backed by Venus Hub receipt tokens (vhTokens), with borrowing paused at launch:

- **Venus vhUSDT (vvhUSDT)** — backed by vhUSDT (Venus Hub USDT, ERC4626, 24 decimals)
- **Venus vhUSDC (vvhUSDC)** — backed by vhUSDC (Venus Hub USDC, ERC4626, 24 decimals)
- **Venus vhU (vvhU)** — backed by vhU (Venus Hub U, ERC4626, 24 decimals)

#### Description

For each new market this VIP will:

- Arm the growth cap on the vhToken's capped **ERC4626Oracle** (seed the snapshot, set the growth rate and set the snapshot gap)
- Register that oracle in the ResilientOracle as the single price source. It prices the vhToken as *underlying resilient price × capped vault exchange rate*, the same design as the live asBNB and slisBNB capped oracles.
- Add the market to the Core Pool Comptroller
- Set the supply cap, borrow cap (0), interest rate model, collateral factor, liquidation threshold, liquidation incentive and reserve factor
- Set the AccessControlManager, ProtocolShareReserve and reduce-reserves block delta on the vToken
- Provide bootstrap liquidity (minting an initial supply, burning 10% and sending the remainder to the VTreasury)
- Pause borrowing for the market at launch (the markets are collateral-only)
- Enable Oracle Dynamic Protection Mode / "E-brake" (DeviationBoundedOracle, see VIP-617) for the vhToken, with a stable-appropriate 5% deviation trigger

#### Risk parameters

All three markets share the same interest rate model (base 0%, multiplier 9%, jump multiplier 200%, kink 50%); rates are inert while borrowing is paused. Per-market parameters:

**Venus vhUSDT (vvhUSDT)**
- Collateral factor: 80%
- Liquidation threshold: 80%
- Liquidation incentive: 10%
- Reserve factor: 10%
- Supply cap: 10,000,000 vhUSDT
- Borrow cap: 0 (borrowing disabled)
- E-brake trigger / reset: 5% / 2%

**Venus vhUSDC (vvhUSDC)**
- Collateral factor: 82.5%
- Liquidation threshold: 82.5%
- Liquidation incentive: 10%
- Reserve factor: 10%
- Supply cap: 10,000,000 vhUSDC
- Borrow cap: 0 (borrowing disabled)
- E-brake trigger / reset: 5% / 2%

**Venus vhU (vvhU)**
- Collateral factor: 75%
- Liquidation threshold: 75%
- Liquidation incentive: 10%
- Reserve factor: 10%
- Supply cap: 10,000,000 vhU
- Borrow cap: 0 (borrowing disabled)
- E-brake trigger / reset: 5% / 2%

#### Notes on the risk parameters

- **Interest rate model.** Although these markets are non-borrowable, a vToken requires an interest rate model at construction, so a jump-rate IRM (base 0%, multiplier 9%, jump multiplier 200%, kink 50%) is wired to make the market well-formed. No new model is deployed: [0x1Ef3b851CE40B663dBbF91B86A4EE51A4a0999C5](https://bscscan.com/address/0x1Ef3b851CE40B663dBbF91B86A4EE51A4a0999C5) already carries exactly these parameters and already backs vasBNB and vslisBNB. It has no economic effect while borrowing is paused. The listing checklist noted "IRM not needed" precisely because the market is non-borrowable — that is consistent with this VIP: the IRM exists only to satisfy the constructor and is inert.
- **Collateral factor equals liquidation threshold** on all three markets (80/80, 82.5/82.5, 75/75). This is intentional and matches the approved risk parameters from the listing template. The vhTokens are ~$1 stablecoin-correlated assets priced through a growth-capped ERC4626 oracle with the E-brake (DeviationBoundedOracle) protection mode enabled, so no CF↔LT buffer is applied; a position opened at the maximum LTV therefore sits at the liquidation boundary, which is the deliberate design for these tightly-pegged collaterals.
- **The three collateral factors differ (82.5% vhUSDC, 80% vhUSDT, 75% vhU).** These are the approved per-asset values set by the risk manager in the listing template — not a single blanket figure — and are ordered by the relative maturity and market depth of each underlying peg (USDC > USDT > USD1/U). vhU/USD1, the newest and least liquid of the three, carries the most conservative factor.
- **Supply cap is denominated in the underlying token amount, not USD.** \`_setMarketSupplyCaps\` takes an amount of the underlying, so each cap of 10,000,000 is 10,000,000 vhTokens (24 decimals). At the current ~$1 vault price this corresponds to roughly $10M of collateral exposure per market.
- **Reserve factor (10%), vTokenReceiver (VTreasury) and bootstrap amount (100 vhToken per market)** were not specified in the listing template and follow the standard Core-pool listing convention. The reserve factor is inert while borrowing is paused.
- **Protocol seize share is not settable on the Core pool.** The legacy Core vToken exposes no \`protocolSeizeShare\` getter or setter at all — the share is a constant in the implementation — which is why no Core-pool listing VIP sets it. The listing checklist asks for the value; there is nothing to configure.

#### Capped oracle

The oracles are deployed with the cap zeroed, exactly as the asBNB oracle was, so this VIP arms it per market with \`setSnapshot\`, \`setGrowthRate\` and \`setSnapshotGap\` — the same three commands in the same order as VIP-530. The permissions for all three already sit with the Normal, Fast-Track and Critical timelocks (granted repo-wide in VIP-517), so no new ACM grants are needed.

| | Growth rate | Snapshot interval | Snapshot gap | Seeded exchange rate |
|---|---|---|---|---|
| vhUSDT | 5%/yr | 30 days | 41 bps (0.004102665000087531) | 1.004752665021436793 |
| vhUSDC | 5%/yr | 30 days | 41 bps (0.004103344080921740) | 1.004918973574029229 |
| vhU | 5%/yr | 30 days | 41 bps (0.004102231289845391) | 1.004646448325306769 |

- **The 5%/yr growth rate leaves 2–3× headroom over observed yield.** The three vaults launched ~13 days before this was written, all from an exchange rate of exactly 1.0; measured growth annualises to 1.82% (vhUSDT), 2.29% (vhUSDC) and 1.52% (vhU). A 5% cap therefore does not bind in normal operation, and matches what asBNB and slisBNB run since VIP-605.
- **The 41 bps gap is one snapshot interval of capped growth** (5% × 30/365 = 0.41%), the same ratio VIP-530 applied to every asset it armed — BNBx 7.53%/yr → 63 bps, ankrBNB 6.12%/yr → 51 bps, sUSDe 28.27%/yr → 236 bps, slisBNB 4.12%/yr → 34 bps.
- Exchange rates were read at block 116836175 (\`2026-08-19T10:57:40Z\`), which is also the snapshot timestamp. Because the seed carries 41 bps of headroom on top of the growth allowance accruing from that timestamp, drift between authoring and execution does not cap the price at listing.

#### Underlying tokens

Each underlying was read directly from BNB Chain and matches the listing template:

| Token | Address | Name | Decimals | ERC4626 asset | Resilient price of the asset |
|---|---|---|---|---|---|
| vhUSDT | [0x18AfDACF30F8671021dec4b78297E39d2FE87226](https://bscscan.com/address/0x18AfDACF30F8671021dec4b78297E39d2FE87226) | Venus Hub USDT | 24 | [USDT](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955) | $0.9991 |
| vhUSDC | [0x9D2D9592cF8DFbf59107fAab703d08494BE14617](https://bscscan.com/address/0x9D2D9592cF8DFbf59107fAab703d08494BE14617) | Venus Hub USDC | 24 | [USDC](https://bscscan.com/address/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d) | $0.9998 |
| vhU | [0x0e5AA174d4F31b757a237eb1999DE151596788B0](https://bscscan.com/address/0x0e5AA174d4F31b757a237eb1999DE151596788B0) | Venus Hub U | 24 | [U](https://bscscan.com/address/0xcE24439F2D9C6a2289F741120FE202248B666666) | $0.9995 |

All three vaults report a share price of ~1.0006 assets per share, so each 10,000,000-share supply cap is worth roughly $10M. U trades at ~$1, so the cap is comparable to the two USD stables.

#### Prerequisite

The bootstrap liquidity is withdrawn from the VTreasury, which currently holds **no** vhUSDT, vhUSDC or vhU. The Treasury must be funded with at least 100 of each vhToken before this VIP executes, otherwise \`withdrawTreasuryBEP20\` reverts. The Treasury does hold the underlying stables (USDT, USDC and U), so the funding can be done by depositing into each Venus Hub vault.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
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
      {
        target: m.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[m.vToken.address], [m.riskParameters.supplyCap]],
      },
      // Explicit, though a fresh market already defaults to 0: the borrow cap is a stated risk
      // parameter, and relying on a default is what hid the unarmed price cap.
      {
        target: m.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[m.vToken.address], [m.riskParameters.borrowCap]],
      },
      // Pause borrowing for the market at launch (collateral-only markets).
      {
        target: m.vToken.comptroller,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[m.vToken.address], [BORROW_ACTION], true],
      },
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
      // Set here rather than trusted from the vToken constructor, since this reuses an already
      // deployed model instead of deploying one per market.
      {
        target: m.vToken.address,
        signature: "_setInterestRateModel(address)",
        params: [m.rateModel],
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

      // Initial liquidity: pull underlying from the Treasury, mint, burn a slice, send the remainder to the receiver.
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [m.vToken.underlying.address, m.initialSupply.amount, bscmainnet.NORMAL_TIMELOCK],
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
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
