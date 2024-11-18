export const Assets = [
  "0xf3118a17863996B9F2A073c9A66Faaa664355cf8", // USDT
  "0x86f096B1D970990091319835faF3Ee011708eAe8", // USDC
  "0xFb8d93FD3Cf18386a5564bb5619cD1FdB130dF7D", // WBTC
  "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73", // WETH
  "0x877Dc896e7b13096D3827872e396927BbE704407", // XVS
];

export const BaseAssets = [
  "0xf3118a17863996B9F2A073c9A66Faaa664355cf8", // USDT USDTPrimeConverter BaseAsset
  "0x86f096B1D970990091319835faF3Ee011708eAe8", // USDC USDCPrimeConverter BaseAsset
  "0xFb8d93FD3Cf18386a5564bb5619cD1FdB130dF7D", // WBTC WBTCPrimeConverter BaseAsset
  "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73", // WETH WETHPrimeConverter BaseAsset
  "0x877Dc896e7b13096D3827872e396927BbE704407", // XVS XVSPrimeConverter BaseAsset
];

export const CONVERTER_NETWORK = "0x9dD63dC8DADf90B67511939C00607484567B0D7A";
export const USDT_PRIME_CONVERTER = "0xFC0ec257d3ec4D673cB4e2CD3827C202e75fd0be";
export const USDC_PRIME_CONVERTER = "0xE88ed530597bc8D50e8CfC0EecAAFf6A93248C74";
export const WBTC_PRIME_CONVERTER = "0x3089F46caf6611806caA39Ffaf672097156b893a";
export const WETH_PRIME_CONVERTER = "0x0d1e90c1F86CD1c1dF514B493c5985B3FD9CD6C8";
export const XVS_VAULT_CONVERTER = "0x99942a033454Cef6Ffb2843886C8b2E658E7D5fd";

export const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";

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
