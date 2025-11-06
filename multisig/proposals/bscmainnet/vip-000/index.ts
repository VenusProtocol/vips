import { parseUnits } from "ethers/lib/utils";
import { makeProposal } from "src/utils";

const VCAKE_BNB = "0x86aC3974e2BD0d60825230fa6F355fF11409df5c";
const VFIL_BNB = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";

const BORROWER = "0xa98e339f5a0f135792286d481b4e23d91a667d3f";
const CAKE_DEBT = parseUnits("394048.61", 18); // 394,048.61 CAKE
const FIL_DEBT = parseUnits("4193.80", 18); // 4,193.80 FIL

const vip000 = () => {
  return makeProposal([
    {
      target: VCAKE_BNB,
      signature: "repayBorrowBehalf(address,uint256)",
      params: [BORROWER, CAKE_DEBT],
    },

    {
      target: VFIL_BNB,
      signature: "repayBorrowBehalf(address,uint256)",
      params: [BORROWER, FIL_DEBT],
    },
  ]);
};

export default vip000;
