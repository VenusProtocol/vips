import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// ===== Core protocol contracts =====
export const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const RISK_FUND_V2 = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const SHORTFALL = "0xf37530A8a810Fcb501AA0Ecd0B0699388F0F2209";
export const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
export const CORE_COMPTROLLER = bscmainnet.UNITROLLER;

// ===== Allowlisted swap routers (passed to helper.execute) =====
export const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // PCS V2
export const PANCAKE_V3_ROUTER = "0x1b81D678ffb9C0263b24A97847620C99d213eB14";
export const PANCAKE_SMART_ROUTER = "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4";
export const PANCAKE_UNIVERSAL_ROUTER = "0xd9C500DfF816a1Da21A48A732d3498Bf09dc9AEB";
export const ONEINCH_ROUTER = "0x1111111254EEB25477B68fb85Ed929f73A960582";
export const UNIV2_SWAP_ROUTER_02 = "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24";
export const UNIV3_SWAP_ROUTER_02 = "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2";
export const UNIV4_SWAP_ROUTER = "0x8b844f885672f333bc0042cb669255f93a4c1e6b";
export const UNI_UNIVERSAL_ROUTER = "0x1906c1d672b88cd1b9ac7593301ca990f94eae07";

export const ALLOWED_ROUTERS: string[] = [
  PANCAKE_ROUTER,
  PANCAKE_V3_ROUTER,
  PANCAKE_SMART_ROUTER,
  PANCAKE_UNIVERSAL_ROUTER,
  ONEINCH_ROUTER,
  UNIV2_SWAP_ROUTER_02,
  UNIV3_SWAP_ROUTER_02,
  UNIV4_SWAP_ROUTER,
  UNI_UNIVERSAL_ROUTER,
];

// ===== Core pool ERC20 universe (must mirror helper's _coreTokens()) =====
// Universe of every underlying that any market in the BSC core Unitroller
// reports via `vToken.underlying()`. Helper iterates this list against each
// timelock-owned converter and skips zero balances. The list is asserted in
// the simulation to be a superset of the converters' actual non-zero token set.
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
export const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
export const TUSD = "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9";
export const TUSDOLD = "0x14016E85a25aeb13065688cAFB43044C2ef86784";
export const FDUSD = "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409";
export const USDe = "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34";
export const sUSDe = "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2";
export const USD1 = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";
export const lisUSD = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const LTC = "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94";
export const XRP = "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE";
export const BCH = "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf";
export const DOT = "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402";
export const LINK = "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD";
export const FIL = "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153";
export const ADA = "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47";
export const DOGE = "0xbA2aE424d960c26247Dd6c32edC70B295c744C43";
export const MATIC = "0xCC42724C6683B7E57334c4E856f4c9965ED682bD";
export const TRX = "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3";
export const TRXOLD = "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B";
export const SOL = "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF";
export const UNI = "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1";
export const AAVE = "0xfb6115445Bff7b52FeB98650C87f44907E58f802";
export const SXP = "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const CAN = "0x20bff4bbEDa07536FF00e073bd8359E5D80D733d";
export const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
export const TWT = "0x4B0F1812e5Df2A09796481Ff14017e6005508003";
export const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";
export const VU = "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E";
export const XAUM = "0x23AE4fd8E7844cdBc97775496eBd0E8248656028";
export const UST = "0x3d4350cD54aeF9f9b2C29435e0fa809957B3F30a";
export const LUNA = "0x156ab3346823B651294766e23e6Cf87254d68962";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const BETH = "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B";
export const WBETH = "0xa2E3356610840701BDf5611a53974510Ae27E2e1";
export const slisBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
export const asBNB = "0x77734e70b6E88b4d82fE632a168EDf6e700912b6";
export const SolvBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
export const xSolvBTC = "0x1346b618dC92810EC74163e4c27004c921D446a5";
export const PT_sUSDE_26JUN2025 = "0xDD809435ba6c9d6903730f923038801781cA66ce";
export const PT_USDe_30OCT2025 = "0x607C834cfb7FCBbb341Cbe23f77A6E83bCf3F55c";
export const PT_clisBNB_25JUN2026 = "0xe052823b4aefc6e230FAf46231A57d0905E30AE0";

