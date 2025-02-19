import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0x36a69dE601381be7b0DcAc5D5dD058825505F8f6";

export const OMNICHAIN_EXECUTOR_OWNER = "0x6E78a0d96257F8F2615d72F3ee48cb6fb2c970bd";
export const ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0x904D11b00bdB2740d16176cc00DE139d0d626115";
export const MAX_DAILY_LIMIT = 100;

const vip456 = () => {
  const meta = {
    version: "v2",
    title: "VIP-456 [Unichain] Omnichain Governance",
    description: `#### Summary

If passed, this VIP will enable the Omnichain Governance system on the Venus protocol, for Unichain. Omnichain Governance will allow the Venus Community to propose VIP’s on BNB Chain including commands to be executed on Unichain.

#### Description

This VIP will grant permissions to [Normal](https://bscscan.com/address/0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396), [Fast-track](https://bscscan.com/address/0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02) and [Critical](https://bscscan.com/address/0x213c446ec11e45b15a6E29C1C1b402B8897f606d) timelocks on BNB Chain to create remote VIP’s on Unichain. It also performs the necessary configuration of [OmnichainProposalSender](https://bscscan.com/address/0x36a69dE601381be7b0DcAc5D5dD058825505F8f6) on BNB Chain and [OmnichainGovernanceExecutor](https://uniscan.xyz/address/0x3E281461efb3D53EC20DB207674373Ed8Ef3BbA9) on Unichain (set the trustworthiness relationships, configure limits, accept ownerships).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, checking ownership of the contracts
- **Deployment on testnet**: the same contracts have been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Audit**: [OpenZeppelin](https://www.openzeppelin.com/), [Quantstamp](https://quantstamp.com/), [Cantina](https://cantina.xyz/) and [Certik](https://www.certik.com/) have audited the Omnichain Governance contracts.

#### Audit reports

- [Openzepplin audit report - 2024/01/19](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/084_multichainGovernance_openzeppelin_20240119.pdf)
- [Quantstamp audit report - 2024/04/29](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/106_multichainGovernance_quantstamp_20240429.pdf)
- [Cantina audit report - 2024/04/25](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/105_multichainGovernance_cantina_20240425.pdf)
- [Certik audit report - 2024/02/26](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/085_multichainGovernance_certik_20240226.pdf)
- [Certik audit report of ACMCommandsAggregator - 2024/10/07](https://github.com/VenusProtocol/governance-contracts/blob/3a5a2740e86c9137ab17f4f3939c97b145a22803/audits/118_ACMCommandsAggregator_certik_20241007.pdf)

#### Deployed contracts on Unichain

- Normal Timelock: [0x918532A78d22419Da4091930d472bDdf532BE89a](https://uniscan.xyz/address/0x918532A78d22419Da4091930d472bDdf532BE89a)
- FastTrack Timelock: [0x4121995b87f9EE8bA0a89e87470255e2E0fe48c7](https://uniscan.xyz/address/0x4121995b87f9EE8bA0a89e87470255e2E0fe48c7)
- Critical Timelock: [0x1b05eCb489842786776a9A10e91AAb56e2CFe15e](https://uniscan.xyz/address/0x1b05eCb489842786776a9A10e91AAb56e2CFe15e)
- Omnichain Governance Executor: [0x3E281461efb3D53EC20DB207674373Ed8Ef3BbA9](https://uniscan.xyz/address/0x3E281461efb3D53EC20DB207674373Ed8Ef3BbA9)
- Omnichain Executor Owner Proxy: [0x6E78a0d96257F8F2615d72F3ee48cb6fb2c970bd](https://uniscan.xyz/address/0x6E78a0d96257F8F2615d72F3ee48cb6fb2c970bd)
- ACMCommandsAggregator: [0x904D11b00bdB2740d16176cc00DE139d0d626115](https://uniscan.xyz/address/0x904D11b00bdB2740d16176cc00DE139d0d626115)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/498)
- [Deploy Venus on Unichain](https://community.venus.io/t/deploy-venus-on-unichain/4859)
- Snapshot ["Deploy Venus on Unichain"](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xbf2fff03c4f84620a8b3ece2e31d879224ee03c42aefc6dc94e9c2b40a5a634b)
- [Code of Omnichain Governance](https://github.com/VenusProtocol/governance-contracts/pull/21)
- [Documentation - Technical article with more details of the Omnichain Governance feature](https://docs-v4.venus.io/technical-reference/reference-technical-articles/omnichain-governance)
- [Documentation](https://docs-v4.venus.io/)

#### Disclaimer for Unichain VIPs

Privilege commands on Unichain will be executed by the [Guardian wallet](https://uniscan.xyz/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C), until the [Omnichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/omnichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=unichain:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0xdf9f020eb83bf3e68d6511c6a4e0ee4ed5f1529b82f7fcd71db27f856ee18ea5) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.unichainmainnet, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.unichainmainnet, unichainmainnet.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },
      {
        target: OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [2],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [3],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip456;
