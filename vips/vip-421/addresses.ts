import { LzChainId } from "src/types";

export const arbitrumSepoliaBaseAssets = [
  "0xf3118a17863996B9F2A073c9A66Faaa664355cf8", // USDT USDTPrimeConverter BaseAsset
  "0x86f096B1D970990091319835faF3Ee011708eAe8", // USDC USDCPrimeConverter BaseAsset
  "0xFb8d93FD3Cf18386a5564bb5619cD1FdB130dF7D", // WBTC WBTCPrimeConverter BaseAsset
  "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73", // WETH WETHPrimeConverter BaseAsset
  "0x877Dc896e7b13096D3827872e396927BbE704407", // XVS XVSPrimeConverter BaseAsset
];

export const ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER = "0xFC0ec257d3ec4D673cB4e2CD3827C202e75fd0be";
export const ARBITRUM_SEPOLIA_USDC_PRIME_CONVERTER = "0xE88ed530597bc8D50e8CfC0EecAAFf6A93248C74";
export const ARBITRUM_SEPOLIA_WBTC_PRIME_CONVERTER = "0x3089F46caf6611806caA39Ffaf672097156b893a";
export const ARBITRUM_SEPOLIA_WETH_PRIME_CONVERTER = "0x0d1e90c1F86CD1c1dF514B493c5985B3FD9CD6C8";
export const ARBITRUM_SEPOLIA_XVS_VAULT_CONVERTER = "0x99942a033454Cef6Ffb2843886C8b2E658E7D5fd";

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";

export const arbitrumSepoliaConverters = [
  ARBITRUM_SEPOLIA_USDC_PRIME_CONVERTER,
  ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER,
  ARBITRUM_SEPOLIA_WBTC_PRIME_CONVERTER,
  ARBITRUM_SEPOLIA_WETH_PRIME_CONVERTER,
  ARBITRUM_SEPOLIA_XVS_VAULT_CONVERTER,
];

export const arbitrumSepoliaTokenAddresses = [
  "0x4371bb358aB5cC192E481543417D2F67b8781731", // ARB
  "0x243141DBff86BbB0a082d790fdC21A6ff615Fa34", // weETH
  "0x4A9dc15aA6094eF2c7eb9d9390Ac1d71f9406fAE", // wstETH
];

export const arbitrumSepoliaIncentiveAndAccessibilities = [
  [0, 1],
  [0, 1],
  [0, 1],
];

export interface Command {
  target: string;
  signature: string;
  params: any[];
  value?: string;
  dstChainId?: LzChainId;
  // only matters for simulations. For some network forks, the gas fee estimation is not accurate. Should be a whole number.
  gasFeeMultiplicationFactor?: number;
  // only matters for simulations. For some network forks, the gas limit estimation is not accurate. Should be a whole number.
  gasLimitMultiplicationFactor?: number;
}

export const arbitrumSepoliaGrant = (target: string, signature: string, caller: string): Command => ({
  target: ARBITRUM_SEPOLIA_ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [target, signature, caller],
  dstChainId: LzChainId.arbitrumsepolia,
});

export const sepoliaBaseAssets = [
  "0x8d412FD0bc5d826615065B931171Eed10F5AF266", // USDT USDTPrimeConverter BaseAsset
  "0x772d68929655ce7234C8C94256526ddA66Ef641E", // USDC USDCPrimeConverter BaseAsset
  "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b", // WBTC WBTCPrimeConverter BaseAsset
  "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // WETH WETHPrimeConverter BaseAsset
  "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E", // XVS XVSPrimeConverter BaseAsset
];

export const SEPOLIA_USDT_PRIME_CONVERTER = "0x3716C24EA86A67cAf890d7C9e4C4505cDDC2F8A2";
export const SEPOLIA_USDC_PRIME_CONVERTER = "0x511a559a699cBd665546a1F75908f7E9454Bfc67";
export const SEPOLIA_WBTC_PRIME_CONVERTER = "0x8a3937F27921e859db3FDA05729CbCea8cfd82AE";
export const SEPOLIA_WETH_PRIME_CONVERTER = "0x274a834eFFA8D5479502dD6e78925Bc04ae82B46";
export const SEPOLIA_XVS_VAULT_CONVERTER = "0xc203bfA9dCB0B5fEC510Db644A494Ff7f4968ed2";

export const sepoliaAssets = [
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
  "0xB8eb706b85Ae7355c9FE4371a499F50f3484809c", // ezETH
  "0xE233527306c2fa1E159e251a2E5893334505A5E0", // weETHs
];

// Function to filter assets based on a base asset
const filterAssets = (assets: string[], baseAsset: string) => assets.filter(asset => asset !== baseAsset);

export const sepoliaUSDTPrimeConverterTokenOuts = filterAssets(SepoliaAssets, SepoliaBaseAssets[0]);
export const sepoliaUSDCPrimeConverterTokenOuts = filterAssets(SepoliaAssets, SepoliaBaseAssets[1]);
export const sepoliaWBTCPrimeConverterTokenOuts = filterAssets(SepoliaAssets, SepoliaBaseAssets[2]);
export const sepoliaWETHPrimeConverterTokenOuts = filterAssets(SepoliaAssets, SepoliaBaseAssets[3]);
export const sepoliaXVSVaultConverterTokenOuts = filterAssets(SepoliaAssets, SepoliaBaseAssets[4]);
