import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

const CHAINLINK_BTC_FEED = "0xd0C7101eACbB49F3deCcCc166d238410D6D46d57";
const CHAINLINK_ETH_FEED = "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612";
const CHAINLINK_USDC_FEED = "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3";
const CHAINLINK_USDT_FEED = "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7";
const CHAINLINK_ARB_FEED = "0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6";
const REDSTONE_XVS_FEED = "0xd9a66Ff1D660aD943F48e9c606D09eA672f312E8";

const WBTC = "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f";
const WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
const USDC = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
const USDT = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";
const ARB = "0x912ce59144191c1204e64559fe8253a0e49e6548";
const XVS = "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52";

const ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const BOUND_VALIDATOR = "0x2245FA2420925Cd3C2D889Ddc5bA1aefEF0E14CF";

const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)

const vip001 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.RESILIENT_ORACLE, "pause()", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.RESILIENT_ORACLE, "unpause()", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.RESILIENT_ORACLE, "setOracle(address,address,uint8)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumone.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumone.RESILIENT_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: arbitrumone.CHAINLINK_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: arbitrumone.REDSTONE_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: arbitrumone.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WBTC, CHAINLINK_BTC_FEED, STALE_PERIOD_26H]],
    },
    {
      target: arbitrumone.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WBTC,
          [
            arbitrumone.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: arbitrumone.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WETH, CHAINLINK_ETH_FEED, STALE_PERIOD_26H]],
    },
    {
      target: arbitrumone.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WETH,
          [
            arbitrumone.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: arbitrumone.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDC, CHAINLINK_USDC_FEED, STALE_PERIOD_26H]],
    },
    {
      target: arbitrumone.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDC,
          [
            arbitrumone.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: arbitrumone.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDT, CHAINLINK_USDT_FEED, STALE_PERIOD_26H]],
    },
    {
      target: arbitrumone.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDT,
          [
            arbitrumone.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: arbitrumone.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[ARB, CHAINLINK_ARB_FEED, STALE_PERIOD_26H]],
    },
    {
      target: arbitrumone.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          ARB,
          [
            arbitrumone.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: arbitrumone.REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[XVS, REDSTONE_XVS_FEED, STALE_PERIOD_26H]],
    },
    {
      target: arbitrumone.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          XVS,
          [
            arbitrumone.REDSTONE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
  ]);
};

export default vip001;
