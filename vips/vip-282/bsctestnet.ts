import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_VAULT_TREASURY = "0x317c6C4c9AA7F87170754DB08b4804dD689B68bF";
export const XVS_VAULT_TREASURY_NEW_IMPLEMENTATION = "0x7c7DcD99889ADe9caaA07026a699a4E7Da05A524";
export const DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";

const vip282 = () => {
  const meta = {
    version: "v2",
    title: "VIP-282",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [XVS_VAULT_TREASURY, XVS_VAULT_TREASURY_NEW_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip282;
