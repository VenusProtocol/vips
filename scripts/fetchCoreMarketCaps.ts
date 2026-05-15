/**
 * Build the Executor's per-market 20% floor table for VIP-701.
 *
 * Pipeline (per vToken returned by Unitroller.getAllMarkets()):
 *   1. Skip if not listed in the core pool (poolMarkets(0, vToken).isListed === false).
 *   2. Pick the effective caps:
 *        - If the market is touched by queued VIP-622 (marketCapChanges or delistAssets in
 *          vips/vip-622/data/bscmainnet.ts), use the post-VIP-622 caps from that file.
 *        - Otherwise read the live caps from Comptroller.borrowCaps / supplyCaps.
 *   3. Compute 20% floors. Integer division means a 1-wei dust cap rounds to 0.
 *   4. Skip the market entirely if both 20% floors are zero — covers fully delisted
 *      markets (THE/TUSD/FIL via VIP-622) and dormant zero-cap stubs
 *      (BUSD/SXP/MATIC/TUSDOLD/TRXOLD/vBETH).
 *
 * Run:
 *   npx hardhat run scripts/fetchCoreMarketCaps.ts --network bscmainnet
 *
 * Output:
 *   vips/vip-701/coreMarketCaps.json — consumed directly by vips/vip-701/bscmainnet.ts.
 */
import { BigNumber } from "ethers";
import fs from "fs";
import { ethers } from "hardhat";
import path from "path";

import { delistAssets, marketCapChanges } from "../vips/vip-622/data/bscmainnet";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const CORE_POOL_ID = 0;
const FLOOR_PERCENT = 20;

const COMPTROLLER_ABI = [
  "function getAllMarkets() view returns (address[])",
  "function poolMarkets(uint96,address) view returns (bool isListed,uint256,bool,uint256,uint256,uint96,bool)",
  "function borrowCaps(address) view returns (uint256)",
  "function supplyCaps(address) view returns (uint256)",
];
const VTOKEN_ABI = ["function symbol() view returns (string)"];

interface PostVip622Cap {
  symbol: string;
  borrowCap: BigNumber;
  supplyCap: BigNumber;
}

interface KeptMarket {
  address: string;
  symbol: string;
  capSource: "live" | "vip-622";
  effectiveBorrowCap: string;
  effectiveSupplyCap: string;
  minBorrowCap: string;
  minSupplyCap: string;
}
interface SkippedMarket {
  address: string;
  symbol?: string;
  reason: string;
}

// Build the VIP-622 override map directly from PR #706's data file.
// Single source of truth: any future edit to vips/vip-622/data/bscmainnet.ts flows here.
function buildVip622Overrides(): Map<string, PostVip622Cap> {
  const overrides = new Map<string, PostVip622Cap>();
  for (const m of marketCapChanges) {
    overrides.set(m.vToken.toLowerCase(), {
      symbol: m.symbol,
      borrowCap: BigNumber.from(m.borrowCap.new),
      supplyCap: BigNumber.from(m.supplyCap.new),
    });
  }
  for (const d of delistAssets) {
    // delistAssets force caps to 0; marketCapChanges may also list the same vToken (no-op),
    // but the delist intent wins so we overwrite unconditionally.
    overrides.set(d.vToken.toLowerCase(), {
      symbol: d.symbol,
      borrowCap: BigNumber.from(0),
      supplyCap: BigNumber.from(0),
    });
  }
  return overrides;
}

async function main() {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);
  const block = await provider.getBlockNumber();
  console.log(`Fetching at block ${block}…`);

  const vip622Overrides = buildVip622Overrides();
  console.log(`VIP-622 supplies post-caps for ${vip622Overrides.size} markets`);

  const allMarkets: string[] = await comptroller.getAllMarkets();
  console.log(`getAllMarkets() returned ${allMarkets.length} markets`);

  const kept: KeptMarket[] = [];
  const skipped: SkippedMarket[] = [];

  for (const market of allMarkets) {
    const [isListed] = await comptroller.poolMarkets(CORE_POOL_ID, market);
    if (!isListed) {
      skipped.push({ address: market, reason: "not listed in core pool (poolId 0)" });
      continue;
    }

    const override = vip622Overrides.get(market.toLowerCase());
    let borrowCap: BigNumber;
    let supplyCap: BigNumber;
    let capSource: "live" | "vip-622";
    if (override) {
      borrowCap = override.borrowCap;
      supplyCap = override.supplyCap;
      capSource = "vip-622";
    } else {
      [borrowCap, supplyCap] = await Promise.all([comptroller.borrowCaps(market), comptroller.supplyCaps(market)]);
      capSource = "live";
    }

    const minBorrowCap = borrowCap.mul(FLOOR_PERCENT).div(100);
    const minSupplyCap = supplyCap.mul(FLOOR_PERCENT).div(100);

    const symbol = await new ethers.Contract(market, VTOKEN_ABI, provider).symbol();

    if (minBorrowCap.isZero() && minSupplyCap.isZero()) {
      skipped.push({
        address: market,
        symbol,
        reason: `${capSource} 20% floors are both zero (delisted / dormant)`,
      });
      continue;
    }

    kept.push({
      address: market,
      symbol,
      capSource,
      effectiveBorrowCap: borrowCap.toString(),
      effectiveSupplyCap: supplyCap.toString(),
      minBorrowCap: minBorrowCap.toString(),
      minSupplyCap: minSupplyCap.toString(),
    });
  }

  console.log(`Kept ${kept.length} markets, skipped ${skipped.length}`);
  console.log("Skipped:", skipped);

  const out = {
    _meta: {
      network: "bscmainnet",
      comptroller: UNITROLLER,
      corePoolId: CORE_POOL_ID,
      block,
      fetchedAt: new Date().toISOString(),
      floorPercent: FLOOR_PERCENT,
      vip622DataSource: "vips/vip-622/data/bscmainnet.ts (PR https://github.com/VenusProtocol/vips/pull/706)",
    },
    markets: kept,
    skipped,
  };

  const outPath = path.resolve(__dirname, "../vips/vip-701/coreMarketCaps.json");
  fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`Wrote ${outPath}`);

  console.log("\n--- Per-market 20% floors ---");
  console.log("symbol".padEnd(28), "source".padEnd(10), "minBorrowCap".padEnd(28), "minSupplyCap");
  for (const m of kept) {
    console.log(m.symbol.padEnd(28), m.capSource.padEnd(10), m.minBorrowCap.padEnd(28), m.minSupplyCap);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
