import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import chainState from "../../simulations/vip-999/utils/chainState.json";

// ──────────────────────────────────────────────────────────────────────
// chainState shape — one entry per remote chain, produced by
// simulations/vip-999/utils/fetchChainState.ts.
//
//   markets[vToken] = { totalReserves }
//     Snapshotted per Core Pool vToken right before proposal build. Used
//     as the exact amount passed to `VToken.reduceReserves(uint256)`.
//     Safe because `VToken.totalReserves` is monotonically non-decreasing
//     between snapshot and execution — interest accrual and repayments
//     can only grow it; nothing except `reduceReserves` itself shrinks
//     it. Snapshot ≤ live always, so `ReduceReservesCashValidation` cannot
//     revert. Dust that accrues between snapshot and execution is swept
//     in Phase 2.
//
//   psrDistribution: [{ schema, percentage, destination }]
//     Snapshot of ProtocolShareReserve.distributionTargets() used only by
//     the simulation's conservation check — not consumed here.
// ──────────────────────────────────────────────────────────────────────

type ChainStateKey = "opbnbmainnet" | "unichainmainnet" | "opmainnet";
interface MarketSnapshot {
  totalReserves: string;
}
interface ChainRuntimeState {
  markets: Record<string, MarketSnapshot>;
}
const CHAIN_STATE = chainState as Record<ChainStateKey, ChainRuntimeState>;

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
// `markets[]`               — Core Pool vTokens + their underlyings, in
//                              the order the proposal iterates them.
// ──────────────────────────────────────────────────────────────────────

