import { BigNumber } from "ethers";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import chainState from "../../simulations/vip-615/utils/chainState.json";

// ──────────────────────────────────────────────────────────────────────
// chainState shape — one entry per remote chain, produced by
// simulations/vip-615/utils/fetchChainState.ts.
//
//   markets[vToken] = {
//     totalReserves, treasuryVTokenBalance, redeemCapacity, exchangeRate,
//     psrPreBalance
//   }
//     Snapshotted per Core Pool vToken right before proposal build.
//     - `totalReserves` is the amount passed to
//       `VToken.reduceReserves(uint256)`. Safe because totalReserves is
//       monotonically non-decreasing between snapshot and execution.
//     - `treasuryVTokenBalance` is the vToken supply position held by
//       `VTreasuryV8` (seeded at market creation via
//       `PoolRegistry.addMarket(..., supplier = treasury, ...)`). Drives
//       the (D) treasury-redeem flow below.
//     - `redeemCapacity` = `getCash() − totalReserves` in underlying
//       units at snapshot. Upper bound on what `vToken.redeem` can pay
//       out at execution; we haircut this 5% to absorb cash drift from
//       other suppliers redeeming during the cross-chain VIP window.
//     - `exchangeRate` = `exchangeRateStored()`. Translates between
//       vToken and underlying units in `computeSafeRedeem`.
//     - `psrPreBalance` = `balanceOf(underlying, PSR)` at snapshot time.
//       Used by the simulation and the offline accounting aggregator
//       (computeExpectedTotals.ts) to report how much of the
//       Treasury-side gain came from pre-existing PSR balance vs. the
//       reserves this VIP pushes in.
//
//   psrDistribution: [{ schema, percentage, destination }]
//     Snapshot of ProtocolShareReserve.distributionTargets() used only by
//     the simulation's conservation check — not consumed here.
//
//   xvsVaultRewardSpeed
//     Scalar snapshot of `XVSVault.rewardTokenAmountsPerBlock(XVS)`.
//     Drives the (E) block — we emit `setRewardAmountPerBlockOrSecond(XVS, 0)`
//     only when the snapshotted speed is non-zero.
//
//   gatewayNativeBalance
//     Scalar snapshot of `provider.getBalance(nativeTokenGateway)`. Not
//     consumed by the VIP itself (sweepNative no-ops when 0), but read
//     by the aggregator to report the native dust forwarded to the
//     timelock.
// ──────────────────────────────────────────────────────────────────────

type ChainStateKey = "opbnbmainnet" | "unichainmainnet" | "opmainnet";
interface MarketSnapshot {
  totalReserves: string;
  treasuryVTokenBalance: string;
  redeemCapacity: string;
  exchangeRate: string;
  psrPreBalance: string;
}
export type { MarketSnapshot };
interface ChainRuntimeState {
  markets: Record<string, MarketSnapshot>;
  xvsVaultRewardSpeed?: string;
  gatewayNativeBalance?: string;
}
const CHAIN_STATE = chainState as Record<ChainStateKey, ChainRuntimeState>;

// redeemAmountUnderlying = redeemTokens × exchangeRate / 1e18.
const EXCHANGE_RATE_SCALE = BigNumber.from(10).pow(18);

// 5% haircut on the snapshotted redeem capacity to absorb cash drift
// (other suppliers redeeming) between snapshot and execution.
const REDEEM_HAIRCUT_NUM = BigNumber.from(95);
const REDEEM_HAIRCUT_DEN = BigNumber.from(100);

// For each market, return the vToken quantity we can safely redeem:
//   min(treasuryVTokenBalance,
//       floor(redeemCapacity × 1e18 / exchangeRate) × 95/100)
export const computeSafeRedeem = (snap: MarketSnapshot): BigNumber => {
  const treasuryBal = BigNumber.from(snap.treasuryVTokenBalance);
  if (treasuryBal.isZero()) return BigNumber.from(0);
  const capUnderlying = BigNumber.from(snap.redeemCapacity);
  const rate = BigNumber.from(snap.exchangeRate);
  if (capUnderlying.isZero() || rate.isZero()) return BigNumber.from(0);

  const capVTokens = capUnderlying.mul(EXCHANGE_RATE_SCALE).div(rate);
  const safeCap = capVTokens.mul(REDEEM_HAIRCUT_NUM).div(REDEEM_HAIRCUT_DEN);
  return treasuryBal.lt(safeCap) ? treasuryBal : safeCap;
};

