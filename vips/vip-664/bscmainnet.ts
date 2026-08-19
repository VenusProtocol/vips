import { BigNumber, constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// =============================================================================
// DRAFT — VIP-664 [BNB Chain] List vhUSDT, vhUSDC and vhU in the Venus Core Pool
// -----------------------------------------------------------------------------
// This VIP is a WORK IN PROGRESS opened as a draft PR. The command structure,
// risk parameters and oracle/E-brake design are complete; the only items that
// remain are the deploy-dependent addresses and the fork simulation, which are
// gated on the testnet deploy of the 3 capped ERC4626 oracles + 3 vTokens.
//
// PENDING BEFORE THIS VIP CAN BE PROPOSED (see PR description):
//   1. Confirm the two still-open, risk-sensitive knobs (recommended values are
//      baked in below and clearly labelled):
//        - E-brake (DeviationBoundedOracle) thresholds — recommended 5% trigger
//          / 2% reset / 1h cooldown (stable-appropriate; VIP-633's 16.67% is for
//          volatile equities and is intentionally NOT copied).
//        - Capped-oracle snapshot mode — recommended frozen snapshot
//          (snapshotInterval = MaxUint256, gap 0), 5%/yr growth (from Notion).
//   2. Deploy the 3 capped ERC4626Oracle instances (oracle repo) and 3 vToken
//      markets (venus-protocol repo) on bsctestnet, then fill the TODO addresses
//      below and author + run the fork simulation (simulations/vip-664).
//   3. Confirm the VTreasury holds the bootstrap balance of each vhToken.
// =============================================================================

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

// Capped ERC4626 oracle template (set at oracle-deploy time, documented here for review).
// "vhToken resilient price = underlying resilient price x capped vault exchange rate" — Notion.
export const ANNUAL_GROWTH_RATE = parseUnits("0.05", 18); // 5%/yr — from Notion
export const SNAPSHOT_INTERVAL = constants.MaxUint256; // frozen snapshot (recommended)
export const SNAPSHOT_GAP = 0;

// Oracle Dynamic Protection Mode / "E-brake" (DeviationBoundedOracle, see VIP-617).
export const DEVIATION_BOUNDED_ORACLE = "0xc79Cb7efEBd121DC4B39eA141C214606595D665A";
export const DBO_COOLDOWN_PERIOD = 3600; // 1h rolling window
// Stable-appropriate thresholds (recommended). vhTokens are ~$1 stablecoin-correlated, so
// VIP-633's 16.67% equity trigger is intentionally not reused. Contract bounds: trigger in
// [5%, 50%], reset non-zero and below trigger, cooldown > 0.
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

// All three markets: non-borrowable collateral, 24-decimal ERC4626 underlyings, Core pool.
// exchangeRate scale = 18 + underlyingDecimals(24) - vTokenDecimals(8) = 34.
const EXCHANGE_RATE = parseUnits("1", 34);
const SUPPLY_CAP = parseUnits("10000000", 24); // 10,000,000 vhToken (24 dec)
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
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.09",
    jumpMultiplierPerYear: "2",
    kink: "0.5",
  },
  oracle: { address: VHUSDT_ORACLE },
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
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.09",
    jumpMultiplierPerYear: "2",
    kink: "0.5",
  },
  oracle: { address: VHUSDC_ORACLE },
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
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.09",
    jumpMultiplierPerYear: "2",
    kink: "0.5",
  },
  oracle: { address: VHU_ORACLE },
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

- Register the vhToken in the ResilientOracle using a dedicated capped **ERC4626Oracle** as the single price source. The oracle prices the vhToken as *underlying resilient price × capped vault exchange rate* (5%/yr growth cap), the same design as asBNB.
- Add the market to the Core Pool Comptroller
- Set the supply cap, collateral factor, liquidation threshold, liquidation incentive and reserve factor
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
- E-brake trigger / reset: 5% / 2%`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    MARKETS.flatMap(m => [
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

      // Enable Oracle Dynamic Protection Mode / "E-brake" (DBO) for the vhToken with a 5% deviation trigger.
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
