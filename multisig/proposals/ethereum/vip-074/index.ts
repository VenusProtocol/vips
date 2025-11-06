import { parseUnits } from "ethers/lib/utils";
import { makeProposal } from "src/utils";

const VEIGEN_ETHEREUM = "0x256AdDBe0a387c98f487e44b85c29eb983413c5e";

const BORROWER = "0xa98e339f5a0f135792286d481b4e23d91a667d3f";
const EIGEN_DEBT = parseUnits("232162.71", 18); // 232,162.71 EIGEN

const vip000 = () => {
  return makeProposal([
    {
      target: VEIGEN_ETHEREUM,
      signature: "repayBorrowBehalf(address,uint256)",
      params: [BORROWER, EIGEN_DEBT],
    },
  ]);
};

export default vip000;
