import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const VBUSD = "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4";
const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";

export const vip223Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-223 Risk Parameters Adjustments (BUSD)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates](https://community.venus.io/t/chaos-labs-risk-parameter-updates-12-26-23/3998).

- [BUSD (Core pool)](https://bscscan.com/address/0x08e0A5575De71037aE36AbfAfb516595fE68e5e4)
    - Reduce collateral factor, from 0.3 to 0

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: https://github.com/VenusProtocol/vips/pull/142`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VBUSD, "0"],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
