import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncsepolia } = NETWORK_ADDRESSES;

const vip006 = () => {
  return makeProposal([
    {
      target: zksyncsepolia.XVS_VAULT_PROXY,
      signature: "resume()",
      params: [],
    },
  ]);
};

export default vip006;
