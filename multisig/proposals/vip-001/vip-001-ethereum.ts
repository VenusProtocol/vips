import { makeProposal } from "../../../src/utils";

const RESILIENT_ORACLE = "0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94";
const CHAINLINK_ORACLE = "0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2";
const REDSTONE_ORACLE = "0x0FC8001B2c9Ec90352A46093130e284de5889C86";
const BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";
const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
const ETHEREUM_MULTISIG = "0x285960C5B22fD66A736C7136967A3eB15e93CC67";

const STALE_PERIOD_100M = 60 * 100; // 100 minutes (for pricefeeds with heartbeat of 1 hr)
const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)

interface TokenConfig {
  tokenAddress: string;
  priceFeed: string;
}

// Token configurations
const USDC: TokenConfig = {
  tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  priceFeed: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
};

const USDT: TokenConfig = {
  tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  priceFeed: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
};

const WBTC: TokenConfig = {
  tokenAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  priceFeed: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
};

const WETH: TokenConfig = {
  tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  priceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
};

const CRV: TokenConfig = {
  tokenAddress: "0xD533a949740bb3306d119CC777fa900bA034cd52",
  priceFeed: "0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f",
};

const crvUSD: TokenConfig = {
  tokenAddress: "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e",
  priceFeed: "0xEEf0C605546958c1f899b6fB336C20671f9cD49F",
};

// VIP: Configures the new oracle with the ACL and configures the initial price feeds on this oracle
export const vip001 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "pause()", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "unpause()", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "setOracle(address,address,uint8)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [REDSTONE_ORACLE, "setDirectPrice(address,uint256)", ETHEREUM_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", ETHEREUM_MULTISIG],
    },
    { target: RESILIENT_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: CHAINLINK_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: REDSTONE_ORACLE, signature: "acceptOwnership()", params: [] },
    { target: BOUND_VALIDATOR, signature: "acceptOwnership()", params: [] },
    {
      target: CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WBTC.tokenAddress, WBTC.priceFeed, STALE_PERIOD_100M]],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WBTC.tokenAddress,
          [
            CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WETH.tokenAddress, WETH.priceFeed, STALE_PERIOD_100M]],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WETH.tokenAddress,
          [
            CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDC.tokenAddress, USDC.priceFeed, STALE_PERIOD_26H]],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDC.tokenAddress,
          [
            CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDT.tokenAddress, USDT.priceFeed, STALE_PERIOD_26H]],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDT.tokenAddress,
          [
            CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[CRV.tokenAddress, CRV.priceFeed, STALE_PERIOD_26H]],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          CRV.tokenAddress,
          [
            CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[crvUSD.tokenAddress, crvUSD.priceFeed, STALE_PERIOD_26H]],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          crvUSD.tokenAddress,
          [
            CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
  ]);
};
