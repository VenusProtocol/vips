import { ZERO_ADDRESS } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
const ETHEREUM_MULTISIG = "0x285960C5B22fD66A736C7136967A3eB15e93CC67";
const RESILIENT_ORACLE = "0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94";
const POOL_REGISTRY = "0x61CAff113CCaf05FFc6540302c37adcf077C5179";
const TREASURY = "0xfd9b071168bc27dbe16406ec3aba050ce8eb22fa";
const DEFAULT_PROXY_ADMIN = "0x567e4cc5e085d09f66f836fa8279f38b4e5866b9";
const POOL_REGISTRY_IMPL = "0x08A2577611Ae63d1ba40188035eD6Ad21F8502A9";
// Comptrollers
const COMPTROLLER_CORE = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
const COMPTROLLER_CURVE = "0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796";
// Markets
const vCRV_Curve = "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa";
const vUSDC_Core = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
const vUSDT_Core = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
const vWBTC_Core = "0x8716554364f20BCA783cb2BAA744d39361fd1D8d";
const vWETH_Core = "0x7c8ff7d2A1372433726f879BD945fFb250B94c65";
const vcrvUSD_Core = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";
const vcrvUSD_Curve = "0x2d499800239C4CD3012473Cb1EAE33562F0A6933";
// Assets
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const CRV = "0xD533a949740bb3306d119CC777fa900bA034cd52";
const crvUSD = "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e";
const CRV_VTOKEN_RECEIVER = "0x7a16fF8270133F063aAb6C9977183D9e72835428";

// New IRs
const IR_BASE0_SLOPE900_JUMP7500_KINK7500 = "0xa4f048254631119f4E899359711fB282589c4ED8";
const IR_BASE0_SLOPE900_JUMP7500_KINK8000 = "0x694536cbCe185f8549Ca56cDFeE4531593762686";
const IR_BASE0_SLOPE750_JUMP8000_KINK8000 = "0x1C243a1aCe202424fa79F71de36225DF93B9e5C5";
const IR_BASE200_SLOPE2000_JUMP30000_KINK5000 = "0x87C427b00C89E82064B32Ca63c9E983fedD3e53e";

// IL configuration
const vip002 = () => {
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
      params: [ZERO_ADDRESS, "setForcedLiquidation(address,bool)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [POOL_REGISTRY, "addPool(string,address,uint256,uint256,uint256)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [POOL_REGISTRY, "addMarket(AddMarketInput)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [POOL_REGISTRY, "setPoolName(address,string)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [POOL_REGISTRY, "updatePoolMetadata(address,VenusPoolMetaData)", ETHEREUM_MULTISIG],
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
    {
      target: vWBTC_Core,
      signature: "setInterestRateModel(address)",
      params: [IR_BASE0_SLOPE900_JUMP7500_KINK7500],
    },
    {
      target: vWETH_Core,
      signature: "setInterestRateModel(address)",
      params: [IR_BASE0_SLOPE900_JUMP7500_KINK8000],
    },
    {
      target: vUSDC_Core,
      signature: "setInterestRateModel(address)",
      params: [IR_BASE0_SLOPE750_JUMP8000_KINK8000],
    },
    {
      target: vUSDT_Core,
      signature: "setInterestRateModel(address)",
      params: [IR_BASE0_SLOPE750_JUMP8000_KINK8000],
    },
    {
      target: vcrvUSD_Core,
      signature: "setInterestRateModel(address)",
      params: [IR_BASE0_SLOPE750_JUMP8000_KINK8000],
    },
    {
      target: vcrvUSD_Curve,
      signature: "setInterestRateModel(address)",
      params: [IR_BASE0_SLOPE750_JUMP8000_KINK8000],
    },
    {
      target: vCRV_Curve,
      signature: "setInterestRateModel(address)",
      params: [IR_BASE200_SLOPE2000_JUMP30000_KINK5000],
    },
    { target: POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    { target: DEFAULT_PROXY_ADMIN, signature: "upgrade(address,address)", params: [POOL_REGISTRY, POOL_REGISTRY_IMPL] },
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
      params: [WBTC, "29818818", ETHEREUM_MULTISIG],
    },
    {
      target: WBTC,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: WBTC,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "29818818"],
    },
    {
      target: vWBTC_Core,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [vWBTC_Core, "750000000000000000", "800000000000000000", "29818818", TREASURY, "100000000000", "85000000000"],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryNative(uint256,address)",
      params: ["5000000000000000000", ETHEREUM_MULTISIG],
    },
    {
      target: WETH,
      signature: "deposit()",
      params: [],
      value: "5000000000000000000",
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
      params: ["7200"],
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
          "20000000000000000000000",
          "18000000000000000000000",
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
      params: ["7200"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vUSDC_Core,
          "780000000000000000",
          "800000000000000000",
          "10000000000",
          TREASURY,
          "50000000000000",
          "45000000000000",
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
      params: ["7200"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vUSDT_Core,
          "780000000000000000",
          "800000000000000000",
          "10000000000",
          TREASURY,
          "50000000000000",
          "45000000000000",
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
      params: ["7200"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vcrvUSD_Core,
          "780000000000000000",
          "800000000000000000",
          "10000000000000000000000",
          CRV_VTOKEN_RECEIVER,
          "50000000000000000000000000",
          "45000000000000000000000000",
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
      params: ["7200"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vcrvUSD_Curve,
          "450000000000000000",
          "500000000000000000",
          "10000000000000000000000",
          CRV_VTOKEN_RECEIVER,
          "2500000000000000000000000",
          "2000000000000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [CRV, "40000000000000000000000", ETHEREUM_MULTISIG],
    },
    {
      target: CRV,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: CRV,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "40000000000000000000000"],
    },
    {
      target: vCRV_Curve,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vCRV_Curve,
          "450000000000000000",
          "500000000000000000",
          "40000000000000000000000",
          CRV_VTOKEN_RECEIVER,
          "6000000000000000000000000",
          "3000000000000000000000000",
        ],
      ],
    },
  ]);
};

export default vip002;
