import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { makeProposal } from "../../../../src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const eBTC = "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642";
export const INITIAL_SUPPLY = parseUnits("0.14471345", 8);

export const vip068 = () => {
  return makeProposal([
    {
      target: ethereum.VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [eBTC, INITIAL_SUPPLY, ethereum.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip068;
