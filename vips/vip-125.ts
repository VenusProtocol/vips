import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const VXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";

export const vip125 = () => {
  const meta = {
    version: "v2",
    title: "VIP-125 Risk Parameters Update",
    description: `
    XVS:
        Increase supply cap to 1.3m from 1m
      `,
    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VXVS], [parseUnits("1300000", 18)]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
