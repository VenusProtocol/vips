import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
export const NEW_VTOKEN_IMPLEMENTATION = "0xB0c4227FA3b7b2a5C298dCa960aB0631763D2839";

export const vip377 = () => {
  const meta = {
    version: "v2",
    title: "VIP-377",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_VTOKEN_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip377;
