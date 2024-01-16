import { makeProposal } from "../../../src/utils";

const PRIME_LIQUIDITY_PROVIDER = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";
const VTreasury = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

const ETH = "0x700868CAbb60e90d77B6588ce072d9859ec8E281";
const BTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const USDT = "0x8d412FD0bc5d826615065B931171Eed10F5AF266";

const ETH_AMOUNT = "42230000000000000000";
const BTC_AMOUNT = "218000000";
const USDC_AMOUNT = "61329430000";
const USDT_AMOUNT = "150666500000";

export const vip008 = () => {
  return makeProposal([
    {
      target: VTreasury,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [ETH, ETH_AMOUNT, PRIME_LIQUIDITY_PROVIDER],
    },
    {
      target: VTreasury,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [BTC, BTC_AMOUNT, PRIME_LIQUIDITY_PROVIDER],
    },
    {
      target: VTreasury,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDC, USDC_AMOUNT, PRIME_LIQUIDITY_PROVIDER],
    },
    {
      target: VTreasury,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDT, USDT_AMOUNT, PRIME_LIQUIDITY_PROVIDER],
    },
  ]);
};
