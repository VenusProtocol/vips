import { ethers } from "ethers";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const RISK_FUND_V2 = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
export const PRIME_LIQUIDITY_PROVIDER = "0xAdeddc73eAFCbed174e6C400165b111b0cb80B7E";
export const XVS_VAULT_TREASURY = "0x317c6C4c9AA7F87170754DB08b4804dD689B68bF";
export const PANCAKE_ROUTER = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";

// ===== Tokens =====
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
export const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
export const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
export const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
export const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";
export const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";

// ===== Legacy converters =====
export const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
export const USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
export const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
export const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
export const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
export const XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";
export const WBNB_BURN_CONVERTER = "0x42DBA48e7cCeB030eC73AaAe29d4A3F0cD4facba";
export const CONVERTER_NETWORK = "0xC8f2B705d5A2474B390f735A5aFb570e1ce0b2cf";

// ===== New TokenBuyback proxies — TODO: fill from deploy on feat/VPD-1087 =====
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

export const NEW_RISK_FUND_V2_IMPL = ethers.constants.AddressZero; // TODO: fill from deploy
export const OPERATOR = ethers.constants.AddressZero; // TODO: finance-team cron EOA

const EXECUTE_BUYBACK_SIG = "executeBuyback(address,uint256,uint256,uint256,address,bytes,address)";
const FORWARD_BASE_ASSET_SIG = "forwardBaseAsset(address,uint256)";

export const vip800 = () => {
  const meta = {
    version: "v2",
    title: "VIP-800 [BNB Chain Testnet] TokenBuyback migration",
    description: `#### Summary

If passed, this VIP replaces the community-driven Token Converter system (RiskFundConverter + 4 *PrimeConverter + XVSVaultConverter + WBNBBurnConverter + ConverterNetwork) with **10 ACM-authorized TokenBuyback proxies** driven by a finance-team cron. BSC-only; this VIP targets **BNB Chain Testnet**.

#### Proposed Changes

1. **Upgrade RiskFundV2 implementation** — new impl removes \`updatePoolState\`, \`sweepTokenFromPool\`, and the \`poolAssetsFunds\` mapping (storage slot preserved as \`__deprecatedSlotPoolAssetsFunds\`). \`transferReserveForAuction\` now reads raw balance.
2. **Accept ownership** on each of the 10 new buyback proxies (deploy script already called \`transferOwnership(NormalTimelock)\`).
3. **Allowlist PancakeSwap V2 router** on each of the 10 buybacks.
4. **Grant ACM permissions** on \`executeBuyback\` + \`forwardBaseAsset\` for the cron operator on each of the 10 buybacks.
5. **Drain legacy converters** (remaining tokens → new buyback or VTreasury).
6. **Revoke ACM permissions** on legacy converters.
7. **Repoint ProtocolShareReserve distributions** from legacy converters to the 10 new buybacks.

RiskFundConverter drain + revoke is ordered **before** the upgrade — new impl removes \`updatePoolState\`, so in-flight \`convertExactTokens\` callbacks would revert.

Implementation: [VenusProtocol/protocol-reserve PR #158](https://github.com/VenusProtocol/protocol-reserve/pull/158).

#### Retired contracts

- WBNBBurnConverter — protocol shifted away from buy-and-burn.
- ConverterNetwork — routing layer no longer needed with direct PSR → Buyback wiring.`,
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

      // 2. Accept ownership of 10 TokenBuyback proxies
      ...BUYBACKS.map(b => ({
        target: b,
        signature: "acceptOwnership()",
        params: [],
      })),

      // 3. Allowlist PancakeSwap V2 router
      ...BUYBACKS.map(b => ({
        target: b,
        signature: "setAllowedRouter(address,bool)",
        params: [PANCAKE_ROUTER, true],
      })),

      // 4. Grant cron-operator ACM permissions (executeBuyback + forwardBaseAsset × 10)
      ...BUYBACKS.flatMap(b => [
        {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [b, EXECUTE_BUYBACK_SIG, OPERATOR],
        },
        {
          target: bsctestnet.ACCESS_CONTROL_MANAGER,
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
