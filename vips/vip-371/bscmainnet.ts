import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";
export const COMMUNITY_WALLET = "0xc444949e0054a23c44fc45789738bdf64aed2391";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const VUSDC_AMOUNT = parseUnits("1022560", 8); // close to 25000 USDC, taking into account 1 USDC = 40.9 vUSDC with exchange rate of 244489614500844742686609163
const USDC_AMOUNT = parseUnits("25000", 18);

const vip371 = () => {
  const meta = {
    version: "v2",
    title: "VIP-371 Bootstrap liquidity for the Optimism markets",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VUSDC, VUSDC_AMOUNT, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [VUSDC, COMMUNITY_WALLET, USDC_AMOUNT, TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip371;
