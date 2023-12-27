import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVS_VAULT_PROXY = "0x9aB56bAD2D7631B2A857ccf36d998232A8b82280";
const XVS_VAULT = "0xBd75fcB67E19a2F9eC5d410409be0A8D7DCfaA52";

export const vip223Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-223 Upgrade XVS Vault",
    description: `This VIP will perform the upgrade of XVS Vault`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [XVS_VAULT],
      },
      {
        target: XVS_VAULT,
        signature: "_become(address)",
        params: [XVS_VAULT_PROXY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
