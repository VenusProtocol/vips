import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vip344 = () => {
  const meta = {
    version: "v2",
    title: "VIP-344 [Ethereum] Distribution Speed Adjustment for the XVS Vault",
    description: `#### Summary

If passed, this VIP will transfer the converted XVS tokens from the [XVS Vault Treasury](https://etherscan.io/address/0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE) to the [XVS Store](https://etherscan.io/address/0x1db646e1ab05571af99e47e8f909801e5c99d37b) and adjust the XVS Vault distribution speed.

- Transfer 6,893 XVS from the [XVS Vault Treasury](https://etherscan.io/address/0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE) to the [XVS Store](https://etherscan.io/address/0x1db646e1ab05571af99e47e8f909801e5c99d37b) for distribution.
- Set the new XVS distribution speed to 310 XVS/day.

#### Description

A total of 6,893 XVS has been converted through a buyback during Q2 2024 using the [XVS converter](https://etherscan.io/address/0x1FD30e761C3296fE36D9067b1e398FD97B4C0407). These tokens will be added to the distribution as per our [Tokenomics V4](https://app.venus.io/#/governance/proposal/332?chainId=56) and [ETH Deployment Proposal](https://community.venus.io/t/xvs-ethereum-mainnet-development-program-with-lido-frax-curve-and-gitcoin/4200).

The converted XVS is currently held in the [XVS Vault Treasury](https://etherscan.io/address/0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE) and needs to be transferred to the [XVS Store](https://etherscan.io/address/0x1db646e1ab05571af99e47e8f909801e5c99d37b) for distribution.

The new distribution speed will be increased from 250 XVS/day to 310 XVS/day, which is estimated to increase the vault APR from 12% to 15%.

#### References

- [Tokenomics V4](https://app.venus.io/#/governance/proposal/332?chainId=56)
- [ETH Deployment Proposal](https://community.venus.io/t/xvs-ethereum-mainnet-development-program-with-lido-frax-curve-and-gitcoin/4200)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/330)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x26a82f80811aebe17b3dc863726075581db822b08381f9bb75feb1600a4d11e6) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: NORMAL_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip344;
