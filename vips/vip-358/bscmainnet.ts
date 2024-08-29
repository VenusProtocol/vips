import { parseUnits } from "ethers/lib/utils";

import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVS_BRIDGE_ADMIN = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";

export const MIN_DST_GAS = "300000";
export const SINGLE_SEND_LIMIT = parseUnits("10000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("10200", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("51000", 18);
export const ZKSYNC_TRUSTED_REMOTE = "0x16a62b534e09a7534cd5847cfe5bf6a4b0c1b116";

const vip358 = () => {
  const meta = {
    version: "v2",
    title: "VIP-358 XVS bridge between zkSync Era and BNB Chain, Ethereum, Arbitrum one and opBNB",
    description: `#### Summary

Following the community proposal [Deploy Venus Protocol on ZKsync Era](https://community.venus.io/t/deploy-venus-protocol-on-zksync-era/4472), and the [associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x56aec6471ddf25eddc0a39e00ab1bbb98477fe67576cd84c7993f7d37729a717), if passed, this VIP configures the bridge contract between zkSync Era and the supported networks (BNB Chain, Ethereum, Arbitrum one, opBNB) using [LayerZero](https://layerzero.network/) ([snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x62440d98cb7513d4873662203b7a27f9441880afa73105c55a733005de7ac9a1)). After the execution, it will be possible to send XVS from zkSync Era to any supported network and vice versa.

#### Description

If passed, this VIP will perform the following actions, following the [Chaos labs recommendations](https://community.venus.io/t/deploy-venus-protocol-on-zksync-era/4472/12):

* Link the [bridge contract on zkSync Era](https://explorer.zksync.io/address/0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116) with the bridges on the different supported networks, setting the trustworthiness relationships
* Configuration of limits (they could be updated in the future with a new VIP):
    * Maximum bridged XVS in a single transaction: 20,000 USD
    * Maximum bridged XVS in 24 hours: 100,000 USD
    * Mintable XVS on zkSync Era: 500,000 XVS
* Governance is whitelisted, so it could bridge any amount of XVS to/from zkSync Era

The bridge contracts use LayerZero, specifically the [Omnichain Fungible Token V2 standard](https://layerzero.gitbook.io/docs/evm-guides/layerzero-omnichain-contracts/oft/oftv2):

* BNB chain → zkSync Era: XVS tokens are locked in BNB Chain bridge contract, and minted on zkSync Era
* zkSync Era → BNB chain: XVS tokens are burnt on zkSync Era, and released on BNB Chain
* zkSync Era ↔ opBNB/Ethereum/Arbitrum one: XVS tokens are burnt on the source network, and minted on the destination network

The Venus UI includes a section to allow the bridge of XVS tokens from a web user interface. A detailed technical guide is provided in the [Venus official documentation site](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge), to bridge XVS tokens directly interacting with the contracts.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

* **Audits:** [Certik](https://www.certik.com/), [Peckshield](https://peckshield.com/) and [Quantstamp](https://quantstamp.com/) have audited the deployed code. Moreover, the [LayerZero](https://layerzero.network/) team reviewed the design and the code directly related to the bridge.
* **VIP execution simulation:** in a simulation environment, validating the bridge is properly configured after the execution
* **Deployment on testnet:** the same bridge has been deployed to testnet, and used in the Venus Protocol testnet environment

#### Audit reports

* [Certik audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/083_multichain_token_bridge_certik_20231226.pdf) (2023/December/26)
* [Quantstamp audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/064_multichain_token_bridge_quantstamp_20231219.pdf) (2023/December/19)
* [Peckshield audit report](https://github.com/VenusProtocol/token-bridge/blob/04b0a8526bb2fa916785c41eefd94b4f84c12819/audits/079_multichain_token_bridge_peckshield_20231020.pdf) (2023/October/20)

#### Deployed contracts on zkSync Era

* XVSBridgeAdmin: [0x2471043F05Cc41A6051dd6714DC967C7BfC8F902](https://explorer.zksync.io/address/0x2471043F05Cc41A6051dd6714DC967C7BfC8F902)
* XVSProxyOFTDest: [0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116](https://explorer.zksync.io/address/0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116)
* XVS: [0xD78ABD81a3D57712a3af080dc4185b698Fe9ac5A](https://explorer.zksync.io/address/0xD78ABD81a3D57712a3af080dc4185b698Fe9ac5A)
* Guardian: [0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa)

#### Bridge contract on the rest of supported networks

* [Ethereum](https://etherscan.io/address/0x888E317606b4c590BBAD88653863e8B345702633)
* [BNB Chain](https://bscscan.com/address/0xf8F46791E3dB29a029Ec6c9d946226f3c613e854)
* [opBNB](https://opbnbscan.com/address/0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2)
* [Arbitrum one](https://arbiscan.io/address/0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6)

#### References

* [Repository](https://github.com/VenusProtocol/token-bridge)
* [VIP simulation](https://github.com/VenusProtocol/vips/pull/362)
* [Chaos labs recommendations about the deployment on zkSync Era](https://community.venus.io/t/deploy-venus-protocol-on-zksync-era/4472/12)
* [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge) 

#### Disclaimer for Ethereum, opBNB, Arbitrum one and zkSync Era commands

Privilege commands on Ethereum, opBNB, Arbitrum one and zkSync Era will be executed by the Guardian wallets ([Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [opBNB](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207), [Arbitrum](https://arbiscan.io/address/0x14e0e151b33f9802b3e75b621c1457afc44dcaa0), [zkSync Era](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa)), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x06370ee4ef60137afb98201cd3b3b44c475891728c5208133a60d31c13071b36), [this](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0xb1ec88e7e803ff207e146099c7755c52ea2efb4a8e8343db91a4fc78b6749a91), [this](https://multisig.bnbchain.org/transactions/tx?safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207&id=multisig_0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207_0x9398052778e70bb653944dc0d4bbdb493b01e62512a4124690b475225e8c8e7f) and [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0xb81cb96b3e58a9dbce3fa2ed059929463cda55ef593efa4611cfb727b3372b65) multisig transactions will be executed. Otherwise, they will be rejected.
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.zksyncmainnet, ZKSYNC_TRUSTED_REMOTE],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMinDstGas(uint16,uint16,uint256)",
        params: [LzChainId.zksyncmainnet, 0, MIN_DST_GAS],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.zksyncmainnet, MAX_DAILY_SEND_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleTransactionLimit(uint16,uint256)",
        params: [LzChainId.zksyncmainnet, SINGLE_SEND_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [LzChainId.zksyncmainnet, MAX_DAILY_RECEIVE_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [LzChainId.zksyncmainnet, SINGLE_RECEIVE_LIMIT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip358;
