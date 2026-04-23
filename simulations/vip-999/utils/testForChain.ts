import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { testForkedNetworkVipCommands } from "src/vip-framework";

import vip999, { opbnbmainnet, opmainnet, unichainmainnet } from "../../../vips/vip-999/bscmainnet";
import ERC20_ABI from "../abi/ERC20.json";
import VTOKEN_ABI from "../abi/vtoken.json";
import chainStateJson from "./chainState.json";

type ChainKey = "opbnbmainnet" | "unichainmainnet" | "opmainnet";
type ChainConfig = typeof opbnbmainnet | typeof unichainmainnet | typeof opmainnet;

interface DistributionTarget {
  schema: number;
  percentage: number;
  destination: string;
}
interface ChainSnapshot {
  markets: Record<string, { totalReserves: string }>;
  psrDistribution: DistributionTarget[];
}
const CHAIN_STATE = chainStateJson as Record<ChainKey, ChainSnapshot>;

interface ChainExtras {
  vTreasury: string;
  nativeGateway: string;
}

export const describeChainExecution = async (
  description: string,
  chain: ChainConfig,
  chainKey: ChainKey,
  extras: ChainExtras,
) => {
  const provider = ethers.provider;
  const snapshot = CHAIN_STATE[chainKey];

  // Destinations that receive from PSR.releaseFunds.
  const allDestinations = Array.from(
    new Set([extras.vTreasury, ...snapshot.psrDistribution.map(d => d.destination)]),
  );

  // Pre-VIP state captured here; mutated inside `before()` hooks.
  const reservesBefore: Record<string, BigNumber> = {};
  const psrBefore: Record<string, BigNumber> = {};
  const destBalancesBefore: Record<string, Record<string, BigNumber>> = {};
  let gatewayNativeBefore = BigNumber.from(0);

  describe(`Pre-VIP snapshot (${description})`, async () => {
    before(async () => {
      for (const m of chain.markets) {
        const vToken = new ethers.Contract(m.vToken, VTOKEN_ABI, provider);
        const tok: Contract = new ethers.Contract(m.underlying, ERC20_ABI, provider);
        reservesBefore[m.vToken] = await vToken.totalReserves();
        psrBefore[m.underlying] = await tok.balanceOf(chain.protocolShareReserve);
        destBalancesBefore[m.underlying] = {};
        for (const d of allDestinations) {
          destBalancesBefore[m.underlying][d] = await tok.balanceOf(d);
        }
      }
      gatewayNativeBefore = await provider.getBalance(extras.nativeGateway);
    });

    it("captured totalReserves snapshot matches chainState.json", async () => {
      for (const m of chain.markets) {
        const snapped = snapshot.markets[m.vToken]?.totalReserves ?? "0";
        // Live fork value should be >= snapshotted value (accrual can only grow it).
        expect(reservesBefore[m.vToken].gte(BigNumber.from(snapped))).to.equal(
          true,
          `${m.name}: live totalReserves (${reservesBefore[m.vToken].toString()}) < snapshotted (${snapped})`,
        );
      }
    });

    it("psrDistribution loaded from chainState.json is non-empty (or treasury is covered implicitly)", async () => {
      // If snapshot is empty, the conservation check still works because
      // `allDestinations` always includes vTreasury. Just log.
      if (snapshot.psrDistribution.length === 0) {
        console.log(
          `  ⚠ psrDistribution empty for ${chainKey} — conservation check will only cover VTreasuryV8. Run fetchChainState.ts to populate.`,
        );
      }
      expect(allDestinations.length).to.be.greaterThan(0);
    });
  });

  testForkedNetworkVipCommands(description, await vip999());

  describe(`Post-VIP state (${description})`, async () => {
    it("VToken totalReserves == 0 for every Core Pool market (drained to PSR)", async () => {
      for (const m of chain.markets) {
        const vToken = new ethers.Contract(m.vToken, VTOKEN_ABI, provider);
        const after: BigNumber = await vToken.totalReserves();
        expect(after.toString()).to.equal(
          "0",
          `${m.name}: totalReserves ${after.toString()} != 0; reduceReserves did not fully drain`,
        );
      }
    });

    it("PSR underlying balance == 0 for every Core Pool asset (released out)", async () => {
      for (const m of chain.markets) {
        const tok = new ethers.Contract(m.underlying, ERC20_ABI, provider);
        const after: BigNumber = await tok.balanceOf(chain.protocolShareReserve);
        expect(after.toString()).to.equal(
          "0",
          `${m.name} (underlying ${m.underlying}): PSR still holds ${after.toString()}; releaseFunds did not fully release`,
        );
      }
    });

    it("conservation: sum(destination balances) increased by at least R + P per asset", async () => {
      // Destinations should receive at least R (pushed via reduceReserves) +
      // P (previously-unreleased PSR balance). A small positive drift is
      // acceptable and comes from (a) yield-bearing underlyings that rebase
      // during fork mining (opBNB `ETH`, wstETH, etc.), and (b) interest
      // accrual inside reduceReserves between the snapshot and the VIP run.
      // A negative drift — destinations received *less* than R + P — would
      // indicate a real regression (partial drain, bad distribution config,
      // tokens stuck somewhere).
      for (const m of chain.markets) {
        const tok = new ethers.Contract(m.underlying, ERC20_ABI, provider);
        let destSumAfter = BigNumber.from(0);
        let destSumBefore = BigNumber.from(0);
        for (const d of allDestinations) {
          destSumAfter = destSumAfter.add(await tok.balanceOf(d));
          destSumBefore = destSumBefore.add(destBalancesBefore[m.underlying][d]);
        }
        const expectedDelta = reservesBefore[m.vToken].add(psrBefore[m.underlying]);
        const actualDelta = destSumAfter.sub(destSumBefore);

        expect(actualDelta.gte(expectedDelta)).to.equal(
          true,
          `${m.name}: destinations received ${actualDelta.toString()} < expected floor R+P = ${expectedDelta.toString()}`,
        );

        if (!expectedDelta.isZero()) {
          const excess = actualDelta.sub(expectedDelta);
          // 1% of expected expressed as BigNumber-friendly arithmetic
          const onePercent = expectedDelta.div(100);
          if (excess.gt(onePercent)) {
            console.log(
              `  ⚠ ${m.name}: destinations received ${actualDelta.toString()} vs expected R+P ${expectedDelta.toString()} (excess ${excess.toString()} > 1% of expected — investigate if this market uses a rebase/yield-bearing underlying)`,
            );
          }
        }
      }
    });

    it("VTreasuryV8 underlying balance strictly increased when something was drained", async () => {
      for (const m of chain.markets) {
        const expectedDelta = reservesBefore[m.vToken].add(psrBefore[m.underlying]);
        if (expectedDelta.isZero()) continue; // nothing to drain, skip strict-increase check
        const tok = new ethers.Contract(m.underlying, ERC20_ABI, provider);
        const after: BigNumber = await tok.balanceOf(extras.vTreasury);
        const before = destBalancesBefore[m.underlying][extras.vTreasury];
        expect(after.gt(before)).to.equal(
          true,
          `${m.name}: treasury balance did not strictly increase (${before.toString()} -> ${after.toString()})`,
        );
      }
    });

    it("NativeTokenGateway native balance == 0 (swept to remote NormalTimelock)", async () => {
      const bal = await provider.getBalance(extras.nativeGateway);
      expect(bal.toString()).to.equal("0");
      // Referenced so TS doesn't warn if no assertion yet uses gatewayNativeBefore.
      void gatewayNativeBefore;
    });

    it("prints per-market drained amount for reviewer visibility", async () => {
      console.log(`\n  ── ${description} — per-market drained amounts ──`);
      for (const m of chain.markets) {
        const tok = new ethers.Contract(m.underlying, ERC20_ABI, provider);
        const decimals: number = await tok.decimals();
        const reserves = reservesBefore[m.vToken];
        const psr = psrBefore[m.underlying];
        const total = reserves.add(psr);
        console.log(
          `  ${m.name.padEnd(14)} R=${formatUnits(reserves, decimals).padStart(22)} +P=${formatUnits(psr, decimals).padStart(22)} =total ${formatUnits(total, decimals)}`,
        );
      }
      console.log(`  nativeGateway pre-sweep balance = ${formatUnits(gatewayNativeBefore, 18)} (native)\n`);
    });
  });
};
