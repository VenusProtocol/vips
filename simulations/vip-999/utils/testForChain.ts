import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { testForkedNetworkVipCommands } from "src/vip-framework";

import vip999, {
  MarketSnapshot,
  computeSafeRedeem,
  opbnbmainnet,
  opmainnet,
  unichainmainnet,
} from "../../../vips/vip-999/bscmainnet";
import ERC20_ABI from "../abi/ERC20.json";
import PSR_ABI from "../abi/protocolShareReserve.json";
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
  markets: Record<string, MarketSnapshot>;
  psrDistribution: DistributionTarget[];
  xvsVaultRewardSpeed?: string;
  gatewayNativeBalance?: string;
}
const CHAIN_STATE = chainStateJson as Record<ChainKey, ChainSnapshot>;

interface ChainExtras {
  vTreasury: string;
  nativeGateway: string;
  normalTimelock: string;
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
  const allDestinations = Array.from(new Set([extras.vTreasury, ...snapshot.psrDistribution.map(d => d.destination)]));

  // Pre-VIP state captured here; mutated inside `before()` hooks.
  const reservesBefore: Record<string, BigNumber> = {};
  const psrBefore: Record<string, BigNumber> = {};
  const destBalancesBefore: Record<string, Record<string, BigNumber>> = {};
  const treasuryVBalBefore: Record<string, BigNumber> = {};
  const timelockVBalBefore: Record<string, BigNumber> = {};
  const timelockUnderlyingBefore: Record<string, BigNumber> = {};
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
        treasuryVBalBefore[m.vToken] = await vToken.balanceOf(extras.vTreasury);
        timelockVBalBefore[m.vToken] = await vToken.balanceOf(extras.normalTimelock);
        timelockUnderlyingBefore[m.underlying] = await tok.balanceOf(extras.normalTimelock);
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

    it("PSR tracked ledger (assetsReserves) is zero after releaseFunds for every market × schema", async () => {
      const psr = new ethers.Contract(chain.protocolShareReserve, PSR_ABI, provider);
      const schemas = Array.from(new Set(snapshot.psrDistribution.map(d => d.schema)));
      for (const m of chain.markets) {
        for (const schema of schemas) {
          const tracked: BigNumber = await psr.assetsReserves(chain.comptrollerCore, m.underlying, schema);
          expect(tracked.toString()).to.equal(
            "0",
            `${
              m.name
            } schema=${schema}: assetsReserves=${tracked.toString()}, expected 0 (releaseFunds should have cleared the tracked ledger)`,
          );
        }
      }
    });

    it("VToken cash decreased by at least the redeemed underlying (source-side check on redeem)", async () => {
      for (const m of chain.markets) {
        const snap = snapshot.markets[m.vToken];
        if (!snap) continue;
        const safeRedeem = computeSafeRedeem(snap);
        if (safeRedeem.isZero()) continue;

        const vToken = new ethers.Contract(m.vToken, VTOKEN_ABI, provider);
        const tok = new ethers.Contract(m.underlying, ERC20_ABI, provider);

        const timelockGained = (await tok.balanceOf(extras.normalTimelock)).sub(timelockUnderlyingBefore[m.underlying]);

        const cashBefore = BigNumber.from(snap.redeemCapacity).add(BigNumber.from(snap.totalReserves));
        const cashAfter: BigNumber = await vToken.getCash();
        const cashDrop = cashBefore.sub(cashAfter);
        expect(cashDrop.gte(timelockGained)).to.equal(
          true,
          `${
            m.name
          }: VToken cash dropped by ${cashDrop.toString()} but timelock gained ${timelockGained.toString()} underlying — source decrease should be >= destination increase`,
        );
      }
    });

