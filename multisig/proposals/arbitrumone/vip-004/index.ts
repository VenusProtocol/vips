import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const COMPTROLLER_CORE = "0x317c1A5739F39046E20b08ac9BeEa3f10fD43326";

export const WBTC = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";
export const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
export const USDT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
export const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
export const ARB = "0x912CE59144191C1204E64559FE8253a0e49E6548";

export const VWBTC_CORE = "0xaDa57840B372D4c28623E87FC175dE8490792811";
export const VWETH_CORE = "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0";
export const VUSDC_CORE = "0x7D8609f8da70fF9027E9bc5229Af4F6727662707";
export const VUSDT_CORE = "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD";
export const VARB_CORE = "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6";

// IL configuration
const vip004 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setForcedLiquidation(address,bool)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        arbitrumone.POOL_REGISTRY,
        "addPool(string,address,uint256,uint256,uint256)",
        arbitrumone.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.POOL_REGISTRY, "setPoolName(address,string)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.POOL_REGISTRY, "updatePoolMetadata(address,VenusPoolMetaData)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlock(address[],uint32[],uint32[])", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", arbitrumone.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.POOL_REGISTRY, "addMarket(AddMarketInput)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", arbitrumone.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", arbitrumone.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", arbitrumone.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", arbitrumone.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", arbitrumone.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", arbitrumone.POOL_REGISTRY],
    },
    { target: arbitrumone.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [arbitrumone.RESILIENT_ORACLE],
    },
    {
      target: arbitrumone.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", COMPTROLLER_CORE, parseUnits("0.5", 18), parseUnits("1.1", 18), parseUnits("100", 18)],
    },
    {
      target: arbitrumone.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WBTC, parseUnits("0.0731263", 8), arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: WBTC,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, 0],
    },
    {
      target: WBTC,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, parseUnits("0.0731263", 8)],
    },
    {
      target: VWBTC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: arbitrumone.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWBTC_CORE,
          parseUnits("0.75", 18),
          parseUnits("0.80", 18),
          parseUnits("0.0731263", 8),
          arbitrumone.VTREASURY,
          parseUnits("900", 8),
          parseUnits("500", 8),
        ],
      ],
    },
    {
      target: arbitrumone.VTREASURY,
      signature: "withdrawTreasuryNative(uint256,address)",
      params: [parseUnits("1.317651", 18), arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: WETH,
      signature: "deposit()",
      params: [],
      value: "1317651000000000000",
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, 0],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, parseUnits("1.317651", 18)],
    },
    {
      target: VWETH_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: arbitrumone.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH_CORE,
          parseUnits("0.75", 18),
          parseUnits("0.80", 18),
          parseUnits("1.317651", 18),
          arbitrumone.VTREASURY,
          parseUnits("26000", 18),
          parseUnits("23500", 18),
        ],
      ],
    },
    {
      target: arbitrumone.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDC, parseUnits("5000", 6), arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: USDC,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, 0],
    },
    {
      target: USDC,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, parseUnits("5000", 6)],
    },
    {
      target: VUSDC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: arbitrumone.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDC_CORE,
          parseUnits("0.78", 18),
          parseUnits("0.80", 18),
          parseUnits("5000", 6),
          arbitrumone.VTREASURY,
          parseUnits("54000000", 6),
          parseUnits("49000000", 6),
        ],
      ],
    },
    {
      target: arbitrumone.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDT, parseUnits("4999.994418", 6), arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, 0],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, parseUnits("4999.994418", 6)],
    },
    {
      target: VUSDT_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: arbitrumone.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDT_CORE,
          parseUnits("0.78", 18),
          parseUnits("0.80", 18),
          parseUnits("4999.994418", 6),
          arbitrumone.VTREASURY,
          parseUnits("20000000", 6),
          parseUnits("18000000", 6),
        ],
      ],
    },
    {
      target: arbitrumone.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [ARB, parseUnits("4453.694805", 18), arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ARB,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, 0],
    },
    {
      target: ARB,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, parseUnits("4453.694805", 18)],
    },
    {
      target: VARB_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: arbitrumone.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VARB_CORE,
          parseUnits("0.55", 18),
          parseUnits("0.60", 18),
          parseUnits("4453.694805", 18),
          arbitrumone.VTREASURY,
          parseUnits("16000000", 18),
          parseUnits("9000000", 18),
        ],
      ],
    },
  ]);
};

export default vip004;
