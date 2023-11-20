import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import commands from "./commands";

export const vip206 = () => {
  const meta = {
    version: "v2",
    title: "VIP-206 Venus Prime: deployment stage 4/5",
    description: `#### Summary

If passed, this VIP will configure the PrimeLiquidityProvider contract, starting accruing rewards for Prime holders

#### Description

This VIP is the forth one on the deployment plan of Venus Prime. [Check the updated Venus public documentation](https://docs-v4.venus.io/whats-new/prime-yield) to review the details of the deployed Venus Prime program. This VIP is part of the proposal [Venus Tokenomics Upgrade v3.0 Proposal](https://community.venus.io/t/venus-tokenomics-upgrade-v3-0-proposal/2782), published in the Venus community forum. The Venus Prime finally released has several differences with the original program proposed.

The full deployment of Venus Prime needs 5 VIP’s. These are the details of the full deployment plan:

1. Enable Prime token, and allow users to claim them ([VIP-201](https://app.venus.io/#/governance/proposal/201))
2. Set the rest of the timestamps when users staked more than 1,000 XVS on the XVSVault ([VIP-202](https://app.venus.io/#/governance/proposal/202) and [VIP-203](https://app.venus.io/#/governance/proposal/203))
3. Configure the PrimeLiquidityProvider contract, starting accruing rewards for Prime holders (this VIP)
4. Resume Prime

Specifically, in this VIP the following actions will be performed:

1. Transfer funds from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to the [PrimeLiquidityProvider](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2) contract. These funds will be distributed among the Prime holders.
- 150,666.50 USDT
- 61,329.43 USDC
- 2.18 BTC
- 42.23 ETH
1. Set distribution speeds in the PrimeLiquidityProvider contract. Set to distribute the previously transferred amounts **in 60 days**: 1,728,000 blocks.
- USDT: 87191261574074074
- USDC: 35491568287037037
- BTC: 1261574074074
- ETH: 24438657407407

#### Security and additional considerations

We applied the following security procedures for this VIP:

- **Venus Prime configuration post upgrade**: in a simulation environment, validating the behavior of the Venus Prime tokens is the expected one after the VIP
- **Deployment on testnet**: the same contracts were deployed and configured to testnet, and used in the Venus Protocol testnet deployment
- **Audit: OpenZeppelin, Certik, Peckshield and Fairyproof have audited the deployed code**
- **Contest**: Code4rena performed a contest on the Prime codebase

#### Audit reports

- [OpenZeppelin audit report (2023/10/03)](https://github.com/VenusProtocol/venus-protocol/blob/e02832bb2716bc0a178d910f6698877bf1b191e1/audits/065_prime_openzeppelin_20231003.pdf)
- [Certik audit audit report (2023/11/13)](https://github.com/VenusProtocol/venus-protocol/blob/2425501070d28c36a73861d9cf6970f641403735/audits/060_prime_certik_20231113.pdf)
- [Peckshield audit report (2023/08/26)](https://github.com/VenusProtocol/venus-protocol/blob/e02832bb2716bc0a178d910f6698877bf1b191e1/audits/055_prime_peckshield_20230826.pdf)
- [Fairyproof audit report (2023/09/10)](https://github.com/VenusProtocol/venus-protocol/blob/e02832bb2716bc0a178d910f6698877bf1b191e1/audits/056_prime_fairyproof_20230910.pdf)
- [Code4rena contest (2023/09/28)](https://code4rena.com/contests/2023-09-venus-prime)

#### Deployed contracts on main net

- [Prime](https://bscscan.com/address/0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC)
- [PrimeLiquidityProvider](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2)
- [New XVSVault implementation](https://bscscan.com/address/0xEA456C6a52c36Ae021D93cf69812260149Ec39c2)
- [New PolicyFacet contract](https://bscscan.com/address/0xE80E00da355e2cb0807C5dcd3A87Ad18D25ca28b)
- [New SetterFacet contract](https://bscscan.com/address/0x8188fd0818fc782012D45f92CbC05587bECeEd75)

#### References

- [Pull request with the Prime contracts](https://github.com/VenusProtocol/venus-protocol/pull/196)
- [VIP simulations](https://github.com/VenusProtocol/vips/pull/96)
- [Documentation](https://docs-v4.venus.io/whats-new/prime-yield)
- [Technical article about Venus Prime](https://docs-v4.venus.io/technical-reference/reference-technical-articles/prime)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(commands, meta, ProposalType.REGULAR);
};
