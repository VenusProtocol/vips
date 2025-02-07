import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { basesepolia } = NETWORK_ADDRESSES;

export const ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const COMPTROLLER_CORE = "0x272795dd6c5355CF25765F36043F34014454Eb5b";

export const MOCK_cbBTC = "0x0948001047A07e38F685f9a11ea1ddB16B234af9";
export const WETH = "0x4200000000000000000000000000000000000006";
export const MOCK_USDC = "0xFa264c13d657180e65245a9C3ac8d08b9F5Fc54D";

export const VCBBTC_CORE = "0x776f14D624aBdAfa912d6Cd0864976DdaF5Ca4a7";
export const VWETH_CORE = "0x436E5A07F58AAA86277e8b992bC3e596eC423d09";
export const VUSDC_CORE = "0xA31D67c056Aadc2501535f2776bF1157904f810e";

// IL configuration
const vip004 = () => {
  return makeProposal([
    // Permissions
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", basesepolia.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setForcedLiquidation(address,bool)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.POOL_REGISTRY, "addPool(string,address,uint256,uint256,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.POOL_REGISTRY, "setPoolName(address,string)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.POOL_REGISTRY, "updatePoolMetadata(address,VenusPoolMetaData)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", basesepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.POOL_REGISTRY, "addMarket(AddMarketInput)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", basesepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", basesepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", basesepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", basesepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", basesepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", basesepolia.POOL_REGISTRY],
    },
    { target: basesepolia.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [basesepolia.RESILIENT_ORACLE],
    },

    // Add pool
    {
      target: basesepolia.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", COMPTROLLER_CORE, parseUnits("0.5", 18), parseUnits("1.1", 18), parseUnits("100", 18)],
    },

    // Add cbBTC market
    {
      target: MOCK_cbBTC,
      signature: "faucet(uint256)",
      params: [parseUnits("0.6", 8)],
    },
    {
      target: MOCK_cbBTC,
      signature: "approve(address,uint256)",
      params: [basesepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_cbBTC,
      signature: "approve(address,uint256)",
      params: [basesepolia.POOL_REGISTRY, parseUnits("0.6", 8)],
    },
    {
      target: VCBBTC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: basesepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VCBBTC_CORE,
          parseUnits("0.7", 18),
          parseUnits("0.75", 18),
          parseUnits("0.6", 8),
          basesepolia.VTREASURY,
          parseUnits("25", 8),
          parseUnits("16", 8),
        ],
      ],
    },

    // Add WETH market
    {
      target: WETH,
      signature: "deposit()",
      params: [],
      value: "600000000000000000",
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [basesepolia.POOL_REGISTRY, 0],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [basesepolia.POOL_REGISTRY, parseUnits("0.6", 18)],
    },
    {
      target: VWETH_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: basesepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH_CORE,
          parseUnits("0.7", 18),
          parseUnits("0.75", 18),
          parseUnits("0.6", 18),
          basesepolia.VTREASURY,
          parseUnits("25", 18),
          parseUnits("16", 18),
        ],
      ],
    },

    // Add USDC market
    {
      target: MOCK_USDC,
      signature: "faucet(uint256)",
      params: [parseUnits("2000", 6)],
    },
    {
      target: MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [basesepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [basesepolia.POOL_REGISTRY, parseUnits("2000", 6)],
    },
    {
      target: VUSDC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: basesepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDC_CORE,
          parseUnits("0.75", 18),
          parseUnits("0.77", 18),
          parseUnits("2000", 6),
          basesepolia.VTREASURY,
          parseUnits("150000", 6),
          parseUnits("130000", 6),
        ],
      ],
    },
  ]);
};

export default vip004;
