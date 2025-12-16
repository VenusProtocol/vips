import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const LEVERAGE_STRATEGIES_MANAGER = "0x03F079E809185a669Ca188676D0ADb09cbAd6dC1";
export const SWAP_HELPER = "0xD79be25aEe798Aa34A9Ba1230003d7499be29A24";

export const vip576 = () => {
  const meta = {
    version: "v2",
    title: "VIP-576 [BNB Chain] Implementation of Leveraged Positions (Boost & Repay)",
    description: `This proposal is informed by the discussion in the Venus community forum [**Leveraged positions (Boost & Repay)**](https://community.venus.io/t/leveraged-positions-boost-repay/5593?utm_source=chatgpt.com), which outlines the implementation of the Leveraged Positions feature — encompassing “Boost” and “Repay with collateral” — in the Core Pool on BNB Chain. The community post describes the current inefficiencies of manual looping for leveraged strategies and proposes a single-transaction solution that automates leveraging and deleveraging with built-in safety checks, powered by flash loans under the hood. 

If approved, the Venus Protocol will execute the implementation of the Leveraged Positions feature as described in the community post, enabling users to create and manage recursive leveraged positions (Boost and Repay) via a seamless interface, enhancing user experience, capital efficiency, and protocol revenue potential.

**Action :**

- **Implement the Leveraged Positions feature in the Venus Core Pool on BNB Chain**:
    - Enable **Boost** functionality to allow users to open leveraged positions via a single atomic transaction by automating the borrow → swap → supply loop using flash loans.
    - Enable **Repay with collateral** functionality to allow users to repay, partially or fully, their debt using supplied collateral in one transaction, without requiring users to hold the borrowed asset externally.
    - Develop and deploy the necessary user interface components that display:
        - Maximum boostable amount
        - Resulting leverage
        - Updated health factor before confirmation
            
            as described in the community post. 
            
    - Integrate underlying DEX aggregator support to facilitate efficient swaps required for Boost and Repay operations as described.
    - Include risk warning and user acceptance toggle to ensure users are aware of increased risks associated with leveraged positions prior to execution.`,
    forDescription: "Execute",
    againstDescription: "Do not execute",
    abstainDescription: "Abstain",
  };

  return makeProposal(
    [
      {
        target: SWAP_HELPER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: LEVERAGE_STRATEGIES_MANAGER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: UNITROLLER,
        signature: "setWhiteListFlashLoanAccount(address,bool)",
        params: [LEVERAGE_STRATEGIES_MANAGER, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip576;
