import { NETWORK_ADDRESSES } from "src/networkAddresses";

// ===================================================================================================
// VIP-664 [BNB Chain Testnet] — Centrifuge YieldGroup address book.
//
// Every address the VIP touches, in one place. The Centrifuge family and its source were deployed to
// bsctestnet on 2026-08-31 by venus-liquidity-hub scripts 08 and 09; the values below are the
// committed records in venus-liquidity-hub/deployments/bsctestnet/*.json. That repo is not published
// as an @venusprotocol/*-deployments npm package, so its addresses are inlined here, as VIP-650 does.
// Governance / ACM come from @venusprotocol/governance-contracts via NETWORK_ADDRESSES.
//
// Verified against a bsctestnet RPC after deployment (2026-08-31):
//   - CentrifugeSource_USDT.hub()   == HUB_USDT  (0x7cE6…dc61)
//   - CentrifugeSource_USDT.asset() == USDT      (0xA11c…782c) == Hub_USDT.asset()
//     -> addResource passes its ResourceAssetMismatch guard.
//   - AdapterCentrifuge.validateRegistration(MOCK_CENTRIFUGE_VAULT_USDT) does not revert
//     -> addResource will not revert on the adapter's own probe.
//   - MOCK_CENTRIFUGE_VAULT_USDT.pricePerShare() == 1_000_000 (testnet USDT has 6 decimals).
// ===================================================================================================

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN } =
  NETWORK_ADDRESSES.bsctestnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN };

// Testnet only: the Guardian multisig plays Operator and Keeper as well, matching VIP-650.
export const OPERATOR = GUARDIAN;
export const KEEPER = GUARDIAN;

// ---------------------------------------------------------------------------------------------------
// Existing Hub stack (deployed and wired by VIP-650). Reference, except HUB_USDT which is called.
// ---------------------------------------------------------------------------------------------------
export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61";
export const CORE_SOURCE_USDT = "0x11e39DC7b8b16BBDA8D9C2903dF741Ae9341Ec88";
export const FRV_SOURCE_USDT = "0xA0Fb0fFeBdcB7F45A3Ec841cCE7F78B7CeBD0f82";
export const FLUX_SOURCE_USDT = "0x044E572144bc08ed2D90E081EeEd7b5b6Cb01016";
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

// ---------------------------------------------------------------------------------------------------
// Centrifuge family — deployed by venus-liquidity-hub/deploy/08_DeployCentrifuge.s.sol.
// ---------------------------------------------------------------------------------------------------
export const ADAPTER_CENTRIFUGE = "0x78b5D33CB96546BEED3F2CeD7B95bc11bD330A35";
export const CENTRIFUGE_BEACON = "0xD5F75f510Fd01F40baA13C4410d548FCc5e57137"; // reference; owned by governance
export const YIELD_GROUP_CENTRIFUGE_IMPL = "0x07B13f1A527Be4777678c7B8F17e9bd1729D55cF"; // reference

// Source proxy for Hub_USDT — deployed by deploy/09_DeployCentrifugeSource.s.sol.
export const CENTRIFUGE_SOURCE_USDT = "0x28e5E0ce9c15E3dE00855C2dda7cA260B470FCC2";

// ---------------------------------------------------------------------------------------------------
// The fund registered as the Centrifuge resource.
//
// TESTNET MOCK, not a Centrifuge contract. Centrifuge has no BSC-testnet deployment — their `env/`
// covers sepolia, base-sepolia, arbitrum-sepolia and hyper-evm-testnet only — so there is no real
// ERC-7540 fund on chain 97 to register. This is
// venus-liquidity-hub/deploy/testnet/mocks/TestnetCentrifugeVault.sol, deployed by that repo's
// deploy/testnet/01_DeployMockCentrifuge.s.sol, which presents the surface AdapterCentrifuge reads
// and lets a fund-manager key drive the NAV and settle requests.
//
// The mainnet proposal registers the live JTRSY and/or JAAA vaults instead; this address has no
// mainnet counterpart and must never appear in one.
// ---------------------------------------------------------------------------------------------------
export const MOCK_CENTRIFUGE_VAULT_USDT = "0xbeF5909361D176a6E41C57134bAc071933B569D7";
export const MOCK_CENTRIFUGE_SHARE_USDT = "0x9b6e0AdEbE5cE92BAD399A44DCeEcf370eAc9fB2"; // reference

// ---------------------------------------------------------------------------------------------------
// Caps for Hub.addYieldGroup(source, absoluteCap, percentageCapBps) — testnet policy, unbounded.
// ---------------------------------------------------------------------------------------------------
export const ABSOLUTE_CAP_UNBOUNDED = "340282366920938463463374607431768211455"; // type(uint128).max
export const PERCENTAGE_CAP_DISABLED = 10_000;
