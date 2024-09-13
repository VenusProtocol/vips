import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const WBETH_VTOKEN = "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b";
export const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const OLD_BORROW_CAP = parseUnits("200", 18);
export const NEW_BORROW_CAP = parseUnits("4000", 18);

export const vip261 = () => {
  const meta = {
    version: "v2",
    title: "VIP-260 WBETH (Core Pool) - increase borrow cap to 4,000",
    description: `
The borrow cap for WBETH on Venus Core Pool is currently at 100% utilization.

There is currently a single user borrowing 1.06k WBETH, amounting to 53% of the total borrows of the asset. The user is currently borrowing $8.19M (in WBETH and USDT) against his $13.2M BTCB collateral, bringing his health score to 1.29.

Utilizing our supply and borrow cap methodology, Chaos Labs recommends doubling the borrow cap, setting it at 4K WBETH.

#### References
* [VIP Simulation](https://github.com/VenusProtocol/vips/pull/214)
  `,
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
    ProposalType.REGULAR,
  );
};

export default vip261;
