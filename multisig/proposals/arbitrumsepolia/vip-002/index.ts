import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

// IL configuration
const vip002 = () => {
  return makeProposal([
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addPool(string,address,uint256,uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setPoolName(address,string)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updatePoolMetadata(address,VenusPoolMetaData)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlock(address[],uint32[],uint32[])", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", arbitrumsepolia.POOL_REGISTRY],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.POOL_REGISTRY, "addMarket(AddMarketInput)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", arbitrumsepolia.POOL_REGISTRY],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", arbitrumsepolia.POOL_REGISTRY],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", arbitrumsepolia.POOL_REGISTRY],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", arbitrumsepolia.POOL_REGISTRY],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", arbitrumsepolia.POOL_REGISTRY],
    },
    {
      target: arbitrumsepolia.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", arbitrumsepolia.POOL_REGISTRY],
    },
    { target: arbitrumsepolia.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: arbitrumsepolia.COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: arbitrumsepolia.COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [arbitrumsepolia.RESILIENT_ORACLE],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: [
        "Core",
        arbitrumsepolia.COMPTROLLER_CORE,
        parseUnits("0.5", 18),
        parseUnits("1.1", 18),
        parseUnits("100", 18),
      ],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [arbitrumsepolia.MOCK_WBTC, "35531430000000000", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, 0],
    },
    {
      target: arbitrumsepolia.MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "35531430000000000"],
    },
    {
      target: arbitrumsepolia.VWBTC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: arbitrumsepolia.VWBTC_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [arbitrumsepolia.PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          arbitrumsepolia.VWBTC_CORE,
          "700000000000000000",
          "750000000000000000",
          "35531430000000000",
          arbitrumsepolia.VTREASURY,
          "1000000000000000000",
          "550000000000000000",
        ],
      ],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [arbitrumsepolia.MOCK_WETH, "610978879332136515", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, 0],
    },
    {
      target: arbitrumsepolia.MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "610978879332136515"],
    },
    {
      target: arbitrumsepolia.VWETH_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: arbitrumsepolia.VWETH_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [arbitrumsepolia.PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          arbitrumsepolia.VWETH_CORE,
          "700000000000000000",
          "750000000000000000",
          "610978879332136515",
          arbitrumsepolia.VTREASURY,
          "25000000000000000000",
          "16000000000000000000",
        ],
      ],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [arbitrumsepolia.MOCK_USDC, "1800000000010000000000", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, 0],
    },
    {
      target: arbitrumsepolia.MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "1800000000010000000000"],
    },
    {
      target: arbitrumsepolia.VUSDC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: arbitrumsepolia.VUSDC_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [arbitrumsepolia.PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          arbitrumsepolia.VUSDC_CORE,
          "750000000000000000",
          "770000000000000000",
          "1800000000010000000000",
          arbitrumsepolia.VTREASURY,
          "150000000000000000000000",
          "130000000000000000000000",
        ],
      ],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [arbitrumsepolia.MOCK_USDT, "1800000000010000000000", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, 0],
    },
    {
      target: arbitrumsepolia.MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "1800000000010000000000"],
    },
    {
      target: arbitrumsepolia.VUSDT_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: arbitrumsepolia.VUSDT_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [arbitrumsepolia.PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          arbitrumsepolia.VUSDT_CORE,
          "750000000000000000",
          "770000000000000000",
          "1800000000010000000000",
          arbitrumsepolia.VTREASURY,
          "150000000000000000000000",
          "130000000000000000000000",
        ],
      ],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [arbitrumsepolia.MOCK_ARB, "610978879332136515", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.MOCK_ARB,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, 0],
    },
    {
      target: arbitrumsepolia.MOCK_ARB,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "610978879332136515"],
    },
    {
      target: arbitrumsepolia.VARB_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: arbitrumsepolia.VARB_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [arbitrumsepolia.PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          arbitrumsepolia.VARB_CORE,
          "700000000000000000",
          "750000000000000000",
          "610978879332136515",
          arbitrumsepolia.VTREASURY,
          "25000000000000000000",
          "16000000000000000000",
        ],
      ],
    },
  ]);
};

export default vip002;
