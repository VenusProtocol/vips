import { NETWORK_ADDRESSES } from "src/networkAddresses";

// ===================================================================================================
// VIP-680 [BNB Chain Testnet] — Liquidity Hub (USDT) address book.
//
// One reference for every address the VIP touches. The whole Hub stack (HubRegistry + per-asset Hub +
// Core/FRV/Flux sources + adapters) was REDEPLOYED at ~block 119,459,xxx; the values below are the
// current committed addresses from venus-liquidity-hub/deployments/bsctestnet/*.json. That repo is not
// published as an @venusprotocol/*-deployments npm package, so its addresses are inlined here (source
// file noted per section). Governance / ACM come from @venusprotocol/governance-contracts via
// NETWORK_ADDRESSES — the canonical source — so they are imported, never hardcoded.
//
// Verified on a bsctestnet fork/RPC (2026-07-16):
//   - Hub_USDT.asset() == vUSDT.underlying() == fUSDT.asset() == FRV_VAULT.asset() == USDT
//     (0xA11c…782c) -> addResource passes its ResourceAssetMismatch guard on every source.
//   - Hub_USDT.pendingOwner() == HubRegistry.pendingOwner() == NORMAL_TIMELOCK
//     -> both acceptOwnership() calls succeed from the Normal-timelock proposal.
//   - config.acm == ACM (0x45f8…);  config.governance == NORMAL_TIMELOCK (0xce10…).
// ===================================================================================================

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN } =
  NETWORK_ADDRESSES.bsctestnet;

// ---------------------------------------------------------------------------------------------------
// Governance / access control (source: @venusprotocol/governance-contracts, via NETWORK_ADDRESSES).
// ---------------------------------------------------------------------------------------------------
export const ACM = ACCESS_CONTROL_MANAGER; // 0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA
export { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN };
// The Guardian multisig plays the Operator role, and (testnet only) is topped up to full Governance.
export const OPERATOR = GUARDIAN; // 0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706

// ---------------------------------------------------------------------------------------------------
// Hub stack — CALLED by the VIP (source: venus-liquidity-hub/deployments/bsctestnet/*.json).
// ---------------------------------------------------------------------------------------------------
export const HUB_REGISTRY = "0x5346f648029d1D1d1034e09e8AD7a115f5D7A159"; // acceptOwnership + addHub target
// New HubRegistry implementation exposing the `assetForHub(hub)` reverse getter. The proxy above still
// runs the impl it was deployed with (no assetForHub); this VIP upgrades it via the ProxyAdmin below.
// Source: venus-liquidity-hub/deployments/bsctestnet/HubRegistryImpl.json (deployed at block 119,670,331).
export const HUB_REGISTRY_IMPL = "0x4D2C18fB4520c2e4f7C754979e9a4F3BbC1BCe92";
export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61"; // acceptOwnership + roles + wiring target
export const CORE_SOURCE_USDT = "0x11e39DC7b8b16BBDA8D9C2903dF741Ae9341Ec88";
export const FRV_SOURCE_USDT = "0xA0Fb0fFeBdcB7F45A3Ec841cCE7F78B7CeBD0f82";
export const FLUX_SOURCE_USDT = "0x044E572144bc08ed2D90E081EeEd7b5b6Cb01016";
export const ADAPTER_CORE_V1 = "0xDf669957448eCB23309eEFda4de230c62d22AE33";
export const ADAPTER_FRV = "0xeF0E85ab9A23F50EB4595CF7e2F5461feF7E7fc5";
export const ADAPTER_FLUX = "0x15Dca35ae0b16BeceabAEC9Dea49630e8C601730";

// Ownable2Step contracts whose ownership was transferred to governance at deploy and must be accepted
// (both are AccessControlledV8 -> Ownable2Step). The beacons and the ProxyAdmin are single-step Ownable
// (already owned by governance, no accept); the source proxies are ACM-only (not Ownable, no owner).
export const OWNERSHIP_ACCEPT_TARGETS = [HUB_USDT, HUB_REGISTRY];

// ---------------------------------------------------------------------------------------------------
// Resources registered inside each source — CALLED by the VIP (addResource + inner queues).
// ---------------------------------------------------------------------------------------------------
export const VUSDT_CORE = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A"; // @venusprotocol/venus-protocol core vUSDT
export const FRV_VAULT_USDT = "0x9F6Edab0123188C852854D2D9601115168f52F7a"; // new FRV vault (asset()==USDT, verified)
export const FUSDT_FLUX = "0x52217232e12A1c906aB8DEf58532a3618970D025"; // Fluid fUSDT fToken (ERC-4626)

// Underlying asset shared by the Hub and every resource above.
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

// ---------------------------------------------------------------------------------------------------
// Hub stack — REFERENCE ONLY (not called by the VIP; owned by governance at deploy).
// ---------------------------------------------------------------------------------------------------
export const HUB_BEACON = "0x7cbaC6991aC33DaFDD347e84CFbE2F372b936d92";
export const CORE_BEACON = "0xbBEe25aE7d2Db035Afc327fb0096fC88FDfF3170";
export const FRV_BEACON = "0x6196Ec22133610132563B03b6Fad5aa766A9C037";
export const FLUX_BEACON = "0x6b9CA74F82848668EA04D56E0A8396A816ba5330";
// CALLED by this VIP: Normal-Timelock-owned ProxyAdmin that upgrades the HubRegistry proxy to HUB_REGISTRY_IMPL.
export const HUB_REGISTRY_PROXY_ADMIN = "0x9f8413eEE33D434F6D4f40C83181f32A831c9ef7";
export const MIGRATOR = "0x343D518d8C89f9B5D770000F1ed80f45bF1419f5"; // immutable, permissionless — no wiring

// ---------------------------------------------------------------------------------------------------
// Cap constants for Hub.addYieldGroup(source, absoluteCap, percentageCapBps).
// ---------------------------------------------------------------------------------------------------
// The Hub rejects type(uint256).max as InvalidCap; type(uint128).max is the canonical "no ceiling".
export const ABSOLUTE_CAP_UNBOUNDED = "340282366920938463463374607431768211455"; // type(uint128).max
// 10_000 bps disables the percentage-of-TVL cap dimension, leaving only the absolute cap binding.
export const PERCENTAGE_CAP_DISABLED = 10_000;
