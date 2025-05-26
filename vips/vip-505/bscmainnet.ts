import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VUSD1 = "0x0C1DA220D301155b87318B90692Da8dc43B67340";

export const vip505 = () => {
  const meta = {
    version: "v2",
    title: "Increase USD1 CF to 0.5",
    description: `#### Summary`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: NETWORK_ADDRESSES.bscmainnet.UNITROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VUSD1, parseUnits("0.5", 18)],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip505;
