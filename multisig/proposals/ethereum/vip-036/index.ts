import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
const LOWER_BOUND_RATIO = parseUnits("0.99", 18);
const rsETH_ONE_JUMP_REDSTONE_ORACLE = "0xf689AD140BDb9425fB83ba6f55866447244b5a23";
const rsETH_ONE_JUMP_CHAINLINK_ORACLE = "0xD63011ddAc93a6f8348bf7E6Aeb3E30Ad7B46Df8";
export const rsETH = "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7";
export const vrsETH = "0xDB6C345f864883a8F4cae87852Ac342589E76D1B";
export const vPTweETH = "0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C";
const BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";
export const VTOKEN_RECEIVER = "0x7AAd74b7f0d60D5867B59dbD377a71783425af47";
export const INITIAL_SUPPLY = parseUnits("2", 18);
export const SUPPLY_CAP = parseUnits("8000", 18);
export const BORROW_CAP = parseUnits("3600", 18);
const CHAINLINK_rsETH_FEED = "0x03c68933f7a3F76875C0bc670a58e69294cDFD01";
const REDSTONE_rsETH_FEED = "0xA736eAe8805dDeFFba40cAB8c99bCB309dEaBd9B";
const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr) ;
const CF = parseUnits("0.8", 18);
const LT = parseUnits("0.85", 18);

export const vip036 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: BOUND_VALIDATOR,
      signature: "setValidateConfig((address,uint256,uint256))",
      params: [[rsETH, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
    },
    {
      target: ethereum.REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[rsETH, REDSTONE_rsETH_FEED, STALE_PERIOD_26H]],
    },
    {
      target: ethereum.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[rsETH, CHAINLINK_rsETH_FEED, STALE_PERIOD_26H]],
    },
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          rsETH,
          [rsETH_ONE_JUMP_REDSTONE_ORACLE, rsETH_ONE_JUMP_CHAINLINK_ORACLE, rsETH_ONE_JUMP_CHAINLINK_ORACLE],
          [true, true, true],
        ],
      ],
    },

    // Add Market
    {
      target: ethereum.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [rsETH, INITIAL_SUPPLY, ethereum.NORMAL_TIMELOCK],
    },
    {
      target: rsETH,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: vrsETH,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.01", 18)],
    },
    {
      target: vrsETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: vPTweETH,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.01", 18)],
    },
    {
      target: ethereum.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [[vrsETH, CF, LT, INITIAL_SUPPLY, VTOKEN_RECEIVER, SUPPLY_CAP, BORROW_CAP]],
    },
  ]);
};

export default vip036;
