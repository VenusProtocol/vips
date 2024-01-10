import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
const ETHEREUM_MULTISIG = "0x285960C5B22fD66A736C7136967A3eB15e93CC67";
const RESILIENT_ORACLE = "0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94";
const POOL_REGISTRY = "0x61CAff113CCaf05FFc6540302c37adcf077C5179";
const TREASURY = "0xfd9b071168bc27dbe16406ec3aba050ce8eb22fa";
// Comptrollers
const COMPTROLLER_CORE = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
const COMPTROLLER_CURVE = "0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796";
const COMPTROLLER_STABLECOINS = "0xE4373b7D00233A6370F2e359551f849aD099cf29";
// Markets
const vCRV_Core = "0xa38B2718Fda8fFdF9EF160A29a47e7C447102b2b";
const vCRV_Curve = "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa";
const vUSDC_Core = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
const vUSDC_Stablecoins = "0xB0983aE919D5E7F932da277F0b9a52f521db9aA4";
const vUSDT_Core = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
const vUSDT_Stablecoins = "0xE3f2278425B2c5e8C48Eb87256EfB43A5c18FC91";
const vWBTC_Core = "0x8716554364f20BCA783cb2BAA744d39361fd1D8d";
const vWETH_Core = "0x7c8ff7d2A1372433726f879BD945fFb250B94c65";
const vcrvUSD_Core = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";
const vcrvUSD_Curve = "0x2d499800239C4CD3012473Cb1EAE33562F0A6933";
const vcrvUSD_Stablecoins = "0xb209b110247A002eFfeb97B6BAf9606B95D9cA26";
// Assets
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const CRV = "0xD533a949740bb3306d119CC777fa900bA034cd52";
const crvUSD = "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e";

// IL configuration
export const vip002 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addPool(string,address,uint256,uint256,uint256)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addMarket(AddMarketInput)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setPoolName(address,string)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updatePoolMetadata(address,VenusPoolMetaData)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlock(address[],uint32[],uint32[])", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", ETHEREUM_MULTISIG],
    },
    { target: POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [RESILIENT_ORACLE],
    },
    {
      target: POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", COMPTROLLER_CORE, "500000000000000000", "1100000000000000000", "100000000000000000000"],
    },
    { target: COMPTROLLER_STABLECOINS, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_STABLECOINS,
      signature: "setPriceOracle(address)",
      params: [RESILIENT_ORACLE],
    },
    {
      target: POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: [
        "Stablecoins",
        COMPTROLLER_STABLECOINS,
        "500000000000000000",
        "1100000000000000000",
        "100000000000000000000",
      ],
    },
    { target: COMPTROLLER_CURVE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CURVE,
      signature: "setPriceOracle(address)",
      params: [RESILIENT_ORACLE],
    },
    {
      target: POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Curve", COMPTROLLER_CURVE, "500000000000000000", "1100000000000000000", "100000000000000000000"],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WBTC, "30000000", ETHEREUM_MULTISIG],
    },
    {
      target: WBTC,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: WBTC,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "30000000"],
    },
    {
      target: vWBTC_Core,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [vWBTC_Core, "750000000000000000", "800000000000000000", "30000000", TREASURY, "30000000000", "25000000000"],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WETH, "5000000000000000000", ETHEREUM_MULTISIG],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "5000000000000000000"],
    },
    {
      target: vWETH_Core,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vWETH_Core,
          "750000000000000000",
          "800000000000000000",
          "5000000000000000000",
          TREASURY,
          "5500000000000000000000",
          "4600000000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDC, "10000000000", ETHEREUM_MULTISIG],
    },
    {
      target: USDC,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: USDC,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "10000000000"],
    },
    {
      target: vUSDC_Core,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vUSDC_Core,
          "800000000000000000",
          "820000000000000000",
          "10000000000",
          TREASURY,
          "10000000000000",
          "9000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDT, "10000000000", ETHEREUM_MULTISIG],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "10000000000"],
    },
    {
      target: vUSDT_Core,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vUSDT_Core,
          "800000000000000000",
          "820000000000000000",
          "10000000000",
          TREASURY,
          "10000000000000",
          "9000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [crvUSD, "10000000000000000000000", ETHEREUM_MULTISIG],
    },
    {
      target: crvUSD,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: crvUSD,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "10000000000000000000000"],
    },
    {
      target: vcrvUSD_Core,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vcrvUSD_Core,
          "800000000000000000",
          "820000000000000000",
          "10000000000000000000000",
          TREASURY,
          "10000000000000000000000000",
          "9000000000000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [CRV, "20000000000000000000000", ETHEREUM_MULTISIG],
    },
    {
      target: CRV,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: CRV,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "20000000000000000000000"],
    },
    {
      target: vCRV_Core,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vCRV_Core,
          "350000000000000000",
          "400000000000000000",
          "20000000000000000000000",
          TREASURY,
          "5000000000000000000000000",
          "2500000000000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDC, "10000000000", ETHEREUM_MULTISIG],
    },
    {
      target: USDC,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: USDC,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "10000000000"],
    },
    {
      target: vUSDC_Stablecoins,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vUSDC_Stablecoins,
          "850000000000000000",
          "900000000000000000",
          "10000000000",
          TREASURY,
          "5000000000000",
          "4500000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDT, "10000000000", ETHEREUM_MULTISIG],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "10000000000"],
    },
    {
      target: vUSDT_Stablecoins,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vUSDT_Stablecoins,
          "850000000000000000",
          "900000000000000000",
          "10000000000",
          TREASURY,
          "5000000000000",
          "4500000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [crvUSD, "10000000000000000000000", ETHEREUM_MULTISIG],
    },
    {
      target: crvUSD,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: crvUSD,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "10000000000000000000000"],
    },
    {
      target: vcrvUSD_Stablecoins,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vcrvUSD_Stablecoins,
          "850000000000000000",
          "900000000000000000",
          "10000000000000000000000",
          TREASURY,
          "5000000000000000000000000",
          "4500000000000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [crvUSD, "10000000000000000000000", ETHEREUM_MULTISIG],
    },
    {
      target: crvUSD,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: crvUSD,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "10000000000000000000000"],
    },
    {
      target: vcrvUSD_Curve,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vcrvUSD_Curve,
          "750000000000000000",
          "800000000000000000",
          "10000000000000000000000",
          TREASURY,
          "2500000000000000000000000",
          "2000000000000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [CRV, "20000000000000000000000", ETHEREUM_MULTISIG],
    },
    {
      target: CRV,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: CRV,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "20000000000000000000000"],
    },
    {
      target: vCRV_Curve,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vCRV_Curve,
          "600000000000000000",
          "650000000000000000",
          "20000000000000000000000",
          TREASURY,
          "5000000000000000000000000",
          "2500000000000000000000000",
        ],
      ],
    },
  ]);
};
