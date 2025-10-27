import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const BSCMAINNET_USDT = "0x55d398326f99059ff775485246999027b3197955";

export const REPAYMENTS = [
  {
    user: "0x563617b87d8bb3f2f14bb5a581f2e19f80b52008",
    amount: parseUnits("2022088.53", 18),
  },
  {
    user: "0x1ee62a12c5c16ba579783ba428c9170310847469",
    amount: parseUnits("111706.53", 18),
  },
  {
    user: "0x89093FCE26D6be5B4416c6db9B59f1e83AbAA3CC",
    amount: parseUnits("6879.374", 18),
  },
  {
    user: "0xc7a7b105cfba2e74d5d836690350acd199051724",
    amount: parseUnits("3712.85", 18),
  },
  {
    user: "0xdaB8aFb7b7816a69bc77cFEa4C3777c18696cd4C",
    amount: parseUnits("4681.88", 18),
  },
  {
    user: "0x5200de8EF3227b5dd2C1E92C7a95ee9c2a12d7f7",
    amount: parseUnits("3908.48", 18),
  },
  {
    user: "0x8952DfB4944C0291C744c889d563C60c8BfbE1Be",
    amount: parseUnits("209843.68", 18),
  },
  {
    user: "0x5fdbeCEac47313E34ccaCd7e106f47a44f5ddF4D",
    amount: parseUnits("175196.55", 18),
  },
  {
    user: "0x57e47016497576383fc6e3d6f4deb4db9f98a6f9",
    amount: parseUnits("156277.26", 18),
  },
  {
    user: "0xC6396e4DD7642208f83b4bf955bBd2A602432c1d",
    amount: parseUnits("72488.6", 18),
  },
];

export const vip559 = () => {
  const meta = {
    version: "v2",
    title: "VIP-559 [BNB Chain] Wave 1 Compensation for Users Affected by the WBETH Depeg",
    description: `If passed, this VIP will transfer compensation from the [Risk Fund](https://bscscan.com/address/0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42) to users who were liquidated during the WBETH price oracle depeg on October 10, 2025. This proposal covers the first wave of affected users identified by the Venus Labs analysis.

Eligibility criteria, calculation methodology, and complete details are outlined in the [Venus Labs Community Post](https://community.venus.io/).

**Addresses and compensation amounts**

- 0x563617b87d8bb3f2f14bb5a581f2e19f80b52008: 2,022,088.53 USDT
- 0x1ee62a12c5c16ba579783ba428c9170310847469: 111,706.53 USDT
- 0x89093FCE26D6be5B4416c6db9B59f1e83AbAA3CC: 6,879.374 USDT
- 0xc7a7b105cfba2e74d5d836690350acd199051724: 3,712.85 USDT
- 0xdaB8aFb7b7816a69bc77cFEa4C3777c18696cd4C: 4,681.88 USDT
- 0x5200de8EF3227b5dd2C1E92C7a95ee9c2a12d7f7: 3,908.48 USDT
- 0x8952DfB4944C0291C744c889d563C60c8BfbE1Be: 209,843.68 USDT
- 0x5fdbeCEac47313E34ccaCd7e106f47a44f5ddF4D: 175,196.55 USDT
- 0x57e47016497576383fc6e3d6f4deb4db9f98a6f9: 156,277.26 USDT
- 0xC6396e4DD7642208f83b4bf955bBd2A602432c1d: 72,488.6 USDT

**Voting options**

- **For** — Execute this proposal
- **Against** — Do not execute this proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      ...REPAYMENTS.map(({ user, amount }) => ({
        target: RISK_FUND,
        signature: "sweepTokenFromPool(address,address,address,uint256)",
        params: [BSCMAINNET_USDT, NETWORK_ADDRESSES.bscmainnet.UNITROLLER, user, amount],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip559;
