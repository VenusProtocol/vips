import { makeProposal } from "../../../../src/utils";

type IncentiveAndAccessibility = [number, number];

export const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const CRV_USD = "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const TUSD = "0x0000000000085d4780B73119b644AE5ecd22b376";
const SFRAXETH = "0xac3E018457B222d93114458476f3E3416Abbe38F";
const WEETH = "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee";
const SFRAX = "0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32";
const FRAX = "0x853d955aCEf822Db058eb8505911ED77F175b99e";
const WSTETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
const CRV = "0xD533a949740bb3306d119CC777fa900bA034cd52";
const PTweETHDEC24 = "0x6ee2b5E19ECBa773a352E5B21415Dc419A700d1d";
const rsETH = "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7";
const ezETH = "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110";
const weETHs = "0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88";

export const ETHEREUM_ASSETS = [
  CRV_USD,
  USDT,
  USDC,
  WETH,
  WBTC,
  DAI,
  TUSD,
  SFRAXETH,
  WEETH,
  SFRAX,
  FRAX,
  WSTETH,
  CRV,
  PTweETHDEC24,
  rsETH,
  ezETH,
  weETHs,
];

export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";

// Function to filter assets based on a base asset
const filterAssets = (assets: string[], baseAsset: string) => assets.filter(asset => asset !== baseAsset);

function getIncentiveAndAccessibility(length: number): IncentiveAndAccessibility[] {
  const incentivesAndAccessibility = new Array(length);
  incentivesAndAccessibility.fill([1e14, 1]);
  return incentivesAndAccessibility;
}

export const usdcConverterAssets = filterAssets(ETHEREUM_ASSETS, USDC);
export const usdtConverterAssets = filterAssets(ETHEREUM_ASSETS, USDT);
export const wbtcConverterAssets = filterAssets(ETHEREUM_ASSETS, WBTC);
export const wethConverterAssets = filterAssets(ETHEREUM_ASSETS, WETH);
export const xvsConverterAssets = filterAssets(ETHEREUM_ASSETS, XVS);

export const vip067 = () => {
  return makeProposal([
    {
      target: USDC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [USDC, usdcConverterAssets, getIncentiveAndAccessibility(usdcConverterAssets.length)],
    },
    {
      target: USDT_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [USDT, usdtConverterAssets, getIncentiveAndAccessibility(usdtConverterAssets.length)],
    },
    {
      target: WBTC_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [WBTC, wbtcConverterAssets, getIncentiveAndAccessibility(wbtcConverterAssets.length)],
    },
    {
      target: WETH_PRIME_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [WETH, wethConverterAssets, getIncentiveAndAccessibility(wethConverterAssets.length)],
    },
    {
      target: XVS_VAULT_CONVERTER,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [XVS, xvsConverterAssets, getIncentiveAndAccessibility(xvsConverterAssets.length)],
    },
  ]);
};

export default vip067;
