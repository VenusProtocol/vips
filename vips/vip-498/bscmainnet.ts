import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vSOL = "0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC";
export const vSOL_SUPPLY_CAP = parseUnits("72000", 18);
export const COMPTROLLER_CORE = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const NEW_IR = "0x939c9458Bee63Bc21031be3d56dDD30Af7f2230A";

const vip498 = () => {
  const meta = {
    version: "v2",
    title: "VIP-498 [BNB Chain] Risk Parameters Adjustments (BNB, SOL)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publications [Chaos Labs - BNB Interest Rate Updates 05/16/25](https://community.venus.io/t/chaos-labs-bnb-interest-rate-updates-05-16-25/5111) and [Chaos Labs - Risk Parameter Updates - 05/16/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-05-16-25/5110):

- [BNB (Core pool)](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36): update the interest rate contract with another TwoKinksInterestRate contract, with the following attributes:
    - First slope:
        - Kink: 0.65 (from 0.8)
        - Base rate: 0
        - Multiplier: 0.045 (from 0.035)
    - Second slope:
        - Kink: 0.8 (from 0.9)
        - Base: 0
        - Multiplier: 1.4 (from 1.75)
    - Jump multiplier: 3
- [SOL (Core pool)](https://bscscan.com/address/0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC): increase the supply cap from 36,000 SOL to 72,000 SOL

Complete analysis and details of these recommendations are available in the above publications.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/562)
- [New Interest Rate contract for the vBNB market](https://github.com/VenusProtocol/venus-protocol/pull/592)
- Source code of [TwoKinksInterestRateModel smart contract](https://github.com/VenusProtocol/venus-protocol/blob/main/contracts/InterestRateModels/TwoKinksInterestRateModel.sol)
- [Documentation about TwoKinksInterestRate](https://docs-v4.venus.io/technical-reference/reference-technical-articles/two-kinks-interest-rate-curve)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_CORE,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vSOL], [vSOL_SUPPLY_CAP]],
      },
      {
        target: VBNB_ADMIN,
        signature: "setInterestRateModel(address)",
        params: [NEW_IR],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip498;
