import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const XVS_BRIDGE_DEST = "0x888E317606b4c590BBAD88653863e8B345702633";
export const XVS_MINT_LIMIT = parseUnits("1250000", 18);

const vip016 = () => {
  return makeProposal([
    {
      target: XVS,
      signature: "setMintCap(address,uint256)",
      params: [XVS_BRIDGE_DEST, XVS_MINT_LIMIT],
    },
  ]);
};

export default vip016;