// ──────────────────────────────────────────────────────────────────────
// Per-chain deployment addresses (Core Pool only).
//
// `comptrollerCore`         — Core Pool Comptroller; the `releaseFunds`
//                              call is scoped to it.
// `protocolShareReserve`    — PSR receives `reduceReserves` pushes and
//                              splits balances to configured destinations
//                              (all pointing at VTreasuryV8 today; verified
//                              in chainState.json `psrDistribution`).
// `nativeTokenGateway_*`    — helper that wraps native → WBNB/WETH for
//                              user mints; `sweepNative()` is `onlyOwner`
//                              and the owner is the remote NormalTimelock.
// `vTreasury`               — `VTreasuryV8` on the remote chain. Owner =
//                              remote NormalTimelock, so the timelock
//                              (this batch's executor) can call
//                              `withdrawTreasuryToken` to pull the
//                              treasury's vToken positions into itself.
// `normalTimelock`          — destination for `withdrawTreasuryToken` and
//                              `msg.sender` of the subsequent `redeem`.
// `markets[]`               — Core Pool vTokens + their underlyings, in
//                              the order the proposal iterates them.
// ──────────────────────────────────────────────────────────────────────

export const opbnbmainnet = {
  comptrollerCore: "0xD6e3E2A1d8d95caE355D15b3b9f8E5c2511874dd",
  protocolShareReserve: "0xA2EDD515B75aBD009161B15909C19959484B0C1e",
  nativeTokenGateway_vWBNB: "0x7bAf6019C90B93aD30f8aD6a2EcCD2B11427b29f",
  vTreasury: "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52",
  normalTimelock: "0x10f504e939b912569Dca611851fDAC9E3Ef86819",
  xvsVaultProxy: "0x7dc969122450749A8B0777c0e324522d67737988",
  xvs: "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61",
  markets: [
    {
      name: "vWBNB_Core",
      vToken: "0x53d11cB8A0e5320Cd7229C3acc80d1A0707F2672",
      underlying: "0x4200000000000000000000000000000000000006",
    },
    {
      name: "vBTCB_Core",
      vToken: "0xED827b80Bd838192EA95002C01B5c6dA8354219a",
      underlying: "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2",
    },
    {
      name: "vETH_Core",
      vToken: "0x509e81eF638D489936FA85BC58F52Df01190d26C",
      underlying: "0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea",
    },
    {
      name: "vUSDT_Core",
      vToken: "0xb7a01Ba126830692238521a1aA7E7A7509410b8e",
      underlying: "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3",
    },
    {
      name: "vFDUSD_Core",
      vToken: "0x13B492B8A03d072Bab5C54AC91Dba5b830a50917",
      underlying: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    },
  ],
};

