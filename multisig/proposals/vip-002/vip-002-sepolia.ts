import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const vip002 = () => {
  return makeProposal([
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", sepolia.POOL_REGISTRY],
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
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addPool(string,address,uint256,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addMarket(AddMarketInput)", sepolia.NORMAL_TIMELOCK],
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
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
    },
    { target: sepolia.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: sepolia.COMPTROLLER, signature: "acceptOwnership()", params: [] },
    {
      target: sepolia.COMPTROLLER,
      signature: "setPriceOracle(address)",
      params: [sepolia.RESILIENT_ORACLE],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", sepolia.COMPTROLLER, "500000000000000000", "1100000000000000000", "100000000000000000000"],
    },
    {
      target: sepolia.MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sepolia.MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "100000000"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VWBTC,
          "800000000000000000",
          "850000000000000000",
          "100000000",
          sepolia.VTREASURY,
          "10000000000",
          "5000000000",
        ],
      ],
    },
    {
      target: sepolia.MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: sepolia.MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, "10000000000000000000"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VWETH,
          "800000000000000000",
          "850000000000000000",
          "10000000000000000000",
          sepolia.VTREASURY,
          "1000000000000000000000",
          "500000000000000000000",
        ],
      ],
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
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VUSDT,
          "800000000000000000",
          "850000000000000000",
          "10000000000",
          sepolia.VTREASURY,
          "1000000000000",
          "500000000000",
        ],
      ],
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
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepolia.VUSDC,
          "825000000000000000",
          "850000000000000000",
          "10000000000",
          sepolia.VTREASURY,
          "1000000000000",
          "500000000000",
        ],
      ],
    },
  ]);
};
