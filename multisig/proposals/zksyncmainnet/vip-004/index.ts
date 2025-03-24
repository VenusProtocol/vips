import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncmainnet } = NETWORK_ADDRESSES;

export const ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const COMPTROLLER_CORE = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";

export const WBTC = "0xBBeB516fb02a01611cBBE0453Fe3c580D7281011";
export const WETH = "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91";
export const USDT = "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C";
export const USDC_e = "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4";
export const ZK = "0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E";

export const VWBTC_CORE = "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719";
export const VWETH_CORE = "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8";
export const VUSDC_e_CORE = "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D";
export const VUSDT_CORE = "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46";
export const VZK_CORE = "0x697a70779C1A03Ba2BD28b7627a902BFf831b616";

// IL configuration
const vip004 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addPool(string,address,uint256,uint256,uint256)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setPoolName(address,string)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updatePoolMetadata(address,VenusPoolMetaData)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlockTimestamps(address[],uint256[],uint256[])", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", zksyncmainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [zksyncmainnet.POOL_REGISTRY, "addMarket(AddMarketInput)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", zksyncmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", zksyncmainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", zksyncmainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", zksyncmainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", zksyncmainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", zksyncmainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", zksyncmainnet.POOL_REGISTRY],
    },
    { target: zksyncmainnet.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [zksyncmainnet.RESILIENT_ORACLE],
    },
    {
      target: zksyncmainnet.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", COMPTROLLER_CORE, parseUnits("0.5", 18), parseUnits("1.1", 18), parseUnits("100", 18)],
      gasLimitMultiplicationFactor: 10,
    },
    {
      target: zksyncmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WBTC, parseUnits("0.075", 8), zksyncmainnet.GUARDIAN],
    },
    {
      target: WBTC,
      signature: "approve(address,uint256)",
      params: [zksyncmainnet.POOL_REGISTRY, 0],
    },
    {
      target: WBTC,
      signature: "approve(address,uint256)",
      params: [zksyncmainnet.POOL_REGISTRY, parseUnits("0.075", 8)],
    },
    {
      target: VWBTC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: zksyncmainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWBTC_CORE,
          parseUnits("0.77", 18), // CF
          parseUnits("0.80", 18), // LT
          parseUnits("0.075", 8), // initial supply
          zksyncmainnet.VTREASURY,
          parseUnits("40", 8), // supply cap
          parseUnits("20", 8), // borrow cap
        ],
      ],
      gasLimitMultiplicationFactor: 10,
    },
    {
      target: zksyncmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WETH, parseUnits("1.5", 18), zksyncmainnet.GUARDIAN],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [zksyncmainnet.POOL_REGISTRY, 0],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [zksyncmainnet.POOL_REGISTRY, parseUnits("1.5", 18)],
    },
    {
      target: VWETH_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: zksyncmainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH_CORE,
          parseUnits("0.77", 18), // CF
          parseUnits("0.80", 18), // LT
          parseUnits("1.5", 18), // initial supply
          zksyncmainnet.VTREASURY,
          parseUnits("2000", 18), // supply cap
          parseUnits("1700", 18), // borrow cap
        ],
      ],
      gasLimitMultiplicationFactor: 10,
    },
    {
      target: zksyncmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDC_e, parseUnits("5000", 6), zksyncmainnet.GUARDIAN],
    },
    {
      target: USDC_e,
      signature: "approve(address,uint256)",
      params: [zksyncmainnet.POOL_REGISTRY, 0],
    },
    {
      target: USDC_e,
      signature: "approve(address,uint256)",
      params: [zksyncmainnet.POOL_REGISTRY, parseUnits("5000", 6)],
    },
    {
      target: VUSDC_e_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: zksyncmainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDC_e_CORE,
          parseUnits("0.72", 18), // CF
          parseUnits("0.75", 18), // LT
          parseUnits("5000", 6), // initial supply
          zksyncmainnet.VTREASURY,
          parseUnits("5000000", 6), // supply cap
          parseUnits("4200000", 6), // borrow cap
        ],
      ],
      gasLimitMultiplicationFactor: 10,
    },
    {
      target: zksyncmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDT, parseUnits("5000", 6), zksyncmainnet.GUARDIAN],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [zksyncmainnet.POOL_REGISTRY, 0],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [zksyncmainnet.POOL_REGISTRY, parseUnits("5000", 6)],
    },
    {
      target: VUSDT_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: zksyncmainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDT_CORE,
          parseUnits("0.77", 18), // CF
          parseUnits("0.80", 18), // LT
          parseUnits("5000", 6), // initial supply
          zksyncmainnet.VTREASURY,
          parseUnits("4000000", 6), // supply cap
          parseUnits("3300000", 6), // borrow cap
        ],
      ],
      gasLimitMultiplicationFactor: 10,
    },
    {
      target: zksyncmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [ZK, parseUnits("25000", 18), zksyncmainnet.GUARDIAN],
    },
    {
      target: ZK,
      signature: "approve(address,uint256)",
      params: [zksyncmainnet.POOL_REGISTRY, 0],
    },
    {
      target: ZK,
      signature: "approve(address,uint256)",
      params: [zksyncmainnet.POOL_REGISTRY, parseUnits("25000", 18)],
    },
    {
      target: VZK_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: zksyncmainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VZK_CORE,
          parseUnits("0.35", 18), // CF
          parseUnits("0.40", 18), // LT
          parseUnits("25000", 18), // initial suply
          zksyncmainnet.VTREASURY,
          parseUnits("25000000", 18), // supply cap
          parseUnits("12500000", 18), // borrow cap
        ],
      ],
      gasLimitMultiplicationFactor: 10,
    },
  ]);
};

export default vip004;
