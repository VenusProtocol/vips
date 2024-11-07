import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { makeProposal } from "../../../../src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const EIGEN = "0xec53bF9167f50cDEB3Ae105f56099aaaB9061F83";
export const INITIAL_SUPPLY = parseUnits("1854.883016", 18);

export const vip067 = () => {
  return makeProposal([
    {
      target: ethereum.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [EIGEN, INITIAL_SUPPLY, ethereum.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip067;
