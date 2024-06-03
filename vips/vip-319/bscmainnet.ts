import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vip319 = () => {
  const meta = {
    version: "v2",
    title: "VIP-319 [Arbitrum] XVS vault configuration",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Transfer the ownership of the [XVSVault on Arbitrum one](https://arbiscan.io/address/0x8b79692AAB2822Be30a6382Eb04763A74752d5B4) to the [Guardian wallet](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0)
- Configure (and pause) the vault accepting [XVS tokens on Arbitrum one](https://arbiscan.io/address/0xc1Eb7689147C81aC840d4FF0D298489fc7986d52)

#### Description

Following the [VIP-317: VIP-317 XVS bridge between Arbitrum one and BNB Chain, Ethereum and opBNB](https://app.venus.io/#/governance/proposal/317), this VIP configure (and pause) the XVS vault on Arbitrum one.

The following steps on the Arbitrum deployment are:

1. Configure and pause the XVS vault. This VIP
2. Configure the Venus markets, following the [Chaos labs recommendations](https://community.venus.io/t/vrc-deploy-venus-protocol-on-arbitrum/3721/7)
3. Configure Venus Prime on the XVS vault and resume the XVS vault. From this moment, users will be able to deposit XVS into the vault, starting with their qualification period for Prime
4. Transfer XVS from BNB Chain to Arbitrum one, that will be used for the rewards
5. Enable rewards on the XVS vault and on the Venus markets

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, checking ownership of the contracts and validating the usual operations on the XVS vault
- **Deployment on testnet**: the same contracts have been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Audit**: Certik, Quantstamp and Fairyproof have audited the code of the XVSVault on Arbitrum

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/088_timeBased_certik_20240117.pdf) (2024/01/17)
- [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/470416836922656783eab52ded54744489e8c345/audits/089_timeBased_quantstamp_20240319.pdf) (2024/03/19)
- [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/094_timeBased_fairyproof_20240304.pdf) (2024/03/04)

#### Deployed contracts on Arbitrum one

- [XVSVaultProxy](https://arbiscan.io/address/0x8b79692AAB2822Be30a6382Eb04763A74752d5B4)
- [XVSVault (implementation)](https://arbiscan.io/address/0x4C4BedC003e4E2f3A057DeC35aeF26F64Cb07384)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/250)
- [[VRC] Deploy Venus Protocol on Arbitrum](https://community.venus.io/t/vrc-deploy-venus-protocol-on-arbitrum/3721)
- Snapshot ["Deploy Venus Protocol on Arbitrum"](https://snapshot.org/#/venus-xvs.eth/proposal/0xfc1f42609bda5d7d14660b0b91b19ca63ea1b2ea50169ddab79adfbfbdce323f)
- [Guardian wallet](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0)

#### Disclaimer for Arbitrum one VIPs

Privilege commands on Arbitrum one will be executed by the [](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67)[Guardian wallet](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x79ca5d7ef82648f5c52054aa996356da270a60e95a959c595ee3c29defc6a4ca)[this](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x3b66875e3b0b2d876a5208820f27ebc7e52097b020aad748bfe793e34cf2e64c) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
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

export default vip319;
