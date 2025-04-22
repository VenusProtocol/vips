import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const vCAKE = "0x86aC3974e2BD0d60825230fa6F355fF11409df5c";
export const BORROW_CAP = parseUnits("19200000", 18);

const vip485 = () => {
  const meta = {
    version: "v2",
    title: "VIP-485 [BNB Chain] Risk Parameters Adjustments (CAKE)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Adjust $CAKE borrow cap in anticipation of the upcoming launchpads on PCS](https://community.venus.io/t/adjust-cake-borrow-cap-in-anticipation-of-the-upcoming-launchpads-on-pcs/5056/4).

BNB Chain / [CAKE (Core pool)](https://bscscan.com/address/0x86aC3974e2BD0d60825230fa6F355fF11409df5c)

- Increase borrow cap, from 3,749,000 CAKE to 19.2M CAKE

Complete analysis and details of this recommendation are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/542](https://github.com/VenusProtocol/vips/pull/542)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vCAKE], [BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip485;
