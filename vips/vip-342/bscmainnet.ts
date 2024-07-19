import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const OLD_IR = "0xF558Be24F2CACb65a4BB41A155631C83B15388F1";
export const NEW_IR = "0xe5be8D9f4697dD264e488efD4b29c8CC31616fa5";
export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";

const vip342 = () => {
  const meta = {
    version: "v2",
    title: "VIP-342 Risk Parameters Adjustments (BNB)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - BNB Interest Rate Updates - 07/15/24](https://community.venus.io/t/chaos-labs-bnb-interest-rate-updates-07-15-24/4471).

- [BNB (Core pool)](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36): decrease kink, from 0.8 to 0.7

Complete analysis and details of these recommendations are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/327)
- [New Interest Rate model](https://bscscan.com/address/0xe5be8D9f4697dD264e488efD4b29c8CC31616fa5)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
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

export default vip342;
