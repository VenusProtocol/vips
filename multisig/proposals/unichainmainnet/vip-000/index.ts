import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;
const vip000 = () => {
  return makeProposal([
    {
      target: unichainmainnet.VTREASURY,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};
export default vip000;