export const CORE_TOKENS: string[] = [
  USDT,
  USDC,
  BUSD,
  DAI,
  TUSD,
  TUSDOLD,
  FDUSD,
  USDe,
  sUSDe,
  USD1,
  lisUSD,
  BTCB,
  ETH,
  LTC,
  XRP,
  BCH,
  DOT,
  LINK,
  FIL,
  ADA,
  DOGE,
  MATIC,
  TRX,
  TRXOLD,
  SOL,
  UNI,
  AAVE,
  SXP,
  XVS,
  CAN,
  CAKE,
  TWT,
  THE,
  U,
  XAUM,
  UST,
  LUNA,
  WBNB,
  BETH,
  WBETH,
  slisBNB,
  asBNB,
  SolvBTC,
  xSolvBTC,
  PT_sUSDE_26JUN2025,
  PT_USDe_30OCT2025,
  PT_clisBNB_25JUN2026,
];

// ===== Legacy converters =====
export const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
export const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";
export const WBNB_BURN_CONVERTER = "0x9eF79830e626C8ccA7e46DCEd1F90e51E7cFCeBE";
export const CONVERTER_NETWORK = "0xF7Caad5CeB0209165f2dFE71c92aDe14d0F15995";

export const TIMELOCK_OWNED_CONVERTERS: string[] = [
  RISK_FUND_CONVERTER,
  USDT_PRIME_CONVERTER,
  USDC_PRIME_CONVERTER,
  BTCB_PRIME_CONVERTER,
  ETH_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
];

// ===== New TokenBuyback proxies (10 instances) =====
export const RISK_FUND_BUYBACK     = "0xfffB20c23650B27126815994f3F07eF6B46aea60";
export const USDT_PRIME_BUYBACK    = "0x0191Bb3CD28A96691F5EC5066ad42A0373ae11C6";
export const U_PRIME_BUYBACK       = "0xFd50bd4107705929df73Ac683BD505232BA9E9dB";
export const XVS_BUYBACK           = "0xBaAc819aE93b29fA6512a095CA00255a4F05b027";
export const U_TREASURY_BUYBACK    = "0xef7cb42a7EBD4b011905D20Fc8038a603c3f22E4";
export const BTCB_TREASURY_BUYBACK = "0x69739FF52e90BC93dCaEd5a2431072b5082d326D";
export const ETH_TREASURY_BUYBACK  = "0x9e0543F9E09fb5b8a58F73d11967DC894dbD40a7";
export const USDT_TREASURY_BUYBACK = "0xBF858c95D778022b48E6Ad343D3d644017fb0ca7";
export const USDC_TREASURY_BUYBACK = "0xFB5FA544dBf39983198BDD01e2c26E3AB597e22A";
export const XVS_TREASURY_BUYBACK  = "0x01D0f07D389692D386EB8D09Da3bbCa5C83be551";

export const BUYBACKS: string[] = [
  RISK_FUND_BUYBACK,
  USDT_PRIME_BUYBACK,
  U_PRIME_BUYBACK,
  XVS_BUYBACK,
  U_TREASURY_BUYBACK,
  BTCB_TREASURY_BUYBACK,
  ETH_TREASURY_BUYBACK,
  USDT_TREASURY_BUYBACK,
  USDC_TREASURY_BUYBACK,
  XVS_TREASURY_BUYBACK,
];

// Targets that the VIP must accept ownership of from the helper after `execute()`
// hands them back. Order matches helper's _handBackOwnership for legibility.
export const HELPER_RETURNED_OWNERSHIPS: string[] = [...BUYBACKS, ...TIMELOCK_OWNED_CONVERTERS];

// ===== New RiskFundV2 implementation =====
export const NEW_RISK_FUND_V2_IMPL = "0x01BE9c56A0844040b2c1a684B1a72cE88489486a"; 
// ===== TokenBuyback migration helper =====
export const MIGRATION_HELPER = "0x34c62aFcF8Bb18614329fC4d3266a9aFd82A8bdc";

// ===== Cron operator =====
export const OPERATOR = "0x88ac9ca69a371f47798df18e5c36449af44526a4"; 

// AccessControl `DEFAULT_ADMIN_ROLE` (OZ AccessControl) — the admin role on the
// AccessControlManager. Granting it to the helper lets `execute()` self-grant
// transient ACM permissions and renounce them at the end of the call.
const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;

// ===== May 2026 Prime Rewards Allocation (USDT + U) =====
// USDT/U pool at fee tier 100 (0.01%) — pool 0xA0909f81785f87f3e79309F0E73A7d82208094E4
// holds ~8.75M USDT + ~10.13M U with active liquidity at price ≈ 1.0. Tier 500 has no
// pool; tier 2500 is dust (1 wei). Tier 100 is the only viable choice.
export const PANCAKE_V3_FEE_TIER = 100;

