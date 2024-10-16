import { BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const TWT = "0xb99C6B26Fdf3678c6e2aff8466E3625a0e7182f8";
export const VTWT = "0x95DaED37fdD3F557b3A5cCEb7D50Be65b36721DF";
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
const USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
const XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";

export const EXPECTED_CONVERSION_INCENTIVE = 1e14;
export const converterBaseAssets = {
  [RISK_FUND_CONVERTER]: USDT,
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [BTCB_PRIME_CONVERTER]: BTCB,
  [ETH_PRIME_CONVERTER]: ETH,
  [XVS_VAULT_CONVERTER]: XVS,
};
export const AMOUNT_TO_REFUND = parseUnits("5000", 18);
export const INITIAL_FUNDING = parseUnits("5000", 18);
export const INITIAL_VTOKENS = parseUnits("5000", 8);

const configureConverters = (fromAssets: string[], incentive: BigNumberish = EXPECTED_CONVERSION_INCENTIVE) => {
  enum ConversionAccessibility {
    NONE = 0,
    ALL = 1,
    ONLY_FOR_CONVERTERS = 2,
    ONLY_FOR_USERS = 3,
  }

  return Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => {
    const conversionConfigs = fromAssets.map(() => [incentive, ConversionAccessibility.ALL]);
    return {
      target: converter,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [baseAsset, fromAssets, conversionConfigs],
    };
  });
};
const { bsctestnet } = NETWORK_ADDRESSES;

export const vip384 = () => {
  const meta = {
    version: "v2",
    title: "VIP-384 Add TWT Market to core pool on BNB",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with the Add TWT Market",
    againstDescription: "I do not think that Venus Protocol should proceed with the Add TWT Market",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Add TWT Market or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_supportMarket(address)",
        params: [VTWT],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VTWT], [parseUnits("3000000", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VTWT], [parseUnits("1000000", 18)]],
      },
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VTWT, parseUnits("0.5", 18)],
      },
      {
        target: VTWT,
        signature: "setAccessControlManager(address)",
        params: [ACCESS_CONTROL_MANAGER],
      },
      {
        target: VTWT,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: VTWT,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [100],
      },
      {
        target: VTWT,
        signature: "_setReserveFactor(uint256)",
        params: ["250000000000000000"],
      },
      {
        target: TWT,
        signature: "faucet(uint256)",
        params: [INITIAL_FUNDING],
      },

      {
        target: TWT,
        signature: "approve(address,uint256)",
        params: [VTWT, 0],
      },

      {
        target: TWT,
        signature: "approve(address,uint256)",
        params: [VTWT, INITIAL_FUNDING],
      },
      {
        target: VTWT,
        signature: "mint(uint256)",
        params: [INITIAL_FUNDING],
      },

      {
        target: VTWT,
        signature: "transfer(address,uint256)",
        params: [bsctestnet.VTREASURY, INITIAL_VTOKENS],
      },

      {
        target: USDT,
        signature: "allocateTo(address,uint256)",
        params: [bsctestnet.VTREASURY, AMOUNT_TO_REFUND],
      },

      {
        target: bsctestnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, AMOUNT_TO_REFUND, COMMUNITY_WALLET],
      },
      ...configureConverters([TWT]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
