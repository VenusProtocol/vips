import { makeProposal } from "../../../../src/utils";

const XVS_VAULT_PROXY = "0x1129f882eAa912aE6D4f6D445b2E2b1eCbA99fd5";
const NEW_XVS_IMPLEMENTATION = "0xA6814c7c8Da831214b5488e57d11b1a1071761c9";

const vip019 = () => {
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

export default vip019;
