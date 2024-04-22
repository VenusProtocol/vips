import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const COMPTROLLER_CORE = "0xA198909e8432f262f6978F2C81B04b32c55eb063";

export const MOCK_WBTC = "0xFb8d93FD3Cf18386a5564bb5619cD1FdB130dF7D";
export const MOCK_WETH = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73";
export const MOCK_USDT = "0xf3118a17863996B9F2A073c9A66Faaa664355cf8";
export const MOCK_USDC = "0x86f096B1D970990091319835faF3Ee011708eAe8";
export const MOCK_ARB = "0x4371bb358aB5cC192E481543417D2F67b8781731";

export const VWBTC_CORE = "0x86bA857556ce8Ea25175e844E11ee413B7A73a25";
export const VWETH_CORE = "0xef6DF2bE5d6Ad0291eDb1160fEf7a4ED2528fAfb";
export const VUSDC_CORE = "0xf34F869da124Ae9b6b45EcB1787d0559Efa5DFA8";
export const VUSDT_CORE = "0xFf3a9fD8d4f208Ed98f56A5F771AD470258866D7";
export const VARB_CORE = "0x09522549a45767093F8b044a6CcA86E34Bf52396";

export const PSR = "0x09267d30798B59c581ce54E861A084C6FC298666";

// IL configuration
const vip002 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addPool(string,address,uint256,uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setPoolName(address,string)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updatePoolMetadata(address,VenusPoolMetaData)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlock(address[],uint32[],uint32[])", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", arbitrumsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.POOL_REGISTRY, "addMarket(AddMarketInput)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", arbitrumsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", arbitrumsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", arbitrumsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", arbitrumsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", arbitrumsepolia.POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", arbitrumsepolia.POOL_REGISTRY],
    },
    { target: arbitrumsepolia.POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [arbitrumsepolia.RESILIENT_ORACLE],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", COMPTROLLER_CORE, parseUnits("0.5", 18), parseUnits("1.1", 18), parseUnits("100", 18)],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_WBTC, "3553143", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_WBTC,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "3553143"],
    },
    {
      target: VWBTC_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VWBTC_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWBTC_CORE,
          "700000000000000000",
          "750000000000000000",
          "3553143",
          arbitrumsepolia.VTREASURY,
          "100000000",
          "55000000",
        ],
      ],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_WETH, "610978879332136515", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_WETH,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "610978879332136515"],
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
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH_CORE,
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
      params: [MOCK_USDC, "1800000000", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_USDC,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "1800000000"],
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
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDC_CORE,
          "750000000000000000",
          "770000000000000000",
          "1800000000",
          arbitrumsepolia.VTREASURY,
          "150000000000",
          "130000000000",
        ],
      ],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_USDT, "1800000000", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "1800000000"],
    },
    {
      target: VUSDT_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VUSDT_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDT_CORE,
          "750000000000000000",
          "770000000000000000",
          "1800000000",
          arbitrumsepolia.VTREASURY,
          "150000000000",
          "130000000000",
        ],
      ],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_ARB, "610978879332136515", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_ARB,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, 0],
    },
    {
      target: MOCK_ARB,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "610978879332136515"],
    },
    {
      target: VARB_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VARB_CORE,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VARB_CORE,
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
