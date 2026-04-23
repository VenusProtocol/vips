import { ethers } from "ethers";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const RISK_FUND_V2 = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

// ===== Tokens =====
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

// ===== Legacy converters (drain + revoke) =====
export const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
export const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";
export const WBNB_BURN_CONVERTER = "0x9eF79830e626C8ccA7e46DCEd1F90e51E7cFCeBE";
export const CONVERTER_NETWORK = "0xF7Caad5CeB0209165f2dFE71c92aDe14d0F15995";

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

// ===== New RiskFundV2 implementation =====
// TODO: fill post-deploy. New impl drops updatePoolState / sweepTokenFromPool /
//       poolAssetsFunds mapping; transferReserveForAuction reads raw balance.
export const NEW_RISK_FUND_V2_IMPL = ethers.constants.AddressZero; // TODO

// ===== Cron operator =====
// TODO: finance-team EOA / multisig
export const OPERATOR = ethers.constants.AddressZero; // TODO

// Sighashes (strings — ACM grants are keyed by full signature)
const EXECUTE_BUYBACK_SIG = "executeBuyback(address,uint256,uint256,uint256,address,bytes,address)";
const FORWARD_BASE_ASSET_SIG = "forwardBaseAsset(address,uint256)";

export const vip800 = () => {
  const meta = {
    version: "v2",
    title: "VIP-800 TokenBuyback migration",
    description: `#### Summary

If passed, this VIP replaces the community-driven Token Converter system (RiskFundConverter + 4 *PrimeConverter + XVSVaultConverter + WBNBBurnConverter + ConverterNetwork) with **10 ACM-authorized TokenBuyback proxies** driven by a finance-team cron. BSC-only; this VIP targets **BNB Chain**.

#### Proposed Changes

1. **Upgrade RiskFundV2 implementation** — new impl removes \`updatePoolState\`, \`sweepTokenFromPool\`, and the \`poolAssetsFunds\` mapping (storage slot preserved as \`__deprecatedSlotPoolAssetsFunds\`). \`transferReserveForAuction\` now reads raw balance. Per-pool accounting was dead weight since isolated pools are wound down and the core pool does not auction via Shortfall.
2. **Accept ownership** on each of the 10 new buyback proxies (deploy script already called \`transferOwnership(NormalTimelock)\`).
3. **Allowlist PancakeSwap V2 router** on each of the 10 buybacks.
4. **Grant ACM permissions** on \`executeBuyback\` + \`forwardBaseAsset\` for the cron operator on each of the 10 buybacks.
5. **Drain legacy converters** (remaining tokens → new buyback or VTreasury).
6. **Revoke ACM permissions** on legacy converters.
7. **Repoint ProtocolShareReserve distributions** from legacy converters to the 10 new buybacks.

Because the new RiskFundV2 impl removes \`updatePoolState\`, RiskFundConverter drain + ACM revoke are ordered **before** the upgrade to prevent in-flight \`convertExactTokens\` callbacks reverting.

Implementation: [VenusProtocol/protocol-reserve PR #158](https://github.com/VenusProtocol/protocol-reserve/pull/158). Testnet sign-off gate: 24–48h of green cron operation covering at least one \`executeBuyback\` per instance and one \`forwardBaseAsset\` per destination.

#### Retired contracts

- WBNBBurnConverter — no longer burns BNB (protocol shifted away from buy-and-burn).
- ConverterNetwork — routing layer no longer needed with direct PSR → Buyback wiring.

#### Conclusion

Replaces a complex multi-contract converter system with 10 single-purpose buybacks and an off-chain operator, ending the 50% premium and oracle coupling while consolidating custody under NormalTimelock-owned proxies.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // PRE-UPGRADE: drain + revoke RiskFundConverter (must precede RiskFundV2 upgrade)
      // TODO: sweepToken for each held asset, then revokeCallPermission for each grant

      // 1. Upgrade RiskFundV2 implementation
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND_V2, NEW_RISK_FUND_V2_IMPL],
      },

      // 2. Accept ownership of each of the 10 TokenBuyback proxies
      ...BUYBACKS.map(b => ({
        target: b,
        signature: "acceptOwnership()",
        params: [],
      })),

      // 3. Allowlist PancakeSwap V2 router on each buyback
      ...BUYBACKS.map(b => ({
        target: b,
        signature: "setAllowedRouter(address,bool)",
        params: [PANCAKE_ROUTER, true],
      })),

      // 4. Grant cron-operator ACM permissions on each buyback (executeBuyback + forwardBaseAsset)
      ...BUYBACKS.flatMap(b => [
        {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [b, EXECUTE_BUYBACK_SIG, OPERATOR],
        },
        {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [b, FORWARD_BASE_ASSET_SIG, OPERATOR],
        },
      ]),

      // 5. Drain remaining legacy converters (RiskFundConverter already drained above)
      // TODO: sweepToken per held asset per converter

      // 6. Revoke ACM permissions on remaining legacy converters
      // TODO: revokeCallPermission per existing grant

      // 7. Repoint ProtocolShareReserve distribution targets to the 10 new buybacks
      // TODO: fill [schema, percentage, destination] rows (sum per schema = 1e4)
      {
        target: PROTOCOL_SHARE_RESERVE,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            // [schema, percentage, destination]
            // TODO
          ],
        ],
      },
      // TODO: removeDistributionConfig for any stale rows pointing at retired contracts
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip800;
