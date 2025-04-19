import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const IRM = "0x01B1DA0D0e7c92BE46405565e34fc7C23f0a5A2A";
export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const RF = parseUnits("0.1", 18);

const vip484 = () => {
  const meta = {
    version: "v2",
    title: "VIP-484 [BNB Chain] Risk Parameters Adjustments (BNB)",
    description: `If passed, this VIP will perform the following changes on the [BNB (Core pool)](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36) market, recommended by Chaos Labs in the Venus community forum publication [Proposal: Adjust BNB Borrow APY on Venus Core Pool & Integrate SlisBNB to Enable LST Looping](https://community.venus.io/t/proposal-adjust-bnb-borrow-apy-on-venus-core-pool-integrate-slisbnb-to-enable-lst-looping/5046/12):

- Update the interest rate contract with another TwoKinksInterestRate contract, with the following attributes:
    - First slope:
        - Kink: 0.8 (from 0.4)
        - Base rate: 0
        - Multiplier: 0.035 (from 0.125)
    - Second slope:
        - Kink: 0.9 (from 0.8)
        - Base: 0 (from 0.05)
        - Multiplier: 1.75 (from 0.9)
    - Jump multiplier: 3 (from 5)
- Reduce the Reserve Factor from 30% to 10%

Complete analysis and details of this recommendation are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/541)
- [New Interest Rate contract for the vBNB market](https://bscscan.com/address/0x01B1DA0D0e7c92BE46405565e34fc7C23f0a5A2A)
- Source code of [TwoKinksInterestRateModel smart contract](https://github.com/VenusProtocol/venus-protocol/blob/main/contracts/InterestRateModels/TwoKinksInterestRateModel.sol)
- [Documentation about TwoKinksInterestRate](https://docs-v4.venus.io/technical-reference/reference-technical-articles/two-kinks-interest-rate-curve)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VBNB_ADMIN,
        signature: "setInterestRateModel(address)",
        params: [IRM],
      },
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

export default vip484;
