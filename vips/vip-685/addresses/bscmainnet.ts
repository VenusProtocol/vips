import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import {
  CollateralMarket,
  DBO_WINDOW,
  DboConfig,
  IRM_COLLATERAL,
  MAINSTREAM_COMPTROLLER,
} from "../../vip-675/addresses/bscmainnet";

export * from "../../vip-675/addresses/bscmainnet";

// ===================================================================================================
// VIP-685: ANTB (Anthropic bStock) as a tier 5 (new listing) collateral market in the bStock mainstream Spoke pool,
// which VIP-675 created. Values are the risk sheet's: the "bStock mainstream spoke pool listing" Notion page, tier 5.
//
// ANTB has 18 decimals, so every token amount below is 18-decimal scaled.
// ===================================================================================================

/// The pool VIP-675 registered. It lists 23 markets, under the 50 `maxLoopsLimit` it was initialized with.
export const POOL = MAINSTREAM_COMPTROLLER;

/// Anthropic (bStocks). A BeaconProxy on the same beacon as the pool's other bStocks.
export const ANTB = "0x38Dd26788Cf2d901E3aBf04efE3007d459d0Fc53";

/// `VToken_vANTB_bStockMainstream`, deployed by isolated-pools `028` from the bscmainnet spoke config
/// (isolated-pools#590) at block 135,438,083.
export const VANTB_MAINSTREAM = "0x1Caa2718D36686d722f836F2cFCeBe0395C2147f";

/// Atlas "SingleFeed ANTB/USD". `isAuthorizedCaller(ATLAS_ORACLE)` is true (2026-11-24, block 135,419,767). APRO has no
/// ANTB feed on BNB Chain, so ANTB is priced by Atlas alone.
export const ANTB_ATLAS_FEED = "0x678db7256da55731C2bbE585fAc2C93896D3F559";

export type Vip685Market = CollateralMarket & {
  name: string;
  /// Set with `setProtocolSeizeShare`: the market is deployed with 5%.
  protocolSeizeShare: BigNumber;
  initialSupply: BigNumber;
  dbo: DboConfig;
};

export const ANTB_MARKET: Vip685Market = {
  name: "Venus ANTB (bStock mainstream)",
  symbol: "vANTB_bStockMainstream",
  vToken: VANTB_MAINSTREAM,
  underlying: ANTB,
  // The rate model that charges 0, as on the pool's other bStocks.
  interestRateModel: IRM_COLLATERAL,
  collateralFactor: parseUnits("0.5", 18),
  liquidationThreshold: parseUnits("0.65", 18),
  liquidationIncentive: parseUnits("1.15", 18),
  protocolSeizeShare: parseUnits("0.075", 18),
  // About $100k at the 2026-11-24 Atlas price of $85.8, the cap the risk sheet gives tiers 3 to 5.
  supplyCap: parseUnits("1160", 18),
  borrowCap: BigNumber.from(0),
  // What the market is deployed with, so no `setReserveFactor`.
  reserveFactor: parseUnits("0.1", 18),
  // About $10. The VTreasury held no ANTB on 2026-11-24, so it needs this much before execution.
  initialSupply: parseUnits("0.12", 18),
  atlasFeed: ANTB_ATLAS_FEED,
  aproFeed: null,
  // The pool's window for its new assets: 1 hour cooldown, 12.5% trigger, 5% reset.
  dbo: DBO_WINDOW,
};
