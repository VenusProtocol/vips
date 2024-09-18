import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { makeProposal } from "../../../../src/utils";

const { opmainnet } = NETWORK_ADDRESSES;

export const TREASURY = "0x104c01EB7b4664551BE6A9bdB26a8C5c6Be7d3da";
export const ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";

const CHAINLINK_BTC_FEED = "0xD702DD976Fb76Fffc2D3963D037dfDae5b04E593";
const CHAINLINK_ETH_FEED = "0x13e3Ee699D1909E989722E753853AE30b17e08c5";
const CHAINLINK_USDC_FEED = "0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3";
const CHAINLINK_USDT_FEED = "0xECef79E109e997bCA29c1c0897ec9d7b03647F5E";
const CHAINLINK_OP_FEED = "0x0D276FC14719f9292D5C1eA2198673d1f4269246";
const REDSTONE_XVS_FEED = "0x414F8f961969A8131AbE53294600c6C515E68f81";

const WBTC = "0x68f180fcCe6836688e9084f035309E29Bf0A2095";
const WETH = "0x4200000000000000000000000000000000000006";
const USDC = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607";
const USDT = "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58";
const OP = "0x4200000000000000000000000000000000000042";

const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)
const STALE_PERIOD_30M = 60 * 30; // 30 minutes (pricefeeds with heartbeat of 30 minutes)

const vip000 = () => {
  return makeProposal([
    {
      target: TREASURY,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.RESILIENT_ORACLE, "pause()", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.RESILIENT_ORACLE, "unpause()", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.RESILIENT_ORACLE, "setOracle(address,address,uint8)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", opmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [opmainnet.BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", opmainnet.GUARDIAN],
    },
    {
      target: opmainnet.RESILIENT_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: opmainnet.CHAINLINK_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: opmainnet.BOUND_VALIDATOR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: opmainnet.REDSTONE_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: opmainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WBTC, CHAINLINK_BTC_FEED, STALE_PERIOD_30M]],
    },
    {
      target: opmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WBTC,
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
      target: opmainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WETH, CHAINLINK_ETH_FEED, STALE_PERIOD_30M]],
    },
    {
      target: opmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WETH,
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
      target: opmainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDC, CHAINLINK_USDC_FEED, STALE_PERIOD_30M]],
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
      target: opmainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDT, CHAINLINK_USDT_FEED, STALE_PERIOD_30M]],
    },
    {
      target: opmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDT,
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
      target: opmainnet.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[OP, CHAINLINK_OP_FEED, STALE_PERIOD_26H]],
    },
    {
      target: opmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          OP,
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
      target: opmainnet.REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[opmainnet.XVS, REDSTONE_XVS_FEED, STALE_PERIOD_26H]],
    },
    {
      target: opmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          opmainnet.XVS,
          [
            opmainnet.REDSTONE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
  ]);
};
export default vip000;
