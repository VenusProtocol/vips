import { NETWORK_ADDRESSES } from "src/networkAddresses";

// ===================================================================================================
// VIP-680 [BNB Chain Mainnet] — Liquidity Hub (USDT) address book.
//
// STATUS: the Hub stack is NOT deployed on BNB Chain mainnet yet. venus-liquidity-hub/deployments/
// holds only bsctestnet/, and deploy/config/bscmainnet.json still ships 0x0 for acm / governance /
// fluxLendingResolver / feeRecipient. Every address in the "Hub stack" sections below is therefore a
// TODO placeholder that must be filled from venus-liquidity-hub/deployments/bscmainnet/<Name>.json
// once the deploy lands. Everything outside those sections is live and was verified on-chain.
//
// The fork simulation cannot pass while the placeholders are zero: testVip's "can be proposed" step
// runs validateTargetAddresses(), which requires bytecode at every target. That is expected, not a
// defect — see simulations/vip-680/bscmainnet.ts.
//
// Verified live on bscmainnet (2026-07-23):
//   - USDT.decimals() == 18  (NOTE: testnet USDT is 6-decimal; do not carry testnet amounts over)
//   - vUSDT.underlying()  == USDT
//   - fUSDT.asset()       == USDT, decimals 18, totalAssets ~2.98e24
//   - Comptroller.treasuryPercent() == 0 -> AdapterCoreV1.validateRegistration accepts vUSDT
//     (a non-zero per-redeem treasury fee would block Core registration)
//   - Of the four governance accounts, only NORMAL_TIMELOCK holds DEFAULT_ADMIN_ROLE on the ACM,
//     so this proposal must be REGULAR
//   - AuxiliaryCommandsAggregator: batchCount() == 2, owner() == NORMAL_TIMELOCK, and both
//     NORMAL_TIMELOCK and FAST_TRACK_TIMELOCK hold executeBatch(uint256). CRITICAL_TIMELOCK's grants
//     on it were revoked by VIP-645, which does not affect this proposal.
// ===================================================================================================

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN } =
  NETWORK_ADDRESSES.bscmainnet;

// ---------------------------------------------------------------------------------------------------
// Governance / access control (source: @venusprotocol/governance-contracts, via NETWORK_ADDRESSES).
// ---------------------------------------------------------------------------------------------------
export const ACM = ACCESS_CONTROL_MANAGER; // 0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555
export { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK };
// Granted nothing by this proposal. Exported so the simulation can assert they stay empty-handed.
export { CRITICAL_TIMELOCK, GUARDIAN };

// TODO(ops): the Operator account is not decided yet. It plays the tighten-only role (lower caps,
// pause, reorder queues) plus the operator-exclusive `reallocate`. Candidates are the Guardian
// multisig (NETWORK_ADDRESSES.bscmainnet.GUARDIAN, 0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B) or a
// dedicated operator account. Fill before running utils/seedAcmBatch.ts.
export const OPERATOR = "0x0000000000000000000000000000000000000000";

// ---------------------------------------------------------------------------------------------------
// ACM batching — AuxiliaryCommandsAggregator.
//
// The 96 ACM grants do not fit inline: 96 + 14 wiring commands = 110, above GovernorBravo's
// proposalMaxOperations of 100 (a hard revert in propose()), and far above the 16,777,216 per-tx gas
// cap. Pre-seeding them as one aggregator batch collapses them to three proposal commands.
//
// Every call in the batch targets the ACM itself — `giveCallPermission(contract, sig, account)` — so
// the aggregator never touches the Hub or the registry directly and needs no Hub permission. It only
// needs DEFAULT_ADMIN_ROLE on the ACM, which the VIP lends it for exactly one command and takes back
// in the same atomic transaction.
//
// The wiring commands stay inline on purpose. Their targets ARE the Hub and the registry, so batching
// them would require granting a shared, upgradeable contract standing Hub governance; and
// `acceptOwnership()` could not be batched at all, since Ownable2Step checks msg.sender against
// pendingOwner (the Timelock), which the aggregator is not.
//
// Source: governance-contracts/contracts/Utils/AuxiliaryCommandsAggregator.sol (develop).
// Address: deployments/bscmainnet/AuxiliaryCommandsAggregator.json, brought into service by VIP-628.
// ---------------------------------------------------------------------------------------------------
export const AUX_COMMANDS_AGGREGATOR = "0x528A428748dfE73DFcc844176B401475D1831057";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

// The batch slot this VIP's grants occupy. Shared by the proposal, the seed script and the
// simulation so all three agree on one value.
//
// TODO(ops): re-verify immediately before seeding. `batchCount()` read 2 on 2026-07-23, and batches
// are append-only, so any batch seeded by another VIP in the meantime shifts this. The seed script
// asserts `batchCount() == ACM_BATCH_INDEX` and uses the indexed `addBatch(calls, expectedIndex)`
// overload, which reverts `InvalidBatchIndex` rather than silently landing in the wrong slot — bump
// this constant and re-run if it trips.
export const ACM_BATCH_INDEX = 2;

