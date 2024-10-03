import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opmainnet } = NETWORK_ADDRESSES;

export const ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
export const COMPTROLLER_CORE = "0x5593FF68bE84C966821eEf5F0a988C285D5B7CeC";

export const WBTC = "0x68f180fcCe6836688e9084f035309E29Bf0A2095";
export const WETH = "0x4200000000000000000000000000000000000006";
export const USDT = "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58";
export const OP = "0x4200000000000000000000000000000000000042";
export const USDC = "0x0b2c639c533813f4aa9d7837caf62653d097ff85";

export const VWBTC_CORE = "0x9EfdCfC2373f81D3DF24647B1c46e15268884c46";
export const VWETH_CORE = "0x66d5AE25731Ce99D46770745385e662C8e0B4025";
export const VUSDT_CORE = "0x37ac9731B0B02df54975cd0c7240e0977a051721";
export const VOP_CORE = "0x6b846E3418455804C1920fA4CC7a31A51C659A2D";
export const VUSDC_CORE = "0x1C9406ee95B7af55F005996947b19F91B6D55b15";

const CHAINLINK_USDC_FEED = "0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3";
const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)
const USDCe = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607";

// IL configuration
const vip003 = () => {
  return makeProposal([
    {
      target: opmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDCe,
          [
            opmainnet.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [false, false, false],
        ],
      ],
    },
    {
      target: opmainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDC, CHAINLINK_USDC_FEED, STALE_PERIOD_26H]],
    },
    {
      target: opmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDC,
          [
            opmainnet.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setForcedLiquidation(address,bool)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.POOL_REGISTRY, "addPool(string,address,uint256,uint256,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.POOL_REGISTRY, "setPoolName(address,string)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.POOL_REGISTRY, "updatePoolMetadata(address,VenusPoolMetaData)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlock(address[],uint32[],uint32[])", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", opmainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.POOL_REGISTRY, "addMarket(AddMarketInput)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", opmainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", opmainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", opmainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", opmainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", opmainnet.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", opmainnet.POOL_REGISTRY],
    },
    { target: opmainnet.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [opmainnet.RESILIENT_ORACLE],
    },
    {
      target: opmainnet.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", COMPTROLLER_CORE, parseUnits("0.5", 18), parseUnits("1.1", 18), parseUnits("100", 18)],
    },
    {
      target: opmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WBTC, parseUnits("0.07575825", 8), opmainnet.GUARDIAN],
    },
    {
      target: WBTC,
      signature: "approve(address,uint256)",
      params: [opmainnet.POOL_REGISTRY, 0],
    },
    {
      target: WBTC,
      signature: "approve(address,uint256)",
      params: [opmainnet.POOL_REGISTRY, parseUnits("0.07575825", 8)],
    },
    {
      target: VWBTC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: opmainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWBTC_CORE,
          parseUnits("0.68", 18),
          parseUnits("0.73", 18),
          parseUnits("0.07575825", 8),
          opmainnet.VTREASURY,
          parseUnits("100", 8),
          parseUnits("50", 8),
        ],
      ],
    },
    {
      target: opmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WETH, parseUnits("1.862738289667629", 18), opmainnet.GUARDIAN],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [opmainnet.POOL_REGISTRY, 0],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [opmainnet.POOL_REGISTRY, parseUnits("1.862738289667629", 18)],
    },
    {
      target: VWETH_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: opmainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH_CORE,
          parseUnits("0.75", 18),
          parseUnits("0.80", 18),
          parseUnits("1.862738289667629", 18),
          opmainnet.VTREASURY,
          parseUnits("3000", 18),
          parseUnits("2700", 18),
        ],
      ],
    },
    {
      target: opmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDT, parseUnits("4998.602725", 6), opmainnet.GUARDIAN],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [opmainnet.POOL_REGISTRY, 0],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [opmainnet.POOL_REGISTRY, parseUnits("4998.602725", 6)],
    },
    {
      target: VUSDT_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: opmainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDT_CORE,
          parseUnits("0.75", 18),
          parseUnits("0.78", 18),
          parseUnits("4998.602725", 6),
          opmainnet.VTREASURY,
          parseUnits("4000000", 6),
          parseUnits("3600000", 6),
        ],
      ],
    },
    {
      target: opmainnet.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [OP, parseUnits("2641.144058375767936110", 18), opmainnet.GUARDIAN],
    },
    {
      target: OP,
      signature: "approve(address,uint256)",
      params: [opmainnet.POOL_REGISTRY, 0],
    },
    {
      target: OP,
      signature: "approve(address,uint256)",
      params: [opmainnet.POOL_REGISTRY, parseUnits("2641.144058375767936110", 18)],
    },
    {
      target: VOP_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: opmainnet.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VOP_CORE,
          parseUnits("0.58", 18),
          parseUnits("0.63", 18),
          parseUnits("2641.144058375767936110", 18),
          opmainnet.VTREASURY,
          parseUnits("3000000", 18),
          parseUnits("1500000", 18),
        ],
      ],
    },
  ]);
};

export default vip003;
