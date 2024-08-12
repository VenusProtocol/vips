import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const COMPTROLLER_LIQUID_STAKED_ETH = "0x006D44b6f5927b3eD83bD0c1C36Fb1A3BaCaC208";

export const Mock_wstETH = "0x4A9dc15aA6094eF2c7eb9d9390Ac1d71f9406fAE";
export const Mock_weETH = "0x243141DBff86BbB0a082d790fdC21A6ff615Fa34";
export const WETH = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73";

const CHAINLINK_ETH_FEED = "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165";
const STALE_PERIOD_3M = 60 * 3; // 3 minutes (for pricefeeds with heartbeat of 2 mins)

export const PSR = "0x09267d30798B59c581ce54E861A084C6FC298666";

// IL configuration
const vip015 = () => {
  return makeProposal([
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
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [Mock_wstETH, "2000000000000000000", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: Mock_wstETH,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, 0],
    },
    {
      target: Mock_wstETH,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "2000000000000000000"],
    },
    {
      target: Mock_wstETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: Mock_wstETH,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          Mock_wstETH,
          "930000000000000000",
          "950000000000000000",
          "2000000000000000000",
          arbitrumsepolia.VTREASURY,
          "8000000000000000000000",
          "800000000000000000000",
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
      params: [Mock_weETH, "2000000000000000000", arbitrumsepolia.NORMAL_TIMELOCK],
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
      target: Mock_weETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: Mock_weETH,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          Mock_weETH,
          "930000000000000000",
          "950000000000000000",
          "2000000000000000000",
          arbitrumsepolia.VTREASURY,
          "8000000000000000000000",
          "800000000000000000000",
        ],
      ],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WETH, "2000000000000000000", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, 0],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [arbitrumsepolia.POOL_REGISTRY, "2000000000000000000"],
    },
    {
      target: WETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: WETH,
      signature: "setProtocolShareReserve(address)",
      params: [PSR],
    },
    {
      target: arbitrumsepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          WETH,
          "770000000000000000",
          "800000000000000000",
          "2000000000000000000",
          arbitrumsepolia.VTREASURY,
          "14000000000000000000000",
          "12500000000000000000000",
        ],
      ],
    },
  ]);
};

export default vip015;
