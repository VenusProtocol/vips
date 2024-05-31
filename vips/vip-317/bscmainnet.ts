import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVS_BRIDGE_ADMIN = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";

export const MIN_DST_GAS = "300000";
export const MAX_DAILY_SEND_LIMIT = parseUnits("100000", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("102000", 18);
export const SINGLE_SEND_LIMIT = parseUnits("20000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("20400", 18);
export const ARBITRUM_ONE_CHAIN_ID = 110;
const ARBITRUM_ONE_TRUSTED_REMOTE = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";

const vip317 = () => {
  const meta = {
    version: "v2",
    title: "VIP-317 XVS bridge between Arbitrum one and BNB Chain, Ethereum and opBNB",
    description: `#### Summary

Following the community proposal [[VRC] Deploy Venus Protocol on Arbitrum](https://community.venus.io/t/vrc-deploy-venus-protocol-on-arbitrum/3721), and the [associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xfc1f42609bda5d7d14660b0b91b19ca63ea1b2ea50169ddab79adfbfbdce323f), if passed, this VIP configures the bridge contract between Arbitrum one and the supported networks (BNB Chain, Ethereum, opBNB) using [LayerZero](https://layerzero.network/) ([snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x62440d98cb7513d4873662203b7a27f9441880afa73105c55a733005de7ac9a1)). After the execution, it will be possible to send XVS from Arbitrum one to any supported network and vice versa.

#### Description

If passed, this VIP will perform the following actions, following the [Chaos labs recommendations](https://community.venus.io/t/vrc-deploy-venus-protocol-on-arbitrum/3721/7):

- Link the [bridge contract on Arbitrum one](https://arbiscan.io/address/0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6) with the bridges on the different supported networks, setting the trustworthiness relationships
- Configuration of limits (they could be updated in the future with a new VIP):
    - Maximum bridged XVS in a single transaction: 20,000 USD
    - Maximum bridged XVS in 24 hours: 100,000 USD
    - Mintable XVS on Arbitrum: 500,000 XVS
- Governance is whitelisted, so it could bridge any amount of XVS to/from Arbitrum one

The bridge contracts use LayerZero, specifically the [Omnichain Fungible Token V2 standard](https://layerzero.gitbook.io/docs/evm-guides/layerzero-omnichain-contracts/oft/oftv2):

- BNB chain → Arbitrum one: XVS tokens are locked in BNB Chain bridge contract, and minted on Arbitrum one
- Arbitrum one → BNB chain: XVS tokens are burnt on Arbitrum one, and released on BNB Chain
- Arbitrum one ↔ opBNB/Ethereum: XVS tokens are burnt on the source network, and minted on the destination network

The Venus UI includes a section to allow the bridge of XVS tokens from a web user interface. A detailed technical guide is provided in the [Venus official documentation site](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge), to bridge XVS tokens directly interacting with the contracts.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Certik](https://www.certik.com/), [Peckshield](https://peckshield.com/) and [Quantstamp](https://quantstamp.com/) have audited the deployed code. Moreover, the [LayerZero](https://layerzero.network/) team reviewed the design and the code directly related to the bridge.
- **VIP execution simulation**: in a simulation environment, validating the bridge is properly configured after the execution
- **Deployment on testnet**: the same bridge has been deployed to testnet, and used in the Venus Protocol testnet environment

#### Audit reports

- [Certik audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/083_multichain_token_bridge_certik_20231226.pdf) (2023/December/26)
- [Quantstamp audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/064_multichain_token_bridge_quantstamp_20231219.pdf) (2023/December/19)
- [Peckshield audit report](https://github.com/VenusProtocol/token-bridge/blob/04b0a8526bb2fa916785c41eefd94b4f84c12819/audits/079_multichain_token_bridge_peckshield_20231020.pdf) (2023/October/20)

#### Deployed contracts on Arbitrum one

- XVSBridgeAdmin: [0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784](https://arbiscan.io/address/0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784)
- XVSProxyOFTDest: [0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6](https://arbiscan.io/address/0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6)
- XVS: [0xc1Eb7689147C81aC840d4FF0D298489fc7986d52](https://arbiscan.io/address/0xc1Eb7689147C81aC840d4FF0D298489fc7986d52)
- Guardian: [0x14e0e151b33f9802b3e75b621c1457afc44dcaa0](https://arbiscan.io/address/0x14e0e151b33f9802b3e75b621c1457afc44dcaa0)

#### Bridge contract on the rest of supported networks

- [Ethereum](https://etherscan.io/address/0x888E317606b4c590BBAD88653863e8B345702633)
- [BNB Chain](https://bscscan.com/address/0xf8F46791E3dB29a029Ec6c9d946226f3c613e854)
- [opBNB](https://opbnbscan.com/address/0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2)

#### References

- [Repository](https://github.com/VenusProtocol/token-bridge)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/249)
- [Chaos labs recommendations about the deployment on Arbitrum one](https://community.venus.io/t/vrc-deploy-venus-protocol-on-arbitrum/3721/7)
- [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge)

#### Disclaimer for Ethereum, opBNB and Arbitrum commands

Privilege commands on Ethereum, opBNB and Arbitrum will be executed by the Guardian wallets ([Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [opBNB](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207), [Arbitrum](https://arbiscan.io/address/0x14e0e151b33f9802b3e75b621c1457afc44dcaa0)), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x7024acf8550e731450fadd820f36bbd39ff3402b3f131e6caac436ca5f66297e), [this](https://multisig.bnbchain.org/transactions/tx?safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207&id=multisig_0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207_0x9e8e41d2536cded737fb3c299fda35595e17ebd8dcf17652401499b561d02caf) and [this](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0xaa760a5de694220e188753f6db55b79e0ed9e6af3318bbd50829e6ac581abdba) multisig transactions will be executed. Otherwise, they will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [ARBITRUM_ONE_CHAIN_ID, ARBITRUM_ONE_TRUSTED_REMOTE],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMinDstGas(uint16,uint16,uint256)",
        params: [ARBITRUM_ONE_CHAIN_ID, 0, MIN_DST_GAS],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [ARBITRUM_ONE_CHAIN_ID, MAX_DAILY_SEND_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleTransactionLimit(uint16,uint256)",
        params: [ARBITRUM_ONE_CHAIN_ID, SINGLE_SEND_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [ARBITRUM_ONE_CHAIN_ID, MAX_DAILY_RECEIVE_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [ARBITRUM_ONE_CHAIN_ID, SINGLE_RECEIVE_LIMIT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip317;
