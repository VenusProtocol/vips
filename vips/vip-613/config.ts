// ============================================================
// DeviationSentinel infrastructure (deployed in VIP-590)
// ============================================================
export const DEVIATION_SENTINEL = "0x6599C15cc8407046CD91E5c0F8B7f765fF914870";
export const SENTINEL_ORACLE = "0x58eae0Cf4215590E19860b66b146C5d539cb6f14";
export const PANCAKESWAP_ORACLE = "0x44B72078240A3509979faF450085Fa818401D32E";

// Unified deviation threshold across the Core Pool monitoring set
export const DEVIATION_THRESHOLD = 10;

// ============================================================
// Underlying token addresses (BSC mainnet)
// ============================================================
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
export const SOLVBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
export const USD1 = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";
export const SLISBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
export const WBETH = "0xa2e3356610840701bdf5611a53974510ae27e2e1";
export const XRP = "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE";
export const SOL = "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF";
export const TUSD = "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9";
export const LINK = "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD";
export const DOGE = "0xbA2aE424d960c26247Dd6c32edC70B295c744C43";
export const XAUM = "0x23AE4fd8E7844cdBc97775496eBd0E8248656028";
export const ADA = "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47";
export const LISUSD = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
export const LTC = "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94";
export const TRX = "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3";
export const FDUSD = "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409";
export const UNI = "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1";
export const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

// ============================================================
// PancakeSwap V3 pool addresses (sourced from PCS V3 Factory)
// Suffix convention: _NNN represents the fee tier in basis points
//   _001 = 0.01% fee (1 basis point)
//   _005 = 0.05% fee (5 basis points)
//   _025 = 0.25% fee (25 basis points)
// Example: POOL_USDT_USDC_001 is the USDT/USDC pair with 0.01% fee tier
// ============================================================
export const POOL_USDT_USDC_001 = "0x92b7807bf19b7dddf89b706143896d05228f3121";
export const POOL_U_USDT_001 = "0xa0909f81785f87f3e79309f0e73a7d82208094e4";
// USDT and WBNB share this pool — configured for both markets so each gets its own circuit breaker
export const POOL_USDT_WBNB_001 = "0x172fcd41e0913e95784454622d1c3724f546f849";
export const POOL_BTCB_WBNB_005 = "0x6bbc40579ad1bbd243895ca0acb086bb6300d636";
export const POOL_ETH_WBNB_005 = "0xd0e226f674bbf064f54ab47f42473ff80db98cba";
// CAKE pool replaces the CAKE/BUSD pool used in VIP-590 (0x7f51c8AaA6B0599aBd16674e2b17FEc7a9f674A1)
export const POOL_CAKE_WBNB_025 = "0x133b3d95bad5405d14d53473671200e9342896bf";
export const POOL_SOLVBTC_BTCB_005 = "0x12197d7a4fe2d67f9f97ae64d82a44c24b7ad407";
export const POOL_USD1_USDT_001 = "0x9c4ee895e4f6ce07ada631c508d1306db7502cce";
export const POOL_SLISBNB_WBNB_005 = "0x9474e972f49605315763c296b122cbb998b615cf";
export const POOL_WBETH_ETH_005 = "0x379044e32f5a162233e82de19da852255d0951b8";
export const POOL_XRP_USDT_025 = "0x71f5a8f7d448e59b1ede00a19fe59e05d125e742";
export const POOL_SOL_WBNB_005 = "0xbffec96e8f3b5058b1817c14e4380758fada01ef";
export const POOL_TUSD_USDT_001 = "0xd881d9d0e0767719701305c614903f555d589586";
export const POOL_LINK_WBNB_025 = "0x0e1893beeb4d0913d26b9614b18aea29c56d94b9";
export const POOL_DOGE_WBNB_025 = "0xce6160bb594fc055c943f59de92cee30b8c6b32c";
export const POOL_XAUM_USDT_005 = "0x497e224d7008fe47349035ddd98bedb773e1f4c5";
export const POOL_ADA_USDT_025 = "0x29c5ba7dbb67a4af999a28cc380ad234fe7c1b86";
export const POOL_LISUSD_USDT_005 = "0x12e79eb21dcc5852f9c6ac1736d977312925da33";
export const POOL_LTC_WBNB_025 = "0xe3cbe4dd1bd2f7101f17d586f44bab944091d383";
export const POOL_TRX_WBNB_025 = "0xf683113764e4499c473acd38fc4b37e71554e4ad";
export const POOL_FDUSD_USDT_001 = "0xbf72b6485e4b31601afe7b0a1210be2004d2b1d6";
export const POOL_UNI_WBNB_025 = "0x647d99772863e09f47435782cbb6c96ec4a75f12";
export const POOL_DAI_USDT_001 = "0xe043558b77e2b4c262d7d6e579b005ceb7f4591c";
export const POOL_XVS_WBNB_025 = "0x77d5b2560e4b84b3fc58875cb0133f39560e8ae3";

export interface Market {
  symbol: string;
  token: string;
  pool: string;
}

// 25 Core Pool markets with eligible PCS V3 pools.
// CAKE is re-configured (pool changed, threshold tightened from 20% to 10%).
export const MARKETS: Market[] = [
  { symbol: "USDC", token: USDC, pool: POOL_USDT_USDC_001 },
  { symbol: "U", token: U, pool: POOL_U_USDT_001 },
  { symbol: "WBNB", token: WBNB, pool: POOL_USDT_WBNB_001 },
  { symbol: "USDT", token: USDT, pool: POOL_USDT_WBNB_001 },
  { symbol: "BTCB", token: BTCB, pool: POOL_BTCB_WBNB_005 },
  { symbol: "ETH", token: ETH, pool: POOL_ETH_WBNB_005 },
  { symbol: "CAKE", token: CAKE, pool: POOL_CAKE_WBNB_025 },
  { symbol: "solvBTC", token: SOLVBTC, pool: POOL_SOLVBTC_BTCB_005 },
  { symbol: "USD1", token: USD1, pool: POOL_USD1_USDT_001 },
  { symbol: "slisBNB", token: SLISBNB, pool: POOL_SLISBNB_WBNB_005 },
  { symbol: "wBETH", token: WBETH, pool: POOL_WBETH_ETH_005 },
  { symbol: "XRP", token: XRP, pool: POOL_XRP_USDT_025 },
  { symbol: "SOL", token: SOL, pool: POOL_SOL_WBNB_005 },
  { symbol: "TUSD", token: TUSD, pool: POOL_TUSD_USDT_001 },
  { symbol: "LINK", token: LINK, pool: POOL_LINK_WBNB_025 },
  { symbol: "DOGE", token: DOGE, pool: POOL_DOGE_WBNB_025 },
  { symbol: "XAUM", token: XAUM, pool: POOL_XAUM_USDT_005 },
  { symbol: "ADA", token: ADA, pool: POOL_ADA_USDT_025 },
  { symbol: "lisUSD", token: LISUSD, pool: POOL_LISUSD_USDT_005 },
  { symbol: "LTC", token: LTC, pool: POOL_LTC_WBNB_025 },
  { symbol: "TRX", token: TRX, pool: POOL_TRX_WBNB_025 },
  { symbol: "FDUSD", token: FDUSD, pool: POOL_FDUSD_USDT_001 },
  { symbol: "UNI", token: UNI, pool: POOL_UNI_WBNB_025 },
  { symbol: "DAI", token: DAI, pool: POOL_DAI_USDT_001 },
  { symbol: "XVS", token: XVS, pool: POOL_XVS_WBNB_025 },
];
