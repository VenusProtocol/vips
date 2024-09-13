import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const WBETH_VTOKEN = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const OLD_BORROW_CAP = parseUnits("2000", 18);
export const NEW_BORROW_CAP = parseUnits("4000", 18);

export const vip261 = () => {
  const meta = {
    version: "v2",
    title: "VIP-261 Risk Parameters Adjustments (WBETH)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates 02/20/2024](https://community.venus.io/t/chaos-labs-risk-parameter-updates-02-20-24/4125).

- [WBETH (Core pool)](https://bscscan.com/address/0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0)
    - Increase borrow cap, from 2K WBETH to 4K WBETH

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/214](https://github.com/VenusProtocol/vips/pull/214)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[WBETH_VTOKEN], [NEW_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip261;
