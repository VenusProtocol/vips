import { ethers } from "hardhat";

const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";

const VTreasury = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";

export default [
  {
    target: PRIME_LIQUIDITY_PROVIDER,
    signature: "setTokensDistributionSpeed(address[],uint256[])",
    params: [
      [ETH, BTC, USDC, USDT],
      ["24438657407407", "1261574074074", "36881637731481481", "87191261574074074"],
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
