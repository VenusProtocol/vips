import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVSBridgeAdmin_Proxy = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";

export const MIN_DST_GAS = "300000";
export const SINGLE_SEND_LIMIT = "10000000000000000000000";
export const MAX_DAILY_SEND_LIMIT = "50000000000000000000000";
export const SINGLE_RECEIVE_LIMIT = "10000000000000000000000";
export const MAX_DAILY_RECEIVE_LIMIT = "50000000000000000000000";
export const DEST_CHAIN_ID = 202; // OPBNBMAINNET
const TRUSTED_REMOTE = "0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2";

export const vip251 = () => {
  const meta = {
    version: "v2",
    title: "VIP-251 XVS bridge BNB chain - opBNB",
    description: `#### Summary

Following the community proposal [Deploy Venus Protocol on opBNB](https://community.venus.io/t/deploy-venus-protocol-on-opbnb/3995), and the [associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xbde3c7b8acf4bba025ad838f3f515c9d9e6f4c2eb0e68fca7f37234baf4ed103), if passed, this VIP configures the bridge contract between BNB Chain and [opBNB](https://opbnb.bnbchain.org/) using [LayerZero](https://layerzero.network/) ([snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x62440d98cb7513d4873662203b7a27f9441880afa73105c55a733005de7ac9a1)). After the execution, it will be possible to send XVS from BNB Chain to opBNB mainnet and vice versa.

#### Description

If passed, this VIP will perform the following actions:

- Link the [bridge contract on BNB Chain](https://bscscan.com/address/0xf8F46791E3dB29a029Ec6c9d946226f3c613e854) with the [bridge contract on opBNB](https://opbnbscan.com/address/0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2), setting the trustworthiness relationship
- Configuration of limits (they could be updated in the future with a new VIP):
    - Maximum bridged XVS in a single transaction: 10,000 USD
    - Maximum bridged XVS in 24 hours: 50,000 USD
- Governance is whitelisted, so it could bridge any amount of XVS to/from opBNB

The bridge contracts use LayerZero, specifically the [Omnichain Fungible Token V2 standard](https://layerzero.gitbook.io/docs/evm-guides/layerzero-omnichain-contracts/oft/oftv2):

- BNB chain → opBNB: XVS tokens are locked in BNB Chain bridge contract, and minted on opBNB
- opBNB → BNB chain: XVS tokens are burnt on opBNB, and released on BNB Chain

The Venus UI includes a section to allow the bridge of XVS tokens from a web user interface. Moreover, it will be possible to bridge XVS from BNB Chain (chain id 102 [according to LayerZero](https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids)) and opBNB mainnet (chain id 202 according to LayerZero) directly interacting with the contracts. A detailed technical guide is provided in the [Venus official documentation site](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge).

This VIP is similar to [VIP-232 XVS bridge BNB Chain - Ethereum](https://app.venus.io/#/governance/proposal/232), but for opBNB instead of Ethereum.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Certik](https://www.certik.com/), and [Quantstamp](https://quantstamp.com/) have audited the deployed code. Moreover, [LayerZero](https://layerzero.network/) team reviewed the design and the code directly related to the bridge.
- **VIP execution simulation**: in a simulation environment, validating the bridge is properly configured after the execution
- **Deployment on testnet**: the same bridge has been deployed to testnet (BNB testnet - opBNB testnet), and used in the Venus Protocol testnet environment

#### Audit reports

- [Certik audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/083_multichain_token_bridge_certik_20231226.pdf) (2023/December/26)
- [Quantstamp audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/064_multichain_token_bridge_quantstamp_20231219.pdf) (2023/December/19)

#### Deployed contracts

- BNB Chain
    - XVSBridgeAdmin: [0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21](https://bscscan.com/address/0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21)
    - XVSProxyOFTSrc: [0xf8F46791E3dB29a029Ec6c9d946226f3c613e854](https://bscscan.com/address/0xf8F46791E3dB29a029Ec6c9d946226f3c613e854)
- opBNB
    - XVSBridgeAdmin: [0x52fcE05aDbf6103d71ed2BA8Be7A317282731831](https://opbnbscan.com/address/0x52fcE05aDbf6103d71ed2BA8Be7A317282731831)
    - XVSProxyOFTDest: [0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2](https://opbnbscan.com/address/0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2)
    - XVS: [0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61](https://opbnbscan.com/address/0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61)
    - Guardian: [0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207)
- [Contracts on the testnets](https://docs-v4.venus.io/deployed-contracts/xvs-multichain#testnet-chains)

#### References

- [Repository](https://github.com/VenusProtocol/token-bridge)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/123)
- [Resilient oracle deployed to opBNB](https://docs-v4.venus.io/deployed-contracts/oracles#opbnb-mainnet)
- [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge)`,

    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [DEST_CHAIN_ID, TRUSTED_REMOTE], // OPBNBTESTNET
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMinDstGas(uint16,uint16,uint256)",
        params: [DEST_CHAIN_ID, 0, MIN_DST_GAS],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, MAX_DAILY_SEND_LIMIT],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxSingleTransactionLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, SINGLE_SEND_LIMIT],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, MAX_DAILY_RECEIVE_LIMIT],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, SINGLE_RECEIVE_LIMIT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip251;
