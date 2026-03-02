import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const vslisBNB = "0xaB5504A3cde0d8253E8F981D663c7Ff7128B3e56";

export const NEW_CF = parseUnits("0.8", 18);
export const NEW_LT = parseUnits("0.8", 18);
export const NEW_LI = parseUnits("1.1", 18);

export const vip597 = () => {
  const meta = {
    version: "v2",
    title: "VIP-597 [BNB Chain] slisBNB Core Pool Risk Parameter Update",
    description: "VIP-597 [BNB Chain] slisBNB Core Pool Risk Parameter Update",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vslisBNB, NEW_CF, NEW_LT],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(address,uint256)",
        params: [vslisBNB, NEW_LI],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip597;
