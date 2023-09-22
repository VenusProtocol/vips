import { makeProposal } from "../../../src/utils";
import { ADDRESSES, ZERO_ADDRESS } from "../../helpers/config";

const { sepoliaContracts } = ADDRESSES;

export const vtokenConfiguration = () => {
  return makeProposal([
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", sepoliaContracts.POOL_REGISTRY],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", sepoliaContracts.POOL_REGISTRY],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", sepoliaContracts.POOL_REGISTRY],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", sepoliaContracts.POOL_REGISTRY],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", sepoliaContracts.POOL_REGISTRY],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", sepoliaContracts.POOL_REGISTRY],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", sepoliaContracts.POOL_REGISTRY],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addPool(string,address,uint256,uint256,uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addMarket(AddMarketInput)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setPoolName(address,string)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updatePoolMetadata(address,VenusPoolMetaData)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", sepoliaContracts.TIMELOCK],
    },
    {
      target: sepoliaContracts.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", sepoliaContracts.TIMELOCK],
    },
    { target: sepoliaContracts.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: sepoliaContracts.COMPTROLLER, signature: "acceptOwnership()", params: [] },
    {
      target: sepoliaContracts.COMPTROLLER,
      signature: "setPriceOracle(address)",
      params: [sepoliaContracts.RESILIENT_ORACLE],
    },
    {
      target: sepoliaContracts.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: [
        "Core",
        sepoliaContracts.COMPTROLLER,
        "500000000000000000",
        "1100000000000000000",
        "100000000000000000000",
      ],
    },
    {
      target: sepoliaContracts.MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [sepoliaContracts.POOL_REGISTRY, 0],
    },
    {
      target: sepoliaContracts.MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [sepoliaContracts.POOL_REGISTRY, "100000000"],
    },
    {
      target: sepoliaContracts.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepoliaContracts.VWBTC,
          "800000000000000000",
          "850000000000000000",
          "100000000",
          sepoliaContracts.VTREASURY,
          "10000000000",
          "5000000000",
        ],
      ],
    },
    {
      target: sepoliaContracts.MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [sepoliaContracts.POOL_REGISTRY, 0],
    },
    {
      target: sepoliaContracts.MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [sepoliaContracts.POOL_REGISTRY, "10000000000000000000"],
    },
    {
      target: sepoliaContracts.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepoliaContracts.VWETH,
          "800000000000000000",
          "850000000000000000",
          "10000000000000000000",
          sepoliaContracts.VTREASURY,
          "1000000000000000000000",
          "500000000000000000000",
        ],
      ],
    },
    {
      target: sepoliaContracts.MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [sepoliaContracts.POOL_REGISTRY, 0],
    },
    {
      target: sepoliaContracts.MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [sepoliaContracts.POOL_REGISTRY, "10000000000"],
    },
    {
      target: sepoliaContracts.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepoliaContracts.VUSDT,
          "800000000000000000",
          "850000000000000000",
          "10000000000",
          sepoliaContracts.VTREASURY,
          "1000000000000",
          "500000000000",
        ],
      ],
    },
    {
      target: sepoliaContracts.MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [sepoliaContracts.POOL_REGISTRY, 0],
    },
    {
      target: sepoliaContracts.MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [sepoliaContracts.POOL_REGISTRY, "10000000000"],
    },
    {
      target: sepoliaContracts.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          sepoliaContracts.VUSDC,
          "825000000000000000",
          "850000000000000000",
          "10000000000",
          sepoliaContracts.VTREASURY,
          "1000000000000",
          "500000000000",
        ],
      ],
    },
  ]);
};
