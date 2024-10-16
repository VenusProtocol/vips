import { BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const TWT = "0x4B0F1812e5Df2A09796481Ff14017e6005508003";
export const VTWT = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";

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
export const INITIAL_FUNDING = parseUnits("4401.074", 18);
export const INITIAL_VTOKENS = parseUnits("4401.074", 8);

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
const { bscmainnet } = NETWORK_ADDRESSES;

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
        params: [[VTWT], [parseUnits("2000000", 18)]],
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
        params: [28800],
      },
      {
        target: VTWT,
        signature: "_setReserveFactor(uint256)",
        params: ["250000000000000000"],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [TWT, INITIAL_FUNDING, bscmainnet.NORMAL_TIMELOCK],
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
        params: [bscmainnet.VTREASURY, INITIAL_VTOKENS],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, AMOUNT_TO_REFUND, COMMUNITY_WALLET],
      },
      ...configureConverters([TWT]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
