import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const TOKEN_REDEEMER = "0x13fFde8050fa0Ef5A6f3c28B500c9267ec8A2C46";
export const COMMUNITY_WALLET = "0xc444949e0054a23c44fc45789738bdf64aed2391";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const VUSDC_AMOUNT = parseUnits("1049500", 8); // (close to 25000 USDC, taking into account 1 USDC = 41.9 vUSDC)

const vip306 = () => {
  const meta = {
    version: "v2",
    title: "VIP-306 VIP to transfer the bootstrap liquidity needed for Arbitrum one to the Community wallet",
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
        signature: "redeemAndTransfer(address,address)",
        params: [VUSDC, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip306;
