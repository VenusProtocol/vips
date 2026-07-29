import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

// ===================================================================================================
// VIP-680 [BNB Chain Mainnet] — Liquidity Hub address book. Launch set: THREE Hubs, one per asset
// (USDT, USDC, U). One Hub proxy + three source proxies (Core / Flux / FRV) per asset; the registry,
// the three adapters, the four beacons and the Migrator are shared once per chain.
//
// STATUS: the Hub stack is DEPLOYED on BNB Chain mainnet. Every address below is filled from
// venus-liquidity-hub/deployments/bscmainnet/<Name>.json and verified on-chain (see below).
//
// Verified live on bscmainnet (2026-07-29, block ~112.78M):
//   - USDT / USDC / U all decimals() == 18, so caps below are in 18-dec asset units uniformly.
//   - Every Core vToken.underlying() and Flux fToken.asset() equals its asset (all six).
//   - Per stack (all 36 bindings): hub.asset() == asset, hub.pendingOwner() == NORMAL_TIMELOCK,
//     hub.accessControlManager() == ACM; and every Core/Flux/FRV source hub()/asset()/
//     accessControlManager() correct. The sources have NO setter for _accessControlManager/_hub, so
//     this binding is unrepairable and the check is load-bearing.
//   - HubRegistry pendingOwner() == NORMAL_TIMELOCK and accessControlManager() == ACM; all four
//     beacons and the registry ProxyAdmin owner() == NORMAL_TIMELOCK; AdapterFlux resolver == Fluid
//     LendingResolver 0x48D32f49aFeAEC7AE66ad7B9264f446fc11a1569.
//   - Of the four governance accounts, only NORMAL_TIMELOCK holds DEFAULT_ADMIN_ROLE on the ACM, so
//     this proposal must be REGULAR.
//   - AuxiliaryCommandsAggregator batchCount() == 2 (== ACM_BATCH_INDEX_BASE), owner() ==
//     NORMAL_TIMELOCK; NORMAL and FAST_TRACK hold executeBatch(uint256).
// ===================================================================================================

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN } =
  NETWORK_ADDRESSES.bscmainnet;

export const ACM = ACCESS_CONTROL_MANAGER; // 0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555
export { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK };
export { GUARDIAN }; // 0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B
// Granted nothing by this proposal. Exported so the simulation can assert it stays empty-handed.
export { CRITICAL_TIMELOCK };

// The Operator (routine keeper): raise/lower caps, reorder queues, pause, plus the operator-exclusive
// `reallocate`. Distinct from the Guardian.
export const OPERATOR: string = "0x83f426233B358A36953F6951161E76FB7c866a7A";

// ---------------------------------------------------------------------------------------------------
// ACM batching — AuxiliaryCommandsAggregator.
//
// All 233 ACM grants (77 per asset x3 + 2 registry) far exceed both GovernorBravo's
// proposalMaxOperations of 100 and the 16,777,216 per-tx gas cap. They are pre-seeded as THREE batches
// (one per asset; the registry's two grants ride in the USDT batch) and replayed by three executeBatch
// commands, holding the aggregator's DEFAULT_ADMIN_ROLE only transiently. One batch per asset keeps
// each executeBatch (~79 grants) comfortably under the per-tx gas cap.
//
// Every call in every batch targets the ACM itself — giveCallPermission(contract, sig, account) — so
// the aggregator never touches a Hub or the registry directly and needs no permission on them.
//
// Source: governance-contracts/contracts/Utils/AuxiliaryCommandsAggregator.sol (develop).
// Address: deployments/bscmainnet/AuxiliaryCommandsAggregator.json, brought into service by VIP-628.
// ---------------------------------------------------------------------------------------------------
export const AUX_COMMANDS_AGGREGATOR = "0x528A428748dfE73DFcc844176B401475D1831057";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

// The first of three consecutive batch slots this VIP occupies: USDT = base, USDC = base+1, U = base+2.
//
// TODO(ops): re-verify immediately before seeding. Batches are append-only, so any batch seeded by
// another VIP in the meantime shifts this. The seed script asserts batchCount() == base and uses the
// indexed addBatch(calls, expectedIndex) overload (reverts InvalidBatchIndex), so a stale value trips
// loudly rather than landing grants in the wrong slot — bump this and re-run if it does.
export const ACM_BATCH_INDEX_BASE = 2;

// ---------------------------------------------------------------------------------------------------
// Shared Hub infrastructure — one deployment per chain.
// ---------------------------------------------------------------------------------------------------
export const HUB_REGISTRY: string = "0x4196932b0c76A114178236C00A5e140f27866790"; // HubRegistry.json — CALLED (acceptOwnership, addHub)
export const ADAPTER_CORE_V1 = "0x4E514a0C7aB9d140eE204dfA0017574270D92944"; // AdapterCoreV1.json — shared by every Core source
export const ADAPTER_FRV = "0x1FA0365bDd603452CE96BE3c0e12Db5515a35902"; // AdapterFRV.json — shared (unused until a vault exists)
export const ADAPTER_FLUX = "0xA81bDf813A428053E764C34Bc679b3E4d0807be3"; // AdapterFlux.json — shared by every Flux source

