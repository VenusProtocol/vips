import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const PESSIMISTIC_RECEIVER = "0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f";
const FAIRYPROOF_RECEIVER = "0x060a08fff78aedba4eef712533a324272bf68119";

export const vip257 = () => {
  const meta = {
    version: "v2",
    title: "VIP-257 Payment for Audits",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with these payments",
    againstDescription: "I do not think that Venus Protocol should proceed with these payments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with these payments",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("5000", 18), PESSIMISTIC_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("15000", 18), FAIRYPROOF_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip257;
