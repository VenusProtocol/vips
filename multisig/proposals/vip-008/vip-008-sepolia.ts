import { makeProposal } from "../../../src/utils";

const PRIME_LIQUIDITY_PROVIDER = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";
const VTreasury = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
const PRIME = "0x27A8ca2aFa10B9Bc1E57FC4Ca610d9020Aab3739";

const ETH = "0x700868CAbb60e90d77B6588ce072d9859ec8E281";
const BTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const USDT = "0x8d412FD0bc5d826615065B931171Eed10F5AF266";

export const vip008 = () => {
  return makeProposal([
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "setTokensDistributionSpeed(address[],uint256[])",
      params: [
        [ETH, BTC, USDC, USDT],
        ["24438657407407", "126", "36881", "87191"],
      ],
    },
    {
      target: VTreasury,
      signature: "withdrawTreasuryBEP20(address,uint256,address)",
      params: [ETH, "42230000000000000000", PRIME_LIQUIDITY_PROVIDER],
    },
    {
      target: VTreasury,
      signature: "withdrawTreasuryBEP20(address,uint256,address)",
      params: [BTC, "2180000000000000000", PRIME_LIQUIDITY_PROVIDER],
    },
    {
      target: VTreasury,
      signature: "withdrawTreasuryBEP20(address,uint256,address)",
      params: [USDC, "61329430000000000000000", PRIME_LIQUIDITY_PROVIDER],
    },
    {
      target: VTreasury,
      signature: "withdrawTreasuryBEP20(address,uint256,address)",
      params: [USDT, "150666500000000000000000", PRIME_LIQUIDITY_PROVIDER],
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
