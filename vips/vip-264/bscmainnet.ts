import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
const NEW_IR = "0xF558Be24F2CACb65a4BB41A155631C83B15388F1";

export const vip264 = () => {
  const meta = {
    version: "v2",
    title: "VIP-264 Risk Parameters Adjustments (BNB)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Core Pool BNB IR Curve Update](https://community.venus.io/t/core-pool-bnb-ir-curve-update/4159).

- [BNB (Core pool)](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36)
    - Increase kink, from 0.6 to 0.8
    - Increase multiplier (annualized), from 0.15 to 0.225
    - Increase jump multiplier (annualized), from 4 to 6.8

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/223](https://github.com/VenusProtocol/vips/pull/223)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: VBNB_ADMIN,
        signature: "_setInterestRateModel(address)",
        params: [NEW_IR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip264;
