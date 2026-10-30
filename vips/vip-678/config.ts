import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

const { CRITICAL_GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bscmainnet;

// ===================================================================================================
// VIP-678: the "BPN Loan" Hub-Funded Spoke pool. A third pool in SPOKE_POOL_REGISTRY, next to the bStock index and
// bStock mainstream pools. Its one collateral asset is BPNC, the BPN Credit Token, priced at a fixed $1 and suppliable
// only by allowlisted accounts. USDT, USDC and U are the liquidity side, funded by the same Spoke sources as the other
// two pools, at a flat 6% borrow APY.
//
// Listing doc: "BPN Loan spoke pool listing" (Notion, 2026-10-29).
//
// STATUS: DRAFT. Only BPN's supply address, `bpnSupplier` in BPN_INPUTS, is still a placeholder.
// ===================================================================================================

// ---------------------------------------------------------------------------------------------------
// Existing contracts and accounts, as earlier VIPs set them up.
// ---------------------------------------------------------------------------------------------------

export const OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A"; // Liquidity Hub Operator (VIP-668)
export const SPOKE_POOL_REGISTRY = "0x372D0eE44993B5c6eb641364BAB939311e8e5B4c"; // VIP-668
export const DEVIATION_BOUNDED_ORACLE = "0xc79Cb7efEBd121DC4B39eA141C214606595D665A"; // VIP-668
export const COLLATERAL_GATEWAY = "0xd0F7B94BF06675D13e8bA9a2546835a1c32a80b8"; // VIP-670
export const ADAPTER_SPOKE_V1 = "0x231915FfE3e3A6Be09B0E5c73EFA2F1a4FF8Aa69"; // the spoke yield groups' adapter (VIP-670)
export const IRM_COLLATERAL = "0x11C29b4b3cDbC7069920b2bE9A0b9D1711617A4d"; // zero-rate model, bStock collateral (VIP-670)
export const SEED_RECEIVER = "0x000000000000000000000000000000000000dEaD"; // takes every market's seed vTokens
export const REDUCE_RESERVES_BLOCK_DELTA = 28800; // as on the bStock index markets (VIP-670)

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";

/// Each token's Liquidity Hub and the Spoke source on it (VIP-669)
export const HUB_USDT = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";
export const HUB_USDC = "0x9D2D9592cF8DFbf59107fAab703d08494BE14617";
export const HUB_U = "0x0e5AA174d4F31b757a237eb1999DE151596788B0";
export const SPOKE_SOURCE_USDT = "0x3cC1eDE91419dC7EC199a06704EC8ECAb665a684"; // spoke yield group
export const SPOKE_SOURCE_USDC = "0x4cd4aB2F88E39D3F3e481bb2555EcdF00266f717"; // spoke yield group
export const SPOKE_SOURCE_U = "0xcA3f9AFD7C4c1022E4A37a12671Ef57B8A7bfc51"; // spoke yield group

export const BPN_POOL_NAME = "BPN Loan";
export const BPN_POOL_DESCRIPTION = "Loan to Better Payment Network";

/// Suffix of every market's symbol, `vBPNC_BPNLoan`.
const SYMBOL_SUFFIX = "BPNLoan";

/// $1, as the ChainlinkOracle stores it for an 18-decimal token. BPNC has no pivot or fallback oracle and no
/// DeviationBoundedOracle window, so the DBO passes its spot price through.
export const BPNC_PRICE = parseUnits("1", 18);

// ---------------------------------------------------------------------------------------------------
// BPNC. A CustodyReceiptToken, the contract VIP-656 took over as vceBTC: an 18-decimal ERC20 whose mint, burn, pause
// and unpause are gated by the ACM. Pausing stops holder-to-holder transfers, which includes supplying BPNC to its
// market and redeeming it. Deployed from the copy in isolated-pools, which nominates the Normal Timelock as owner.
// ---------------------------------------------------------------------------------------------------

/// The first BPNC, minted by VIP-678 to OPERATOR.
export const BPNC_FIRST_MINT = parseUnits("3333334", 18);

/// Who may call each ACM-gated BPNC function once VIP-678 has run. The Operator can mint and stop transfers, as can
/// governance; only governance can burn, which takes BPNC from any holder, and lift a pause.
export const BPNC_ROLES: { role: string; accounts: string[] }[] = [
  { role: "mint(address,uint256)", accounts: [OPERATOR, NORMAL_TIMELOCK, CRITICAL_GUARDIAN] },
  { role: "pause()", accounts: [OPERATOR, NORMAL_TIMELOCK, CRITICAL_GUARDIAN] },
  { role: "burn(address,uint256)", accounts: [NORMAL_TIMELOCK, CRITICAL_GUARDIAN] },
  { role: "unpause()", accounts: [NORMAL_TIMELOCK, CRITICAL_GUARDIAN] },
];

// ---------------------------------------------------------------------------------------------------
// Pool parameters.
// ---------------------------------------------------------------------------------------------------

export const BPN_CLOSE_FACTOR = parseUnits("0.5", 18);

/// The pool-wide 5% is the floor the comptroller accepts (`MIN_POOL_LIQUIDATION_INCENTIVE_MANTISSA`). No market
/// falls back to it: each gets the 0% of its own below.
export const BPN_POOL_LIQUIDATION_INCENTIVE = parseUnits("1.05", 18);

export const BPN_MIN_LIQUIDATABLE_COLLATERAL = parseUnits("100", 18);

// ---------------------------------------------------------------------------------------------------
// Hub wiring.
// ---------------------------------------------------------------------------------------------------

/// The bStock index markets (VIP-670) and the bStock mainstream markets (isolated-pools#575, VIP-675).
export const VUSDT_INDEX = "0xEA0096142fBB56AAc0F594ED1D4de3E4De638f22";
export const VUSDC_INDEX = "0x6adb5e462ac6eA880246F24E3C47D23f70FCCbF6";
export const VU_INDEX = "0x713bBaA44Dc99e691F1F9fE8086FC328E94B6f27";
export const VUSDT_MAINSTREAM = "0x2b12bC29044CE8f018Ae0aF5929450a8A6259Ed8";
export const VUSDC_MAINSTREAM = "0xD7608E9dFe6CB4b527d41abF40d0f46D917c9EeA";
export const VU_MAINSTREAM = "0x24Ee5A3F631f9c2FAf8a730d43F059D3eA9566AD";

/// Each Spoke source's inner queues once VIP-675 has run: its bStock index market first to deposit and last to
/// withdraw, its bStock mainstream market after it. VIP-678 replaces each queue, so it reverts or drops a market if
/// the queues differ at execution. Re-read them on chain before proposing.
const queues = (indexMarket: string, mainstreamMarket: string): InnerQueues => ({
  deposit: [indexMarket, mainstreamMarket],
  withdraw: [mainstreamMarket, indexMarket],
});
export const QUEUES_AFTER_VIP_675: Record<string, InnerQueues> = {
  [SPOKE_SOURCE_USDT]: queues(VUSDT_INDEX, VUSDT_MAINSTREAM),
  [SPOKE_SOURCE_USDC]: queues(VUSDC_INDEX, VUSDC_MAINSTREAM),
  [SPOKE_SOURCE_U]: queues(VU_INDEX, VU_MAINSTREAM),
};

// ---------------------------------------------------------------------------------------------------
// VIP-678's inputs. The contracts are deployed by isolated-pools `025`, `028` and `029` (feat/bpn-loan-spoke-pool): a
// BeaconProxy over SPOKE_COMPTROLLER_BEACON with the Normal Timelock nominated as owner, and markets over
// SPOKE_VTOKEN_BEACON owned by the Normal Timelock, with a 10% reserve factor and the Normal Timelock as `shortfall`.
// ---------------------------------------------------------------------------------------------------

export type BpnInputs = {
  /// BPN Credit Token, the CustodyReceiptToken above.
  bpnc: string;
  comptroller: string;
  vBPNC: string;
  vUSDT: string;
  vUSDC: string;
  vU: string;
  /// JumpRateModelV2 for USDT, USDC and U, with FLAT_6_IRM.
  irmFlat6: string;
  /// BPN's supply address on the BPNC allowlist.
  bpnSupplier: string;
  /// Each Spoke source's inner queues just before VIP-678 runs, keyed by the Spoke source.
  queuesBefore: Record<string, InnerQueues>;
};

export type InnerQueues = { deposit: string[]; withdraw: string[] };

export const BPN_INPUTS: BpnInputs = {
  bpnc: "0x6d7C501cF2603d8A3d9aE10Fee8809fd4EA9D689",
  comptroller: "0xA73D31939c936d07fA0FD15b3d86C0fe2a72c282",
  vBPNC: "0x7aC71651fC58214A26df172289899f6F52E227ef",
  vUSDT: "0x722997e2211a224Ac98Cc55D8C1C973D63623a0b",
  vUSDC: "0xd43e18D5568E544aA98b2EB1f3039f4a24267B7c",
  vU: "0x60d7BFd15B2414e9a29DEB04b84F1AD8c9868E44",
  irmFlat6: "0xA3bCca7ab0a52953096e579f7A19740920C8D1e0",
  bpnSupplier: "0x1111111111111111111111111111111111111111", // PLACEHOLDER: BPN names its supply address
  queuesBefore: QUEUES_AFTER_VIP_675,
};

/// A flat 6% borrow APY at any utilization. The base is the per-year rate that compounds daily to 6%,
/// (1.06^(1/365) - 1) * 365, computed the same way as the bStock index pool's 1.5% base.
export const FLAT_6_IRM = {
  baseRatePerYear: BigNumber.from("58273559420325816"),
  multiplierPerYear: BigNumber.from(0),
  jumpMultiplierPerYear: BigNumber.from(0),
  kink: parseUnits("1", 18),
};

/// The only account allowed to liquidate in the pool. Every seizure checks the pool's liquidation allowlist, so no one
/// else can liquidate BPNC, through `liquidateBorrow`, `liquidateAccount` or `healAccount`.
export const BPN_LIQUIDATORS = [OPERATOR];

// ---------------------------------------------------------------------------------------------------
// Supply allowlists.
// ---------------------------------------------------------------------------------------------------

/// Venus custody Safe (2 of 3), the one VIP-656 minted vceBTC to.
export const VENUS_CUSTODY_SAFE = "0x5D1507d5Cfb3d031C3209e9FB8e2644e4094Ea01";

// ---------------------------------------------------------------------------------------------------
// Markets.
// ---------------------------------------------------------------------------------------------------

export type BpnMarket = {
  symbol: string;
  vToken: string;
  underlying: string;
  interestRateModel: string;
  collateralFactor: BigNumber;
  liquidationThreshold: BigNumber;
  supplyCap: BigNumber;
  borrowCap: BigNumber;
  reserveFactor: BigNumber;
  /// Every market gets an incentive of its own, so none falls back to the pool-wide 5%.
  liquidationIncentive: BigNumber;
  /// Set with `setProtocolSeizeShare` before the incentive, which it bounds from below.
  protocolSeizeShare: BigNumber;
  /// Supplied by `addMarket`, with the vTokens minted to SEED_RECEIVER. Pulled from the VTreasury, except BPNC's, which
  /// VIP-678 mints.
  initialSupply: BigNumber;
  /// The only accounts that may supply.
  allowedSuppliers: string[];
};

export type BpnLiquidityMarket = BpnMarket & {
  hub: string;
  spokeSource: string; // spoke yield group
  /// The Spoke source's inner queues just before VIP-678 runs.
  queuesBefore: InnerQueues;
};

const symbol = (asset: string) => `v${asset}_${SYMBOL_SUFFIX}`;

/// 0% liquidation incentive and 0% protocol seize share, on both sides, per the listing doc.
const noIncentive = {
  liquidationIncentive: parseUnits("1", 18),
  protocolSeizeShare: BigNumber.from(0),
  reserveFactor: parseUnits("0.1", 18),
};

/// Not borrowable: borrow cap 0 and BORROW paused. Charges no interest: the zero rate model the bStock markets use.
export const collateralMarket = (inputs: BpnInputs): BpnMarket => ({
  ...noIncentive,
  symbol: symbol("BPNC"),
  vToken: inputs.vBPNC,
  underlying: inputs.bpnc,
  interestRateModel: IRM_COLLATERAL,
  collateralFactor: parseUnits("0.9", 18),
  liquidationThreshold: parseUnits("0.95", 18),
  supplyCap: parseUnits("10000000", 18),
  borrowCap: BigNumber.from(0),
  initialSupply: parseUnits("10", 18),
  allowedSuppliers: [VENUS_CUSTODY_SAFE, inputs.bpnSupplier],
});

const liquidityMarket = (
  inputs: BpnInputs,
  asset: string,
  vToken: string,
  underlying: string,
  hub: string,
  spokeSource: string,
): BpnLiquidityMarket => ({
  ...noIncentive,
  symbol: symbol(asset),
  vToken,
  underlying,
  interestRateModel: inputs.irmFlat6,
  collateralFactor: BigNumber.from(0),
  liquidationThreshold: BigNumber.from(0),
  supplyCap: parseUnits("8000000", 18),
  borrowCap: parseUnits("8000000", 18),
  initialSupply: parseUnits("10", 18),
  allowedSuppliers: [spokeSource],
  hub,
  spokeSource,
  queuesBefore: inputs.queuesBefore[spokeSource],
});

/// Borrowable, no borrow power. Only their Hub's Spoke source may supply them.
export const liquidityMarkets = (inputs: BpnInputs): BpnLiquidityMarket[] => [
  liquidityMarket(inputs, "USDT", inputs.vUSDT, USDT, HUB_USDT, SPOKE_SOURCE_USDT),
  liquidityMarket(inputs, "USDC", inputs.vUSDC, USDC, HUB_USDC, SPOKE_SOURCE_USDC),
  liquidityMarket(inputs, "U", inputs.vU, U, HUB_U, SPOKE_SOURCE_U),
];
