import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const VBUSD = "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4";
const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const NEW_COLLATERAL_FACTOR = parseUnits("0.72", 18);

export const vip218Testnet = () => {
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
