import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;

const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
const BINANCE_ORACLE = "0xB09EC9B628d04E1287216Aa3e2432291f50F9588";
const RESILIENT_ORACLE = "0x8f3618c4F0183e14A218782c116fb2438571dAC9";
const BOUND_VALIDATOR = "0xd1f80C371C6E2Fa395A5574DB3E3b4dAf43dadCE";
const BTCB = "0x7c6b91d9be155a6db01f749217d76ff02a7227f2";
const ETH = "0xe7798f023fc62146e8aa1b36da45fb70855a77ea";
const USDT = "0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3";
const WBNB = "0x4200000000000000000000000000000000000006";
const XVS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";
const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)
const STALE_PERIOD_100S = 100; // 100 seconds (pricefeeds with heartbeat of 1 minute)
const STALE_PERIOD_25M = 60 * 25; // 25 minutes (pricefeeds with heartbeat of 15 minutes)

const vip001 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "pause()", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "unpause()", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "setOracle(address,address,uint8)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BINANCE_ORACLE, "setSymbolOverride(string,string)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    { target: RESILIENT_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: BOUND_VALIDATOR, signature: "acceptOwnership()", params: [] },
    { target: BINANCE_ORACLE, signature: "acceptOwnership()", params: [] },

    {
      target: BINANCE_ORACLE,
      signature: "setSymbolOverride(string,string)",
      params: ["BTCB", "BTC"],
    },
    {
      target: BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["BTC", STALE_PERIOD_100S],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          BTCB,
          [BINANCE_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },

    {
      target: BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["ETH", STALE_PERIOD_100S],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          ETH,
          [BINANCE_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },
    {
      target: BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["USDT", STALE_PERIOD_26H],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDT,
          [BINANCE_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },
    {
      target: BINANCE_ORACLE,
      signature: "setSymbolOverride(string,string)",
      params: ["WBNB", "BNB"],
    },
    {
      target: BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["BNB", STALE_PERIOD_100S],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WBNB,
          [BINANCE_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },
    {
      target: BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["XVS", STALE_PERIOD_25M],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          XVS,
          [BINANCE_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },
  ]);
};

export default vip001
