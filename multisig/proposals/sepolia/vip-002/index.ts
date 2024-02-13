import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const COMPTROLLER_CORE = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
const COMPTROLLER_STABLECOINS = "0x18eF8D2bee415b731C25662568dc1035001cEB2c";
const COMPTROLLER_CURVE = "0xD298182D3ACb43e98e32757FF09C91F203e9E67E";
const MOCK_WBTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const MOCK_USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const MOCK_USDT = "0x8d412FD0bc5d826615065B931171Eed10F5AF266";
const MOCK_WETH = "0x700868CAbb60e90d77B6588ce072d9859ec8E281";
const VCRV_CORE = "0x121E3be152F283319310D807ed847E8b98319C1e";
const VCRVUSD_CORE = "0xA09cFAd2e138fe6d8FF62df803892cbCb79ED082";
const VUSDC_CORE = "0xF87bceab8DD37489015B426bA931e08A4D787616";
const VUSDT_CORE = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
const VWBTC_CORE = "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383";
const VWETH_CORE = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
const VCRVUSD_STABLECOINS = "0x9C5e7a3B4db931F07A6534f9e44100DDDc78c408";
const VUSDC_STABLECOINS = "0xD5f83FCbb4a62779D0B37b9E603CD19Ad84884F0";
const VUSDT_STABLECOINS = "0x93dff2053D4B08823d8B39F1dCdf8497f15200f4";
const VCRV_CURVE = "0x9Db62c5BBc6fb79416545FcCBDB2204099217b78";
const VCRVUSD_CURVE = "0xc7be132027e191636172798B933202E0f9CAD548";
const MOCK_CRV = "0x2c78EF7eab67A6e0C9cAa6f2821929351bdDF3d3";
const MOCK_crvUSD = "0x36421d873abCa3E2bE6BB3c819C0CF26374F63b6";

// IL configuration
const vip002 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addPool(string,address,uint256,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setPoolName(address,string)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updatePoolMetadata(address,VenusPoolMetaData)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlock(address[],uint32[],uint32[])", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", sepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.POOL_REGISTRY, "addMarket(AddMarketInput)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", sepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", sepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", sepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", sepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", sepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", sepolia.POOL_REGISTRY],
    },
    { target: sepolia.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [sepolia.RESILIENT_ORACLE],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", COMPTROLLER_CORE, "500000000000000000", "1100000000000000000", "100000000000000000000"],
    },
    { target: COMPTROLLER_STABLECOINS, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_STABLECOINS,
      signature: "setPriceOracle(address)",
      params: [sepolia.RESILIENT_ORACLE],
    },
    {
      target: sepolia.POOL_REGISTRY,
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
      params: [sepolia.RESILIENT_ORACLE],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Curve", COMPTROLLER_CURVE, "500000000000000000", "1100000000000000000", "100000000000000000000"],
    },
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_WBTC, "30000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "30000000"],
    },
    {
      target: VWBTC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWBTC_CORE,
          "750000000000000000",
          "800000000000000000",
          "30000000",
          sepolia.VTREASURY,
          "30000000000",
          "25000000000",
        ],
      ],
    },
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_WETH, "5000000000000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "5000000000000000000"],
    },
    {
      target: VWETH_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH_CORE,
          "750000000000000000",
          "800000000000000000",
          "5000000000000000000",
          sepolia.VTREASURY,
          "5500000000000000000000",
          "4600000000000000000000",
        ],
      ],
    },
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_USDC, "10000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000"],
    },
    {
      target: VUSDC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDC_CORE,
          "800000000000000000",
          "820000000000000000",
          "10000000000",
          sepolia.VTREASURY,
          "10000000000000",
          "9000000000000",
        ],
      ],
    },
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_USDT, "10000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000"],
    },
    {
      target: VUSDT_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDT_CORE,
          "800000000000000000",
          "820000000000000000",
          "10000000000",
          sepolia.VTREASURY,
          "10000000000000",
          "9000000000000",
        ],
      ],
    },
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_crvUSD, "10000000000000000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_crvUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_crvUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000000000000000"],
    },
    {
      target: VCRVUSD_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VCRVUSD_CORE,
          "800000000000000000",
          "820000000000000000",
          "10000000000000000000000",
          sepolia.VTREASURY,
          "10000000000000000000000000",
          "9000000000000000000000000",
        ],
      ],
    },
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_CRV, "20000000000000000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_CRV,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_CRV,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "20000000000000000000000"],
    },
    {
      target: VCRV_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VCRV_CORE,
          "350000000000000000",
          "400000000000000000",
          "20000000000000000000000",
          sepolia.VTREASURY,
          "5000000000000000000000000",
          "2500000000000000000000000",
        ],
      ],
    },
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_USDC, "10000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000"],
    },
    {
      target: VUSDC_STABLECOINS,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDC_STABLECOINS,
          "850000000000000000",
          "900000000000000000",
          "10000000000",
          sepolia.VTREASURY,
          "5000000000000",
          "4500000000000",
        ],
      ],
    },
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_USDT, "10000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000"],
    },
    {
      target: VUSDT_STABLECOINS,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDT_STABLECOINS,
          "850000000000000000",
          "900000000000000000",
          "10000000000",
          sepolia.VTREASURY,
          "5000000000000",
          "4500000000000",
        ],
      ],
    },
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_crvUSD, "10000000000000000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_crvUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_crvUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000000000000000"],
    },
    {
      target: VCRVUSD_STABLECOINS,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VCRVUSD_STABLECOINS,
          "850000000000000000",
          "900000000000000000",
          "10000000000000000000000",
          sepolia.VTREASURY,
          "5000000000000000000000000",
          "4500000000000000000000000",
        ],
      ],
    },
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_crvUSD, "10000000000000000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_crvUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_crvUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000000000000000"],
    },
    {
      target: VCRVUSD_CURVE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VCRVUSD_CURVE,
          "750000000000000000",
          "800000000000000000",
          "10000000000000000000000",
          sepolia.VTREASURY,
          "2500000000000000000000000",
          "2000000000000000000000000",
        ],
      ],
    },
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_CRV, "20000000000000000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_CRV,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_CRV,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "20000000000000000000000"],
    },
    {
      target: VCRV_CURVE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VCRV_CURVE,
          "600000000000000000",
          "650000000000000000",
          "20000000000000000000000",
          sepolia.VTREASURY,
          "5000000000000000000000000",
          "2500000000000000000000000",
        ],
      ],
    },
  ]);
};

export default vip002;
