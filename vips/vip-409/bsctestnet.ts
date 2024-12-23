import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const Assets = [
  "0x74671106a04496199994787B6BcB064d08afbCCf", // MockPT_USDe_27MAR2025
  "0x3EBa2Aa29eC2498c2124523634324d4ce89c8579", // MockPT_sUSDE_27MAR2025
  "0xA3A3e5ecEA56940a4Ae32d0927bfd8821DdA848A", // MocksUSDe
  "0x772d68929655ce7234C8C94256526ddA66Ef641E", // MockUSDC
];
export const VsUSDe_Ethena = "0x643a2BE96e7675Ca34bcceCB33F4f0fECA1ba9fC";
export const VUSDC_Ethena = "0x466fe60aE3d8520e49D67e3483626786Ba0E6416";
export const PRIME = "0x2Ec432F123FEbb114e6fbf9f4F14baF0B1F14AbC";

enum ConversionAccessibility {
  NONE = 0,
  ALL = 1,
  ONLY_FOR_CONVERTERS = 2,
  ONLY_FOR_USERS = 3,
}

export const CONVERSION_INCENTIVE = 1e14;

export const USDT_PRIME_CONVERTER = "0x3716C24EA86A67cAf890d7C9e4C4505cDDC2F8A2";
export const USDC_PRIME_CONVERTER = "0x511a559a699cBd665546a1F75908f7E9454Bfc67";
export const WBTC_PRIME_CONVERTER = "0x8a3937F27921e859db3FDA05729CbCea8cfd82AE";
export const WETH_PRIME_CONVERTER = "0x274a834eFFA8D5479502dD6e78925Bc04ae82B46";
export const XVS_VAULT_CONVERTER = "0xc203bfA9dCB0B5fEC510Db644A494Ff7f4968ed2";
const USDT = "0x8d412FD0bc5d826615065B931171Eed10F5AF266";
const USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const WBTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";

export const converterBaseAssets = {
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [WBTC_PRIME_CONVERTER]: WBTC,
  [WETH_PRIME_CONVERTER]: WETH,
  [XVS_VAULT_CONVERTER]: XVS,
};

const BaseAssets = [
  "0x8d412FD0bc5d826615065B931171Eed10F5AF266", // USDT
  "0x772d68929655ce7234C8C94256526ddA66Ef641E", // USDC
  "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b", // WBTC
  "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // WETH
  "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E", // XVS
];

// Function to filter assets based on a base asset
const filterAssets = (assets: string[], baseAsset: string) => assets.filter(asset => asset !== baseAsset);

export const USDTPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[0]);
export const USDCPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[1]);
export const WBTCPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[2]);
export const WETHPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[3]);
export const XVSVaultConverterTokenOuts = filterAssets(Assets, BaseAssets[4]);

export const vip409 = () => {
  const meta = {
    version: "v2",
    title: "VIP-409 [Sepolia] New Ethena pool (Part-III)",
    description: `#### Summary`,
    forDescription: "Process to configure and launch the new pool",
    againstDescription: "Defer configuration and launch of the new pool",
    abstainDescription: "No opinion on the matter",
  };
  return makeProposal(
    [
      // Configure converters

      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[0],
          USDTPrimeConverterTokenOuts,
          [
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[1],
          USDCPrimeConverterTokenOuts,
          [
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[2],
          WBTCPrimeConverterTokenOuts,
          [
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[3],
          WETHPrimeConverterTokenOuts,
          [
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[4],
          XVSVaultConverterTokenOuts,
          [
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
    ],

    meta,
    ProposalType.REGULAR,
  );
};

export default vip409;
