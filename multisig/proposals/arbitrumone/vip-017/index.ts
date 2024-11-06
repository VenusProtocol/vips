import { parseUnits } from "ethers/lib/utils";
import { makeProposal } from "src/utils";

export const XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";
export const XVS = "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52";
export const XVS_AMOUNT = parseUnits("4500", 18);

export const VTREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";

const vip008 = () => {
  return makeProposal([
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, XVS_AMOUNT, XVS_STORE],
    },
  ]);
};

export default vip008;
