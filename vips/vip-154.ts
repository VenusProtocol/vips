import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const VWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
export const NEW_SUPPLY_CAP = parseUnits("16000", 18);

export const vip154 = () => {
  const meta = {
    version: "v2",
    title: "VIP-154 Risk Parameters Update",
    description: `
    WBETH (Core pool):
      Supply cap: 8,000 -> 16,000
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
        params: [[VWBETH], [NEW_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