// ---------------------------------------------------------------------------------------------------
// Hub stack — CALLED by the VIP.
// TODO(deploy): fill every address below from venus-liquidity-hub/deployments/bscmainnet/<Name>.json.
// ---------------------------------------------------------------------------------------------------
export const HUB_REGISTRY = "0x0000000000000000000000000000000000000000"; // HubRegistry.json
export const HUB_USDT = "0x0000000000000000000000000000000000000000"; // Hub_USDT.json
export const CORE_SOURCE_USDT = "0x0000000000000000000000000000000000000000"; // CoreSource_USDT.json
export const FRV_SOURCE_USDT = "0x0000000000000000000000000000000000000000"; // FRVSource_USDT.json
export const FLUX_SOURCE_USDT = "0x0000000000000000000000000000000000000000"; // FluxSource_USDT.json
export const ADAPTER_CORE_V1 = "0x0000000000000000000000000000000000000000"; // AdapterCoreV1.json
export const ADAPTER_FRV = "0x0000000000000000000000000000000000000000"; // AdapterFRV.json
export const ADAPTER_FLUX = "0x0000000000000000000000000000000000000000"; // AdapterFlux.json

// Ownable2Step contracts whose ownership is transferred to governance at deploy and must be accepted
// by the VIP. Until acceptOwnership() runs, the deployer EOA is still the LIVE owner and can repoint
// setAccessControlManager (onlyOwner), so accepting early retires that key.
export const OWNERSHIP_ACCEPT_TARGETS = [HUB_REGISTRY, HUB_USDT];

// ---------------------------------------------------------------------------------------------------
// Resources registered inside each source — CALLED by the VIP (addResource + inner queues).
// Live mainnet markets, verified on-chain. Cross-checked against
// venus-liquidity-hub/tests/foundry/fork/base/ForkAddresses.sol:74-97, which the repo's own mainnet
// fork suite binds against.
// ---------------------------------------------------------------------------------------------------
export const VUSDT_CORE = "0xfD5840Cd36d94D7229439859C0112a4185BC0255"; // @venusprotocol/venus-protocol core vUSDT
export const FUSDT_FLUX = "0xA5b8FCa32E5252B0B58EAbf1A8c79d958F8EE6A2"; // Fluid fUSDT fToken (ERC-4626)

// Underlying asset shared by the Hub and every resource above. 18 decimals on mainnet.
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

// NOTE: there is no FRV vault instance for USDT on mainnet — only the controller
// (0x6D9e91cB766259af42619c14c994E694E57e6E85), the loan-vault implementation and the position token.
// ForkAddresses.sol:88 confirms mainnet vault instances are created on-fork. The FRV YieldGroup is
// therefore registered by this VIP but left with no resource and kept out of both outer queues; a
// follow-up VIP wires it once a vault exists.

// ---------------------------------------------------------------------------------------------------
// Hub stack — REFERENCE ONLY (not called by the VIP; single-step Ownable, owned by governance at
// deploy, so no acceptOwnership). Recorded so the simulation can assert their owners.
// TODO(deploy): fill from venus-liquidity-hub/deployments/bscmainnet/<Name>.json.
// ---------------------------------------------------------------------------------------------------
export const HUB_BEACON = "0x0000000000000000000000000000000000000000";
export const CORE_BEACON = "0x0000000000000000000000000000000000000000";
export const FRV_BEACON = "0x0000000000000000000000000000000000000000";
export const FLUX_BEACON = "0x0000000000000000000000000000000000000000";
export const HUB_REGISTRY_PROXY_ADMIN = "0x0000000000000000000000000000000000000000";
export const MIGRATOR = "0x0000000000000000000000000000000000000000"; // immutable, permissionless — no wiring

// ---------------------------------------------------------------------------------------------------
// Cap constants for Hub.addYieldGroup(source, absoluteCap, percentageCapBps).
// ---------------------------------------------------------------------------------------------------
// The Hub rejects type(uint256).max as InvalidCap; type(uint128).max is the canonical "no ceiling".
export const ABSOLUTE_CAP_UNBOUNDED = "340282366920938463463374607431768211455"; // type(uint128).max
// 10_000 bps disables the percentage-of-TVL cap dimension, leaving only the absolute cap binding. It
// is also required for a fresh Hub: at TVL 0 any pct < 100% collapses the effective cap to zero and
// the first deposit could not land.
export const PERCENTAGE_CAP_DISABLED = 10_000;

// TODO(risk): mainnet launch caps are not decided. The values below mirror the testnet policy
// (uncapped) so the proposal is complete and reviewable; replace them with the risk team's numbers
// before proposing. Amounts are in USDT units — 18 decimals on mainnet, NOT the 6 used on testnet.
export const CORE_ABSOLUTE_CAP = ABSOLUTE_CAP_UNBOUNDED;
export const CORE_PERCENTAGE_CAP_BPS = PERCENTAGE_CAP_DISABLED;
export const FLUX_ABSOLUTE_CAP = ABSOLUTE_CAP_UNBOUNDED;
export const FLUX_PERCENTAGE_CAP_BPS = PERCENTAGE_CAP_DISABLED;
export const FRV_ABSOLUTE_CAP = ABSOLUTE_CAP_UNBOUNDED;
export const FRV_PERCENTAGE_CAP_BPS = PERCENTAGE_CAP_DISABLED;
