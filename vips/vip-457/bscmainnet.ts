import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { FAST_TRACK_TIMELOCK } from "src/vip-framework";

const vip457 = () => {
  const meta = {
    version: "v2",
    title: "VIP-457 [Unichain] XVS Rewards on Unichain",
    description: `#### Summary

If passed, this VIP will perform these actions following the proposal [[Unichain] XVS Incentives Model Proposal](https://community.venus.io/t/unichain-xvs-incentives-model-proposal/4864) (and the associated [snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x6fb0e2eadd6713e6ed073122f3c7a576fa3499eed0bd4149fa7c081ab6d5f324)):

- Transfer 18,000 XVS from the [Venus Treasury on Unichain](https://uniscan.xyz/address/0x958F4C84d3ad523Fa9936Dc465A123C7AD43D69B) to the [XVS RewardsDistributor](https://uniscan.xyz/address/0x4630B71C1BD27c99DD86aBB2A18C50c3F75C88fb) of the Core pool, used as market emissions, and configure the emissions for 30 days
- Transfer 1,500 XVS from the [Venus Treasury on Unichain](https://uniscan.xyz/address/0x958F4C84d3ad523Fa9936Dc465A123C7AD43D69B) to the [XVSStore](https://uniscan.xyz/address/0x0ee4b35c2cEAb19856Bf35505F81608d12B2a7Bb) contract, used as XVS Vault rewards, and configure the XVS Vault base rewards for 30 days

#### Description

According to the proposal [[Unichain] XVS Incentives Model Proposal](https://community.venus.io/t/unichain-xvs-incentives-model-proposal/4864), the following XVS rewards will be enabled on Unichain for the first 30 days:

- **Market Emissions**: 4,000 XVS allocated as liquidity incentives, for the following markets in the Core pool on Unichain:
    - WETH: 2,000 XVS
    - USDC: 2,000 XVS
    - In both cases, 75% of the XVS rewards will be for the suppliers and 25% for the borrowers
- Market emissions could be updated after 30 days in a different VIP, following the incentives model proposal, to distribute the 14,000 XVS also sent to the RewardsDistributor contract

The **XVS Vault Base Rewards** will be configured in this VIP to distribute 200 XVS in 30 days.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/496)
- Snapshot "[[Unichain] XVS Incentives Model Proposal](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x6fb0e2eadd6713e6ed073122f3c7a576fa3499eed0bd4149fa7c081ab6d5f324)"
- Community proposal "[[Unichain] XVS Incentives Model Proposal](https://community.venus.io/t/unichain-xvs-incentives-model-proposal/4864)"
- [VIP-452 XVS bridge among Unichain and every supported network](https://app.venus.io/#/governance/proposal/452?chainId=56), where the XVS funds used by this VIP were transferred to the Venus Treasury on Unichain
- [Documentation](https://docs-v4.venus.io/)

#### Disclaimer for Unichain VIPs

Privilege commands on Unichain will be executed by the [](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67)[Guardian wallet](https://uniscan.xyz/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x79ca5d7ef82648f5c52054aa996356da270a60e95a959c595ee3c29defc6a4ca)[this](https://app.safe.global/transactions/tx?safe=unichain:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0x5c990862fd2ceed2cdaabf3e699e9a70ef1ba2b3fd362d29d2203ce709782d24) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: FAST_TRACK_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip457;
