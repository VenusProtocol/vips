import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const DESTINATION_ADDRESS = "0x48e9d2128321cbf75cd108321459865357c00f15";
const USDT_AMOUNT = "2100253000000000000000000";

export const vip233 = () => {
  const meta = {
    version: "v2",
    title: "VIP-233 2023 Development Team Expense Reimbursement",
    description: `#### Summary

If passed, this VIP will transfer 2,100,253 USDT to the [Development Team](https://bscscan.com/address/0x48e9d2128321cbf75cd108321459865357c00f15).

#### Description

Following the community post [2023 Development Team Expense Reimbursement](https://community.venus.io/t/2023-development-team-expense-reimbursement/4000/1), and the associated [snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x6719ec8630c06161895a659e4562fd54bb20c0fc0526caa397186a8bed7de57c), this VIP transfers 2,100,253 USDT to the Development Team.

Venus Protocol has made substantial progress in the area of DeFi innovation, security, integrations, and community contributions. The development team’s efforts have saliently altered the protocol’s trajectory.

New offerings have been developed such as [Isolated Lending](https://app.venus.io/#/governance/proposal/136), an [multichain XVS bridge](https://docs-v4.venus.io/technical-reference/reference-technical-articles/technical-doc-xvs-bridge), [Venus Prime](https://app.venus.io/#/governance/proposal/210), [Industry-First Resilient Price Oracle](https://app.venus.io/#/governance/proposal/123), [Peg Stability Module for VAI](https://app.venus.io/#/governance/proposal/157), [Reward Distributor](https://docs-v4.venus.io/whats-new/reward-distributor), and a Rapid Pace of Governance execution to serve the community.

Following the [new tokenomics](https://snapshot.org/#/venus-xvs.eth/proposal/0xc9d270ccecb7b91c75b95b8d9af24fc7c20cd38c0c0c44888ed4e7724f4e7ce9), the 20% team/ops allocation was removed starting in Q2 2023, meaning no reserves were set aside for continued protocol development. However, protocol development has continued with V4 deliverables and more, funded by the team.

Considering the monthly token closing prices, the total protocol revenues for Q2, Q3, and Q4 (up to December 26) are $11,264,937. This proposal seeks to reimburse the team’s expenses for Q2, Q3, and Q4 of 2023, totaling $2,100,253.

#### About the Development Team

- Leadership is composed of Product Management and Engineering talent from one of the largest global banks, technology firms like Accenture, and web3 firms including Consensys. Together we bring over 30 years of combined technology experience with 10 of those in blockchain.
- Leadership helps inform the community’s direction for protocol development through continuous discovery and continuous improvement. Our research inputs include community engagement across surveys, AMAs, forum discussions and recruitment of invaluable contributors in risk management, economics, and more.
- This year’s recruited contributors include background from esteemed projects like MakerDAO ([Steakhouse Financial](https://twitter.com/SteakhouseFi)), and industry leading risk managers ([Chaos Labs](https://chaoslabs.xyz/)) and top tier security audit partners ([Code4arena](https://code4rena.com/), [OpenZepplin](https://www.openzeppelin.com/), [Quantstamp](https://quantstamp.com/)).
- The dev team is also composed of a complete roster of engineers covering the gamut of protocol development across front-end, back-end, smart contract and user experience squads.

#### Key Highlights

- As of 2023, Venus is the most security audited protocol in its category
- The most revenue performant lending protocol in DeFi per $ of TVL
- Ascended to be the most highly rated lending protocol in security across nearly every category

#### List of Accomplishments

- 50% of all VIPS, a total of 100, have been made since Q2 2023.
- Multichain Deployment preparations: Development and preparations for a multichain deployment on
- Isolated Pools: Deployment and support of 5 isolated markets with 26 new tokens.
- Venus Prime: Development for Venus Prime and Soulbound Tokens integration for real yield opportunities.
- Resilient Price Oracle: Deployment and support for the industry’s first, multi-source resilient oracle, creating the first solution in DeFi to mitigate oracle failures.
- Automatic Income Allocation: Development of automatic income distribution from interest reserves and liquidation fees.
- Peg Stability Module: Development, integration, and support for the VAI-pegging PSM.
- Token Converter: Development of the multiple token converter contracts that allow for the automation of the conversion process.
- V4 Deployment Support: Technical assistance for Isolated Pools, Risk Fund, Shortfall Handling, VAI Stability, Liquidation Mechanics, Resilient Price Oracle, Decentralization, User Experience, Stable Rate Borrowing, and Venus Prime Soulbound Token.
- Risk Fund and Shortfall Management: Risk fund management and successful repayment of $11.2M USD for BTC, ETH, and BUSD.
- Governance improvements: Ongoing support for governance model changes, including VIP fast-tracking, role-based access, and a pause mechanism.
- User experience improvements: Enhancements to the user interface and reward system.
- Venus introduced wallet screening for AML/illicit funds to improve compliance positioning of the protocol`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, DESTINATION_ADDRESS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
