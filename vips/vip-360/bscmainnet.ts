import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const vip360 = () => {
  const meta = {
    version: "v2",
    title: "VIP-360 [zkSync] XVS vault configuration",
    description: `#### Summary

If passed, this VIP will perform the following actions:

* Transfer the ownership of the [XVSVault on zkSync Era](https://explorer.zksync.io/address/0x58DDAF7e1F08fAfAdDf2169C45dB5420497634D5) to the [Guardian wallet](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa)
* Configure (and pause) the vault accepting [XVS tokens on zkSync Era](https://explorer.zksync.io/address/0xD78ABD81a3D57712a3af080dc4185b698Fe9ac5A)

No XVS rewards in the XVS Vault will be configured in this VIP. No deposits will be accepted by the XVS Vault either. This will be enabled in the future, with a different VIP.

#### Description

Following the [VIP-358 XVS bridge between zkSync Era and BNB Chain, Ethereum, Arbitrum one and opBNB](https://app.venus.io/#/governance/proposal/358), this VIP configure (and pause) the XVS vault on zkSync Era.

The following steps on the zkSync Era deployment are:

1. Configure and pause the XVS vault. This VIP
2. Configure the Venus markets, following the [Chaos labs recommendations](https://community.venus.io/t/deploy-venus-protocol-on-zksync-era/4472/12)
3. Configure Venus Prime on the XVS vault and resume the XVS vault. From this moment, users will be able to deposit XVS into the vault, starting with their qualification period for Prime
4. Transfer XVS from BNB Chain to zkSync Era, that will be used for the rewards
5. Enable rewards on the XVS vault and on the Venus markets

#### Security and additional considerations

We applied the following security procedures for this upgrade:

* **VIP execution simulation:** in a simulation environment, checking ownership of the contracts and validating the usual operations on the XVS vault
* **Deployment on testnet:** the same contracts have been deployed to testnet, and used in the Venus Protocol testnet deployment
* **Audit:** Certik, Quantstamp and Fairyproof have audited the code of the XVSVault on zkSync Era

#### Audit reports

* [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/088_timeBased_certik_20240117.pdf) (2024/01/17)
* [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/470416836922656783eab52ded54744489e8c345/audits/089_timeBased_quantstamp_20240319.pdf) (2024/03/19)
* [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/094_timeBased_fairyproof_20240304.pdf) (2024/03/04)

#### Deployed contracts on zkSync Era

* [XVSVaultProxy](https://explorer.zksync.io/address/0x58DDAF7e1F08fAfAdDf2169C45dB5420497634D5)
* [XVSVault (implementation)](https://explorer.zksync.io/address/0xb7f1d55914CD8c05ac225c3c1a30281Fcc169f25)

#### References

* [VIP simulation](https://github.com/VenusProtocol/vips/pull/365)
* [Deploy Venus Protocol on ZKsync Era](https://community.venus.io/t/deploy-venus-protocol-on-zksync-era/4472)
* Snapshot ["Proposal: Deploy Venus Protocol on ZKsync Era"](https://snapshot.org/#/venus-xvs.eth/proposal/0x56aec6471ddf25eddc0a39e00ab1bbb98477fe67576cd84c7993f7d37729a717)
* [Guardian wallet](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa)

#### Disclaimer for zkSync Era VIPs

Privilege commands on zkSync Era will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0xb854ce0258d98aca0af31c1f63d82d4ecc9a59790f08d839a0e4041dce34f820) multisig transaction will be executed. Otherwise, it will be rejected.
`,
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

export default vip360;
