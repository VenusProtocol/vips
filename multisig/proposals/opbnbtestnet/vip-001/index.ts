import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;

const ACM = "0x049f77f7046266d27c3bc96376f53c17ef09c986";
const RESILIENT_ORACLE = "0xEF4e53a9A4565ef243A2f0ee9a7fc2410E1aA623";
const BINANCE_ORACLE = "0x496B6b03469472572C47bdB407d5549b244a74F2";
const BOUND_VALIDATOR = "0x049537Bb065e6253e9D8D08B45Bf6b753657A746";
const MOCK_BTCB = "0x7Af23F9eA698E9b953D2BD70671173AaD0347f19";
const MOCK_ETH = "0x94680e003861D43C6c0cf18333972312B6956FF1";
const MOCK_USDT = "0x8ac9B3801D0a8f5055428ae0bF301CA1Da976855";
const MOCK_WBNB = "0xF9ce72611a1BE9797FdD2c995dB6fB61FD20E4eB";
const XVS = "0x3d0e20D4caD958bc848B045e1da19Fe378f86f03";
const DEFAULT_PROXY_ADMIN = "0xB1281ADC816fba7df64B798D7A0BC4bd2a6d42f4";
const BINANCE_ORACLE_IMPL = "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383";

const vip001 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "pause()", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "unpause()", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "setOracle(address,address,uint8)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BINANCE_ORACLE, "setSymbolOverride(string,string)", opbnbtestnet.NORMAL_TIMELOCK],
    },
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "upgrade(address,address)",
      params: [BINANCE_ORACLE, BINANCE_ORACLE_IMPL],
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
      params: ["BTC", "86400"],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_BTCB,
          [BINANCE_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },
    {
      target: BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["ETH", "86400"],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_ETH,
          [BINANCE_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },
    {
      target: BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["USDT", "86400"],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_USDT,
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
      params: ["BNB", "86400"],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          MOCK_WBNB,
          [BINANCE_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },
    {
      target: BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["XVS", "86400"],
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
