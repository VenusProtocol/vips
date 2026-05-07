import { ethers } from "ethers";
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
// TODO: fill deployed proxy addresses from `npx hardhat deploy --tags RiskFundBuyback,
//       PrimeBuyback,XVSBuyback,TreasuryBuyback --network bscmainnet` on feat/VPD-1087.
export const RISK_FUND_BUYBACK = ethers.constants.AddressZero; // TODO
export const USDT_PRIME_BUYBACK = ethers.constants.AddressZero; // TODO
export const U_PRIME_BUYBACK = ethers.constants.AddressZero; // TODO
export const XVS_BUYBACK = ethers.constants.AddressZero; // TODO
export const U_TREASURY_BUYBACK = ethers.constants.AddressZero; // TODO
export const BTCB_TREASURY_BUYBACK = ethers.constants.AddressZero; // TODO
export const ETH_TREASURY_BUYBACK = ethers.constants.AddressZero; // TODO
export const USDT_TREASURY_BUYBACK = ethers.constants.AddressZero; // TODO
export const USDC_TREASURY_BUYBACK = ethers.constants.AddressZero; // TODO
export const XVS_TREASURY_BUYBACK = ethers.constants.AddressZero; // TODO

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
// TODO: fill post-deploy. New impl drops updatePoolState / sweepTokenFromPool /
//       poolAssetsFunds mapping; transferReserveForAuction reads raw balance.
export const NEW_RISK_FUND_V2_IMPL = ethers.constants.AddressZero; // TODO

// ===== TokenBuyback migration helper =====
// TODO: pin the deployed helper address here. The helper has no constructor
//       arguments — every address it operates on (timelock, ACM, PSR, legacy
//       converters, new buybacks, operator, routers, core-pool token universe)
//       is hardcoded as a `private constant` in its source. Before deploying,
//       fill the eleven TODO placeholders in the source (10 buyback addresses +
//       OPERATOR).
export const MIGRATION_HELPER = ethers.constants.AddressZero; // TODO

// ===== Cron operator =====
// TODO: finance-team EOA / multisig
export const OPERATOR = ethers.constants.AddressZero; // TODO

// AccessControl `DEFAULT_ADMIN_ROLE` (OZ AccessControl) — the admin role on the
// AccessControlManager. Granting it to the helper lets `execute()` self-grant
// transient ACM permissions and renounce them at the end of the call.
const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;

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

      // 6. Upgrade RiskFundV2 (drained + paused inside helper.execute() above).
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip800;
