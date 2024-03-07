import { makeProposal } from "../../../src/utils";

const PRIME_LIQUIDITY_PROVIDER = "0xF68E8925d45fb6679aE8caF7f859C76BdD964325";
const PRIME = "0x7831156A181288ce76B5952624Df6C842F4Cc0c1";
const TREASURY = "0x3370915301E8a6A6baAe6f461af703e2498409F3";

const BTCB = "0x7Af23F9eA698E9b953D2BD70671173AaD0347f19";
const ETH = "0x94680e003861D43C6c0cf18333972312B6956FF1";

export const vip013 = () => {
  return makeProposal([
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "setTokensDistributionSpeed(address[],uint256[])",
      params: [
        [ETH, BTCB],
        ["24438657407407", "126"],
      ],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [ETH, "42230000000000000000", PRIME_LIQUIDITY_PROVIDER],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [BTCB, "2180000000000000000", PRIME_LIQUIDITY_PROVIDER],
    },
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "resumeFundsTransfer()",
      params: [],
    },
    {
      target: PRIME,
      signature: "togglePause()",
      params: [],
    },
  ]);
};
