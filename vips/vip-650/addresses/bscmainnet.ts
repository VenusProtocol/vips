import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

// ===================================================================================================
// VIP-650 / VIP-651 [BNB Chain Mainnet] — Liquidity Hub address book, shared by BOTH onboarding proposals in
// this directory (bscmainnet-part-1.ts = USDT + USDC, bscmainnet-part-2.ts = U). Launch set: THREE
// Hubs, one per asset. One Hub proxy + three source proxies (Core / Flux / FRV) per asset; the
// registry, the three adapters, the four beacons and the Migrator are shared once per chain.
//
// STATUS: the Hub stack is DEPLOYED on BNB Chain mainnet. Every address below is filled from
// venus-liquidity-hub/deployments/bscmainnet/<Name>.json and verified on-chain (see below).
//
// Verified live on bscmainnet (2026-07-29 for the Hub stacks, 2026-07-31 for the registry):
//   - USDT / USDC / U all decimals() == 18, so caps below are in 18-dec asset units uniformly.
//   - Every Core vToken.underlying() and Flux fToken.asset() equals its asset (all six).
//   - Per stack (all 36 bindings): hub.asset() == asset, hub.pendingOwner() == NORMAL_TIMELOCK,
//     hub.accessControlManager() == ACM; and every Core/Flux/FRV source hub()/asset()/
//     accessControlManager() correct. The sources have NO setter for _accessControlManager/_hub, so
//     this binding is unrepairable and the check is load-bearing.
//   - HubRegistry pendingOwner() == NORMAL_TIMELOCK, accessControlManager() == ACM, getHubsCount() == 0;
//     its EIP-1967 admin slot holds DEFAULT_PROXY_ADMIN, whose getProxyImplementation() returns the
//     implementation recorded in HubRegistryImpl.json (0x4426a09d5425ca2103896A88C1e9a1F5779a4d3a).
//   - All four beacons and DEFAULT_PROXY_ADMIN owner() == NORMAL_TIMELOCK; AdapterFlux resolver ==
//     Fluid LendingResolver 0x48D32f49aFeAEC7AE66ad7B9264f446fc11a1569.
//   - Of the four governance accounts, only NORMAL_TIMELOCK holds DEFAULT_ADMIN_ROLE on the ACM, so
//     this proposal must be REGULAR.
//   - AuxiliaryCommandsAggregator owner() == NORMAL_TIMELOCK; NORMAL and FAST_TRACK hold
//     executeBatch(uint256). batchCount() == 5, i.e. both parts' batches are stored (see below).
// ===================================================================================================

const {
  ACCESS_CONTROL_MANAGER,
  NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK,
  GUARDIAN,
  VTREASURY,
  DEFAULT_PROXY_ADMIN,
} = NETWORK_ADDRESSES.bscmainnet;

export const ACM = ACCESS_CONTROL_MANAGER; // 0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555
export { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK };
export { GUARDIAN }; // 0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B
// Granted nothing by this proposal. Exported so the simulation can assert it stays empty-handed.
export { CRITICAL_TIMELOCK };

// The Operator (routine keeper): raise/lower caps, reorder queues, pause, plus the operator-exclusive
// `reallocate`. Distinct from the Guardian.
export const OPERATOR: string = "0x83f426233B358A36953F6951161E76FB7c866a7A";

// ---------------------------------------------------------------------------------------------------
// Bootstrap deposit. Each Hub is seeded from the Treasury in the same proposal, so governance is the
// first depositor and totalSupply is never 0. Shares go to the burn address rather than the Treasury:
// a redeemable seed could be withdrawn later, returning supply to 0 and re-opening `_deposit`'s
// refill-from-empty branch. Defence in depth only — the deployed decimalsOffset of 6 is what actually
// makes a first-deposit inflation attack non-griefing.
//
// The receiver cannot be address(0): ERC4626 `_deposit` ends in `_mint`, which rejects it.
//
// withdrawTreasuryBEP20 is onlyOwner (not ACM-gated) and the Treasury owner is the Normal Timelock,
// so no grant is needed. It SILENTLY CLAMPS to the treasury balance instead of reverting when short,
// which is why the simulation asserts that balance up front.
// ---------------------------------------------------------------------------------------------------
export { VTREASURY };
export const BOOTSTRAP_RECEIVER = "0x000000000000000000000000000000000000dEaD";
export const BOOTSTRAP_SEED = parseUnits("10", 18).toString(); // 10 tokens per asset (all 18-dec)

// ---------------------------------------------------------------------------------------------------
// ACM batching — AuxiliaryCommandsAggregator, brought into service by VIP-628.
//
// All 234 grants (77 per asset x3, plus 2 registry grants in part 1 and the redundant `addHub`
// re-grant in part 2) exceed both GovernorBravo's proposalMaxOperations of 100 and the per-tx gas cap.
// They are pre-seeded one batch per asset and replayed by executeBatch, with the aggregator holding
// DEFAULT_ADMIN_ROLE only for the duration of the proposal.
// ---------------------------------------------------------------------------------------------------
export const AUX_COMMANDS_AGGREGATOR = "0x528A428748dfE73DFcc844176B401475D1831057";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

