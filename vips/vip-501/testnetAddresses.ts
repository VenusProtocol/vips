export const USDC = "0xf16d4774893eB578130a645d5c69E9c4d183F3A5";
export const WETH = "0x4200000000000000000000000000000000000006";
export const XVS_VAULT_TREASURY = "0xA2c492f85aad1847dc21a44650cc687b94CdD6B3";
export const XVS = "0xC0e51E865bc9Fed0a32Cc0B2A65449567Bc5c741";

export const Assets = [USDC, WETH, XVS];

export const BaseAssets = [
  USDC, // USDCPrimeConverter BaseAsset
  WETH, // WETHPrimeConverter BaseAsset
  XVS, // XVSPrimeConverter BaseAsset
];

export const CONVERTER_NETWORK = "0xfD57cc379D74d2d4A94D653f989F8EEb6b078aBF";
export const USDC_PRIME_CONVERTER = "0x599708901Cee4921EDb7E0816A76fE8861C5D059";
export const WETH_PRIME_CONVERTER = "0x49ace012A451219290B54f07385880727e86D376";
export const XVS_VAULT_CONVERTER = "0x835F8A6C29d539cd7B78DCb8B9DaeAb643Ff9f0E";

export const ACM = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";

export const converters: string[] = [USDC_PRIME_CONVERTER, WETH_PRIME_CONVERTER, XVS_VAULT_CONVERTER];

// Function to filter assets based on a base asset
const filterAssets = (assets: string[], baseAsset: string) => assets.filter(asset => asset !== baseAsset);

export const USDCPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[1]);
export const WETHPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[3]);
export const XVSVaultConverterTokenOuts = filterAssets(Assets, BaseAssets[4]);
