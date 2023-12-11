import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;
const ACM = "0x049f77f7046266d27c3bc96376f53c17ef09c986";
const POOL_REGISTRY = "0x560eA4e1cC42591E9f5F5D83Ad2fd65F30128951";
const COMPTROLLER_CORE = "0x2FCABb31E57F010D623D8d68e1E18Aed11d5A388";
const TREASURY = "0x3370915301E8a6A6baAe6f461af703e2498409F3";
const RESILIENT_ORACLE = "0xEF4e53a9A4565ef243A2f0ee9a7fc2410E1aA623";
const MOCK_BTCB = "0x7Af23F9eA698E9b953D2BD70671173AaD0347f19";
const MOCK_ETH = "0x94680e003861D43C6c0cf18333972312B6956FF1";
const MOCK_USDT = "0x8ac9B3801D0a8f5055428ae0bF301CA1Da976855";
const MOCK_WBNB = "0xF9ce72611a1BE9797FdD2c995dB6fB61FD20E4eB";
const VBTCB_CORE = "0x86F82bca79774fc04859966917D2291A68b870A9";
const VETH_CORE = "0x034Cc5097379B13d3Ed5F6c85c8FAf20F48aE480";
const VUSDT_CORE = "0xe3923805f6E117E51f5387421240a86EF1570abC";
const VWBNB_CORE = "0xD36a31AcD3d901AeD998da6E24e848798378474e";

export const vip002 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "supportMarket(address)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCloseFactor(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReduceReservesBlockDelta(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setCollateralFactor(address,uint256,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLiquidationIncentive(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketBorrowCaps(address[],uint256[])", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMarketSupplyCaps(address[],uint256[])", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setActionsPaused(address[],uint256[],bool)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setMinLiquidatableCollateral(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addPool(string,address,uint256,uint256,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "addMarket(AddMarketInput)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setPoolName(address,string)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updatePoolMetadata(address,VenusPoolMetaData)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setProtocolSeizeShare(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setReserveFactor(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setInterestRateModel(address)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setRewardTokenSpeeds(address[],uint256[],uint256[])", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "setLastRewardingBlock(address[],uint32[],uint32[])", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [ZERO_ADDRESS, "updateJumpRateModel(uint256,uint256,uint256,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    { target: POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [RESILIENT_ORACLE],
    },
    {
      target: POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", COMPTROLLER_CORE, "500000000000000000", "1100000000000000000", "100000000000000000000"],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_BTCB, "300000000000000000", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_BTCB,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: MOCK_BTCB,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "300000000000000000"],
    },
    {
      target: VBTCB_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["300"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VBTCB_CORE,
          "750000000000000000",
          "800000000000000000",
          "300000000000000000",
          TREASURY,
          "300000000000000000000",
          "250000000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_ETH, "5000000000000000000", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_ETH,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: MOCK_ETH,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "5000000000000000000"],
    },
    {
      target: VETH_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["300"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VETH_CORE,
          "750000000000000000",
          "800000000000000000",
          "5000000000000000000",
          TREASURY,
          "5500000000000000000000",
          "4600000000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_USDT, "10000000000000000000000", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: MOCK_USDT,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "10000000000000000000000"],
    },
    {
      target: VUSDT_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["300"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDT_CORE,
          "800000000000000000",
          "820000000000000000",
          "10000000000000000000000",
          TREASURY,
          "10000000000000000000000000",
          "9000000000000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [MOCK_WBNB, "45000000000000000000", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: MOCK_WBNB,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: MOCK_WBNB,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "45000000000000000000"],
    },
    {
      target: VWBNB_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["300"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWBNB_CORE,
          "450000000000000000",
          "500000000000000000",
          "45000000000000000000",
          TREASURY,
          "80000000000000000000000",
          "56000000000000000000000",
        ],
      ],
    },
  ]);
};
