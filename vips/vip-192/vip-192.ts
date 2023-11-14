import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import commands from "./commands";
import staked from "./staked-users";

export const vip192 = () => {
  const meta = {
    version: "v2",
    title: "VIP-201 Venus Prime: deployment stage 1/4",
    description: `#### Summary

If passed, this VIP will enable Prime tokens, allowing users to claim theirs.

#### Description

[Check the updated Venus public documentation](https://docs-v4.venus.io/whats-new/prime-yield) to review the details of the deployed Venus Prime program. This VIP is part of the proposal [Venus Tokenomics Upgrade v3.0 Proposal](https://community.venus.io/t/venus-tokenomics-upgrade-v3-0-proposal/2782), published in the Venus community forum. The Venus Prime finally released has several differences with the original program proposed.

The full deployment of Venus Prime will need 4 VIP’s. This is the first one. These are the details of the full deployment plan:

1. Enable Prime token, and allow users to claim them
2. Set the rest of the timestamps when users staked more than 1,000 XVS on the XVSVault
3. Configure the PrimeLiquidityProvider contract, starting accruing rewards for Prime holders
4. Resume Prime

The rationale behind this deployment plan is:

- Between VIP 1/2 and VIP 3 users will be able to claim their Prime tokens
- When VIP 3 is executed, there will already be Prime users that will start accruing rewards from the PrimeLiquidityProvider. Otherwise, rewards would be distributed among a reduced amount of Prime holder
- Between VIP 3 and VIP 4, users will be able to see in the [Venus UI](https://app.venus.io/) how their rewards are increasing. Everything will be reviewed, and if some issue is detected then the Venus community will be able to rollback and fix it, because the funds will be still in the PrimeLiquidityProvider contract

Specifically, in this VIP the following actions will be performed:

1. Upgrade the implementation of the PolicyFacet and SetterFacet facets
2. Set the prime attribute in the Core pool comptroller
3. Accept ownership of the Prime contract, and PrimeLiquidityProvider
4. Grant permissions on the Prime and PrimeLiquidityProvider contracts
5. Upgrade implementation of the [XVSVault](https://bscscan.com/address/0x051100480289e704d20e9DB4804837068f3f9204)
6. Set the prime attribute in the XVSVault
7. Add Prime markets (USDT, USDC, ETH, BTC) into the Prime contract
8. Set distribution speeds in the PrimeLiquidityProvider equal to zero, disabling the rewards
9. Set (partially) stakedAt attribute, to allow eligible XVS stakers to claim their Prime token

**Prime parameters**

- Markets: USDT, USDC, ETH, BTC
- Minimum XVS to qualify: 1,000 XVS
- Maximum XVS cap: 100,000 XVS
- Number of days staking XVS to qualify: 90
- Limit to the number of Prime holders: 500 revocable tokens, 0 irrevocable tokens
- Alpha: 0.5 (staked XVS and borrowed/supplied amounts have the same weight calculating the Prime user score)
- Supply multiplier: 2 (for the 4 markets)
- Borrow multiplier: 4 (for the 4 markets)

**Security and additional considerations**

We applied the following security procedures for this upgrade:

- **Venus Prime configuration post upgrade**: in a simulation environment, validating the behavior of the Venus Prime tokens is the expected one after the VIP
- **Deployment on testnet**: the same contracts were deployed and configured to testnet, and used in the Venus Protocol testnet deployment
- **Audit: OpenZeppelin, Certik, Peckshield and Fairyproof have audited the deployed code**
- **Contest**: Code4rena performed a contest on the Prime codebase

**Audit reports**

- [OpenZeppelin audit report (2023/10/03)](https://github.com/VenusProtocol/venus-protocol/blob/e02832bb2716bc0a178d910f6698877bf1b191e1/audits/065_prime_openzeppelin_20231003.pdf)
- [Certik audit audit report (2023/11/13)](https://github.com/VenusProtocol/venus-protocol/blob/2425501070d28c36a73861d9cf6970f641403735/audits/060_prime_certik_20231113.pdf)
- [Peckshield audit report (2023/08/26)](https://github.com/VenusProtocol/venus-protocol/blob/e02832bb2716bc0a178d910f6698877bf1b191e1/audits/055_prime_peckshield_20230826.pdf)
- [Fairyproof audit report (2023/09/10)](https://github.com/VenusProtocol/venus-protocol/blob/e02832bb2716bc0a178d910f6698877bf1b191e1/audits/056_prime_fairyproof_20230910.pdf)
- [Code4rena contest (2023/09/28)](https://code4rena.com/contests/2023-09-venus-prime)

**Deployed contracts on mainnet**

- [Prime](https://bscscan.com/address/0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC)
- [PrimeLiquidityProvider](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2)
- [New XVSVault implementation](https://bscscan.com/address/0xEA456C6a52c36Ae021D93cf69812260149Ec39c2)
- [New PolicyFacet contract](https://bscscan.com/address/0xE80E00da355e2cb0807C5dcd3A87Ad18D25ca28b)
- [New SetterFacet contract](https://bscscan.com/address/0x8188fd0818fc782012D45f92CbC05587bECeEd75)

**References**

- [Pull request with the Prime contracts](https://github.com/VenusProtocol/venus-protocol/pull/196)
- [VIP simulations](https://github.com/VenusProtocol/vips/pull/96)
- [Documentation](https://docs-v4.venus.io/whats-new/prime-yield)
- [Technical article about Venus Prime](https://docs-v4.venus.io/technical-reference/reference-technical-articles/prime)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal([...commands, staked], meta, ProposalType.REGULAR);
};
