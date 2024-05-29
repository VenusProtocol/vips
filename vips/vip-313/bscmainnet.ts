import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";
export const GITCOIN_WALLET = "0x457990a79f64bBf8f09e090C16d017d5e70d3CB3";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const VUSDC_AMOUNT = parseUnits("6280050", 8); // (close to 150,000 USDC, taking into account 1 USDC = 41.866882 vUSDC)
const USDC_AMOUNT = parseUnits("150000", 18);

const vip313 = () => {
  const meta = {
    version: "v2",
    title: "VIP-313 Allocate funding for the Gitcoin Grants Stack Partnership",
    description: `#### Summary

If passed, this VIP will allocate $150,000 USDC to Gitcoin.

#### Description

Gitcoin will handle the design, setup, implementation, and management of the rounds atop Gitcoin Grants Stack. The Venus dev team and community will approve grantees, ensuring alignment with strategic goals and ecosystem development priorities.

The funding rounds will focus on projects contributing to the Venus ecosystem’s growth and development within the following themes:

1. Venus Stablecoin Adoption
2. Lending and Borrowing Innovations
3. DeFi / Gaming Integrations
4. Developer Tools and Libraries
5. Venus Governance and Community Engagement

#### Actions

Send 150,000 USDC to BEP20 wallet address: [0x457990a79f64bBf8f09e090C16d017d5e70d3CB3](https://bscscan.com/address/0x457990a79f64bBf8f09e090C16d017d5e70d3CB3).

#### References

- [Proposal](https://community.venus.io/t/gitcoin-grants-stack-partnership/4187/10)
- [Snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x9043f38a9cc0ca75ded022c2b2a839d377ed83a4ff133834dd3e119864816fcc)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VUSDC, VUSDC_AMOUNT, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [VUSDC, GITCOIN_WALLET, USDC_AMOUNT, TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip313;
