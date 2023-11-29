import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

// IL configuration
export const vip002 = () => {
  return makeProposal([
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addPool(string,address,uint256,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setPoolName(address,string)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updatePoolMetadata(address,VenusPoolMetaData)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlock(address[],uint32[],uint32[])", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", sepolia.POOL_REGISTRY],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [sepolia.POOL_REGISTRY, "addMarket(AddMarketInput)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", sepolia.POOL_REGISTRY],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", sepolia.POOL_REGISTRY],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", sepolia.POOL_REGISTRY],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", sepolia.POOL_REGISTRY],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", sepolia.POOL_REGISTRY],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", sepolia.POOL_REGISTRY],
    },
    { target: sepolia.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: sepolia.COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: sepolia.COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [sepolia.RESILIENT_ORACLE],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", sepolia.COMPTROLLER_CORE, "500000000000000000", "1100000000000000000", "100000000000000000000"],
    },
    { target: sepolia.COMPTROLLER_STABLECOINS, signature: "acceptOwnership()", params: [] },
    {
      target: sepolia.COMPTROLLER_STABLECOINS,
      signature: "setPriceOracle(address)",
      params: [sepolia.RESILIENT_ORACLE],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: [
        "Stablecoins",
        sepolia.COMPTROLLER_STABLECOINS,
        "500000000000000000",
        "1100000000000000000",
        "100000000000000000000",
      ],
    },
    { target: sepolia.COMPTROLLER_CURVE, signature: "acceptOwnership()", params: [] },
    {
      target: sepolia.COMPTROLLER_CURVE,
      signature: "setPriceOracle(address)",
      params: [sepolia.RESILIENT_ORACLE],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: [
        "Curve",
        sepolia.COMPTROLLER_CURVE,
        "500000000000000000",
        "1100000000000000000",
        "100000000000000000000",
      ],
    },
    {
      target: sepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [sepolia.MOCK_WBTC, "30000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sepolia.MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "30000000"],
    },
    {
      target: sepolia.VWBTC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VWBTC_CORE,
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
      params: [sepolia.MOCK_WETH, "5000000000000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sepolia.MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "5000000000000000000"],
    },
    {
      target: sepolia.VWETH_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VWETH_CORE,
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
      params: [sepolia.MOCK_USDC, "10000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sepolia.MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000"],
    },
    {
      target: sepolia.VUSDC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VUSDC_CORE,
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
      params: [sepolia.MOCK_USDT, "10000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sepolia.MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000"],
    },
    {
      target: sepolia.VUSDT_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VUSDT_CORE,
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
      params: [sepolia.MOCK_crvUSD, "10000000000000000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.MOCK_crvUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sepolia.MOCK_crvUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000000000000000"],
    },
    {
      target: sepolia.VCRVUSD_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VCRVUSD_CORE,
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
      params: [sepolia.MOCK_CRV, "20000000000000000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.MOCK_CRV,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sepolia.MOCK_CRV,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "20000000000000000000000"],
    },
    {
      target: sepolia.VCRV_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VCRV_CORE,
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
      params: [sepolia.MOCK_USDC, "10000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sepolia.MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000"],
    },
    {
      target: sepolia.VUSDC_STABLECOINS,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VUSDC_STABLECOINS,
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
      params: [sepolia.MOCK_USDT, "10000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sepolia.MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000"],
    },
    {
      target: sepolia.VUSDT_STABLECOINS,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VUSDT_STABLECOINS,
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
      params: [sepolia.MOCK_crvUSD, "10000000000000000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.MOCK_crvUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sepolia.MOCK_crvUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000000000000000"],
    },
    {
      target: sepolia.VCRVUSD_STABLECOINS,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VCRVUSD_STABLECOINS,
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
      params: [sepolia.MOCK_crvUSD, "10000000000000000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.MOCK_crvUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sepolia.MOCK_crvUSD,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000000000000000"],
    },
    {
      target: sepolia.VCRVUSD_CURVE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VCRVUSD_CURVE,
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
      params: [sepolia.MOCK_CRV, "20000000000000000000000", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.MOCK_CRV,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sepolia.MOCK_CRV,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "20000000000000000000000"],
    },
    {
      target: sepolia.VCRV_CURVE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["6171"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VCRV_CURVE,
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
