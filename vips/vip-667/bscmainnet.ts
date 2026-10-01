import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vTUSDOLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";

// WhitePaperInterestRateModel with base 0 and slope 0: the borrow rate is 0 at any utilization.
export const ZERO_RATE_MODEL = "0x42Ec3Eb6F23460dFDfa3aE5688f3415CDfE0C6AD";

// The JumpRateModel vTUSDOLD uses before this VIP.
export const OLD_RATE_MODEL = "0xc255352947ef3594C45b0Fe8bcB690e51C3D744A";

export const vip667 = () => {
  const meta = {
    version: "v2",
    title: "VIP-667 [BNB Chain] Stop Interest Accrual on the Deprecated TUSDOLD Market",
    description: `#### Summary

This proposal sets a zero rate interest rate model on the deprecated TUSDOLD market (vTUSDOLD) on BNB Chain, so the remaining debt stops growing. Without it, the market's borrow rate reaches the protocol's hard rate ceiling within days, after which repayments, liquidations and any further change to the market revert.

#### Background

Mint, borrow and enter market are paused on vTUSDOLD, but interest still accrues on the remaining debt. The market has no cash and a 100% reserve factor, so all interest is booked as reserves and borrows minus reserves stays fixed at about 40,000 TUSDOLD. Utilization is computed as borrows / (cash + borrows - reserves) and is not capped, so it rises with the debt. It is about 2,800% today, and the borrow rate rises with it.

When the rate passes the VToken ceiling of 0.0005% per block, accrueInterest reverts. Every action that accrues interest first then reverts too, including repay, liquidate and _setInterestRateModel itself. At the current pace this happens at about 3.8 to 4.0 million TUSDOLD of borrows, roughly two days after October 1, 2026. Once that point is reached, the interest rate model can no longer be changed by governance and only a contract upgrade would restore the market.

This proposal uses the Fast Track timelock, which holds the _setInterestRateModel permission on vTUSDOLD, so that it executes before the ceiling is reached.

#### Actions

1. Call _setInterestRateModel(address) on [vTUSDOLD](https://bscscan.com/address/0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3) with the existing zero rate model [WhitePaperInterestRateModel](https://bscscan.com/address/0x42Ec3Eb6F23460dFDfa3aE5688f3415CDfE0C6AD) (base rate 0, multiplier 0).

The call accrues interest one final time at the current rate and then switches the model. From then on no interest accrues on vTUSDOLD, and actions that accrue interest first, such as repay and liquidate, can no longer hit the rate ceiling. Pause states, collateral factors and the reserve factor are unchanged.

The existing debt and the reserves already booked are not changed by this proposal. How to settle the remaining positions will be handled separately.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/TBD)
- [Fork test of the rate ceiling](https://github.com/VenusProtocol/venus-protocol/pull/716)

#### Voting options

- **For**: Execute the proposal
- **Against**: Do not execute the proposal
- **Abstain**: Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vTUSDOLD,
        signature: "_setInterestRateModel(address)",
        params: [ZERO_RATE_MODEL],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip667;
