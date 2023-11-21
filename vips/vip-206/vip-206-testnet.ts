import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const VUNI = "0x171B468b52d7027F12cEF90cd065d6776a25E24e";
const NEW_SUPPLY_CAP = parseUnits("100000", 18);
const NEW_BORROW_CAP = parseUnits("50000", 18);

export const vip206Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-206 Update Risk Parameters of UNI Market",
    description: `
        VIP
        Risk parameters suggested by Chaos lab:
        Supply cap:  100,000(full tokens)
        Borrow cap: 50,000 (full tokens)
        `,
    forDescription: "I agree that Venus Protocol should proceed with the new Risk Parameters suggested by chaos lab",
    againstDescription:
      "I do not think that Venus Protocol should proceed with the new Risk Parameters suggested by chaos lab",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with the new Risk Parameters suggested by chaos lab",
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
    ProposalType.REGULAR,
  );
};
