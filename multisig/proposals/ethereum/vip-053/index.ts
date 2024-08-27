import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";

const vip053 = () => {
  return makeProposal([
    {
      target: ethereum.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip053;
