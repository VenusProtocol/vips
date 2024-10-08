import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const COMPTROLLER_LIQUID_STAKED_ETH = "0x52bAB1aF7Ff770551BD05b9FC2329a0Bf5E23F16";

export const wstETH = "0x5979D7b546E38E414F7E9822514be443A4800529";
export const weETH = "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe";
export const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

export const VwstETH = "0x9df6B5132135f14719696bBAe3C54BAb272fDb16";
export const VweETH = "0x246a35E79a3a0618535A469aDaF5091cAA9f7E88";
export const VWETH = "0x39D6d13Ea59548637104E40e729E4aABE27FE106";

export const vTokenReceiverVwstETH = "0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61";
export const vTokenReceiverVweETH = "0x46cba1e9b1e5db32da28428f2fb85587bcb785e7";
export const REWARD_DISTRIBUTOR_LIQUID_STAKED_ETH = "0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D";
export const PRIME = "0xFE69720424C954A2da05648a0FAC84f9bf11Ef49";
export const COMPTROLLER_CORE = "0x317c1A5739F39046E20b08ac9BeEa3f10fD43326";
export const NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL = "0xD1e89806BAB8Cd7680DFc7425D1fA6d7D5F0C3FE";

const wstETH_ONE_JUMP_ORACLE = "0x748DeFdbaE5215cdF0C436c538804823b55D76bc";
const weETH_ONE_JUMP_ORACLE = "0x09eA4825a5e2FB2CB9a44F317c22e7D65053ea9d";
const CHAINLINK_wstETH_FEED = "0xB1552C5e96B312d0Bf8b554186F846C40614a540";
const CHAINLINK_weETH_FEED = "0x20bAe7e1De9c596f5F7615aeaa1342Ba99294e12";

const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)

// IL configuration
const vip013 = () => {
  return makeProposal([
    {
      target: arbitrumone.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          wstETH,
          [
            wstETH_ONE_JUMP_ORACLE,
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
      params: [[wstETH, CHAINLINK_wstETH_FEED, STALE_PERIOD_26H]],
    },
    { target: COMPTROLLER_LIQUID_STAKED_ETH, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_LIQUID_STAKED_ETH,
      signature: "setPriceOracle(address)",
      params: [arbitrumone.RESILIENT_ORACLE],
    },
    {
      target: arbitrumone.POOL_REGISTRY,
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
      target: arbitrumone.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [wstETH, parseUnits("3.55", 18), arbitrumone.GUARDIAN],
    },
    {
      target: wstETH,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, 0],
    },
    {
      target: wstETH,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, parseUnits("3.55", 18)],
    },
    {
      target: VwstETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VwstETH,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.01", 18)],
    },
    {
      target: arbitrumone.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VwstETH,
          parseUnits("0.93", 18),
          parseUnits("0.95", 18),
          parseUnits("3.55", 18),
          vTokenReceiverVwstETH,
          parseUnits("8000", 18),
          parseUnits("800", 18),
        ],
      ],
    },
    {
      target: arbitrumone.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          weETH,
          [
            weETH_ONE_JUMP_ORACLE,
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
      params: [[weETH, CHAINLINK_weETH_FEED, STALE_PERIOD_26H]],
    },
    {
      target: arbitrumone.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [weETH, parseUnits("4", 18), arbitrumone.GUARDIAN],
    },
    {
      target: weETH,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, 0],
    },
    {
      target: weETH,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, parseUnits("4", 18)],
    },
    {
      target: VweETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VweETH,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.01", 18)],
    },
    {
      target: arbitrumone.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VweETH,
          parseUnits("0.93", 18),
          parseUnits("0.95", 18),
          parseUnits("4", 18),
          vTokenReceiverVweETH,
          parseUnits("4600", 18),
          parseUnits("2300", 18),
        ],
      ],
    },
    {
      target: arbitrumone.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WETH, parseUnits("1.9678", 18), arbitrumone.GUARDIAN],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, "0"],
    },
    {
      target: WETH,
      signature: "approve(address,uint256)",
      params: [arbitrumone.POOL_REGISTRY, parseUnits("1.9678", 18)],
    },
    {
      target: VWETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["86400"],
    },
    {
      target: VWETH,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.01", 18)],
    },
    {
      target: arbitrumone.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          VWETH,
          "0",
          "0",
          parseUnits("1.9678", 18),
          arbitrumone.VTREASURY,
          parseUnits("14000", 18),
          parseUnits("12500", 18),
        ],
      ],
    },
    {
      target: arbitrumone.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [arbitrumone.XVS, parseUnits("15300", 18), REWARD_DISTRIBUTOR_LIQUID_STAKED_ETH],
    },
    { target: REWARD_DISTRIBUTOR_LIQUID_STAKED_ETH, signature: "acceptOwnership()", params: [] },
    {
      target: COMPTROLLER_LIQUID_STAKED_ETH,
      signature: "addRewardsDistributor(address)",
      params: [REWARD_DISTRIBUTOR_LIQUID_STAKED_ETH],
    },
    {
      target: REWARD_DISTRIBUTOR_LIQUID_STAKED_ETH,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        [VwstETH, VweETH, VWETH],
        ["327932098765432", "327932098765432", "393518518518518"],
        ["0", "0", "918209876543209"],
      ],
    },
    {
      target: NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: COMPTROLLER_CORE,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
    {
      target: COMPTROLLER_LIQUID_STAKED_ETH,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
  ]);
};

export default vip013;
