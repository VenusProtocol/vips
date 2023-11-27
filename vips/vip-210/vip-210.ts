import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
const NEW_PRIME_IMPL = "0x371c0355CC22Ea13404F2fEAc989435DAD9b9d03";

export const vip210 = () => {
  const meta = {
    version: "v2",
    title: "VIP-210 Venus Prime: deployment stage 5/5",
    description: `#### Summary

If passed, this VIP will resume Prime contract, allowing Prime holders to claim their rewards. It will also upgrade the Prime contract, to improve the traceability of interactions with the contract, emitting more events.

#### Description

This VIP is the fifth (and last) one on the deployment plan of Venus Prime. [Check the updated Venus public documentation](https://docs-v4.venus.io/whats-new/prime-yield) to review the details of the deployed Venus Prime program. This VIP is part of the proposal [Venus Tokenomics Upgrade v3.0 Proposal](https://community.venus.io/t/venus-tokenomics-upgrade-v3-0-proposal/2782), published in the Venus community forum. The Venus Prime finally released has several differences with the original program proposed.

The full deployment of Venus Prime needs 5 VIP’s. These are the details of the full deployment plan:

1. Enable Prime token, and allow users to claim them ([VIP-201](https://app.venus.io/#/governance/proposal/201))
2. Set the rest of the timestamps when users staked more than 1,000 XVS on the XVSVault ([VIP-202](https://app.venus.io/#/governance/proposal/202) and [VIP-203](https://app.venus.io/#/governance/proposal/203))
3. Configure the PrimeLiquidityProvider contract, starting accruing rewards for Prime holders ([VIP-206](https://app.venus.io/#/governance/proposal/206))
4. Resume Prime (this VIP)

Specifically, in this VIP the following actions will be performed:

- Resume transfers from [PrimeLiquidityProvider](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2)
- Resume [Prime](https://bscscan.com/address/0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC)
- Upgrade Prime implementation

After this VIP, Prime holders will be able to claim their Prime rewards.

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

#### Deployed contracts on mainnet

- [Prime](https://bscscan.com/address/0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC)
- [PrimeLiquidityProvider](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2)
- [New Prime implementation](https://bscscan.com/address/0x371c0355CC22Ea13404F2fEAc989435DAD9b9d03)

#### References

- [Pull request with the Prime contracts](https://github.com/VenusProtocol/venus-protocol/pull/196)
- [VIP simulations](https://github.com/VenusProtocol/vips/pull/96)
- [Documentation](https://docs-v4.venus.io/whats-new/prime-yield)
- [Technical article about Venus Prime](https://docs-v4.venus.io/technical-reference/reference-technical-articles/prime)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PRIME, NEW_PRIME_IMPL],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "resumeFundsTransfer()",
        params: [],
      },
      {
        target: PRIME,
        signature: "togglePause()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