// Part 1 takes two consecutive slots (USDT = base, USDC = base+1), part 2 one. Each part pins its own
// base rather than deriving part 2's from part 1's: batches are append-only, so anything another VIP
// appends between the two seeding runs would shift part 2 alone.
//
// SEEDED AND VERIFIED ON MAINNET by provisionAcmBatches.ts:
//   index 2  block 113,735,454  79 calls (USDT + the registry's addHub/removeHub)
//   index 3  block 113,735,462  77 calls (USDC)
//   index 4  block 113,735,798  78 calls (U + the redundant addHub re-grant)
// The script read each one back call-for-call after storing it, and the simulations deep-compare the
// stored bytes against the builder on every run. These indices are frozen: changing any role string,
// address or cap invalidates the stored batches, which would then have to be re-seeded at new slots.
export const ACM_BATCH_INDEX_BASE_PART_1 = 2;
export const ACM_BATCH_INDEX_BASE_PART_2 = 4;

// ---------------------------------------------------------------------------------------------------
// Shared Hub infrastructure — one deployment per chain.
// ---------------------------------------------------------------------------------------------------
export const HUB_REGISTRY: string = "0x6D93Fd479f2d37445CFBe132412e316a0364acc2"; // HubRegistry.json — CALLED (acceptOwnership, addHub)
export const ADAPTER_CORE_V1 = "0x4E514a0C7aB9d140eE204dfA0017574270D92944"; // AdapterCoreV1.json — shared by every Core source
export const ADAPTER_FRV = "0x1FA0365bDd603452CE96BE3c0e12Db5515a35902"; // AdapterFRV.json — shared (unused until a vault exists)
export const ADAPTER_FLUX = "0xA81bDf813A428053E764C34Bc679b3E4d0807be3"; // AdapterFlux.json — shared by every Flux source

// Not called by the VIP. Recorded so the simulation can assert who may replace the implementation
// behind every proxy in the launch set.
export const HUB_BEACON = "0x0f20e1004962e2DF16c16FC15460Dc6480626321";
export const CORE_BEACON = "0x195a0F1BCF73C3Beb609a1271E8E08b8E4c098C6";
export const FRV_BEACON = "0x8A5EceDD726246682402430b9B24c19bF61B7f1d";
export const FLUX_BEACON = "0x9bb6a3Ac5955fA8dc236560CA9D51483d1d79f15";
export { DEFAULT_PROXY_ADMIN }; // 0x6beb6D2695B67FEb73ad4f172E8E2975497187e4 — admins the HubRegistry proxy

// Deliberately not asserted anywhere: the Migrator is non-upgradeable with no owner and no ACM, so
// there is nothing to wire and nothing to check.
export const MIGRATOR = "0xfe6b8BEf1215C19Cd247FbF495ef560932F1Eb9B";

// ---------------------------------------------------------------------------------------------------
// Per-asset Hub stacks. `asset` / `vToken` / `fToken` are the live underlying and resources; the rest
// are BeaconProxy instances from deployments/bscmainnet/{Hub,CoreSource,FluxSource,FRVSource}_<KEY>.
// Bindings verified on-chain — see the header.
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

// Part 1 takes USDT and USDC, part 2 takes U. See commands.ts for why the launch set is split.
export const STACKS_PART_1: HubStack[] = [
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
];

export const STACKS_PART_2: HubStack[] = [
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

// Neither proposal iterates this; the simulations use it to assert the end state after both parts.
export const STACKS: HubStack[] = [...STACKS_PART_1, ...STACKS_PART_2];

// ---------------------------------------------------------------------------------------------------
// Caps for Hub.addYieldGroup(source, absoluteCap, percentageCapBps), from the shipment plan's routing
// worksheet. Identical for all three assets, which are all 18-decimal. `_effectiveCap` takes the lower
// of the two dimensions, so:
//   - Core binds on its absolute cap alone and takes deposits from block one.
//   - Flux is held to 20% of TVL, well under its absolute cap at launch, so it fills via Operator
//     `reallocate` rather than from the deposit queue.
//   - FRV is stored config only until a later VIP wires a vault. See stackCommands() in commands.ts
//     for why it is still listed last in the withdraw queue.
// ---------------------------------------------------------------------------------------------------
// The 10_000 sentinel equals BPS_DENOMINATOR, which disables the percentage dimension entirely.
export const PERCENTAGE_CAP_DISABLED = 10_000;

export const CORE_ABSOLUTE_CAP = parseUnits("2000000000", 18).toString(); // 2,000,000,000 tokens
export const CORE_PERCENTAGE_CAP_BPS = PERCENTAGE_CAP_DISABLED; // 100% -> absolute only
export const FLUX_ABSOLUTE_CAP = parseUnits("7000000", 18).toString(); // 7,000,000 tokens
export const FLUX_PERCENTAGE_CAP_BPS = 2_000; // 20% of TVL
export const FRV_ABSOLUTE_CAP = parseUnits("5000000", 18).toString(); // 5,000,000 tokens
export const FRV_PERCENTAGE_CAP_BPS = 3_000; // 30% of TVL
