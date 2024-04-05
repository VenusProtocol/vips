import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const XVS_VAULT_TREASURY_NEW_IMPLEMENTATION = "0xA95a4F34337d8FaC283C3e3D2a605b95DA916cD6";
export const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";

const vip279 = () => {
  const meta = {
    version: "v2",
    title: "VIP-279",
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

export default vip279;
