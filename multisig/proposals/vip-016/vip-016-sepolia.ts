import { makeProposal } from "../../../src/utils";

const PRIME = "0x27A8ca2aFa10B9Bc1E57FC4Ca610d9020Aab3739";
const PRIME_LIQUIDITY_PROVIDER = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";

const ETH = "0x700868CAbb60e90d77B6588ce072d9859ec8E281";
const BTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const USDT = "0x8d412FD0bc5d826615065B931171Eed10F5AF266";

export const vip016 = () => {
  return makeProposal([
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "setTokensDistributionSpeed(address[],uint256[])",
      params: [
        [ETH, BTC, USDC, USDT],
        [0, 0, 0, 0],
      ],
    },
    {
      target: PRIME,
      signature: "setLimit(uint256,uint256)",
      params: [
        0,
        1, // we already have a token minted
      ],
    },
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "pauseFundsTransfer()",
      params: [],
    },
    {
      target: PRIME,
      signature: "togglePause()",
      params: [],
    },
  ]);
};
