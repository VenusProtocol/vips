import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const IRM = "0xb16Db373A194acb9018919B77ae480f2a8f0F128";
export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";

const vip479 = () => {
  const meta = {
    version: "v2",
    title: "VIP-479 [BNB Chain] Risk Parameters Adjustments (BNB)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - BNB IR Curve Update](https://community.venus.io/t/chaos-labs-bnb-ir-curve-update/5037):

- [BNB (Core pool)](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36): update the interest rate contract with another TwoKinksInterestRate contract, with the following attributes:
    - First slope:
        - Kink: 0.4
        - Base rate: 0
        - Multiplier: 0.125
    - Second slope:
        - Kink: 0.8
        - Base: 0.05 (from 0.21)
        - Multiplier: 0.9
    - Jump multiplier: 5

Complete analysis and details of this recommendation are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/536)
- [New Interest Rate contract for the vBNB market](https://bscscan.com/address/0xb16Db373A194acb9018919B77ae480f2a8f0F128)
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
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip479;
