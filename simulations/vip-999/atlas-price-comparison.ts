import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999 from "../../vips/vip-999/bscmainnet";
import { ATLAS_ORACLE, BSC_MIGRATIONS } from "../../vips/vip-999/utils/data";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const BLOCK_NUMBER = 101860000;
const STALE_PERIOD_OVERRIDE = 315360000; // 10 years
const ZERO = ethers.constants.AddressZero;

// Generic OracleInterface — works for every Venus adapter (Chainlink/RedStone/Atlas/OneJump/correlated).
const GENERIC_ORACLE_ABI = [
  "function getPrice(address asset) external view returns (uint256)",
  "function tokenConfigs(address asset) external view returns (address,address,uint256)",
];
const ERC20_ABI = ["function decimals() external view returns (uint8)", "function symbol() external view returns (string)"];

// Adapters that follow the ChainlinkOracle interface (so we can override their stale period to read raw last answer).
const CHAINLINK_STYLE = new Set(
  [bscmainnet.CHAINLINK_ORACLE, bscmainnet.REDSTONE_ORACLE, ATLAS_ORACLE].map(a => a.toLowerCase()),
);

const label = (addr: string): string => {
  const m: Record<string, string> = {
    [bscmainnet.CHAINLINK_ORACLE.toLowerCase()]: "Chainlink",
    [bscmainnet.REDSTONE_ORACLE.toLowerCase()]: "RedStone",
    [bscmainnet.BINANCE_ORACLE.toLowerCase()]: "Binance",
    [ATLAS_ORACLE.toLowerCase()]: "Atlas",
  };
  return m[addr.toLowerCase()] ?? `${addr.slice(0, 8)}…`;
};
const SLOT = ["MAIN", "PIVOT", "FALLBACK"];

const atlasMigrations = BSC_MIGRATIONS.filter(m => m.atlasFeed);

// bps difference of `a` relative to `b`
const bps = (a: BigNumber, b: BigNumber): string => {
  if (b.isZero()) return "n/a";
  return (a.sub(b).abs().mul(10000).div(b).toNumber() / 100).toFixed(3) + "%";
};

forking(BLOCK_NUMBER, async () => {
  // Run the real proposal so the Atlas feeds are configured exactly as the VIP wires them.
  testVip("VIP-999 (BNB Chain) — for Atlas price comparison", await vip999(), {});

  describe("Atlas oracle price vs the other two configured oracles", () => {
    const rows: string[] = [];

    before(async () => {
      // Override stale period on the Chainlink-style adapters so getPrice returns the latest stored answer
      // rather than reverting on the forked block.
      for (const migration of atlasMigrations) {
        for (const oracleAddr of [bscmainnet.CHAINLINK_ORACLE, bscmainnet.REDSTONE_ORACLE, ATLAS_ORACLE]) {
          try {
            await setMaxStalePeriodInChainlinkOracle(
              oracleAddr,
              migration.asset,
              ZERO,
              bscmainnet.NORMAL_TIMELOCK,
              STALE_PERIOD_OVERRIDE,
            );
          } catch {
            /* asset not configured on this adapter — fine */
          }
        }
      }
    });

    for (const migration of atlasMigrations) {
      it(`${migration.symbol}: Atlas has a live price and we report its divergence`, async () => {
        const asset = migration.asset;
        let decimals = 18;
        try {
          decimals = await new Contract(asset, ERC20_ABI, ethers.provider).decimals();
        } catch {
          /* pseudo-asset (e.g. BNB sentinel) — assume 18 */
        }
        const denom = BigNumber.from(10).pow(36 - decimals); // Venus price scale → USD

        const readPrice = async (oracleAddr: string): Promise<BigNumber | null> => {
          try {
            return await new Contract(oracleAddr, GENERIC_ORACLE_ABI, ethers.provider).getPrice(asset);
          } catch {
            return null;
          }
        };
        const fmt = (p: BigNumber | null): string => (p ? "$" + ethers.utils.formatUnits(p, 36 - decimals) : "REVERT/0");

        const slots = migration.newOracles
          .map((addr, i) => ({ addr, slot: SLOT[i] }))
          .filter(s => s.addr !== ZERO);
        const atlasEntry = slots.find(s => s.addr.toLowerCase() === ATLAS_ORACLE.toLowerCase())!;
        const others = slots.filter(s => s.addr.toLowerCase() !== ATLAS_ORACLE.toLowerCase());

        const atlasPrice = await readPrice(ATLAS_ORACLE);

        const otherReads = [];
        for (const o of others) {
          const p = await readPrice(o.addr);
          otherReads.push({ ...o, price: p });
        }

        const parts = otherReads.map(
          o => `${label(o.addr)}(${o.slot})=${fmt(o.price)}${atlasPrice && o.price ? ` Δ${bps(atlasPrice, o.price)}` : ""}`,
        );
        rows.push(
          `${migration.symbol.padEnd(8)} Atlas(${atlasEntry.slot}, ${decimals}d)=${fmt(atlasPrice).padEnd(14)} | ${parts.join("  ")}`,
        );

        // The whole point of the migration: the Atlas feed must actually return a live, non-zero price.
        if (!atlasPrice || atlasPrice.isZero()) {
          throw new Error(`${migration.symbol}: Atlas getPrice returned no price (dead/unconfigured feed)`);
        }
        void denom;
      });
    }

    after(() => {
      console.log("\n================= Atlas vs other configured oracles (block " + BLOCK_NUMBER + ") =================");
      for (const r of rows) console.log(r);
      console.log("==========================================================================================\n");
    });
  });
});
