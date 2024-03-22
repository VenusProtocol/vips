import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const VTREASURY = "0x3370915301E8a6A6baAe6f461af703e2498409F3";
const vip000 = () => {
  return makeProposal([
    {
      target: VTREASURY,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip000;