export const unichainmainnet = {
  comptrollerCore: "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe",
  protocolShareReserve: "0x0A93fBcd7B53CE6D335cAB6784927082AD75B242",
  nativeTokenGateway_vWETH: "0x4441aE3bCEd3210edbA35d0F7348C493E79F1C52",
  vTreasury: "0x958F4C84d3ad523Fa9936Dc465A123C7AD43D69B",
  normalTimelock: "0x918532A78d22419Da4091930d472bDdf532BE89a",
  xvsVaultProxy: "0x5ECa0FBBc5e7bf49dbFb1953a92784F8e4248eF6",
  xvs: "0x81908BBaad3f6fC74093540Ab2E9B749BB62aA0d",
  markets: [
    {
      name: "vWETH_Core",
      vToken: "0xc219BC179C7cDb37eACB03f993f9fDc2495e3374",
      underlying: "0x4200000000000000000000000000000000000006",
    },
    {
      name: "vWBTC_Core",
      vToken: "0x68e2A6F7257FAc2F5a557b9E83E1fE6D5B408CE5",
      underlying: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
    },
    {
      name: "vUSDC_Core",
      vToken: "0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95",
      underlying: "0x078D782b760474a361dDA0AF3839290b0EF57AD6",
    },
    {
      name: "vUSDT0_Core",
      vToken: "0xDa7Ce7Ba016d266645712e2e4Ebc6cC75eA8E4CD",
      underlying: "0x9151434b16b9763660705744891fA906F660EcC5",
    },
    {
      name: "vUNI_Core",
      vToken: "0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2",
      underlying: "0x8f187aA05619a017077f5308904739877ce9eA21",
    },
    {
      name: "vweETH_Core",
      vToken: "0x0170398083eb0D0387709523baFCA6426146C218",
      underlying: "0x7DCC39B4d1C53CB31e1aBc0e358b43987FEF80f7",
    },
    {
      name: "vwstETH_Core",
      vToken: "0xbEC19Bef402C697a7be315d3e59E5F65b89Fa1BB",
      underlying: "0xc02fE7317D4eb8753a02c35fe019786854A92001",
    },
  ],
};

export const opmainnet = {
  comptrollerCore: "0x5593FF68bE84C966821eEf5F0a988C285D5B7CeC",
  protocolShareReserve: "0x735ed037cB0dAcf90B133370C33C08764f88140a",
  nativeTokenGateway_vWETH: "0x5B1b7465cfDE450e267b562792b434277434413c",
  vTreasury: "0x104c01EB7b4664551BE6A9bdB26a8C5c6Be7d3da",
  normalTimelock: "0x0C6f1E6B4fDa846f63A0d5a8a73EB811E0e0C04b",
  xvsVaultProxy: "0x133120607C018c949E91AE333785519F6d947e01",
  xvs: "0xebb41d8Ea9F6Df431208562cB8C87ac3A4E819E3",
  markets: [
    {
      name: "vWETH_Core",
      vToken: "0x66d5AE25731Ce99D46770745385e662C8e0B4025",
      underlying: "0x4200000000000000000000000000000000000006",
    },
    {
      name: "vWBTC_Core",
      vToken: "0x9EfdCfC2373f81D3DF24647B1c46e15268884c46",
      underlying: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    },
    {
      name: "vUSDC_Core",
      vToken: "0x1C9406ee95B7af55F005996947b19F91B6D55b15",
      underlying: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    },
    {
      name: "vUSDT_Core",
      vToken: "0x37ac9731B0B02df54975cd0c7240e0977a051721",
      underlying: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    },
    {
      name: "vOP_Core",
      vToken: "0x6b846E3418455804C1920fA4CC7a31A51C659A2D",
      underlying: "0x4200000000000000000000000000000000000042",
    },
  ],
};

// Emits the drain sequence (A → B → C → D → E) for one remote chain.
//   A. reduceReserves
//   B. withdrawTreasuryToken + redeem
//   C. releaseFunds
//   D. sweepNative
//   E. setRewardAmountPerBlockOrSecond
const chainSection = (
  chain: typeof opbnbmainnet | typeof unichainmainnet | typeof opmainnet,
  nativeGateway: string | null,
  dstChainId: LzChainId,
  state: ChainRuntimeState,
) => {
  const commands: {
    target: string;
    signature: string;
    params: unknown[];
    dstChainId: LzChainId;
  }[] = [];

  // (A) Push VToken reserves → PSR.
  for (const m of chain.markets) {
    const snapshot = state.markets[m.vToken];
    const reserves = snapshot?.totalReserves ?? "0";
    if (reserves !== "0") {
      commands.push({
        target: m.vToken,
        signature: "reduceReserves(uint256)",
        params: [reserves],
        dstChainId,
      });
    }
  }

  // (B) Redeem the treasury's vToken supply positions.
  for (const m of chain.markets) {
    const snapshot = state.markets[m.vToken];
    if (!snapshot) continue;
    const safeRedeemVTokens = computeSafeRedeem(snapshot);
    if (safeRedeemVTokens.isZero()) continue;

    commands.push({
      target: chain.vTreasury,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [m.vToken, snapshot.treasuryVTokenBalance, chain.normalTimelock],
      dstChainId,
    });
    commands.push({
      target: m.vToken,
      signature: "redeem(uint256)",
      params: [safeRedeemVTokens.toString()],
      dstChainId,
    });
  }

  // (C) Release PSR → configured distribution targets.
  commands.push({
    target: chain.protocolShareReserve,
    signature: "releaseFunds(address,address[])",
    params: [chain.comptrollerCore, chain.markets.map(m => m.underlying)],
    dstChainId,
  });

  // (D) Sweep NativeTokenGateway native balance to its owner.
  if (nativeGateway) {
    commands.push({
      target: nativeGateway,
      signature: "sweepNative()",
      params: [],
      dstChainId,
    });
  }

  // (E) Stop XVS distribution on the remote XVSVault. Only emitted when
  //     both the chain config names the vault and the snapshotted speed
  //     is non-zero — so opBNB and Optimism (already 0) are skipped.
  if (state.xvsVaultRewardSpeed && state.xvsVaultRewardSpeed !== "0") {
    commands.push({
      target: chain.xvsVaultProxy,
      signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
      params: [chain.xvs, 0],
      dstChainId,
    });
  }

  return commands;
};

