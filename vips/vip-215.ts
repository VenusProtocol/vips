import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const CONFIGURE_ATTACKER_COMPTROLLER_IMPL = "0xAE37464537fDa217258Bb2Cd70e4f8ffC7E95790";
const DIAMOND_IMPL = "0xD93bFED40466c9A9c3E7381ab335a08807318a1b";
const MOVE_DEBT_DELEGATE = "0x89621C48EeC04A85AfadFD37d32077e65aFe2226";

const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

export const vip215 = () => {
  const meta = {
    version: "v2",
    title: "VIP-215",
    description: `
    `,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: MOVE_DEBT_DELEGATE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: MOVE_DEBT_DELEGATE,
        signature: "setBorrowAllowed(address,bool)",
        params: [VUSDC, true],
      },
      {
        target: MOVE_DEBT_DELEGATE,
        signature: "setBorrowAllowed(address,bool)",
        params: [VUSDT, true],
      },
      {
        target: COMPTROLLER,
        signature: "_setPendingImplementation(address)",
        params: [CONFIGURE_ATTACKER_COMPTROLLER_IMPL],
      },
      {
        target: CONFIGURE_ATTACKER_COMPTROLLER_IMPL,
        signature: "_become(address)",
        params: [COMPTROLLER],
      },
      {
        target: COMPTROLLER,
        signature: "setDelegateForBNBHacker(address)",
        params: [MOVE_DEBT_DELEGATE],
      },
      {
        target: COMPTROLLER,
        signature: "_setPendingImplementation(address)",
        params: [DIAMOND_IMPL],
      },
      {
        target: DIAMOND_IMPL,
        signature: "_become(address)",
        params: [COMPTROLLER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