export const opbnbmainnet = {
  comptrollerCore: "0xD6e3E2A1d8d95caE355D15b3b9f8E5c2511874dd",
  protocolShareReserve: "0xA2EDD515B75aBD009161B15909C19959484B0C1e",
  nativeTokenGateway_vWBNB: "0x7bAf6019C90B93aD30f8aD6a2EcCD2B11427b29f",
  markets: [
    { name: "vWBNB_Core", vToken: "0x53d11cB8A0e5320Cd7229C3acc80d1A0707F2672", underlying: "0x4200000000000000000000000000000000000006" },
    { name: "vBTCB_Core", vToken: "0xED827b80Bd838192EA95002C01B5c6dA8354219a", underlying: "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2" },
    { name: "vETH_Core", vToken: "0x509e81eF638D489936FA85BC58F52Df01190d26C", underlying: "0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea" },
    { name: "vUSDT_Core", vToken: "0xb7a01Ba126830692238521a1aA7E7A7509410b8e", underlying: "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3" },
    { name: "vFDUSD_Core", vToken: "0x13B492B8A03d072Bab5C54AC91Dba5b830a50917", underlying: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb" },
  ],
};

export const unichainmainnet = {
  comptrollerCore: "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe",
  protocolShareReserve: "0x0A93fBcd7B53CE6D335cAB6784927082AD75B242",
  nativeTokenGateway_vWETH: "0x4441aE3bCEd3210edbA35d0F7348C493E79F1C52",
  markets: [
    { name: "vWETH_Core", vToken: "0xc219BC179C7cDb37eACB03f993f9fDc2495e3374", underlying: "0x4200000000000000000000000000000000000006" },
    { name: "vWBTC_Core", vToken: "0x68e2A6F7257FAc2F5a557b9E83E1fE6D5B408CE5", underlying: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c" },
    { name: "vUSDC_Core", vToken: "0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95", underlying: "0x078D782b760474a361dDA0AF3839290b0EF57AD6" },
    { name: "vUSDT0_Core", vToken: "0xDa7Ce7Ba016d266645712e2e4Ebc6cC75eA8E4CD", underlying: "0x9151434b16b9763660705744891fA906F660EcC5" },
    { name: "vUNI_Core", vToken: "0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2", underlying: "0x8f187aA05619a017077f5308904739877ce9eA21" },
    { name: "vweETH_Core", vToken: "0x0170398083eb0D0387709523baFCA6426146C218", underlying: "0x7DCC39B4d1C53CB31e1aBc0e358b43987FEF80f7" },
    { name: "vwstETH_Core", vToken: "0xbEC19Bef402C697a7be315d3e59E5F65b89Fa1BB", underlying: "0xc02fE7317D4eb8753a02c35fe019786854A92001" },
  ],
};

export const opmainnet = {
  comptrollerCore: "0x5593FF68bE84C966821eEf5F0a988C285D5B7CeC",
  protocolShareReserve: "0x735ed037cB0dAcf90B133370C33C08764f88140a",
  nativeTokenGateway_vWETH: "0x5B1b7465cfDE450e267b562792b434277434413c",
  markets: [
    { name: "vWETH_Core", vToken: "0x66d5AE25731Ce99D46770745385e662C8e0B4025", underlying: "0x4200000000000000000000000000000000000006" },
    { name: "vWBTC_Core", vToken: "0x9EfdCfC2373f81D3DF24647B1c46e15268884c46", underlying: "0x68f180fcCe6836688e9084f035309E29Bf0A2095" },
    { name: "vUSDC_Core", vToken: "0x1C9406ee95B7af55F005996947b19F91B6D55b15", underlying: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85" },
    { name: "vUSDT_Core", vToken: "0x37ac9731B0B02df54975cd0c7240e0977a051721", underlying: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58" },
    { name: "vOP_Core", vToken: "0x6b846E3418455804C1920fA4CC7a31A51C659A2D", underlying: "0x4200000000000000000000000000000000000042" },
  ],
};

// Emits the drain sequence (A → B → C) for one remote chain. Order matters:
//   A. reduceReserves pushes vToken reserves into PSR,
//   B. releaseFunds then pushes PSR balances to their distribution targets
//      (VTreasuryV8 per the current on-chain config on all three chains),
//   C. sweepNative clears any residual native dust held by the gateway.
// Re-ordering would leak value (e.g. releasing before reducing leaves the
// fresh reserves stranded in PSR until a subsequent release).
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
  // `reduceReserves` is permissionless (callable by any keeper) but we include
  // it in the VIP for atomicity: the release in (B) should see the reserves
  // we just pushed, not a stale PSR balance. Amount is the snapshotted
  // `totalReserves` — safe because totalReserves only grows between snapshot
  // and execution (see header note). Markets with 0 reserves emit no call.
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

  // (B) Release PSR → configured distribution targets.
  // Permissionless (nonReentrant only). PSR routes per-asset balances to the
  // destinations registered via `addOrUpdateDistributionConfig`. On all three
  // target chains today, every destination resolves to `VTreasuryV8` (verified
  // in `chainState.json.psrDistribution`). One call per chain covers every
  // Core Pool underlying at once.
  commands.push({
    target: chain.protocolShareReserve,
    signature: "releaseFunds(address,address[])",
    params: [chain.comptrollerCore, chain.markets.map(m => m.underlying)],
    dstChainId,
  });

  // (C) Sweep NativeTokenGateway native balance to its owner.
  // `sweepNative()` is `onlyOwner`; the owner is the remote NormalTimelock
  // (which is what's running this batch), so the call is authorised. Funds
  // land on the NormalTimelock rather than VTreasuryV8 — forwarding to
  // treasury happens in Phase 2 to avoid needing a bespoke timelock selector
  // today. No-op when the gateway holds 0 native balance.
  if (nativeGateway) {
    commands.push({
      target: nativeGateway,
      signature: "sweepNative()",
      params: [],
      dstChainId,
    });
  }

  return commands;
};

export const vip999 = () => {
  const meta = {
    version: "v2",
    title: "VIP-999 Core Pool Sunset Phase 1 Step 2 — Drain Reserves to Treasury (opBNB, Unichain, Optimism)",
    description: `#### Summary

Second VIP of the Venus Core Pool sunset on **opBNB**, **Unichain**, and **Optimism**. Follows VIP-998 (which blocked new supply/borrow/enter-market and zeroed caps + collateral factor on every Core Pool market). This proposal drains protocol-held funds from the Core Pool into each chain's \`VTreasuryV8\`.

#### Actions (per chain)

1. **\`VToken.reduceReserves(snapshottedTotalReserves)\` on every Core Pool vToken.**
   Pushes vToken-held reserves into the chain's \`ProtocolShareReserve\`. The amount is the \`totalReserves\` value snapshotted right before proposal build (see \`simulations/vip-999/utils/chainState.json\`). This is safe because \`totalReserves\` is monotonically non-decreasing between snapshot and execution — interest accrual and repayments can only grow it, and nothing except \`reduceReserves\` itself can shrink it. Any dust that accrues between snapshot and execution is collected in the Phase 2 final sweep. Markets with \`totalReserves = 0\` emit no call.

2. **\`ProtocolShareReserve.releaseFunds(comptrollerCore, [underlyings])\`** once per chain.
   Permissionless (nonReentrant only). Routes each per-asset PSR balance to the destinations configured via \`addOrUpdateDistributionConfig\`. On all three target chains today, every configured destination resolves to \`VTreasuryV8\` (verified in the committed \`chainState.json.psrDistribution\` snapshot, and asserted by the simulation's conservation-of-value check).

3. **\`NativeTokenGateway.sweepNative()\` on each gateway.**
   Clears any residual native balance held by the gateway helper. The call is \`onlyOwner\` and the owner is the remote \`NormalTimelock\` (which is what's executing this batch). Funds land on the NormalTimelock rather than directly on \`VTreasuryV8\`; forwarding treasury-side happens in Phase 2 to avoid introducing a bespoke timelock selector today. No-op if the gateway holds 0 native.

#### Markets drained

- **opBNB** (PSR \`0xA2EDD515B75aBD009161B15909C19959484B0C1e\`, gateway \`0x7bAf6019C90B93aD30f8aD6a2EcCD2B11427b29f\`): vWBNB, vBTCB, vETH, vUSDT, vFDUSD.
- **Unichain** (PSR \`0x0A93fBcd7B53CE6D335cAB6784927082AD75B242\`, gateway \`0x4441aE3bCEd3210edbA35d0F7348C493E79F1C52\`): vWETH, vWBTC, vUSDC, vUSD₮0, vUNI, vweETH, vwstETH.
- **Optimism** (PSR \`0x735ed037cB0dAcf90B133370C33C08764f88140a\`, gateway \`0x5B1b7465cfDE450e267b562792b434277434413c\`): vWETH, vWBTC, vUSDC, vUSDT, vOP.

#### Out of scope for this VIP

Deferred to separate Guardian multisig proposals (ACM permissions for these selectors live on the per-chain Guardian multisig, not the remote NormalTimelock — executing them here would take the wrong path authority-wise regardless of whether the batch would fit):

- \`XVSVault.pause()\` on each chain.
- \`XVSBridgeAdmin.setMaxDailyReceiveLimit(102, 0)\` and \`setMaxSingleReceiveTransactionLimit(102, 0)\` (\`102\` is the LayerZero srcChainId for BNB Chain).

Deferred to **Phase 2**:

- Full action pause (REDEEM/REPAY/LIQUIDATE/SEIZE/TRANSFER/EXIT_MARKET), \`liquidationThreshold = 0\`, and \`unlistMarket\` on every Core Pool market.
- \`ProtocolShareReserve.removeDistributionConfig\` + final \`sweepToken\` dust cleanup.
- Unichain \`RewardsDistributor_Core_0.grantRewardToken(VTreasuryV8, 445355991426314711171)\` to reclaim residual XVS (~445.36 XVS), paired with \`unlistMarket\`.
- \`OmnichainGovernanceExecutor.pause()\` on Unichain and opBNB (last cross-chain action ever — after this, those chains can no longer receive VIPs; Optimism has no LZ executor to pause).
- Forward the \`NativeTokenGateway\` sweeps from the remote NormalTimelocks to \`VTreasuryV8\`.

#### Execution path

Commands targeting each remote chain are grouped by \`dstChainId\` into a single LayerZero payload per chain by \`makeProposal\`, sent through \`OmnichainProposalSender\` on BSC, and executed after the remote 48h timelock delay by the local \`OmnichainGovernanceExecutor\`.`,
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
      ...chainSection(
        opmainnet,
        opmainnet.nativeTokenGateway_vWETH,
        LzChainId.opmainnet,
        CHAIN_STATE.opmainnet,
      ),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip999;
