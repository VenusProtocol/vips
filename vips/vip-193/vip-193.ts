import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import commands from "../vip-192/commands";
import staked from "./staked-users";

export const vip193 = () => {
  const meta = {
    version: "v2",
    title: "VIP-202 Venus Prime: deployment stage 2/4",
    description: `#### Summary

If passed, this VIP will set the rest of the timestamps when users staked more than 1,000 XVS on the XVSVault. The qualified users will be able to claim their Prime tokens.

#### Description

This VIP is the second one on the deployment plan of Venus Prime. The first VIP was [VIP-201](https://app.venus.io/#/governance/proposal/201). [Check the updated Venus public documentation](https://docs-v4.venus.io/whats-new/prime-yield) to review the details of the deployed Venus Prime program. This VIP is part of the proposal [Venus Tokenomics Upgrade v3.0 Proposal](https://community.venus.io/t/venus-tokenomics-upgrade-v3-0-proposal/2782), published in the Venus community forum. The Venus Prime finally released has several differences with the original program proposed.

The full deployment of Venus Prime will need 4 VIP’s. This is the second one. These are the details of the full deployment plan:

1. Enable Prime token, and allow users to claim them ([VIP-201](https://app.venus.io/#/governance/proposal/201))
2. Set the rest of the timestamps when users staked more than 1,000 XVS on the XVSVault
3. Configure the PrimeLiquidityProvider contract, starting accruing rewards for Prime holders
4. Resume Prime

Specifically, in this VIP the timestamp when XXX users staked more than 1,000 XVS (the minimum amount to be eligible for a Prime token) will be set.

**Security and additional considerations**

We applied the following security procedures for this VIP:

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

**Deployed contracts on main net**

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
