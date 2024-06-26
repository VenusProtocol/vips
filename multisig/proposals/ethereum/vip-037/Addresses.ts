export const Assets = [
  "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E", // CRV_USD
  "0xD533a949740bb3306d119CC777fa900bA034cd52", // CRV
  "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
  "0x853d955aCEf822Db058eb8505911ED77F175b99e", // FRAX
  "0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32", // SFRAX
  "0x6ee2b5E19ECBa773a352E5B21415Dc419A700d1d", // weETH-26DEC2024
  "0x0000000000085d4780B73119b644AE5ecd22b376", // TUSD
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee", // W_E_ETH
  "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", // WST_ETH
  "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A", // XVS
  "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7", // rsETH
  "0xac3E018457B222d93114458476f3E3416Abbe38F", // sfrxETH
];

export const BaseAssets = [
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT USDTPrimeConverter BaseAsset
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC USDCPrimeConverter BaseAsset
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC WBTCPrimeConverter BaseAsset
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH WETHPrimeConverter BaseAsset
  "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A", // XVS XVSPrimeConverter BaseAsset
];

export const CONVERTER_NETWORK = "0x232CC47AECCC55C2CAcE4372f5B268b27ef7cac8";
export const USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";

export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const GUARDIAN = "0x285960C5B22fD66A736C7136967A3eB15e93CC67";

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
