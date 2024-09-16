import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
const NEW_IR = "0xDb8347b96c94Be24B9c077A4CDDAAD074F6480cf";

export const vip366 = () => {
  const meta = {
    version: "v2",
    title: "VIP-366 Risk Parameters Adjustments (BNB)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 09/12/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-09-12-24/4573).

- [BNB (Core pool)](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36): decrease kink, from 0.7 to 0.5

Complete analysis and details of these recommendations are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/383)
- [New Interest Rate contract for the vBNB market](https://bscscan.com/address/0xDb8347b96c94Be24B9c077A4CDDAAD074F6480cf)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: VBNB_ADMIN,
        signature: "setInterestRateModel(address)",
        params: [NEW_IR],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip366;
