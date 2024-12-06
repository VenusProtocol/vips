import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { basemainnet } = NETWORK_ADDRESSES;

export const ACM = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
export const COMPTROLLER_CORE = "0x0C7973F9598AA62f9e03B94E92C967fD5437426C";

export const cbBTC = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";
export const WETH = "0x4200000000000000000000000000000000000006";
export const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export const VCBBTC_CORE = "0x7bBd1005bB24Ec84705b04e1f2DfcCad533b6D72";
export const VWETH_CORE = "0xEB8A79bD44cF4500943bf94a2b4434c95C008599";
export const VUSDC_CORE = "0x3cb752d175740043Ec463673094e06ACDa2F9a2e";

// IL configuration
const vip004 = () => {
  return makeProposal([
    // Permissions
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", basemainnet.GUARDIAN],
    },

    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setForcedLiquidation(address,bool)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.POOL_REGISTRY, "addPool(string,address,uint256,uint256,uint256)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.POOL_REGISTRY, "setPoolName(address,string)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.POOL_REGISTRY, "updatePoolMetadata(address,VenusPoolMetaData)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", basemainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basemainnet.POOL_REGISTRY, "addMarket(AddMarketInput)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", basemainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", basemainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", basemainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", basemainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", basemainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", basemainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", basemainnet.POOL_REGISTRY],
    },
    { target: basemainnet.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [basemainnet.RESILIENT_ORACLE],
    },

    // Add pool
    {
      target: basemainnet.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", COMPTROLLER_CORE, parseUnits("0.5", 18), parseUnits("1.1", 18), parseUnits("100", 18)],
    },

    // Add cbBTC market
    {
      target: basemainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [cbBTC, parseUnits("0.05", 8), basemainnet.GUARDIAN],
    },
    {
      target: cbBTC,
      signature: "approve(address,uint256)",
      params: [basemainnet.POOL_REGISTRY, 0],
    },
    {
      target: cbBTC,
      signature: "approve(address,uint256)",
      params: [basemainnet.POOL_REGISTRY, parseUnits("0.05", 8)],
    },
    {
      target: VCBBTC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: basemainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VCBBTC_CORE,
          parseUnits("0.73", 18),
          parseUnits("0.78", 18),
          parseUnits("0.05", 8),
          basemainnet.VTREASURY,
          parseUnits("400", 8),
          parseUnits("200", 8),
        ],
      ],
    },

    // Add WETH market
    {
      target: basemainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WETH, parseUnits("2", 18), basemainnet.GUARDIAN],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [basemainnet.POOL_REGISTRY, 0],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [basemainnet.POOL_REGISTRY, parseUnits("2", 18)],
    },
    {
      target: VWETH_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: basemainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH_CORE,
          parseUnits("0.8", 18),
          parseUnits("0.83", 18),
          parseUnits("2", 18),
          basemainnet.VTREASURY,
          parseUnits("10000", 18),
          parseUnits("9000", 18),
        ],
      ],
    },

    // Add USDC market
    {
      target: basemainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDC, parseUnits("5000", 6), basemainnet.GUARDIAN],
    },
    {
      target: USDC,
      signature: "approve(address,uint256)",
      params: [basemainnet.POOL_REGISTRY, 0],
    },
    {
      target: USDC,
      signature: "approve(address,uint256)",
      params: [basemainnet.POOL_REGISTRY, parseUnits("5000", 6)],
    },
    {
      target: VUSDC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: basemainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDC_CORE,
          parseUnits("0.75", 18),
          parseUnits("0.78", 18),
          parseUnits("5000", 6),
          basemainnet.VTREASURY,
          parseUnits("30000000", 6),
          parseUnits("27000000", 6),
        ],
      ],
    },
  ]);
};

export default vip004;
