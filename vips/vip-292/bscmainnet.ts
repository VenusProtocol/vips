import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
const NEW_XVS_IMPLEMENTATION = "0x165b91ffb9EdfE2DceC518C95545b0D72F274EC2";

const vip292 = () => {
  const meta = {
    version: "v2",
    title: "VIP-292 Update XVSVault Implementation",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [NEW_XVS_IMPLEMENTATION],
      },
      {
        target: NEW_XVS_IMPLEMENTATION,
        signature: "_become(address)",
        params: [XVS_VAULT_PROXY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip292;