// Amounts: $24.5K total, 50/50 split between USDT and U (both $1).
export const USDT_TO_SWEEP = parseUnits("12250", 18);
export const USDT_TO_SWAP = parseUnits("12250", 18);
// 1% slippage floor on a stable/stable swap. Pool is at peg with a 1bp fee, so realised
// output should be ~12,248.7 U; the surplus above U_MIN_OUT is delivered straight to PLP
// (recipient = PRIME_LIQUIDITY_PROVIDER), so nothing strands in NormalTimelock.
export const U_MIN_OUT = parseUnits("12127.5", 18);

// Prime multipliers for vU (matches USDT/USDC supply-only convention).
export const SUPPLY_MULTIPLIER = parseUnits("2", 18);
export const BORROW_MULTIPLIER = 0;

// Distribution speeds (PLP is block-based on BSC).
// BSC ≈ 0.45 s/block (empirical, sampled 100k blocks) → 192,000 blocks/day → 5,760,000 / month.
export const REWARD_PER_MARKET_PER_MONTH = parseUnits("12250", 18);
export const BSC_BLOCKS_PER_MONTH = 30 * 192_000;
export const NEW_PRIME_SPEED_FOR_USDT = REWARD_PER_MARKET_PER_MONTH.div(BSC_BLOCKS_PER_MONTH);
export const NEW_PRIME_SPEED_FOR_U = REWARD_PER_MARKET_PER_MONTH.div(BSC_BLOCKS_PER_MONTH);

// 14-day swap deadline (mirrors VIP-580).
export const SWAP_DEADLINE = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14;

// Helper.execute() — no parameters; every drain-token list and every router
// address is hardcoded as a `constant` inside the helper source.
const HELPER_EXECUTE_SIG = "execute()";

