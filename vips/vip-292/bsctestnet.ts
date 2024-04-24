import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVS_VAULT_PROXY = "0x9aB56bAD2D7631B2A857ccf36d998232A8b82280";
const NEW_XVS_IMPLEMENTATION = "0x1D29d396c75d309baa90fBc57c0B70E156c49f04";

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
