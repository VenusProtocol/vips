import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const IRM = "0x4E026f23f65EA7ad206886F91f74B79adBA2bc62";
export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const RF = parseUnits("0.30", 18);
export const GAMEFI_COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const vFLOKI = "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb";
export const BORROW_CAP = parseUnits("8000000000", 9);

const vip406 = () => {
  const meta = {
    version: "v2",
    title: "VIP-406 [BNB Chain] Risk Parameters Adjustments (BNB, FLOKI)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in these Venus community forum publications:

- [Chaos Labs - BNB Market Interest Rate Curve Optimization](https://community.venus.io/t/chaos-labs-bnb-market-interest-rate-curve-optimization/4764/1)
- [Chaos Labs - Risk Parameter Update - 12/09/24](https://community.venus.io/t/chaos-labs-risk-parameter-update-12-09-24/4769)

Changes:

- [BNB (Core pool)](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36): increase reserve factor, from 25% to 30%, and replace the interest rate contract with the new TwoKinksInterestRate contract, with the following attributes:
    - First slope:
        - Kink: 0.4
        - Base rate: 0
        - Multiplier: 0.125 (from 0.225)
    - Second slope:
        - Kink: 0.8 (from 0.7)
        - Base: 0.21
        - Multiplier: 0.9 (from 0.35)
    - Jump multiplier: 5
- [FLOKI (GameFi pool)](https://bscscan.com/address/0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb): increase borrow cap from 4,000,000,000 to 8,000,000,000

Complete analysis and details of these recommendations are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/439)
- [New Interest Rate contract for the vBNB market](https://bscscan.com/address/0x4E026f23f65EA7ad206886F91f74B79adBA2bc62)
- Previous update of the interest rate on the BNB market: [VIP-385 [BNB Chain] Risk Parameters Adjustments (BNB)](https://app.venus.io/#/governance/proposal/385?chainId=56)
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
      {
        target: GAMEFI_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vFLOKI], [BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip406;
