import { parseUnits } from "ethers/lib/utils";

import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVS_BRIDGE_ADMIN = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";

export const MIN_DST_GAS = "300000";
export const SINGLE_SEND_LIMIT = parseUnits("20000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("100000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("20400", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("102000", 18);
export const OP_MAINNET_TRUSTED_REMOTE = "0xbbe46baec851355c3fc4856914c47eb6cea0b8b4";

const vip374 = () => {
  const meta = {
    version: "v2",
    title: "VIP-374 [Optimism] XVS bridge among Optimism and every supported network, and XVS vault configuration",
    description: `#### Summary

Following the community proposal [Deploy Venus Protocol on OP Mainnet](https://community.venus.io/t/deploy-venus-protocol-on-op-mainnet/4512), and the [associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xe2e59410d7c010600ec869132980f10a8694d78e9ece4b3702f973d1e0ecc93f), if passed, this VIP configures the bridge contract among Optimism and the supported networks (BNB Chain, Ethereum, opBNB, Arbitrum one, zkSync Era) using [LayerZero](https://layerzero.network/) ([snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x62440d98cb7513d4873662203b7a27f9441880afa73105c55a733005de7ac9a1)). After the execution, it will be possible to send XVS from Optimism to any supported network and vice versa.

Moreover, if passed, this VIP will perform the following actions:

- Transfer the ownership of the [XVSVault on Optimism](https://optimistic.etherscan.io/address/0x133120607C018c949E91AE333785519F6d947e01) to the [Guardian wallet](https://optimistic.etherscan.io/address/0x2e94dd14E81999CdBF5deDE31938beD7308354b3)
- Configure (and pause) the vault accepting [XVS tokens on Optimism](https://optimistic.etherscan.io/address/0x4a971e87ad1F61f7f3081645f52a99277AE917cF), so no deposits will be accepted yet

#### Description

If passed, this VIP will perform the following actions, following the [Chaos labs recommendations](https://community.venus.io/t/deploy-venus-protocol-on-op-mainnet/4512/9):

- Link the [bridge contract on Optimism](https://optimistic.etherscan.io/address/0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4) with the bridges on the different supported networks, setting the trustworthiness relationships
- Configuration of limits (they could be updated in the future with a new VIP):
    - Maximum bridged XVS in a single transaction: 20,000 USD
    - Maximum bridged XVS in 24 hours: 100,000 USD
    - Mintable XVS on Arbitrum: 500,000 XVS
- Governance is whitelisted, so it could bridge any amount of XVS to/from Optimism

The bridge contracts use LayerZero, specifically the [Omnichain Fungible Token V2 standard](https://layerzero.gitbook.io/docs/evm-guides/layerzero-omnichain-contracts/oft/oftv2):

- BNB chain → Optimism: XVS tokens are locked in BNB Chain bridge contract, and minted on Optimism
- Optimism → BNB chain: XVS tokens are burnt on Optimism, and released on BNB Chain
- Optimism ↔ rest of the networks: XVS tokens are burnt on the source network, and minted on the destination network

The Venus UI includes a section to allow the bridge of XVS tokens from a web user interface. A detailed technical guide is provided in the [Venus official documentation site](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge), to bridge XVS tokens directly interacting with the contracts.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Certik](https://www.certik.com/), [Peckshield](https://peckshield.com/) and [Quantstamp](https://quantstamp.com/) have audited the deployed code related to the bridge. Moreover, the [LayerZero](https://layerzero.network/) team reviewed the design and the code directly related to the bridge. Certik, Quantstamp and [Fairyproof](https://www.fairyproof.com/) have audited the code of the XVSVault on Optimism.
- **VIP execution simulation**: in a simulation environment, validating the bridge is properly configured after the execution
- **Deployment on testnet**: the same bridge has been deployed to testnet, and used in the Venus Protocol testnet environment

#### Audit reports

- Bridge
    - [Certik audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/083_multichain_token_bridge_certik_20231226.pdf) (2023/December/26)
    - [Quantstamp audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/064_multichain_token_bridge_quantstamp_20231219.pdf) (2023/December/19)
    - [Peckshield audit report](https://github.com/VenusProtocol/token-bridge/blob/04b0a8526bb2fa916785c41eefd94b4f84c12819/audits/079_multichain_token_bridge_peckshield_20231020.pdf) (2023/October/20)
- XVS Vault
    - [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/088_timeBased_certik_20240117.pdf) (2024/01/17)
    - [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/470416836922656783eab52ded54744489e8c345/audits/089_timeBased_quantstamp_20240319.pdf) (2024/03/19)
    - [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/094_timeBased_fairyproof_20240304.pdf) (2024/03/04)

#### Deployed contracts on Optimism

- XVSBridgeAdmin: [0x3c307DF1Bf3198a2417d9CA86806B307D147Ddf7](https://optimistic.etherscan.io/address/0x3c307DF1Bf3198a2417d9CA86806B307D147Ddf7)
- XVSProxyOFTDest: [0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4](https://optimistic.etherscan.io/address/0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4)
- XVS: [0x4a971e87ad1F61f7f3081645f52a99277AE917cF](https://optimistic.etherscan.io/address/0x4a971e87ad1F61f7f3081645f52a99277AE917cF)
- XVSVaultProxy: [0x133120607C018c949E91AE333785519F6d947e01](https://optimistic.etherscan.io/address/0x133120607C018c949E91AE333785519F6d947e01)
- XVSVault (implementation): [0x8B8651EEB002a7991F2287500B17a395E8cfe7d9](https://optimistic.etherscan.io/address/0x8B8651EEB002a7991F2287500B17a395E8cfe7d9)
- Guardian: [0x2e94dd14E81999CdBF5deDE31938beD7308354b3](https://optimistic.etherscan.io/address/0x2e94dd14E81999CdBF5deDE31938beD7308354b3)

#### Bridge contract on the rest of supported networks

- [Ethereum](https://etherscan.io/address/0x888E317606b4c590BBAD88653863e8B345702633)
- [BNB Chain](https://bscscan.com/address/0xf8F46791E3dB29a029Ec6c9d946226f3c613e854)
- [opBNB](https://opbnbscan.com/address/0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2)
- [Arbitrum one](https://arbiscan.io/address/0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6)
- [zkSync Era](https://explorer.zksync.io/address/0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116)

#### References

- [Repository](https://github.com/VenusProtocol/token-bridge)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/371)
- [Chaos labs recommendations about the deployment on Optimism](https://community.venus.io/t/deploy-venus-protocol-on-op-mainnet/4512/9)
- [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge)

#### Disclaimer for Ethereum, opBNB, Arbitrum one, zkSync Era and Optimism commands

Privilege commands on Ethereum, opBNB, Arbitrum one, zkSync Era and Optimism will be executed by the Guardian wallets ([Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [opBNB](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207), [Arbitrum one](https://arbiscan.io/address/0x14e0e151b33f9802b3e75b621c1457afc44dcaa0), [zkSync Era](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa), [Optimism](https://optimistic.etherscan.io/address/0x2e94dd14E81999CdBF5deDE31938beD7308354b3)), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, the following multisig transactions will be executed. Otherwise, they will be rejected.

- Bridge configuration:
    - [Ethereum](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xe03db7e074ae8e6b80816cbbdfc722cb479e0014e576283876b7f5b6d02647a4)
    - [opBNB](https://multisig.bnbchain.org/transactions/tx?safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207&id=multisig_0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207_0xe17a2249f96048b552d39f216a0994505f3b5fea2474de995d66157ba407a491)
    - [Arbitrum one](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x2427af46e5783b574534eac23c3555098eb9278e80bfe634202e1c8937ca82fc)
    - [zkSync Era](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x66dd8db8094edf6e913d52577719126324c6c42abc4d25adae4716ee418eecfa)
    - [Optimism](https://app.safe.global/transactions/tx?safe=oeth:0x2e94dd14E81999CdBF5deDE31938beD7308354b3&id=multisig_0x2e94dd14E81999CdBF5deDE31938beD7308354b3_0x4633de15140a675b794b6620d93915364d025971a081f04e1a079d5764fa97f3)
- XVS Vault configuration
    - [Optimism](https://app.safe.global/transactions/tx?safe=oeth:0x2e94dd14E81999CdBF5deDE31938beD7308354b3&id=multisig_0x2e94dd14E81999CdBF5deDE31938beD7308354b3_0x2f416e75707a46e8c831d8ecd92236c47e2ff3584be203059c696cca469a7bcb)
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.opmainnet, OP_MAINNET_TRUSTED_REMOTE],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMinDstGas(uint16,uint16,uint256)",
        params: [LzChainId.opmainnet, 0, MIN_DST_GAS],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.opmainnet, MAX_DAILY_SEND_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleTransactionLimit(uint16,uint256)",
        params: [LzChainId.opmainnet, SINGLE_SEND_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [LzChainId.opmainnet, MAX_DAILY_RECEIVE_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [LzChainId.opmainnet, SINGLE_RECEIVE_LIMIT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip374;
