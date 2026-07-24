import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const BSTOCK_LIQUIDATOR = "0x5974Badab6911a78Ba15229045514C2C1bD42343";

export const vip650 = () => {
  const meta = {
    version: "v2",
    title: "VIP-650 [BNB Chain] Enable flash loans for the bStock backstop liquidator",
    description: `If passed, this VIP will whitelist the bStock backstop liquidator as a flash loan account on the Core Pool Comptroller on BNB Chain.

**Details**

The Core Pool flash loan feature is already live (enabled by [VIP-567](https://app.venus.io/#/governance/proposal/567?chainId=56) and activated for all markets). The Comptroller only allows whitelisted accounts to initiate flash loans. This VIP authorizes the bStock backstop liquidator to do so, letting it atomically repay an undercollateralized bStock borrow, seize and redeem the collateral, and sell it for the debt asset within a single transaction, without locking protocol capital.

This action follows the same pattern as [VIP-576](https://app.venus.io/#/governance/proposal/576?chainId=56), which whitelisted the Leveraged Positions manager.

**Action**

- Whitelist the bStock backstop liquidator on the [Core Pool Comptroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) (\`setWhiteListFlashLoanAccount\`).`,
    forDescription: "Execute",
    againstDescription: "Do not execute",
    abstainDescription: "Abstain",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "setWhiteListFlashLoanAccount(address,bool)",
        params: [BSTOCK_LIQUIDATOR, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip650;