    it("conservation: sum(destination balances) increased by at least R + P per asset", async () => {
      // Destinations should receive at least R (pushed via reduceReserves) +
      // P (previously-unreleased PSR balance). A small positive drift is
      // acceptable and comes from (a) yield-bearing underlyings that rebase
      // during fork mining (opBNB `ETH`, wstETH, etc.), and (b) interest
      // accrual inside reduceReserves between the snapshot and the VIP run.
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
          `${
            m.name
          }: destinations received ${actualDelta.toString()} < expected floor R+P = ${expectedDelta.toString()}`,
        );

        if (!expectedDelta.isZero()) {
          const excess = actualDelta.sub(expectedDelta);
          // 1% of expected expressed as BigNumber-friendly arithmetic
          const onePercent = expectedDelta.div(100);
          if (excess.gt(onePercent)) {
            console.log(
              `  ⚠ ${
                m.name
              }: destinations received ${actualDelta.toString()} vs expected R+P ${expectedDelta.toString()} (excess ${excess.toString()} > 1% of expected — investigate if this market uses a rebase/yield-bearing underlying)`,
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
    });

    it("treasury vToken balance decreased by withdrawTreasuryToken amount", async () => {
      // For every market the VIP emits (B), VTreasuryV8 should end up holding
      // 0 vTokens of that market (the full snapshotted balance was withdrawn
      // to the timelock). For markets the VIP skipped, the balance is
      // unchanged.
      for (const m of chain.markets) {
        const snap = snapshot.markets[m.vToken];
        // if (!snap) continue;
        const vToken = new ethers.Contract(m.vToken, VTOKEN_ABI, provider);
        const after: BigNumber = await vToken.balanceOf(extras.vTreasury);
        const safeRedeem = computeSafeRedeem(snap);
        if (safeRedeem.isZero()) {
          // VIP skipped this market — treasury balance unchanged.
          expect(after.toString()).to.equal(
            treasuryVBalBefore[m.vToken].toString(),
            `${m.name}: treasury vToken balance changed unexpectedly for a skipped market`,
          );
        } else {
          // VIP withdrew the full snapshotted treasury balance; any live
          // balance >= snapshot would be pulled in full.
          expect(after.toString()).to.equal(
            "0",
            `${m.name}: treasury still holds ${after.toString()} vTokens; withdrawTreasuryToken did not fully drain`,
          );
        }
      }
    });

    it("XVSVault reward speed for XVS == 0 when chain has a vault in scope", async () => {
      // (E) only emits a command on chains that expose xvsVaultProxy + xvs in
      // their chain config. For chains without those fields, we skip the check.
      if (!("xvsVaultProxy" in chain) || !chain.xvsVaultProxy || !chain.xvs) return;
      const vault = new ethers.Contract(
        chain.xvsVaultProxy,
        ["function rewardTokenAmountsPerBlock(address) view returns (uint256)"],
        provider,
      );
      const speedAfter: BigNumber = await vault.rewardTokenAmountsPerBlock(chain.xvs);
      expect(speedAfter.toString()).to.equal(
        "0",
        `${chainKey}: XVSVault reward speed for XVS is ${speedAfter.toString()} != 0; setRewardAmountPerBlockOrSecond did not execute`,
      );
    });

    it("timelock holds the treasury-redeem leftovers and released underlying", async () => {
      // For each market the VIP redeemed:
      //   1. Timelock vToken balance delta == treasuryVBalBefore − safeRedeem
      //      (what was withdrawn minus what was redeemed).
      //   2. Timelock underlying balance delta >= safeRedeem × exchangeRateStored / 1e18
      //      (redeem pays out at the live rate, which is ≥ snapshot rate due
      //      to accrual — so the actual payout is a lower-bounded estimate).
      for (const m of chain.markets) {
        const snap = snapshot.markets[m.vToken];
        if (!snap) continue;
        const safeRedeem = computeSafeRedeem(snap);
        if (safeRedeem.isZero()) continue;

        const vToken = new ethers.Contract(m.vToken, VTOKEN_ABI, provider);
        const tok = new ethers.Contract(m.underlying, ERC20_ABI, provider);

        const vBalAfter: BigNumber = await vToken.balanceOf(extras.normalTimelock);
        const vBalDelta = vBalAfter.sub(timelockVBalBefore[m.vToken]);
        const snappedTreasuryBal = BigNumber.from(snap.treasuryVTokenBalance);
        const expectedVDelta = snappedTreasuryBal.sub(safeRedeem);
        expect(vBalDelta.toString()).to.equal(
          expectedVDelta.toString(),
          `${m.name}: timelock vToken delta ${vBalDelta.toString()} != expected ${expectedVDelta.toString()}`,
        );

        const underlyingAfter: BigNumber = await tok.balanceOf(extras.normalTimelock);
        const underlyingDelta = underlyingAfter.sub(timelockUnderlyingBefore[m.underlying]);
        const expectedUnderlyingFloor = safeRedeem
          .mul(BigNumber.from(snap.exchangeRate))
          .div(BigNumber.from(10).pow(18));
        expect(underlyingDelta.gte(expectedUnderlyingFloor)).to.equal(
          true,
          `${
            m.name
          }: timelock received ${underlyingDelta.toString()} underlying, expected >= ${expectedUnderlyingFloor.toString()} (= safeRedeem × snapshotRate)`,
        );
      }
    });

    it("prints Treasury Accounting summary for visibility", async () => {
      // Two sections per chain:
      //   (1) "Phase 1 — direct to VTreasuryV8" — what lands on the
      //       treasury in this VIP via reduceReserves + PSR.releaseFunds.
      //       For each asset this is R (reserves drained now) + P (PSR
      //       pre-balance already sitting there).
      //   (2) "Phase 1 — lands on NormalTimelock (forwarded in Phase 2)" —
      //       underlying that the timelock gains from treasury-vToken
      //       redemptions plus native from the gateway sweep. None of
      //       this reaches VTreasuryV8 until a Phase 2 cross-chain VIP
      //       emits ERC20/native transfers back to treasury.
      console.log(`\n  ═══ ${description} — Treasury Accounting ═══`);
      console.log(`  (1) Phase 1 — direct to VTreasuryV8 (via PSR.releaseFunds):`);
      for (const m of chain.markets) {
        const tok = new ethers.Contract(m.underlying, ERC20_ABI, provider);
        const decimals: number = await tok.decimals();
        const symbol: string = await tok.symbol().catch(() => m.name.replace(/^v/, ""));
        const reserves = reservesBefore[m.vToken];
        const psr = psrBefore[m.underlying];
        const total = reserves.add(psr);
        if (total.isZero()) continue;
        console.log(
          `    ${m.name.padEnd(14)} ${formatUnits(total, decimals).padStart(26)} ${symbol}    (reserves=${formatUnits(
            reserves,
            decimals,
          )}, PSR-pre=${formatUnits(psr, decimals)})`,
        );
      }

      console.log(`  (2) Phase 1 — lands on NormalTimelock (forwarded to VTreasuryV8 in Phase 2):`);
      let redeemEmittedAny = false;
      for (const m of chain.markets) {
        const snap = snapshot.markets[m.vToken];
        if (!snap) continue;
        const safeRedeem = computeSafeRedeem(snap);
        if (safeRedeem.isZero()) continue;
        const tok = new ethers.Contract(m.underlying, ERC20_ABI, provider);
        const decimals: number = await tok.decimals();
        const symbol: string = await tok.symbol().catch(() => m.name.replace(/^v/, ""));
        const redeemUnderlying = safeRedeem.mul(BigNumber.from(snap.exchangeRate)).div(BigNumber.from(10).pow(18));
        const leftoverVTokens = BigNumber.from(snap.treasuryVTokenBalance).sub(safeRedeem);
        redeemEmittedAny = true;
        console.log(
          `    ${m.name.padEnd(14)} ${formatUnits(redeemUnderlying, decimals).padStart(26)} ${symbol}    ` +
            `(safeRedeem=${safeRedeem.toString()} vTokens, leftover=${leftoverVTokens.toString()} vTokens on timelock)`,
        );
      }
      if (!redeemEmittedAny) {
        console.log(`    (no treasury vToken redemptions emitted on this chain)`);
      }
      if (!gatewayNativeBefore.isZero()) {
        console.log(
          `    gateway-sweep   ${formatUnits(gatewayNativeBefore, 18).padStart(26)} native   ` +
            `(swept to NormalTimelock)`,
        );
      }

      // (E) block output.
      if ("xvsVaultProxy" in chain && chain.xvsVaultProxy && snapshot.xvsVaultRewardSpeed) {
        console.log(`  (3) XVSVault rewardTokenAmountsPerBlock(XVS): ${snapshot.xvsVaultRewardSpeed} → 0`);
      }
    });
  });
};
