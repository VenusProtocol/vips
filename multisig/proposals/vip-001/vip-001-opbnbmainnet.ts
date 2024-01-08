import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;

// VIP: Configures the new oracle with the ACM and configures the initial price feeds on this oracle
export const vip001 = () => {
  return makeProposal([
    {
      target: opbnbmainnet.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opbnbmainnet.RESILIENT_ORACLE, "pause()", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbmainnet.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opbnbmainnet.RESILIENT_ORACLE, "unpause()", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbmainnet.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opbnbmainnet.RESILIENT_ORACLE, "setOracle(address,address,uint8)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbmainnet.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opbnbmainnet.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbmainnet.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opbnbmainnet.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbmainnet.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opbnbmainnet.BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", opbnbmainnet.NORMAL_TIMELOCK],
    },

    {
      target: opbnbmainnet.ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opbnbmainnet.BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", opbnbmainnet.NORMAL_TIMELOCK],
    },
    { target: opbnbmainnet.RESILIENT_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: opbnbmainnet.BOUND_VALIDATOR, signature: "acceptOwnership()", params: [] },
    { target: opbnbmainnet.BINANCE_ORACLE, signature: "acceptOwnership()", params: [] },

    {
      target: opbnbmainnet.BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["BTCB", 144000],
    },
    {
      target: opbnbmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          opbnbmainnet.BTCB,
          [
            opbnbmainnet.BINANCE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },

    {
      target: opbnbmainnet.BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["ETH", 144000],
    },
    {
      target: opbnbmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          opbnbmainnet.ETH,
          [
            opbnbmainnet.BINANCE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: opbnbmainnet.BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["USDT", 144000],
    },
    {
      target: opbnbmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          opbnbmainnet.USDT,
          [
            opbnbmainnet.BINANCE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: opbnbmainnet.BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["WBNB", 144000],
    },
    {
      target: opbnbmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          opbnbmainnet.WBNB,
          [
            opbnbmainnet.BINANCE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: opbnbmainnet.BINANCE_ORACLE,
      signature: "setMaxStalePeriod(string,uint256)",
      params: ["XVS", 144000],
    },
    {
      target: opbnbmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          opbnbmainnet.XVS,
          [
            opbnbmainnet.BINANCE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
  ]);
};
