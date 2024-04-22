import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVS_BRIDGE_ADMIN_PROXY = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";
export const BNB_TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const SINGLE_RECEIVE_LIMIT_OP_BNB = parseUnits("10200", 18);
export const MAX_DAILY_RECEIVE_LIMIT_OP_BNB = parseUnits("51000", 18);
export const SINGLE_RECEIVE_LIMIT_ETHEREUM = parseUnits("102000", 18);
export const MAX_DAILY_RECEIVE_LIMIT_ETHEREUM = parseUnits("1020000", 18);
export const OP_BNB_ENDPOINT_ID = 202;
export const ETHEREUM_ENDPOINT_ID = 101;

const vip292 = () => {
  const meta = {
    version: "v2",
    title: "VIP-292 XVS bridge Ethereum - opBNB",
    description: `#### Summary

Following the community proposals [[VRC] Deploy Venus Protocol on Ethereum Mainnet](https://community.venus.io/t/vrc-deploy-venus-protocol-on-ethereum-mainnet/3885) ([snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x68be3a2cf0d4e72459c286ecb3dfae7d6f489ba9d962747987be3a46771a0df2)) and [Deploy Venus Protocol on opBNB](https://community.venus.io/t/deploy-venus-protocol-on-opbnb/3995) ([snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xbde3c7b8acf4bba025ad838f3f515c9d9e6f4c2eb0e68fca7f37234baf4ed103)), if passed, this VIP configures the bridge contract between Ethereum and opBNB using [LayerZero](https://layerzero.network/) ([snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x62440d98cb7513d4873662203b7a27f9441880afa73105c55a733005de7ac9a1)). After the execution, it will be possible to send XVS from Ethereum to opBNB mainnet and vice versa.

Moreover, following the [recommendations from Certik](https://github.com/VenusProtocol/token-bridge/blob/7e13d370fbb8e9fcd6c8e0fde5943e44e0b64bfa/audits/104_mesh_architecture_certik_20240419.pdf), the “receive” limits in the XVS bridge contracts have been increased by 2%, to reduce potential issues in case of changes in the XVS price during the off-chain step of the transfer across networks.

#### Description

If passed, this VIP will perform the following actions:

- Link the [bridge contract on Ethereum](https://etherscan.io/address/0x888E317606b4c590BBAD88653863e8B345702633) with the [bridge contract on opBNB](https://opbnbscan.com/address/0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2), setting the trustworthiness relationship
- Configuration of limits (they could be updated in the future with a new VIP):
    - Maximum bridged XVS in a single transaction: 10,000 USD
    - Maximum bridged XVS in 24 hours: 50,000 USD
- Whitelist the [Guardian](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67) on Ethereum, the [Venus Treasury](https://opbnbscan.com/address/0xDDc9017F3073aa53a4A8535163b0bf7311F72C52) on opBNB and the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) on BNB chain, to bridge any amount of XVS from/to these addresses
- Upgrade the receive limits in the XVS bridge contracts:
    - Single transaction receive limit, from BNB chain to Ethereum: 100,000 USD → 102,000 USD
    - Daily receive limit, from BNB Chain to Ethereum: 1,000,000 USD → 1,020,000 USD
    - Single transaction receive limit, from BNB chain to opBNB: 10,000 USD → 10,200 USD
    - Daily receive limit, from BNB Chain to opBNB: 50,000 USD → 51,000 USD
    - Single transaction receive limit, from Ethereum to BNB Chain: 100,000 USD → 102,000 USD
    - Daily receive limit, from Ethereum to BNB Chain: 1,000,000 USD → 1,020,000 USD
    - Single transaction receive limit, from opBNB to BNB Chain: 10,000 USD → 10,200 USD
    - Daily receive limit, from opBNB to BNB Chain: 50,000 USD → 51,000 USD

The bridge contracts use LayerZero, specifically the [Omnichain Fungible Token V2 standard](https://layerzero.gitbook.io/docs/evm-guides/layerzero-omnichain-contracts/oft/oftv2):

- Ethereum → opBNB: XVS tokens are burnt on Ethereum, and released on opBNB
- opBNB → Ethereum: XVS tokens are burnt on opBNB, and released on Ethereum

Apart from using the Venus UI, it will be possible to bridge XVS from Ethereum (endpoint id 101 [according to LayerZero](https://docs.layerzero.network/v1/developers/technical-reference/mainnet/mainnet-addresses)) and opBNB mainnet (endpoint id 202 according to LayerZero) directly interacting with the contracts. A detailed technical guide is provided in the [Venus official documentation site](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **No changes in the deployed code**. This VIP only sets risk parameters on existing code.
- **Audits:**
    - [Certik](https://www.certik.com/), [Peckshield](https://peckshield.com/) and [Quantstamp](https://quantstamp.com/) have audited the deployed code. Moreover, [LayerZero](https://layerzero.network/) team reviewed the design and the code directly related to the bridge.
    - Certik has reviewed the commands included in this VIP and the mesh architecture
- **VIP execution simulation**: in a simulation environment, validating the bridge is properly configured after the execution
- **Deployment on testnet**: the same bridge has been deployed to testnet (Sepolia - opBNB testnet), and used in the Venus Protocol testnet environment

#### Audit reports

- Codebase:
    - [Certik audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/083_multichain_token_bridge_certik_20231226.pdf) (2023/December/26)
    - [Quantstamp audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/064_multichain_token_bridge_quantstamp_20231219.pdf) (2023/December/19)
    - [Peckshield audit report](https://github.com/VenusProtocol/token-bridge/blob/04b0a8526bb2fa916785c41eefd94b4f84c12819/audits/079_multichain_token_bridge_peckshield_20231020.pdf) (2023/October/20)
- Mesh architecture:
    - [Certik audit report](https://github.com/VenusProtocol/token-bridge/blob/7e13d370fbb8e9fcd6c8e0fde5943e44e0b64bfa/audits/104_mesh_architecture_certik_20240419.pdf) (2024/April/19)

#### Deployed contracts

- Ethereum
    - XVSBridgeAdmin: [0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96](https://etherscan.io/address/0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96)
    - XVSProxyOFTDest: [0x888E317606b4c590BBAD88653863e8B345702633](https://etherscan.io/address/0x888E317606b4c590BBAD88653863e8B345702633)
    - XVS: [0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A](https://etherscan.io/address/0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A)
    - Guardian: [0x285960C5B22fD66A736C7136967A3eB15e93CC67](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67)
- opBNB
    - XVSBridgeAdmin: [0x52fcE05aDbf6103d71ed2BA8Be7A317282731831](https://opbnbscan.com/address/0x52fcE05aDbf6103d71ed2BA8Be7A317282731831)
    - XVSProxyOFTDest: [0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2](https://opbnbscan.com/address/0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2)
    - XVS: [0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61](https://opbnbscan.com/address/0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61)
    - Guardian: [0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207)

#### References

- [Repository](https://github.com/VenusProtocol/token-bridge)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/255)
- [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge)

#### Disclaimer for Ethereum/opBNB VIPs

Privilege commands on Ethereum and opBNB will be executed by the Guardian wallets ([Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [opBNB](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207)), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x7c7b1f572a199c2b0e31c38a7e03b726ca3edf7d0461861847037db13d444f3f) and [this](https://multisig.bnbchain.org/transactions/tx?safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207&id=multisig_0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207_0xf852fe20fca49d1f48e4c1a361acd51cb9af1570173e25ab9a7d63c6ad648650) multisig transactions will be executed. Otherwise, they will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setWhitelist(address,bool)",
        params: [BNB_TREASURY, true],
      },

      // opBNB Configuration
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [OP_BNB_ENDPOINT_ID, MAX_DAILY_RECEIVE_LIMIT_OP_BNB],
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [OP_BNB_ENDPOINT_ID, SINGLE_RECEIVE_LIMIT_OP_BNB],
      },

      // Ethereum configuration
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [ETHEREUM_ENDPOINT_ID, MAX_DAILY_RECEIVE_LIMIT_ETHEREUM],
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [ETHEREUM_ENDPOINT_ID, SINGLE_RECEIVE_LIMIT_ETHEREUM],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip292;
