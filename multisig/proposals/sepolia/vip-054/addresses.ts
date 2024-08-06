export const Assets = [
  "0x36421d873abCa3E2bE6BB3c819C0CF26374F63b6", // CRV_USD
  "0x2c78EF7eab67A6e0C9cAa6f2821929351bdDF3d3", // CRV
  "0x75236711d42D0f7Ba91E03fdCe0C9377F5b76c07", // DAI
  "0x10630d59848547c9F59538E2d8963D63B912C075", // FRAX
  "0xd85FfECdB4287587BC53c1934D548bF7480F11C4", // SFRAX
  "0x56107201d3e4b7Db92dEa0Edb9e0454346AEb8B5", // weETH-26DEC2024
  "0x78b292069da1661b7C12B6E766cB506C220b987a", // TUSD
  "0x772d68929655ce7234C8C94256526ddA66Ef641E", // USDC
  "0x8d412FD0bc5d826615065B931171Eed10F5AF266", // USDT
  "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b", // WBTC
  "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // WETH
  "0x3b8b6E96e57f0d1cD366AaCf4CcC68413aF308D0", // W_E_ETH
  "0x9b87Ea90FDb55e1A0f17FBEdDcF7EB0ac4d50493", // WST_ETH
  "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E", // XVS
];

export const BaseAssets = [
  "0x8d412FD0bc5d826615065B931171Eed10F5AF266", // USDT USDTPrimeConverter BaseAsset
  "0x772d68929655ce7234C8C94256526ddA66Ef641E", // USDC USDCPrimeConverter BaseAsset
  "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b", // WBTC WBTCPrimeConverter BaseAsset
  "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // WETH WETHPrimeConverter BaseAsset
  "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E", // XVS XVSPrimeConverter BaseAsset
];

export const USDT_PRIME_CONVERTER = "0x3716C24EA86A67cAf890d7C9e4C4505cDDC2F8A2";
export const USDC_PRIME_CONVERTER = "0x511a559a699cBd665546a1F75908f7E9454Bfc67";
export const WBTC_PRIME_CONVERTER = "0x8a3937F27921e859db3FDA05729CbCea8cfd82AE";
export const WETH_PRIME_CONVERTER = "0x274a834eFFA8D5479502dD6e78925Bc04ae82B46";
export const XVS_VAULT_CONVERTER = "0xc203bfA9dCB0B5fEC510Db644A494Ff7f4968ed2";

// Function to filter assets based on a base asset
const filterAssets = (assets: string[], baseAsset: string) => assets.filter(asset => asset !== baseAsset);

export const USDTPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[0]);
export const USDCPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[1]);
export const WBTCPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[2]);
export const WETHPrimeConverterTokenOuts = filterAssets(Assets, BaseAssets[3]);
export const XVSVaultConverterTokenOuts = filterAssets(Assets, BaseAssets[4]);
