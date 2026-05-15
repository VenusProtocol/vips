/**
 * Fetch BSC Core Pool markets and compute 20% floors of their current borrow/supply caps.
 *
 * Run:
 *   npx hardhat run scripts/fetchCoreMarketCaps.ts --network bscmainnet
 *
 * Reads on-chain:
 *   - Unitroller.getAllMarkets()
 *   - For each market: poolMarkets(0, vToken) to keep only core-pool-listed entries
 *   - For each kept market: borrowCaps(vToken), supplyCaps(vToken), vToken.symbol()
 *
 * Writes:
 *   vips/vip-701/coreMarketCaps.json — consumed by vips/vip-701/bscmainnet.ts
 *
 * 20% of zero is zero, so uncapped markets stay at minCap=0 (which still permits monitor
 * tightening on the LTV and cap-exceeding paths — only handleCapAdjust becomes a no-op).
 */
import fs from "fs";
import { ethers } from "hardhat";
import path from "path";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const CORE_POOL_ID = 0;

const COMPTROLLER_ABI = [
  "function getAllMarkets() view returns (address[])",
  "function poolMarkets(uint96,address) view returns (bool isListed,uint256,bool,uint256,uint256,uint96,bool)",
  "function borrowCaps(address) view returns (uint256)",
  "function supplyCaps(address) view returns (uint256)",
];

const VTOKEN_ABI = ["function symbol() view returns (string)"];

interface MarketEntry {
  address: string;
  symbol: string;
  currentBorrowCap: string;
  currentSupplyCap: string;
  minBorrowCap: string; // 20% of currentBorrowCap, floored to wei
  minSupplyCap: string; // 20% of currentSupplyCap, floored to wei
}

async function main() {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);

  const block = await provider.getBlockNumber();
  console.log(`Fetching at block ${block}…`);

  // step 1: get all markets
  const allMarkets: string[] = await comptroller.getAllMarkets();
  console.log(`getAllMarkets() returned ${allMarkets.length} markets`);

  const kept: MarketEntry[] = [];
  const skipped: { address: string; reason: string }[] = [];

  for (const market of allMarkets) {
    // step 2: check if it's listed in the core pool (poolId 0)
    const [isListed] = await comptroller.poolMarkets(CORE_POOL_ID, market);
    if (!isListed) {
      skipped.push({ address: market, reason: "not listed in core pool (poolId 0)" });
      continue;
    }

    // step 3: fetch current caps and symbol
    const [currentBorrowCap, currentSupplyCap, symbol] = await Promise.all([
      comptroller.borrowCaps(market),
      comptroller.supplyCaps(market),
      new ethers.Contract(market, VTOKEN_ABI, provider).symbol(),
    ]);

    // step 4: Compute 20% floors, rounding down to the nearest integer (wei)
    const minBorrowCap = currentBorrowCap.mul(20).div(100);
    const minSupplyCap = currentSupplyCap.mul(20).div(100);

    kept.push({
      address: market,
      symbol,
      currentBorrowCap: currentBorrowCap.toString(),
      currentSupplyCap: currentSupplyCap.toString(),
      minBorrowCap: minBorrowCap.toString(),
      minSupplyCap: minSupplyCap.toString(),
    });
  }

  console.log(`Kept ${kept.length} core-pool-listed markets, skipped ${skipped.length}`);
  console.log("Skipped:", skipped);

  const out = {
    _meta: {
      network: "bscmainnet",
      comptroller: UNITROLLER,
      corePoolId: CORE_POOL_ID,
      block,
      fetchedAt: new Date().toISOString(),
      floorPercent: 20,
    },
    markets: kept,
    skipped,
  };

  const outPath = path.resolve(__dirname, "../vips/vip-701/coreMarketCaps.json");
  fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`Wrote ${outPath}`);

  // Print a human-readable summary table so the result is reviewable in the run log.
  console.log("\n--- 20% floors per market ---");
  console.log("symbol".padEnd(28), "minBorrowCap".padEnd(28), "minSupplyCap");
  for (const m of kept) {
    console.log(m.symbol.padEnd(28), m.minBorrowCap.padEnd(28), m.minSupplyCap);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
