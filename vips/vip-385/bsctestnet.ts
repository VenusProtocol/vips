import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const IRM = "0x86954c6fCA6B464269Aa7011B143c4D93Dfa1146";
export const VBNB_ADMIN = "0x04109575c1dbB4ac2e59e60c783800ea10441BBe";

const vip385 = () => {
  const meta = {
    version: "v2",
    title: "VIP-385 [BNB Chain] Risk Parameters Adjustments (BNB)",
    description: `If passed, this VIP will perform the following Risk Parameter actions suggested by the Community in this Venus community forum publication: [BNB Market 2 Kink IRC Proposal](https://community.venus.io/t/bnb-market-2-kink-irc-proposal/4588/4).

- [BNB (Core pool)](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36): replace the interest rate contract with the new TwoKinksInterestRate contract, with the following attributes:
    - First slope:
        - Kink: 0.4
        - Base rate: 0
        - Multiplier: 0.225
    - Second slope:
        - Kink: 0.7
        - Base: 0.21
        - Multiplier: 0.35
    - Jump multiplier: 5

Complete analysis and details of these recommendations are available in the above publication.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Quantstamp](https://quantstamp.com/), [Certik](https://www.certik.com/), and [Fairyproof](https://www.fairyproof.com/) have audited the TwoKinksInterestRate code
- **VIP execution simulation**: in a simulation environment, validating the changes in the configurations are performed as expected
- **Deployment on testnet**: the same change has been performed on BNB Chain testnet, and used in the Venus Protocol testnet environment

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/venus-protocol/blob/8be0034819eef313d6ffe216e5ba0f1152dbdcc0/audits/113_twoKinks_certik_20240731.pdf) (2024/07/31)
- [Quantstamp audit audit report](https://github.com/VenusProtocol/venus-protocol/blob/8be0034819eef313d6ffe216e5ba0f1152dbdcc0/audits/115_twoKinks_quantstamp_20240819.pdf) (2024/08/19)
- [Fairyproof audit report](https://github.com/VenusProtocol/venus-protocol/blob/8be0034819eef313d6ffe216e5ba0f1152dbdcc0/audits/114_twoKinks_fairyproof_20240804.pdf) (2024/08/04)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/406)
- [New Interest Rate contract for the vBNB market](https://bscscan.com/address/0xC682145a767ca98B743B895f1Bd2D4696bC9C2eC)
- Snapshot “[[BNB Chain] BNB Market 2 Kink IRC Proposal](https://snapshot.org/#/venus-xvs.eth/proposal/0xaf7975c6484b0fb640e3a03b667c7a5e4fb183b6b636a155c3aac67798627dde)”
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
    ProposalType.FAST_TRACK,
  );
};

export default vip385;
