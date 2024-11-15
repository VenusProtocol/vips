import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { basesepolia } = NETWORK_ADDRESSES;

export const ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const COMPTROLLER_CORE = "0x7f19DAF5Cf873182284DA7b19841e7a07804B6aB";

export const MOCK_cbBTC = "0x0948001047A07e38F685f9a11ea1ddB16B234af9";
export const WETH = "0x4200000000000000000000000000000000000006";
export const MOCK_USDC = "0xFa264c13d657180e65245a9C3ac8d08b9F5Fc54D";

export const VCBBTC_CORE = "0xCb4FDEDEe788201cD9E91AD99078aC3e684cB3a0";
export const VWETH_CORE = "0x970C62d7A32B88EC678419d88800A9993460671d";
export const VUSDC_CORE = "0xa9beA75098F55EE8415bf6E1B451512964D70e4b";

export const PSR = "0x4Ae3D77Ece08Ec3E5f5842B195f746bd3bCb8d73";
const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)
const STALE_PERIOD_24M = 60 * 24; // 24 minutes

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

    // Configure Oracle
    {
      target: basesepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[MOCK_cbBTC, "0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298", STALE_PERIOD_26H]],
    },
    {
      target: basesepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WETH, "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1", STALE_PERIOD_24M]],
    },
    {
      target: basesepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[MOCK_USDC, "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165", STALE_PERIOD_24M]],
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
      target: VCBBTC_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
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
      target: VWETH_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
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
      target: VUSDC_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
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