export const vip800 = () => {
  const meta = {
    version: "v2",
    title: "VIP-800 TokenBuyback migration",
    description: `#### Summary

If passed, this VIP replaces the community-driven Token Converter system (RiskFundConverter + 4 *PrimeConverter + XVSVaultConverter + WBNBBurnConverter + ConverterNetwork) with **10 ACM-authorized TokenBuyback proxies** driven by a finance-team cron. BSC-only; this VIP targets **BNB Chain**.

The bulk of the migration (drain, router allowlisting, ACM grants, converter pause, ProtocolShareReserve rewiring, ownership normalization) is performed atomically by a single one-shot helper contract, **TokenBuybackMigrationHelper**. The helper is gated by NormalTimelock, runs in a single \`execute()\` call, hands all ownership back, and renounces its ACM admin role before returning. After this VIP executes, the helper holds no privileges and no balances.

#### Proposed Changes

1. **Grant \`DEFAULT_ADMIN_ROLE\`** on the AccessControlManager to the helper, so it can self-grant the transient ACM permissions it needs (\`pauseConversion\` per converter, \`addOrUpdateDistributionConfigs\`, \`removeDistributionConfig\`).
2. **Accept ownership** of each of the 10 new buyback proxies (the deploy script already called \`transferOwnership(NormalTimelock)\`).
3. **Transfer ownership** of each of the 10 buybacks plus the 6 timelock-owned legacy converters to the helper. The 7th legacy converter, WBNBBurnConverter, is owned by the Venus Guardian multisig and is intentionally not handed to the helper; its sub-dollar dust is drained in a follow-up multisig transaction and its PSR row is zeroed by the helper.
4. **\`helper.execute()\`** — runs the full migration atomically in a single transaction:
    - Accepts ownership of all 16 contracts.
    - Drains every non-zero ERC20 balance from the 6 timelock-owned converters into the corresponding new buyback (RiskFundConverter → \`RISK_FUND_BUYBACK\`; the four \`*PrimeConverter\` → \`U_PRIME_BUYBACK\` to consolidate Prime liquidity into U; \`XVSVaultConverter\` → \`XVS_BUYBACK\`).
    - Allowlists 9 swap routers on every buyback (PancakeSwap V2 / V3 / Smart / Universal, Uniswap V2 SwapRouter02 / V3 SwapRouter02 / V4 / Universal, 1inch v5).
    - Grants \`executeBuyback\` and \`forwardBaseAsset\` ACM permissions to the cron operator on every buyback.
    - Calls \`pauseConversion()\` on every timelock-owned converter, closing the only sensitive surface (token conversion); other ACM grants on these converters are limited to internal configuration and become inert once the converter is no longer routed to.
    - Repoints ProtocolShareReserve distributions: 18 new buyback rows are added and 12 stale rows (VTreasury direct destination + every legacy converter) are zeroed in a single \`addOrUpdateDistributionConfigs\` call so the per-schema percentage invariant (1e4 or 0) holds atomically; \`removeDistributionConfig\` then deletes the zeroed array entries.
    - Transfers ownership of all 16 contracts back to NormalTimelock.
    - Renounces \`DEFAULT_ADMIN_ROLE\` on the AccessControlManager so the helper retains no residual privilege.
5. **Accept ownership** of the 10 buybacks + 6 converters returned by the helper.
6. **Upgrade RiskFundV2 implementation**. The new implementation removes \`updatePoolState\`, \`sweepTokenFromPool\`, and the \`poolAssetsFunds\` mapping (storage slot preserved as \`__deprecatedSlotPoolAssetsFunds\`). \`transferReserveForAuction\` now reads raw balance. Per-pool accounting was dead weight since isolated pools are wound down and the core pool does not auction via Shortfall. The upgrade lands *after* RiskFundConverter has been drained and paused inside the helper, so no in-flight \`convertExactTokens\` callback can hit the removed \`updatePoolState\` selector.
7. **Defensively call \`Shortfall.pauseAuctions()\`** to keep the auction surface closed post-upgrade. The shortfall auction mechanism is exclusive to isolated pools, and isolated pools are no longer operational; there are no ongoing or upcoming auctions, so the migration window cannot encounter a STARTED auction carrying a stale pre-upgrade \`seizedRiskFund\` snapshot. \`pauseAuctions()\` is included purely as defense in depth.

#### May 2026 Prime Rewards Allocation (USDT + U)

This VIP also allocates **$24.5K in Prime Rewards** for May 2026, split **50/50 between the USDT and U stablecoin supply markets** (~$12.25K each). This is the first month **U is introduced as a Prime reward market** alongside USDT, per the [community post](https://community.venus.io/). The allocation is retroactive, redistributing 20% of the [$136K](https://dune.com/xvslove_team/venus-prime) in BNB Chain reserves revenue generated during April 2026, while maintaining a 10% buffer for market price fluctuations.

USDT for the U side is sourced by sweeping from PrimeLiquidityProvider and swapping on PancakeSwap V3 directly — by the time these steps run, the legacy \`*PrimeConverter\` contracts have already been drained and paused by the helper above.

8. **Add vU as a Prime market** (\`Prime.addMarket\`) with supplyMultiplier = 2e18, borrowMultiplier = 0 — same supply-only shape as the existing USDT and USDC entries.
9. **Initialize U in PrimeLiquidityProvider** (\`initializeTokens([U])\`) so distribution accounting is tracked against U.
10. **Sweep 12,250 USDT** out of PrimeLiquidityProvider to NormalTimelock for swapping.
11. **Approve PancakeSwap V3 router** for the swap amount.
12. **Swap 12,250 USDT → U directly into PrimeLiquidityProvider** on PancakeSwap V3 (\`exactInputSingle\`, fee tier 1 bp, recipient = PLP, ≥ 12,127.5 U min output, 14-day deadline). The router pulls USDT from NormalTimelock and delivers U straight to PLP, capturing the full output.
13. **Revoke leftover USDT approval** to the router as defense in depth.
14. **Set Prime distribution speeds** for USDT and U via \`setTokensDistributionSpeed\` (~0.002126736 tokens/block each, equivalent to ~$12.25K/month per market at $1 peg).

##### Allocation Strategy

- Focusing rewards on the **supply side** strengthens liquidity and creates conditions for lower borrow rates. Rewarding both sides creates arbitrage opportunities that artificially inflate activity and drive borrow rates up for other users.
- The 50/50 USDT/U split is provisional for the first month of U as a Prime reward market. The split will be reviewed in coming months based on U market performance and reserve contribution.
- Speeds are estimated at $1 = 1 USDT/U; actual realized USD value may vary with token prices between collection and conversion.

Helper source: \`draft/contracts/helpers/TokenBuybackMigrationHelper.sol\` in this repository, intended to be moved to and deployed from venus-periphery. Implementation of the new RiskFundV2: [VenusProtocol/protocol-reserve PR #158](https://github.com/VenusProtocol/protocol-reserve/pull/158). Testnet sign-off gate: 24–48h of green cron operation covering at least one \`executeBuyback\` per instance and one \`forwardBaseAsset\` per destination.

#### Retired contracts

- **WBNBBurnConverter** — no longer burns BNB (protocol shifted away from buy-and-burn). Its PSR row is zeroed by the helper. Sub-dollar residual dust is drained in a follow-up multisig transaction.
- **ConverterNetwork** — routing layer no longer needed with direct PSR → Buyback wiring. Left in place because every routed converter is paused, so any lookup through it short-circuits.

#### Conclusion

Replaces a complex multi-contract converter system with 10 single-purpose buybacks and an off-chain operator, ending the 50% community-conversion premium and oracle coupling while consolidating custody under NormalTimelock-owned proxies. The migration runs as a single helper-driven atomic operation: either every step lands or none of them do.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Grant DEFAULT_ADMIN_ROLE on the ACM to the helper.
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, MIGRATION_HELPER],
      },

      // 2. Accept ownership of the 10 buyback proxies (deploy set pendingOwner = NormalTimelock).
      ...BUYBACKS.map(b => ({
        target: b,
        signature: "acceptOwnership()",
        params: [],
      })),

      // 3. Transfer ownership of buybacks + timelock-owned converters to the helper.
      ...BUYBACKS.map(b => ({
        target: b,
        signature: "transferOwnership(address)",
        params: [MIGRATION_HELPER],
      })),
      ...TIMELOCK_OWNED_CONVERTERS.map(c => ({
        target: c,
        signature: "transferOwnership(address)",
        params: [MIGRATION_HELPER],
      })),

      // 4. helper.execute() — atomic migration.
      {
        target: MIGRATION_HELPER,
        signature: HELPER_EXECUTE_SIG,
        params: [],
      },

      // 5. Accept ownership of the 16 contracts handed back by the helper.
      ...HELPER_RETURNED_OWNERSHIPS.map(a => ({
        target: a,
        signature: "acceptOwnership()",
        params: [],
      })),

      // 6. Upgrade RiskFundV2 implementation. RiskFundConverter (the upstream feeder
      //    that called `updatePoolState` on RiskFundV2) was drained and paused inside
      //    helper.execute() above, so no in-flight `convertExactTokens` callback can
      //    hit the removed selector after the upgrade lands.
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND_V2, NEW_RISK_FUND_V2_IMPL],
      },

      // 7. Defensively pause Shortfall auctions. NormalTimelock holds the
      //    `pauseAuctions()` ACM permission (granted in VIP-170).
      {
        target: SHORTFALL,
        signature: "pauseAuctions()",
        params: [],
      },

      // 8. Add vU as a Prime market (supply-only, matching USDT/USDC).
      {
        target: PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [CORE_COMPTROLLER, VU, SUPPLY_MULTIPLIER, BORROW_MULTIPLIER],
      },

      // 9. Initialize U in PrimeLiquidityProvider so it can be assigned a distribution speed.
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "initializeTokens(address[])",
        params: [[U]],
      },

      // 10. Withdraw 12,250 USDT from PLP to NormalTimelock for swapping.
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "sweepToken(address,address,uint256)",
        params: [USDT, bscmainnet.NORMAL_TIMELOCK, USDT_TO_SWEEP],
      },

      // 11. Approve PancakeSwap V3 router for the swap amount.
      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [PANCAKE_V3_ROUTER, USDT_TO_SWAP],
      },

      // 12. Swap USDT → U; recipient = PLP so the full output (incl. surplus above
      //     U_MIN_OUT) lands in PLP without a separate transfer step.
      {
        target: PANCAKE_V3_ROUTER,
        signature: "exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))",
        params: [[USDT, U, PANCAKE_V3_FEE_TIER, PRIME_LIQUIDITY_PROVIDER, SWAP_DEADLINE, USDT_TO_SWAP, U_MIN_OUT, 0n]],
      },

      // 13. Revoke residual USDT approval (router consumes exactly USDT_TO_SWAP, but
      //     reset to 0 as defense in depth so no future call can spend on the Timelock's behalf).
      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [PANCAKE_V3_ROUTER, 0],
      },

      // 14. Set Prime distribution speeds for both USDT and U.
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDT, U],
          [NEW_PRIME_SPEED_FOR_USDT, NEW_PRIME_SPEED_FOR_U],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip800;