// Reference only (not called by the VIP). Recorded so the simulation can assert owners.
export const HUB_BEACON = "0x0f20e1004962e2DF16c16FC15460Dc6480626321";
export const CORE_BEACON = "0x195a0F1BCF73C3Beb609a1271E8E08b8E4c098C6";
export const FRV_BEACON = "0x8A5EceDD726246682402430b9B24c19bF61B7f1d";
export const FLUX_BEACON = "0x9bb6a3Ac5955fA8dc236560CA9D51483d1d79f15";
export const HUB_REGISTRY_PROXY_ADMIN = "0x3E2fbA605c1d9D470FB2691c4AA59Eb0570caB3E";
export const MIGRATOR = "0xfe6b8BEf1215C19Cd247FbF495ef560932F1Eb9B"; // immutable, permissionless — no wiring

// ---------------------------------------------------------------------------------------------------
// Per-asset Hub stacks, all deployed and verified on-chain (2026-07-29). `asset` / `vToken` / `fToken`
// are the live underlying + resources; `hub` / `core` / `flux` / `frv` are the BeaconProxy instances
// from deploy script 06 (deployments/bscmainnet/{Hub,CoreSource,FluxSource,FRVSource}_<KEY>.json).
// Every vToken.underlying() and fToken.asset() equals `asset`; every source is bound to its `hub` and
// `asset` and to the canonical ACM (checked on-chain, see header).
// ---------------------------------------------------------------------------------------------------
export interface HubStack {
  key: string;
  asset: string;
  vToken: string; // Core resource (Venus vToken)
  fToken: string; // Flux resource (Fluid fToken)
  hub: string;
  core: string;
  flux: string;
  frv: string;
}

export const STACKS: HubStack[] = [
  {
    key: "USDT",
    asset: "0x55d398326f99059fF775485246999027B3197955",
    vToken: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    fToken: "0xA5b8FCa32E5252B0B58EAbf1A8c79d958F8EE6A2",
    hub: "0x18AfDACF30F8671021dec4b78297E39d2FE87226",
    core: "0xC9E6ceD9589363f8dC5695Be2C79AB4dDaECC94B",
    flux: "0xe3df38E12E37ED80E1b3ccf2bdf84F9e1527ce14",
    frv: "0x621eF38cE0C4e7060fF0bF3D609E3D46EC144bE7",
  },
  {
    key: "USDC",
    asset: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    vToken: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    fToken: "0xfE60462E93cee34319F48Cfc6AcFbc13c2882Df9",
    hub: "0x9D2D9592cF8DFbf59107fAab703d08494BE14617",
    core: "0x299D9Be7CEfff91c68F13F267d525CFC18e965ef",
    flux: "0xA65bB4b20542268B64CF08871a98D75342AFE927",
    frv: "0x438388847eE16850Ab4f5b82dc7954c0d043B716",
  },
  {
    key: "U",
    asset: "0xcE24439F2D9C6a2289F741120FE202248B666666",
    vToken: "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E",
    fToken: "0x007df53Cda786450Cf8145a73B2748B241a0069c",
    hub: "0x0e5AA174d4F31b757a237eb1999DE151596788B0",
    core: "0x8A680F77A5367FA7cD33a02f51896Cb1d55159c3",
    flux: "0xe31B8851c3fa9B3dD39a04a2ed9493869A410616",
    frv: "0x30908eddB9E94add7AC9944a0adda66d80B89143",
  },
];

// ---------------------------------------------------------------------------------------------------
// Cap constants for Hub.addYieldGroup(source, absoluteCap, percentageCapBps). Identical for all three
// assets (all 18-dec), per the shipment plan's routing & caps worksheet.
//   - Core: absolute 2B, percentage 100% (the 10_000 sentinel disables the percentage dimension, so the
//     absolute cap alone binds and the first deposit lands in Core from block one).
//   - Flux: absolute 7M, percentage 20% of live TVL. At TVL 0 the effective cap is 0, so Flux fills only
//     via Operator `reallocate` once Core holds funds — the intended "deposits to Core, rebalance to
//     Flux" policy (Hub._effectiveCap, Open item 3).
//   - FRV: absolute 5M, percentage 30%. Stored config only — FRV is registered but has no resource and
//     is out of both outer queues, so nothing routes to it until a later VIP wires a vault.
// ---------------------------------------------------------------------------------------------------
// 10_000 bps == BPS_DENOMINATOR: percentage cap disabled, absolute cap only.
export const PERCENTAGE_CAP_DISABLED = 10_000;

export const CORE_ABSOLUTE_CAP = parseUnits("2000000000", 18).toString(); // 2,000,000,000 tokens
export const CORE_PERCENTAGE_CAP_BPS = PERCENTAGE_CAP_DISABLED; // 100% -> absolute only
export const FLUX_ABSOLUTE_CAP = parseUnits("7000000", 18).toString(); // 7,000,000 tokens
export const FLUX_PERCENTAGE_CAP_BPS = 2_000; // 20% of TVL
export const FRV_ABSOLUTE_CAP = parseUnits("5000000", 18).toString(); // 5,000,000 tokens
export const FRV_PERCENTAGE_CAP_BPS = 3_000; // 30% of TVL
