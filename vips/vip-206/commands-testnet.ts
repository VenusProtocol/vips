const PRIME_LIQUIDITY_PROVIDER = "0xAdeddc73eAFCbed174e6C400165b111b0cb80B7E";

const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
const BTC = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

const VTreasury = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";

export default [
  {
    target: PRIME_LIQUIDITY_PROVIDER,
    signature: "setTokensDistributionSpeed(address[],uint256[])",
    params: [
      [ETH, BTC, USDC, USDT],
      ["24438657407407", "1261574074074", "36881", "87191"],
    ],
  },
  {
    target: VTreasury,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [ETH, "42230000000000000000", PRIME_LIQUIDITY_PROVIDER],
  },
  {
    target: VTreasury,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [BTC, "2180000000000000000", PRIME_LIQUIDITY_PROVIDER],
  },
  {
    target: VTreasury,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [USDC, "63731470000000000000000", PRIME_LIQUIDITY_PROVIDER],
  },
  {
    target: VTreasury,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [USDT, "150666500000000000000000", PRIME_LIQUIDITY_PROVIDER],
  },
];
