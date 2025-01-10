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

export const sepoliaUSDTPrimeConverterTokenOuts = filterAssets(sepoliaAssets, sepoliaBaseAssets[0]);
export const sepoliaUSDCPrimeConverterTokenOuts = filterAssets(sepoliaAssets, sepoliaBaseAssets[1]);
export const sepoliaWBTCPrimeConverterTokenOuts = filterAssets(sepoliaAssets, sepoliaBaseAssets[2]);
export const sepoliaWETHPrimeConverterTokenOuts = filterAssets(sepoliaAssets, sepoliaBaseAssets[3]);
export const sepoliaXVSVaultConverterTokenOuts = filterAssets(sepoliaAssets, sepoliaBaseAssets[4]);

export const arbitrumBaseAssets = [
  "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT USDTPrimeConverter BaseAsset
  "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC USDCPrimeConverter BaseAsset
  "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", // WBTC WBTCPrimeConverter BaseAsset
  "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH WETHPrimeConverter BaseAsset
  "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52", // XVS XVSPrimeConverter BaseAsset
];

export const ARBITRUM_USDT_PRIME_CONVERTER = "0x435Fac1B002d5D31f374E07c0177A1D709d5DC2D";
export const ARBITRUM_USDC_PRIME_CONVERTER = "0x6553C9f9E131191d4fECb6F0E73bE13E229065C6";
export const ARBITRUM_WBTC_PRIME_CONVERTER = "0xF91369009c37f029aa28AF89709a352375E5A162";
export const ARBITRUM_WETH_PRIME_CONVERTER = "0x4aCB90ddD6df24dC6b0D50df84C94e72012026d0";
export const ARBITRUM_XVS_VAULT_CONVERTER = "0x9c5A7aB705EA40876c1B292630a3ff2e0c213DB1";

export const ARBITRUM_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";

export const arbitrumTokenAddresses = [
  "0x912CE59144191C1204E64559FE8253a0e49E6548", // ARB
  "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe", // weETH
  "0x5979D7b546E38E414F7E9822514be443A4800529", // wstETH
];

export const arbitrumIncentiveAndAccessibilities = [
  [0, 1],
  [0, 1],
  [0, 1],
];

export const ethereumBaseAssets = [
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT USDTPrimeConverter BaseAsset
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC USDCPrimeConverter BaseAsset
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC WBTCPrimeConverter BaseAsset
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH WETHPrimeConverter BaseAsset
  "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A", // XVS XVSPrimeConverter BaseAsset
];

export const ETHEREUM_USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const ETHEREUM_USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const ETHEREUM_WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const ETHEREUM_WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const ETHEREUM_XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";

export const ethereumAssets = [
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
  "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110", // ezETH
  "0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88", // weETHs
];

export const ethereumUSDTPrimeConverterTokenOuts = filterAssets(ethereumAssets, ethereumBaseAssets[0]);
export const ethereumUSDCPrimeConverterTokenOuts = filterAssets(ethereumAssets, ethereumBaseAssets[1]);
export const ethereumWBTCPrimeConverterTokenOuts = filterAssets(ethereumAssets, ethereumBaseAssets[2]);
export const ethereumWETHPrimeConverterTokenOuts = filterAssets(ethereumAssets, ethereumBaseAssets[3]);
export const ethereumXVSVaultConverterTokenOuts = filterAssets(ethereumAssets, ethereumBaseAssets[4]);
