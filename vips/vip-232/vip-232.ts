import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVSBridgeAdmin_Proxy = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
const TRUSTED_REMOTE = "0x888E317606b4c590BBAD88653863e8B345702633";

export const MIN_DST_GAS = "300000";
export const SINGLE_SEND_LIMIT = "10000000000000000000000";
export const MAX_DAILY_SEND_LIMIT = "50000000000000000000000";
export const SINGLE_RECEIVE_LIMIT = "10000000000000000000000";
export const MAX_DAILY_RECEIVE_LIMIT = "50000000000000000000000";
export const DEST_CHAIN_ID = 101;

export const vip232 = () => {
  const meta = {
    version: "v2",
    title: "VIP-232 XVS bridge BNB Chain - Ethereum",
    description: `#### Summary

Following the community proposal [[VRC] Deploy Venus Protocol on Ethereum Mainnet](https://community.venus.io/t/vrc-deploy-venus-protocol-on-ethereum-mainnet/3885), and the [associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x68be3a2cf0d4e72459c286ecb3dfae7d6f489ba9d962747987be3a46771a0df2), this VIP is the first one directly related to the multichain deployment of the Venus protocol. It configures the bridge contracts between BNB Chain and Ethereum using [LayerZero](https://layerzero.network/) ([snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x62440d98cb7513d4873662203b7a27f9441880afa73105c55a733005de7ac9a1)). After the execution, it will be possible to send XVS from BNB Chain to Ethereum mainnet and vice versa.

#### Description

If passed, this VIP will perform the following actions:

- Link the [bridge contract on BNB Chain](https://bscscan.com/address/0xf8F46791E3dB29a029Ec6c9d946226f3c613e854) with the [bridge contract on Ethereum](https://etherscan.io/address/0x888E317606b4c590BBAD88653863e8B345702633), setting the trustworthiness relationship
- Configuration of limits (they could be updated in the future with a new VIP):
    - Maximum bridged XVS in a single transaction: 10,000 USD
    - Maximum bridged XVS in 24 hours: 50,000 USD
- Governance is whitelisted, so it could bridge any amount of XVS to/from Ethereum
- Governance accepts the ownership of the XVSBridgeAdmin contract

### Security and additional considerations

- **Audits:** [Certik](https://www.certik.com/), and [Quantstamp](https://quantstamp.com/) have audited the deployed code. Moreover, [LayerZero](https://layerzero.network/) team reviewed the design and the code directly related to the bridge.
- **VIP simulation**: in a simulation environment, validating the bridge is properly configured after the execution
- **Deployment on testnet**: the same bridge has been deployed to testnet (BNB testnet - Sepolia)

#### Audit reports

- [Certik audit report](https://github.com/VenusProtocol/token-bridge/blob/develop/audits/083_multichain_token_bridge_certik_20231226.pdf) (2023/December/26)
- [Quantstamp audit report](https://github.com/VenusProtocol/token-bridge/blob/develop/audits/064_multichain_token_bridge_quantstamp_20231219.pdf) (2023/December/19)

#### Deployed contracts

- BNB Chain
    - XVSBridgeAdmin: [0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21](https://bscscan.com/address/0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21)
    - XVSProxyOFTSrc: [0xf8F46791E3dB29a029Ec6c9d946226f3c613e854](https://bscscan.com/address/0xf8F46791E3dB29a029Ec6c9d946226f3c613e854)
- Ethereum
    - XVSBridgeAdmin: [0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96](https://etherscan.io/address/0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96)
    - XVSProxyOFTDest: [0x888E317606b4c590BBAD88653863e8B345702633](https://etherscan.io/address/0x888E317606b4c590BBAD88653863e8B345702633)
    - XVS: [0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A](https://etherscan.io/address/0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A)
    - Guardian: [0x285960C5B22fD66A736C7136967A3eB15e93CC67](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67)
- [Contracts on the testnets](https://docs-v4.venus.io/deployed-contracts/xvs-multichain#testnet-chains)

#### References

- [Repository](https://github.com/VenusProtocol/token-bridge)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/140)
- [Resilient oracle deployed to Ethereum](https://docs-v4.venus.io/deployed-contracts/oracles#ethereum-mainnet)
- [Configuration of the bridge contract on Ethereum](https://github.com/VenusProtocol/vips/pull/148)
- [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/technical-doc-xvs-bridge)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setSendVersion(uint16)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setReceiveVersion(uint16)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "forceResumeReceive(uint16,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setOracle(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleTransactionLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyReceiveLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "pause()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "unpause()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "removeTrustedRemote(uint16)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "dropFailedMessage(uint16,bytes,uint64)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "fallbackWithdraw(address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "fallbackDeposit(address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setPrecrime(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMinDstGas(uint16,uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setPayloadSizeLimit(uint16,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setWhitelist(address,bool)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setConfig(uint16,uint16,uint256,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "sweepToken(address,address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "updateSendAndCallEnabled(bool)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setTrustedRemoteAddress(uint16,bytes)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "transferBridgeOwnership(address)", NORMAL_TIMELOCK],
      },
      // FASTTRACK TIMELOCK PERMISSIONS
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setSendVersion(uint16)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setReceiveVersion(uint16)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "forceResumeReceive(uint16,bytes)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleTransactionLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyReceiveLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "pause()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "unpause()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "removeTrustedRemote(uint16)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "dropFailedMessage(uint16,bytes,uint64)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMinDstGas(uint16,uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setPayloadSizeLimit(uint16,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setWhitelist(address,bool)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setConfig(uint16,uint16,uint256,bytes)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "updateSendAndCallEnabled(bool)", FAST_TRACK_TIMELOCK],
      },
      // CRITICAL TIMELOCK PERMISSIONS
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setSendVersion(uint16)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setReceiveVersion(uint16)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "forceResumeReceive(uint16,bytes)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleTransactionLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyReceiveLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "pause()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "unpause()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "removeTrustedRemote(uint16)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "dropFailedMessage(uint16,bytes,uint64)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMinDstGas(uint16,uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setPayloadSizeLimit(uint16,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setWhitelist(address,bool)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setConfig(uint16,uint16,uint256,bytes)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "updateSendAndCallEnabled(bool)", CRITICAL_TIMELOCK],
      },
      // GUARDIAN PERMISSIONS
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "pause()", GUARDIAN],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "unpause()", GUARDIAN],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleTransactionLimit(uint16,uint256)", GUARDIAN],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyLimit(uint16,uint256)", GUARDIAN],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxSingleReceiveTransactionLimit(uint16,uint256)", GUARDIAN],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVSBridgeAdmin_Proxy, "setMaxDailyReceiveLimit(uint16,uint256)", GUARDIAN],
      },

      { target: XVSBridgeAdmin_Proxy, signature: "acceptOwnership()", params: [] },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setWhitelist(address,bool)",
        params: [NORMAL_TIMELOCK, true],
      },
      // ETHEREUM CONFIGURATION
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [DEST_CHAIN_ID, TRUSTED_REMOTE],
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
