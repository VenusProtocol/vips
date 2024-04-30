import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;

const ACM = "0x049f77f7046266d27c3bc96376f53c17ef09c986";
const XVS_VAULT_PROXY = "0xB14A0e72C5C202139F78963C9e89252c1ad16f01";
const NEW_XVS_IMPLEMENTATION = "0xe4DE4460c93Af011DC0624bc7Ce4a2Bf40feE4ea";

const vip018 = () => {
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
    {
      target: XVS_VAULT_PROXY,
      signature: "initializeTimeManager(bool,uint256)",
      params: [true, 0],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", opbnbtestnet.GUARDIAN],
    },
  ]);
};

export default vip018;
