import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
const NEW_SUPPLY_CAP = parseUnits("100000", 18);
const NEW_BORROW_CAP = parseUnits("50000", 18);

export const vip206 = () => {
  const meta = {
    version: "v2",
    title: "VIP-206 Update Risk Parameters of UNI Market",
    description: `
        VIP
        Risk parameters suggested by Chaos lab:
        Supply cap: 100,000(full tokens)
        Borrow cap: 50,000 (full tokens)
        `,
    forDescription: "I agree that Venus Protocol should proceed with the new Risk Parameters suggested by chaos lab",
    againstDescription:
      "I do not think that Venus Protocol should proceed with the new Risk Parameters suggested by chaos lab",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with the Anew Risk Parameters suggested by chaos lab",
  };
  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VUNI], [NEW_SUPPLY_CAP]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VUNI], [NEW_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
