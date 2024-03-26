import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;

const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
const POOL_REGISTRY = "0x345a030Ad22e2317ac52811AC41C1A63cfa13aEe";
const COMPTROLLER_CORE = "0xD6e3E2A1d8d95caE355D15b3b9f8E5c2511874dd";
const TREASURY = "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52";
const RESILIENT_ORACLE = "0x8f3618c4F0183e14A218782c116fb2438571dAC9";
const BINANCE_ORACLE = "0xB09EC9B628d04E1287216Aa3e2432291f50F9588";
const BTCB = "0x7c6b91d9be155a6db01f749217d76ff02a7227f2";
const ETH = "0xe7798f023fc62146e8aa1b36da45fb70855a77ea";
const USDT = "0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3";
const WBNB = "0x4200000000000000000000000000000000000006";
const FDUSD = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
const VBTCB_CORE = "0xED827b80Bd838192EA95002C01B5c6dA8354219a";
const VETH_CORE = "0x509e81eF638D489936FA85BC58F52Df01190d26C";
const VUSDT_CORE = "0xb7a01Ba126830692238521a1aA7E7A7509410b8e";
const VWBNB_CORE = "0x53d11cB8A0e5320Cd7229C3acc80d1A0707F2672";
const VFDUSD_CORE = "0x13B492B8A03d072Bab5C54AC91Dba5b830a50917";
const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)
const COMMUNITY_WALLET = "0xc444949e0054a23c44fc45789738bdf64aed2391";

// IL configuration & FDUSD price feed configuration
const vip002 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        "0x0000000000000000000000000000000000000000",
        "setCollateralFactor(address,uint256,uint256)",
        POOL_REGISTRY,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: ["0x0000000000000000000000000000000000000000", "setMarketSupplyCaps(address[],uint256[])", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: ["0x0000000000000000000000000000000000000000", "setMarketBorrowCaps(address[],uint256[])", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: ["0x0000000000000000000000000000000000000000", "setLiquidationIncentive(uint256)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: ["0x0000000000000000000000000000000000000000", "setCloseFactor(uint256)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: ["0x0000000000000000000000000000000000000000", "setMinLiquidatableCollateral(uint256)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: ["0x0000000000000000000000000000000000000000", "supportMarket(address)", POOL_REGISTRY],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: ["0x0000000000000000000000000000000000000000", "setCloseFactor(uint256)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        "0x0000000000000000000000000000000000000000",
        "setReduceReservesBlockDelta(uint256)",
        opbnbmainnet.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        "0x0000000000000000000000000000000000000000",
        "setCollateralFactor(address,uint256,uint256)",
        opbnbmainnet.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        "0x0000000000000000000000000000000000000000",
        "setLiquidationIncentive(uint256)",
        opbnbmainnet.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        "0x0000000000000000000000000000000000000000",
        "setMarketBorrowCaps(address[],uint256[])",
        opbnbmainnet.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        "0x0000000000000000000000000000000000000000",
        "setMarketSupplyCaps(address[],uint256[])",
        opbnbmainnet.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        "0x0000000000000000000000000000000000000000",
        "setActionsPaused(address[],uint256[],bool)",
        opbnbmainnet.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        "0x0000000000000000000000000000000000000000",
        "setMinLiquidatableCollateral(uint256)",
        opbnbmainnet.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [POOL_REGISTRY, "addPool(string,address,uint256,uint256,uint256)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [POOL_REGISTRY, "addMarket(AddMarketInput)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [POOL_REGISTRY, "setPoolName(address,string)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [POOL_REGISTRY, "updatePoolMetadata(address,VenusPoolMetaData)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        "0x0000000000000000000000000000000000000000",
        "setProtocolSeizeShare(uint256)",
        opbnbmainnet.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: ["0x0000000000000000000000000000000000000000", "setReserveFactor(uint256)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        "0x0000000000000000000000000000000000000000",
        "setInterestRateModel(address)",
        opbnbmainnet.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        "0x0000000000000000000000000000000000000000",
        "updateJumpRateModel(uint256,uint256,uint256,uint256)",
        opbnbmainnet.NORMAL_TIMELOCK,
      ],
    },
    { target: POOL_REGISTRY, signature: "acceptOwnership()", params: [] },
    { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_CORE,
      signature: "setPriceOracle(address)",
      params: [RESILIENT_ORACLE],
    },
    {
      target: BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["FDUSD", STALE_PERIOD_26H],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          FDUSD,
          [BINANCE_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },
    {
      target: POOL_REGISTRY,
      signature: "addPool(string,address,uint256,uint256,uint256)",
      params: ["Core", COMPTROLLER_CORE, "500000000000000000", "1100000000000000000", "100000000000000000000"],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [BTCB, "35531430000000000", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: BTCB,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: BTCB,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "35531430000000000"],
    },
    {
      target: VBTCB_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VBTCB_CORE,
          "700000000000000000",
          "750000000000000000",
          "35531430000000000",
          TREASURY,
          "1000000000000000000",
          "550000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [ETH, "610978879332136515", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ETH,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: ETH,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "610978879332136515"],
    },
    {
      target: VETH_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VETH_CORE,
          "700000000000000000",
          "750000000000000000",
          "610978879332136515",
          TREASURY,
          "25000000000000000000",
          "16000000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDT, "1800000000010000000000", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: USDT,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "1800000000010000000000"],
    },
    {
      target: VUSDT_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VUSDT_CORE,
          "750000000000000000",
          "770000000000000000",
          "1800000000010000000000",
          TREASURY,
          "150000000000000000000000",
          "130000000000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WBNB, "4881499602605344833", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: WBNB,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: WBNB,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "4881499602605344833"],
    },
    {
      target: VWBNB_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWBNB_CORE,
          "600000000000000000",
          "650000000000000000",
          "4881499602605344833",
          TREASURY,
          "100000000000000000000",
          "75000000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [FDUSD, "1800000000010000000000", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: FDUSD,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, 0],
    },
    {
      target: FDUSD,
      signature: "approve(address,uint256)",
      params: [POOL_REGISTRY, "1800000000010000000000"],
    },
    {
      target: VFDUSD_CORE,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VFDUSD_CORE,
          "750000000000000000",
          "770000000000000000",
          "1800000000010000000000",
          TREASURY,
          "150000000000000000000000",
          "130000000000000000000000",
        ],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [FDUSD, "7200000000000000000000", COMMUNITY_WALLET],
    },
  ]);
};

export default vip002;
