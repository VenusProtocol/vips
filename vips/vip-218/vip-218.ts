import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const NEW_COLLATERAL_FACTOR = parseUnits("0.72", 18);

export const vip218 = () => {
  const meta = {
    version: "v2",
    title: "Reduce CF of the BUSD market to 0.72",
    description: "Chaos labs recommendations : Reduce CF of the BUSD market to 0.72",
    forDescription: "I agree that Venus Protocol should proceed with this proposal to reduce CF of BUSD market",
    againstDescription:
      "I do not think that Venus Protocol should proceed with this proposal to reduce CF of BUSD market",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with this proposal to reduce CF of BUSD market",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VBUSD, NEW_COLLATERAL_FACTOR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