export const vip615 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-615 [BNB Chain] Core Pool Sunset Phase 1 Step 2 — Drain Reserves and Treasury Supply Positions (opBNB, Unichain, Optimism)",
    description: `#### Summary

VIP of the Venus Core Pool sunset on **opBNB**, **Unichain**, and **Optimism**. Follows VIP-614 (which blocked new supply/borrow/enter-market and zeroed caps + collateral factor on every Core Pool market). This proposal drains protocol-held value from the Core Pool into each chain's \`VTreasuryV8\`: protocol reserves, PSR balances, the treasury's own seed-liquidity supply positions, and native-token-gateway dust.

#### Actions (per chain)

1. **\`VToken.reduceReserves(snapshottedTotalReserves)\` on every Core Pool vToken.**
   Pushes vToken-held reserves into the chain's \`ProtocolShareReserve\`. The amount is the \`totalReserves\` value snapshotted right before proposal build (see \`simulations/vip-615/utils/chainState.json\`). This is safe because \`totalReserves\` is monotonically non-decreasing between snapshot and execution — interest accrual and repayments can only grow it, and nothing except \`reduceReserves\` itself can shrink it. Any dust that accrues between snapshot and execution is collected in the Phase 2 final sweep. Markets with \`totalReserves = 0\` emit no call.

2. **Redeem the Treasury's Core Pool supply positions — per market.**
   At deployment, each Core Pool market was seeded with initial liquidity via \`PoolRegistry.addMarket(..., supplier = VTreasuryV8, ...)\`, which minted vTokens directly to the Treasury. Those positions still sit on \`VTreasuryV8\` today and earn supply interest. We redeem them now — while the market still holds uncommitted cash — because Phase 2's unlisting announcement will trigger a user-redemption rush that outpaces slow borrower repayments, stranding the Treasury's position until repayments trickle back. Flow per market:
   - **a)** \`VTreasuryV8.withdrawTreasuryToken(vToken, treasuryVTokenBalance, NormalTimelock)\` — \`onlyOwner\`; owner is the remote \`NormalTimelock\` executing this batch. vTokens are plain ERC20s, so \`withdrawTreasuryToken\` transfers them out of the Treasury into the timelock.
   - **b)** \`vToken.redeem(safeRedeemVTokens)\` — the timelock is now \`msg.sender\`; redeem burns vTokens and transfers underlying to the timelock. \`safeRedeemVTokens\` is clamped to each market's snapshotted redeem capacity (\`getCash() − totalReserves\`, converted via \`exchangeRateStored\`) with a 5% haircut to absorb cash drift from other suppliers redeeming during the VIP's cross-chain execution window.
   - The redeemed underlying **lands on the \`NormalTimelock\`**, not directly on \`VTreasuryV8\` — forwarded treasury-side in Phase 2 (same pattern as \`sweepNative\`). Any vTokens the market cannot honour at execution time remain with the timelock and are cleaned up in Phase 2.

3. **\`ProtocolShareReserve.releaseFunds(comptrollerCore, [underlyings])\`** once per chain.
   Permissionless. Routes each per-asset PSR balance to the destinations configured via \`addOrUpdateDistributionConfig\`. On all three target chains today, every configured destination resolves to \`VTreasuryV8\` (verified in the committed \`chainState.json.psrDistribution\` snapshot, and asserted by the simulation's conservation-of-value check). **Deliberately runs after (2)** because \`VToken.redeem\` triggers \`accrueInterest\` and Venus's \`reduceReservesBlockDelta\` auto-reduce, which implicitly pushes fresh reserves into PSR; running \`releaseFunds\` after the redeems sweeps both the explicit (1) push and those implicit post-redeem pushes in a single call.

4. **\`NativeTokenGateway.sweepNative()\` on each gateway.**
   Clears any residual native balance held by the gateway helper. The call is \`onlyOwner\` and the owner is the remote \`NormalTimelock\` (which is what's executing this batch). Funds land on the NormalTimelock rather than directly on \`VTreasuryV8\`; forwarding treasury-side happens in Phase 2 to avoid introducing a bespoke timelock selector today. No-op if the gateway holds 0 native.

5. **\`XVSVault.setRewardAmountPerBlockOrSecond(XVS, 0)\` — Unichain only.**
   Stops the ongoing XVS distribution from the XVS staking vault. At snapshot time (2026-04-24) the Unichain vault was emitting ~3.1 XVS/day to stakers; opBNB and Optimism are already at 0 and emit no call. The ACM permission for this selector on the remote \`XVSVaultProxy\` is held by the remote \`NormalTimelock\` (verified via \`AccessControlManager.hasPermission(timelock, vault, sig) = true\`), so this runs inline in the VIP's cross-chain batch rather than a separate Guardian multisig proposal. Existing stakers retain their stake and accrued rewards; only new emissions stop.

#### Markets drained

- **opBNB** (PSR \`0xA2EDD515B75aBD009161B15909C19959484B0C1e\`, gateway \`0x7bAf6019C90B93aD30f8aD6a2EcCD2B11427b29f\`, VTreasuryV8 \`0xDDc9017F3073aa53a4A8535163b0bf7311F72C52\`, NormalTimelock \`0x10f504e939b912569Dca611851fDAC9E3Ef86819\`): vWBNB, vBTCB, vETH, vUSDT, vFDUSD.
- **Unichain** (PSR \`0x0A93fBcd7B53CE6D335cAB6784927082AD75B242\`, gateway \`0x4441aE3bCEd3210edbA35d0F7348C493E79F1C52\`, VTreasuryV8 \`0x958F4C84d3ad523Fa9936Dc465A123C7AD43D69B\`, NormalTimelock \`0x918532A78d22419Da4091930d472bDdf532BE89a\`): vWETH, vWBTC, vUSDC, vUSD₮0, vUNI, vweETH, vwstETH.
- **Optimism** (PSR \`0x735ed037cB0dAcf90B133370C33C08764f88140a\`, gateway \`0x5B1b7465cfDE450e267b562792b434277434413c\`, VTreasuryV8 \`0x104c01EB7b4664551BE6A9bdB26a8C5c6Be7d3da\`, NormalTimelock \`0x0C6f1E6B4fDa846f63A0d5a8a73EB811E0e0C04b\`): vWETH, vWBTC, vUSDC, vUSDT, vOP.
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...chainSection(
        opbnbmainnet,
        opbnbmainnet.nativeTokenGateway_vWBNB,
        LzChainId.opbnbmainnet,
        CHAIN_STATE.opbnbmainnet,
      ),
      ...chainSection(
        unichainmainnet,
        unichainmainnet.nativeTokenGateway_vWETH,
        LzChainId.unichainmainnet,
        CHAIN_STATE.unichainmainnet,
      ),
      ...chainSection(opmainnet, opmainnet.nativeTokenGateway_vWETH, LzChainId.opmainnet, CHAIN_STATE.opmainnet),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip615;
