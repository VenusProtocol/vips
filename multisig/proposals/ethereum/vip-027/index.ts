import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const LST_POOL_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const LST_POOL_VWEETH = "0xb4933AF59868986316Ed37fa865C829Eba2df0C7";
export const VWEETH_BORROW_CAP = parseUnits("1500", 18);

export const vip027 = () => {
  return makeProposal([
    {
      target: LST_POOL_COMPTROLLER,
      signature: "setMarketBorrowCaps(address[],uint256[])",
      params: [[LST_POOL_VWEETH], [VWEETH_BORROW_CAP]],
    },
  ]);
};

export default vip027;
