import { makeProposal } from "../../../../src/utils";

const XVS_VAULT_PROXY = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
const NEW_XVS_IMPLEMENTATION = "0x43E5e72515140c147a72FB21021CF11dA1eBCe9a";

const vip021 = () => {
  return makeProposal([
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
  ]);
};

export default vip021;
