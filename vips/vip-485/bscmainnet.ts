import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const RF = parseUnits("0.1", 18);

const vip485 = () => {
  const meta = {
    version: "v2",
    title: "VIP-485 [BNB Chain] Risk Parameters Adjustments (BNB) - Reserve Factor",
    description: `If passed, this VIP will decrease the Reserve Factor on the [BNB (Core pool)](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36) market, from 30% to 10%, following the Chaos Labs recommendations in the Venus community forum publication [Proposal: Adjust BNB Borrow APY on Venus Core Pool & Integrate SlisBNB to Enable LST Looping](https://community.venus.io/t/proposal-adjust-bnb-borrow-apy-on-venus-core-pool-integrate-slisbnb-to-enable-lst-looping/5046/12).

Complete analysis and details of this recommendation are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/541)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VBNB_ADMIN,
        signature: "_setReserveFactor(uint256)",
        params: [RF],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip485;
