import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const USDT_AMOUNT = parseUnits("275000", 18);

export const vip214 = () => {
  const meta = {
    version: "v2",
    title: "VIP-214",
    description: `.`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };
  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
