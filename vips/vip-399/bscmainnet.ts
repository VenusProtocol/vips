import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { zksyncmainnet, opmainnet } = NETWORK_ADDRESSES;
export const OMNICHAIN_PROPOSAL_SENDER = "0x36a69dE601381be7b0DcAc5D5dD058825505F8f6";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const ZKSYNCMAINNET_OMNICHAIN_EXECUTOR_OWNER = "0xdfaed3E5d9707629Ed5c225b4fB980c064286771";
export const ZKSYNCMAINNET_ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const ZKSYNCMAINNET_ACM_AGGREGATOR = "0x88B1452e512c8fcf83889DdCfe54dF37D561Db82";

export const OP_MAINNET_OMNICHAIN_EXECUTOR_OWNER = "0xe6d9Eb3A07a1dc4496fc71417D7A7b9d5666BaA3";
export const OP_MAINNET_ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
export const OP_MAINNET_ACM_AGGREGATOR = "0xbbEBaF646e7a3E4064a899e68565B1b439eFdf70";

export const MAX_DAILY_LIMIT = 100;

const vip399 = () => {
  const meta = {
    version: "v2",
    title: "VIP-399 Enable Omnichain Governance on zkSync and Optimism (1/2)",
    description: `#### Summary

If passed, following the Community proposal “[Venus Upgrade - Omnichain Money Markets](https://community.venus.io/t/venus-upgrade-omnichain-money-markets/3027/9)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x62440d98cb7513d4873662203b7a27f9441880afa73105c55a733005de7ac9a1), this VIP enables the Omnichain Governance system on the Venus protocol, for zkSync Era and Optimism. Omnichain Governance will allow the Venus Community to propose VIP’s on BNB Chain including commands to be executed on the mentioned networks.

#### Description

[VIP-330](https://app.venus.io/#/governance/proposal/394?chainId=56) executed similar commands for Ethereum, Arbitrum one and opBNB. Review that VIP for a detailed explanation.

#### Commands on the this VIP

This VIP will grant permissions to Normal, Fast-track and Critical timelocks on BNB chain to create remote VIP’s. It also performs the necessary configuration of OmnichainProposalSender on BNB Chain and OmnichainProposalExecutor on zkSync Era and Optimism (set the trustworthiness relationships, configure limits, accept ownerships).

Moreover, this VIP will authorise the Guardian wallets on [zkSync Era](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa) and [Optimism](https://optimistic.etherscan.io/address/0x2e94dd14E81999CdBF5deDE31938beD7308354b3) to execute the privilege commands on the OmnichainExecutorOwner contracts. This is a safety measure, to guarantee it will be possible to execute remote VIP’s. These permissions will be removed in the future. These authorizations will be granted using the [ACMCommandsAggregator](https://github.com/VenusProtocol/governance-contracts/blob/develop/contracts/Utils/ACMCommandsAggregator.sol) contract, previously used in [VIP-391](https://app.venus.io/#/governance/proposal/391?chainId=56).

The Default Role in the AccessControlManager contract will be assigned to the Normal Timelock contracts on zkSync Era and Optimism with multisig transactions ([this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x4959666396bbe77d6b756d522bd749788f5595834bbc159c8df04158f24ad77b) and [this](https://app.safe.global/transactions/tx?safe=oeth:0x2e94dd14E81999CdBF5deDE31938beD7308354b3&id=multisig_0x2e94dd14E81999CdBF5deDE31938beD7308354b3_0x1cbbe6e257d58ca0ff94d5017cc68d7a6cffbba2482bf61da1179a6768a60d26)), that will be executed only if this VIP passes. Otherwise, they will be rejected.

#### Next steps

New VIP’s will be proposed soon to complete the configuration

- Authorise Normal, Fast-track and Critical timelocks to execute the different privilege commands on the destination networks
- Reduce the permissions granted to the Guardian wallets on the destination networks (nowadays, the Guardian wallets can execute any privilege command on those networks)
- Transfer the ownership of the contracts, from the Guardian wallets to the Normal timelocks on each destination network (including Ethereum, Arbitrum one and opBNB)
- Synchronise the voting power. With this feature, the XVS staked on the different networks will be taken into account during the VIP’s votes on BNB Chain

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [OpenZeppelin](https://www.openzeppelin.com/), [Quantstamp](https://quantstamp.com/), [Cantina](https://cantina.xyz/) and [Certik](https://www.certik.com/) have audited the Omnichain Governance contracts.
- **VIP execution simulation**: in a simulation environment, validating the expected configuration on every network
- **Deployment on testnet**: the same contracts have been deployed to the supported testnets, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Openzepplin audit report - 2024/01/19](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/084_multichainGovernance_openzeppelin_20240119.pdf)
- [Quantstamp audit report - 2024/04/29](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/106_multichainGovernance_quantstamp_20240429.pdf)
- [Cantina audit report - 2024/04/25](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/105_multichainGovernance_cantina_20240425.pdf)
- [Certik audit report - 2024/02/26](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/085_multichainGovernance_certik_20240226.pdf)

#### Deployed contracts

Mainnet:

- BNB Chain:
    - OmniChainProposalSender: [0x36a69dE601381be7b0DcAc5D5dD058825505F8f6](https://bscscan.com/address/0x36a69dE601381be7b0DcAc5D5dD058825505F8f6)
- zkSync Era:
    - Normal Timelock: [0x093565Bc20AA326F4209eBaF3a26089272627613](https://explorer.zksync.io/address/0x093565Bc20AA326F4209eBaF3a26089272627613)
    - FastTrack Timelock: [0x32f71c95BC8F9d996f89c642f1a84d06B2484AE9](https://explorer.zksync.io/address/0x32f71c95BC8F9d996f89c642f1a84d06B2484AE9)
    - Critical Timelock: [0xbfbc79D4198963e4a66270F3EfB1fdA0F382E49c](https://explorer.zksync.io/address/0xbfbc79D4198963e4a66270F3EfB1fdA0F382E49c)
    - Omnichain Governance Executor: [0xA1b56f19CA5E5b15EF29d38238930Ce9f0235312](https://explorer.zksync.io/address/0xA1b56f19CA5E5b15EF29d38238930Ce9f0235312)
    - Omnichain Executor Owner Proxy: [0xdfaed3E5d9707629Ed5c225b4fB980c064286771](https://explorer.zksync.io/address/0xdfaed3E5d9707629Ed5c225b4fB980c064286771)
    - ACMCommandsAggregator: [0x88B1452e512c8fcf83889DdCfe54dF37D561Db82](https://explorer.zksync.io/address/0x88B1452e512c8fcf83889DdCfe54dF37D561Db82)
- Optimism:
    - Normal Timelock: [0x0C6f1E6B4fDa846f63A0d5a8a73EB811E0e0C04b](https://optimistic.etherscan.io/address/0x0C6f1E6B4fDa846f63A0d5a8a73EB811E0e0C04b)
    - FastTrack Timelock: [0x508bD9C31E8d6760De04c70fe6c2b24B3cDea7E7](https://optimistic.etherscan.io/address/0x508bD9C31E8d6760De04c70fe6c2b24B3cDea7E7)
    - Critical Timelock: [0xB82479bc345CAA7326D7d21306972033226fC185](https://optimistic.etherscan.io/address/0xB82479bc345CAA7326D7d21306972033226fC185)
    - Omnichain Governance Executor: [0x09b11b1CAdC08E239970A8993783f0f8EeC60ABf](https://optimistic.etherscan.io/address/0x09b11b1CAdC08E239970A8993783f0f8EeC60ABf)
    - Omnichain Executor Owner Proxy: [0xe6d9Eb3A07a1dc4496fc71417D7A7b9d5666BaA3](https://optimistic.etherscan.io/address/0xe6d9Eb3A07a1dc4496fc71417D7A7b9d5666BaA3)
    - ACMCommandsAggregator: [0xbbEBaF646e7a3E4064a899e68565B1b439eFdf70](https://optimistic.etherscan.io/address/0xbbEBaF646e7a3E4064a899e68565B1b439eFdf70)

Testnets:

- BNB Chain:
    - Omnichain Proposal Sender: [0xCfD34AEB46b1CB4779c945854d405E91D27A1899](https://testnet.bscscan.com/address/0xCfD34AEB46b1CB4779c945854d405E91D27A1899)
- zkSync Era sepolia:
    - Normal Timelock: [0xdDe31d7eEEAD7Cf9790F833C4FF4c6e61404402a](https://sepolia-optimism.etherscan.io/address/0xdDe31d7eEEAD7Cf9790F833C4FF4c6e61404402a)
    - FastTrack Timelock: [0xe0Fa35b6279dd802C382ae54c50C8B16deaC0885](https://sepolia-optimism.etherscan.io/address/0xe0Fa35b6279dd802C382ae54c50C8B16deaC0885)
    - Critical Timelock: [0x45d2263c6E0dbF84eBffB1Ee0b80aC740607990B](https://sepolia-optimism.etherscan.io/address/0x45d2263c6E0dbF84eBffB1Ee0b80aC740607990B)
    - Omnichain Governance Executor: [0xC7D6D33adcdBfccD416C3aAB1878360ea8b79ac6](https://sepolia-optimism.etherscan.io/address/0xC7D6D33adcdBfccD416C3aAB1878360ea8b79ac6)
    - Omnichain Executor Owner Proxy: [0xE92E31df479BC1031B866063F65CF71B6bAC4FC6](https://sepolia-optimism.etherscan.io/address/0xE92E31df479BC1031B866063F65CF71B6bAC4FC6)
    - ACMCommandsAggregator: [0xEEeF13364fD22b8eA6932A9ed337e2638f8E0eD6](https://sepolia-optimism.etherscan.io/address/0xEEeF13364fD22b8eA6932A9ed337e2638f8E0eD6)
- Optimism sepolia:
    - Normal Timelock: [0x1730527a0f0930269313D77A317361b42971a67E](https://sepolia.explorer.zksync.io/address/0x1730527a0f0930269313D77A317361b42971a67E)
    - FastTrack Timelock: [0xb055e028b27d53a455a6c040a6952e44E9E615c4](https://sepolia.explorer.zksync.io/address/0xb055e028b27d53a455a6c040a6952e44E9E615c4)
    - Critical Timelock: [0x0E6138bE0FA1915efC73670a20A10EFd720a6Cc8](https://sepolia.explorer.zksync.io/address/0x0E6138bE0FA1915efC73670a20A10EFd720a6Cc8)
    - Omnichain Governance Executor: [0x83F79CfbaEee738173c0dfd866796743F4E25C9e](https://sepolia.explorer.zksync.io/address/0x83F79CfbaEee738173c0dfd866796743F4E25C9e)
    - Omnichain Executor Owner Proxy: [0xa34607D58146FA02aF5f920f29C3D916acAb0bC5](https://sepolia.explorer.zksync.io/address/0xa34607D58146FA02aF5f920f29C3D916acAb0bC5)
    - ACMCommandsAggregator: [0x920Bb18c4bd4D7bc41Bf39933BCAa3D078641502](https://sepolia.explorer.zksync.io/address/0x920Bb18c4bd4D7bc41Bf39933BCAa3D078641502)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/384)
- [Code of Omnichain Governance](https://github.com/VenusProtocol/governance-contracts/pull/21)
- [Documentation - Technical article with more details of the Omnichain Governance feature](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance)
- [Transaction on zkSync Era pre-loading the permissions to be granted in this VIP](https://explorer.zksync.io/tx/0xdad5433e73ea0488ea1ca96c96e6617f97b57ce78b1a681361393a8d11b283eb)
- [Transaction on Optimism pre-loading the permissions to be granted in this VIP](https://optimistic.etherscan.io/tx/0xb05e1dc0cf6ed5d5b59dbab32aa870f8147e0c0d0bcf6cab138aa1abaea0c772)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Omnichain sender configuration for zksync
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.zksyncmainnet, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.zksyncmainnet, zksyncmainnet.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },

      // Remote commands for zksync

      {
        target: ZKSYNCMAINNET_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNCMAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNCMAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },

      // Omnichain sender configuration for op mainnet
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.opmainnet, MAX_DAILY_LIMIT],
      },
      {
        target: OMNICHAIN_PROPOSAL_SENDER,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.opmainnet, opmainnet.OMNICHAIN_GOVERNANCE_EXECUTOR],
      },

      // Remote commands for op mainnet

      {
        target: OP_MAINNET_OMNICHAIN_EXECUTOR_OWNER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OP_MAINNET_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OP_MAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OP_MAINNET_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OP_MAINNET_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OP_MAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip399;
