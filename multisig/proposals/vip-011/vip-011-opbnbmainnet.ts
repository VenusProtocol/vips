import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../src/utils";

const MULTISIG = "0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207";
export const TREASURY = "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52";
export const WBNB_AMOUNT = parseUnits("45", 18);
export const WBNB = "0x4200000000000000000000000000000000000006";

export const vip011 = () => {
  return makeProposal([
    {
      target: TREASURY,
      signature: "withdrawTreasuryNative(uint256,address)",
      params: [WBNB_AMOUNT, MULTISIG],
    },
    {
      target: WBNB,
      signature: "deposit()",
      params: [],
      value: parseUnits("45", 18).toString(),
    },
    {
      target: WBNB,
      signature: "transfer(address,uint256)",
      params: [TREASURY, parseUnits("45", 18)],
    },
  ]);
};
