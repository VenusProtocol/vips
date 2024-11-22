export const USDT = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";
export const USDC = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
export const WBTC = "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f";
export const WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
export const PLP = "0x86bf21dB200f29F21253080942Be8af61046Ec29";
export const XVS = "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52";
export const XVS_VAULT_TREASURY = "0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58";

export const Assets = [USDT, USDC, WBTC, WETH, XVS];

export const BaseAssets = [
  USDT, // USDTPrimeConverter BaseAsset
  USDC, // USDCPrimeConverter BaseAsset
  WBTC, // WBTCPrimeConverter BaseAsset
  WETH, // WETHPrimeConverter BaseAsset
  XVS, // XVSPrimeConverter BaseAsset
];

export const CONVERTER_NETWORK = "0x2F6672C9A0988748b0172D97961BecfD9DC6D6d5";
export const USDT_PRIME_CONVERTER = "0x435Fac1B002d5D31f374E07c0177A1D709d5DC2D";
export const USDC_PRIME_CONVERTER = "0x6553C9f9E131191d4fECb6F0E73bE13E229065C6";
export const WBTC_PRIME_CONVERTER = "0xF91369009c37f029aa28AF89709a352375E5A162";
export const WETH_PRIME_CONVERTER = "0x4aCB90ddD6df24dC6b0D50df84C94e72012026d0";
export const XVS_VAULT_CONVERTER = "0x9c5A7aB705EA40876c1B292630a3ff2e0c213DB1";

export const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";

export const converters: string[] = [
  USDT_PRIME_CONVERTER,
  USDC_PRIME_CONVERTER,
  WBTC_PRIME_CONVERTER,
  WETH_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
];

// Function to filter assets based on a base asset
const filterAssets = (assets: string[], baseAsset: string) => assets.filter(asset => asset !== baseAsset);

export const USDTPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[0]);
export const USDCPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[1]);
export const WBTCPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[2]);
export const WETHPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[3]);
export const XVSVaultConverterTokenOuts = filterAssets(Assets, BaseAssets[4]);
