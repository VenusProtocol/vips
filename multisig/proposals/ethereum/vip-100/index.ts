import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { VTREASURY, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.ethereum;

export const PUFETH = "0xD9A442856C234a39a81a089C06451EBAa4306a72";
const INITIAL_SUPPLY = parseUnits("5", 18);

export const vip100 = () => {
  return makeProposal([
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [PUFETH, INITIAL_SUPPLY, NORMAL_TIMELOCK],
    },
  ]);
};

export default vip100;
