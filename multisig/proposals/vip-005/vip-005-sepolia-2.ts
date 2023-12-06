import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../src/utils";

const XVS = "0xDb633C11D3F9E6B8D17aC2c972C9e3B05DA59bF9";
const XVS_BRIDGE = "0x307C77D8606d7E486aC5D73d309e16996A336dbd";
const XVS_MINT_CAP = parseUnits("10000", 18);

export const vip005 = () => {
  return makeProposal([
    {
      target: XVS,
      signature: "setMintCap(address,uint256)",
      params: [XVS_BRIDGE, XVS_MINT_CAP],
    },
  ]);
};
