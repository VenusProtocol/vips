import { parseUnits } from "ethers/lib/utils";

import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { RemoteBridgeCommand, RemoteBridgeEntry } from "./types";

export const BASE_MAINNET_TRUSTED_REMOTE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";

export const MIN_DST_GAS = "300000";

export const remoteBridgeEntries: RemoteBridgeEntry[] = [
  {
    bridgeAdmin: "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21",
    proxyOFT: "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854",
    dstChainId: undefined,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96",
    proxyOFT: "0x888E317606b4c590BBAD88653863e8B345702633",
    dstChainId: LzChainId.ethereum,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831",
    proxyOFT: "0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2",
    dstChainId: LzChainId.opbnbmainnet,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784",
    proxyOFT: "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6",
    dstChainId: LzChainId.arbitrumone,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0x2471043F05Cc41A6051dd6714DC967C7BfC8F902",
    proxyOFT: "0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116",
    dstChainId: LzChainId.zksyncmainnet,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0x3c307DF1Bf3198a2417d9CA86806B307D147Ddf7",
    proxyOFT: "0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4",
    dstChainId: LzChainId.opmainnet,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
];

function getRemoteBridgeCommands(remoteBridgeEntry: RemoteBridgeEntry): RemoteBridgeCommand[] {
  return [
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [LzChainId.basemainnet, BASE_MAINNET_TRUSTED_REMOTE],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMinDstGas(uint16,uint16,uint256)",
      params: [LzChainId.basemainnet, 0, MIN_DST_GAS],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [LzChainId.basemainnet, remoteBridgeEntry.maxDailyLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [LzChainId.basemainnet, remoteBridgeEntry.maxSingleTransactionLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [LzChainId.basemainnet, remoteBridgeEntry.maxDailyReceiveLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [LzChainId.basemainnet, remoteBridgeEntry.maxSingleReceiveTransactionLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
  ];
}

const vip407 = () => {
  const meta = {
    version: "v2",
    title: "VIP-407 [Base] XVS bridge among Base and every supported network, and XVS vault configuration",
    description: `#### Summary

Following the community proposal [Deploy Venus on Base](https://community.venus.io/t/deploy-venus-on-base/4630), and the [associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x353f5fb23ff895d89c21271ea1904af65e60557aeec317b24ce56d728d29b8c1), if passed, this VIP configures the bridge contract among Base and the supported networks (BNB Chain, Ethereum, opBNB, Arbitrum one, zkSync Era, Optimism) using [LayerZero](https://layerzero.network/) ([snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x62440d98cb7513d4873662203b7a27f9441880afa73105c55a733005de7ac9a1)). After the execution, it will be possible to send XVS from Base to any supported network and vice versa.

Moreover, if passed, this VIP will perform the following actions:

- Transfer the ownership of the [XVSVault on Base](https://basescan.org/address/0x708B54F2C3f3606ea48a8d94dab88D9Ab22D7fCd) to the [Guardian wallet](https://basescan.org/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C)
- Configure (and pause) the vault accepting [XVS tokens on Base](https://basescan.org/address/0xebB7873213c8d1d9913D8eA39Aa12d74cB107995), so no deposits will be accepted yet

#### Description

If passed, this VIP will perform the following actions, following the [Chaos labs recommendations](https://community.venus.io/t/deploy-venus-on-base/4630/13):

- Link the [bridge contract on Base](https://basescan.org/address/0x3dD92fB51a5d381Ae78E023dfB5DD1D45D2426Cd) with the bridges on the different supported networks, setting the trustworthiness relationships
- Configuration of limits (they could be updated in the future with a new VIP):
    - Maximum bridged XVS in a single transaction: 20,000 USD
    - Maximum bridged XVS in 24 hours: 100,000 USD
    - Mintable XVS on Arbitrum: 500,000 XVS
- Governance is whitelisted, so it could bridge any amount of XVS to/from Base

The bridge contracts use LayerZero, specifically the [Omnichain Fungible Token V2 standard](https://layerzero.gitbook.io/docs/evm-guides/layerzero-omnichain-contracts/oft/oftv2):

- BNB chain → Base: XVS tokens are locked in BNB Chain bridge contract, and minted on Base
- Base → BNB chain: XVS tokens are burnt on Base, and released on BNB Chain
- Base ↔ rest of the networks: XVS tokens are burnt on the source network, and minted on the destination network

The Venus UI includes a section to allow the bridge of XVS tokens from a web user interface. A detailed technical guide is provided in the [Venus official documentation site](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge), to bridge XVS tokens directly interacting with the contracts.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Certik](https://www.certik.com/), [Peckshield](https://peckshield.com/) and [Quantstamp](https://quantstamp.com/) have audited the deployed code related to the bridge. Moreover, the [LayerZero](https://layerzero.network/) team reviewed the design and the code directly related to the bridge. Certik, Quantstamp and [Fairyproof](https://www.fairyproof.com/) have audited the code of the XVSVault on Base.
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

#### Deployed contracts on Base

- XVSBridgeAdmin: [0x6303FEcee7161bF959d65df4Afb9e1ba5701f78e](https://basescan.org/address/0x6303FEcee7161bF959d65df4Afb9e1ba5701f78e)
- XVSProxyOFTDest: [0x3dD92fB51a5d381Ae78E023dfB5DD1D45D2426Cd](https://basescan.org/address/0x3dD92fB51a5d381Ae78E023dfB5DD1D45D2426Cd)
- XVS: [0xebB7873213c8d1d9913D8eA39Aa12d74cB107995](https://basescan.org/address/0xebB7873213c8d1d9913D8eA39Aa12d74cB107995)
- XVSVaultProxy: [0x708B54F2C3f3606ea48a8d94dab88D9Ab22D7fCd](https://basescan.org/address/0x708B54F2C3f3606ea48a8d94dab88D9Ab22D7fCd)
- XVSVault (implementation): [0x322F1a2E03F089F8ce510855e793970D6f0EFcF9](https://basescan.org/address/0x322F1a2E03F089F8ce510855e793970D6f0EFcF9)
- Guardian: [0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C](https://basescan.org/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C)

#### Bridge contract on the rest of supported networks

- [Ethereum](https://etherscan.io/address/0x888E317606b4c590BBAD88653863e8B345702633)
- [BNB Chain](https://bscscan.com/address/0xf8F46791E3dB29a029Ec6c9d946226f3c613e854)
- [opBNB](https://opbnbscan.com/address/0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2)
- [Arbitrum one](https://arbiscan.io/address/0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6)
- [zkSync Era](https://explorer.zksync.io/address/0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116)
- [Optimism](https://optimistic.etherscan.io/address/0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4)

#### References

- [Repository](https://github.com/VenusProtocol/token-bridge)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/424)
- [Chaos labs recommendations about the deployment on Base](https://community.venus.io/t/deploy-venus-on-base/4630/13)
- [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge)

#### Disclaimer for Base commands

Privilege commands on Base will be executed by the [Guardian wallet](https://basescan.org/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=base:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0xa02d7c91d257b744460c4f016621e606a0e2254a04613de91d2913b1163a98dd) and [this](https://app.safe.global/transactions/tx?safe=base:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0x55f214cc475c1678aeb4612c6d281b530fbcbf5ec8af120d52d60f8e9b441558) multisig transactions will be executed. Otherwise, they will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(remoteBridgeEntries.flatMap(getRemoteBridgeCommands), meta, ProposalType.REGULAR);
};

export default vip407;
