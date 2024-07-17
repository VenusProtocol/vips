import { makeProposal } from "src/utils";

const XVS_BRIDGE_ADMIN = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";
const XVS_VAULT_TREASURY = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";

const vip046 = () => {
  return makeProposal([
    {
      target: XVS_BRIDGE_ADMIN,
      signature: "setWhitelist(address,bool)",
      params: [XVS_VAULT_TREASURY, true],
    },
  ]);
};

export default vip046;
