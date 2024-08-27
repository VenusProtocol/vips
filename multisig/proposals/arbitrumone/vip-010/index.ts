import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

export const ARBITRUM_ONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";

const vip010 = () => {
  return makeProposal([
    {
      target: arbitrumone.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [arbitrumone.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip010;
