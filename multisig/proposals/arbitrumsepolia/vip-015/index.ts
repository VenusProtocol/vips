import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const COMPTROLLER_LIQUID_STAKED_ETH = "0x3D04F926b2a165BBa17FBfccCCB61513634fa5e4";

export const Mock_wstETH = "0x4A9dc15aA6094eF2c7eb9d9390Ac1d71f9406fAE";
export const Mock_weETH = "0x243141DBff86BbB0a082d790fdC21A6ff615Fa34";
export const WETH = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73";

export const VwstETH = "0x253515E19e8b888a4CA5a0a3363B712402ce4046";
export const VweETH = "0x75f841b14305935D8D7E806f249D9FA52EF1550B";
export const VWETH = "0xd7057250b439c0849377bB6C3263eb8f9cf49d98";

const CHAINLINK_ETH_FEED = "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165";
const STALE_PERIOD_3M = 60 * 3; // 3 minutes (for pricefeeds with heartbeat of 2 mins)

export const PSR = "0x09267d30798B59c581ce54E861A084C6FC298666";

const COMPTROLLER_BEACON = "0x12Dcb8D9F1eE7Ad7410F5B36B07bcC7891ab4cEf";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x92e20Cdad0f06D557C4270Be724C9cf8A2E26Ac3";

// IL configuration
const vip015 = () => {
  return makeProposal([
    {
      target: COMPTROLLER_BEACON,
      signature: "upgradeTo(address)",
      params: [NEW_COMPTROLLER_IMPLEMENTATION],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[Mock_wstETH, CHAINLINK_ETH_FEED, STALE_PERIOD_3M]],
    },
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          Mock_wstETH,
          [
            arbitrumsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [Mock_wstETH, "1100000000000000000"],
    },
    { target: COMPTROLLER_LIQUID_STAKED_ETH, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_LIQUID_STAKED_ETH,
      signature: "setPriceOracle(address)",
      params: [arbitrumsepolia.RESILIENT_ORACLE],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: [
        "Liquid Staked ETH",
        COMPTROLLER_LIQUID_STAKED_ETH,
        parseUnits("0.5", 18),
        parseUnits("1.02", 18),
        parseUnits("100", 18),
      ],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [Mock_wstETH, parseUnits("2", 18), arbitrumsepolia.GUARDIAN],
    },
    {
      target: Mock_wstETH,
      signature: "approve(address,uint256)",
      params: ["0xf93Df3135e0D555185c0BC888073374cA551C5fE", 0],
    },
    {
      target: Mock_wstETH,
      signature: "approve(address,uint256)",
      params: ["0xf93Df3135e0D555185c0BC888073374cA551C5fE", parseUnits("2", 18)],
    },
    {
      target: VwstETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VwstETH,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VwstETH,
          parseUnits("0.93", 18),
          parseUnits("0.95", 18),
          parseUnits("2", 18),
          arbitrumsepolia.VTREASURY,
          parseUnits("8000", 18),
          parseUnits("800", 18),
        ],
      ],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[Mock_weETH, CHAINLINK_ETH_FEED, STALE_PERIOD_3M]],
    },
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          Mock_weETH,
          [
            arbitrumsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [Mock_weETH, "1100000000000000000"],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [Mock_weETH, "2000000000000000000", arbitrumsepolia.GUARDIAN],
    },
    {
      target: Mock_weETH,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, 0],
    },
    {
      target: Mock_weETH,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "2000000000000000000"],
    },
    {
      target: VweETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VweETH,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VweETH,
          "930000000000000000",
          "950000000000000000",
          "2000000000000000000",
          arbitrumsepolia.VTREASURY,
          "4600000000000000000000",
          "2300000000000000000000",
        ],
      ],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WETH, "78042235579982593", arbitrumsepolia.GUARDIAN],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "0"],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "78042235579982593"],
    },
    {
      target: VWETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VWETH,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH,
          "770000000000000000",
          "800000000000000000",
          "78042235579982593",
          arbitrumsepolia.VTREASURY,
          "14000000000000000000000",
          "12500000000000000000000",
        ],
      ],
    },
  ]);
};

export default vip015;
