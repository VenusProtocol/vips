import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const VBETH = "0x972207A639CC1B374B893cc33Fa251b55CEB7c07";

const Actions = {
  BORROW: 2,
};

export const vip111 = () => {
  const meta = {
    version: "v2",
    title: "VIP-111 Delist BETH",
    description: `
        We will start delisting BETH.
          `,
    forDescription: "I agree that Venus Protocol should proceed with the Change Admin in VAI",
    againstDescription: "I do not think that Venus Protocol should proceed with the Change Admin in VAI",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Change Admin in VAI or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[VBETH], [Actions.BORROW], true],
      },
      {
        target: VBETH,
        signature: "_setReserveFactor(uint256)",
        params: ["1000000000000000000"],
      },
      {
        target: COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [[VBETH], ["0"], ["0"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
