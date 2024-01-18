import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const MOVE_DEBT_DELEGATE = "0x89621C48EeC04A85AfadFD37d32077e65aFe2226";

const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";

export const vip241 = () => {
  const meta = {
    version: "v2",
    title: "VIP-241",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: MOVE_DEBT_DELEGATE,
        signature: "setRepaymentAllowed(address,address,bool)",
        params: [VUSDC, EXPLOITER_WALLET, true],
      },
      {
        target: MOVE_DEBT_DELEGATE,
        signature: "setRepaymentAllowed(address,address,bool)",
        params: [VUSDT, EXPLOITER_WALLET, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
