import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
export const NEW_VTOKEN_IMPLEMENTATION = "0xD594F41965881A859a147624c9F03fEb32ad2d33";

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
