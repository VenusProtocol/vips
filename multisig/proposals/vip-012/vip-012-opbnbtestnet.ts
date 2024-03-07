import { parseUnits } from "ethers/lib/utils";
import { makeProposal } from "../../../src/utils";

const PRIME_LIQUIDITY_PROVIDER = "0xF68E8925d45fb6679aE8caF7f859C76BdD964325";
const PRIME = "0x7831156A181288ce76B5952624Df6C842F4Cc0c1";
const COMPTROLLER = "0x2FCABb31E57F010D623D8d68e1E18Aed11d5A388";

const BTCB = "0x7Af23F9eA698E9b953D2BD70671173AaD0347f19";
const ETH = "0x94680e003861D43C6c0cf18333972312B6956FF1";
const USDT = "0x8ac9B3801D0a8f5055428ae0bF301CA1Da976855";

const vBTCB = "0x86F82bca79774fc04859966917D2291A68b870A9";
const vETH = "0x034Cc5097379B13d3Ed5F6c85c8FAf20F48aE480";
const vUSDT = "0xe3923805f6E117E51f5387421240a86EF1570abC";

export const vip012 = () => {
  return makeProposal([
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "initializeTokens(address[])",
      params: [[BTCB, ETH, USDT]],
    },
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "setTokensDistributionSpeed(address[],uint256[])",
      params: [
        [ETH, BTCB, USDT],
        ["0", "0", "0"],
      ],
    },
    {
      target: PRIME,
      signature: "addMarket(address,address,uint256,uint256)",
      params: [COMPTROLLER, vBTCB, parseUnits("2"), parseUnits("4")],
    },
    {
      target: PRIME,
      signature: "addMarket(address,address,uint256,uint256)",
      params: [COMPTROLLER, vETH, parseUnits("2"), parseUnits("4")],
    },
    {
      target: PRIME,
      signature: "addMarket(address,address,uint256,uint256)",
      params: [COMPTROLLER, vUSDT, parseUnits("2"), parseUnits("4")],
    },
  ]);
};