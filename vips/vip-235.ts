import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const Comptroller = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const NewCollateralFactor = parseUnits("0.78", 18);

export const vip235 = () => {
  const meta = {
    version: "v2",
    title: "VIP-235 Risk Parameters Adjustments (BNB, FDUSD)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates 01/09/2024](https://community.venus.io/t/chaos-labs-risk-parameter-updates-01-09-24/4042).

- [FDUSD (Core pool)](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba)
    - Increase supply cap, from 5.5M FDUSD to 10M FDUSD
    - Increase borrow cap, from 4.4M FDUSD to 8M FDUSD
- [BNB (Core pool)](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36)
    - Increase collateral factor, from 0.75 to 0.78

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/165](https://github.com/VenusProtocol/vips/pull/165)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: Comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [vBNB, NewCollateralFactor],
      },

      {
        target: Comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vFDUSD], [parseUnits("10000000", 18)]],
      },
      {
        target: Comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vFDUSD], [parseUnits("8000000", 18)]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
