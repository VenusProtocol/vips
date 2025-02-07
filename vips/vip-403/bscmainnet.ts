import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ZKSYNC_ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const OPMAINNET_ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const OPBNB_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const ARBITRUM_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const BSC_ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";

export const OPBNB_ACM_AGGREGATOR = "0x6dB5e303289fea2E83F7d442470210045592AD93";
export const ARBITRUM_ACM_AGGREGATOR = "0x74AFeA28456a683b8fF907699Ff77138edef00f3";
export const ETHEREUM_ACM_AGGREGATOR = "0xb78772bed6995551b64e54Cdb8e09800d86C73ee";
export const ZKSYNC_ACM_AGGREGATOR = "0x88B1452e512c8fcf83889DdCfe54dF37D561Db82";
export const OPMAINNET_ACM_AGGREGATOR = "0xbbEBaF646e7a3E4064a899e68565B1b439eFdf70";
export const BSC_ACM_AGGREGATOR = "0x8b443Ea6726E56DF4C4F62f80F0556bB9B2a7c64";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const vip403 = () => {
  const meta = {
    version: "v2",
    title: "VIP-403 Enable Omnichain Governance on zkSync and Optimism (2/2)",
    description: `#### Summary

If passed, following the Community proposal “[Venus Upgrade - Omnichain Money Markets](https://community.venus.io/t/venus-upgrade-omnichain-money-markets/3027/9)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x62440d98cb7513d4873662203b7a27f9441880afa73105c55a733005de7ac9a1), this VIP will perform the following actions:

- Authorise timelock contracts (Governance) on Optimism and zkSync Era to execute the same privilege functions they can execute on BNB Chain
- Revoke permissions for the Guardian wallets, to execute the privilege functions that will be authorised for the timelock contracts (Governance) in the previous step
- Minor adjustments on the configured permissions at Ethereum, Arbitrum one, opBNB and BNB Chain

After executing this VIP, no more Guardian transactions will be needed to execute most of the privilege commands on Optimism and zkSync Era (Guardian will be only required for contract upgrades in those networks, and that will change soon too).

#### Details

This VIP will update the following number of permissions:

- Optimism: grant 190 authorizations to Governance and revoke 50 authorizations for the Guardian wallet
- zkSync Era: grant 190 authorizations to Governance and revoke 54 authorizations for the Guardian wallet
- Ethereum: grant 2 authorizations to the Guardian wallet and revoke 4 authorizations for the Guardian wallet
- Arbitrum one: grant 2 authorizations to the Guardian wallet and revoke 4 authorizations for the Guardian wallet
- opBNB: revoke 4 authorizations for the Guardian wallet
- BNB Chain: grant 2 authorizations to the Guardian wallet

The numbers of permissions granted and revoked are different because there are different contracts deployed to each network.

Changes (grants and revokes) are pre-loaded in the ACMCommandsAggregator contracts and the VIP on BNB Chain only sends a message cross-chain to execute specific batches of changes. This reduces the payload sent cross-chain and therefore the gas cost of the VIP execution.

The specific pre-loaded permissions can be checked in here:

- Optimism: [grants](https://optimistic.etherscan.io/tx/0x3e04e39fc1a98cdf7ed32ab5e3051aff3677c0cc849f10241e1116ca2d90ee80) and [revokes](https://optimistic.etherscan.io/tx/0x25184837f97167d57983e1c6b05999a94122420aad466f9a3ae8fc01f5bdaba7)
- zkSync Era: [grants](https://explorer.zksync.io/tx/0xae0db72dc1f890ab270327eed6fcf2d3a6b6b28bcd055049863987c6763ae7d5) and [revokes](https://explorer.zksync.io/tx/0x2657af19e7e57177edb95ca476a50355413eee3405dc6d1626a0298da7d696c2)
- Ethereum: [grants](https://etherscan.io/tx/0x7c0de9c13d9fccb44e99e4a9be1f53f533de4885e8568b1d8c8427107bdb4b3b) and [revokes](https://etherscan.io/tx/0xd826bb3b1aea95b2af870e0f231ef1d5d6a12393d4d728d51df0308c1db3a409)
- Arbitrum one: [grants](https://arbiscan.io/tx/0xafb831d17164e1d1fef912899a3249afcbff1b10ffa8a2c13e7d5cbff6e12ad3) and [revokes](https://arbiscan.io/tx/0xe1c854c7722ff3b0f9083f60f0967549cf0fd6c861da19bee431e2bc042b424b)
- opBNB: [revokes](https://opbnbscan.com/tx/0x41d9bae45d163c3c4ab91d324192a6abbf646d46e9ed416ddfd8a25b3aaa0cdd)
- BNB Chain: [grants](https://bscscan.com/tx/0x0706293a8cd600e031244bd3aab0f7c82f12b159a7dd8f5d9a36fb6ab17a83c4)

The minor adjustments performed on Ethereum, Arbitrum one, opBNB and BNB Chain are:

- Ethereum, Arbitrum one and BNB Chain. The Guardian wallets are authorized to execute privilege functions (setDirectPrice and setTokenConfig) on the RedStoneOracle, as they are on the ChainlinkOracle contracts.
- Ethereum, Arbitrum one and opBNB. Revoke XVSVault permissions from the Guardian wallets

Out of scope in this VIP (to be addressed in the future with other VIP’s):

- Ownership of the contracts. The Guardian wallets will stay as the owner of the contracts on Optimism and zkSync Era. This ownership will be transferred to Governance (specifically to the Normal Timelock contract on each network) after a period confirming everything is working as expected with Omnichain VIP’s

This VIP is a follow-up of [VIP-399 Enable Omnichain Governance on zkSync and Optimism (1/2)](https://app.venus.io/#/governance/proposal/399?chainId=56). Review these VIP’s for a detailed explanation of the Omnichain Governance feature.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [OpenZeppelin](https://www.openzeppelin.com/), [Quantstamp](https://quantstamp.com/), [Cantina](https://cantina.xyz/) and [Certik](https://www.certik.com/) have audited the Omnichain Governance contracts. Certik has audited the ACMCommandsAggregator contract.
- **VIP execution simulation**: in a simulation environment, validating the expected configuration on every network
- **Deployment on testnet**: the same contracts have been deployed to the supported testnets, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Openzepplin audit report - 2024/01/19](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/084_multichainGovernance_openzeppelin_20240119.pdf)
- [Quantstamp audit report - 2024/04/29](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/106_multichainGovernance_quantstamp_20240429.pdf)
- [Cantina audit report - 2024/04/25](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/105_multichainGovernance_cantina_20240425.pdf)
- [Certik audit report - 2024/02/26](https://github.com/VenusProtocol/governance-contracts/blob/feat/ven-1918/audits/085_multichainGovernance_certik_20240226.pdf)
- [Certik audit report of ACMCommandsAggregator - 2024/10/07](https://github.com/VenusProtocol/governance-contracts/blob/3a5a2740e86c9137ab17f4f3939c97b145a22803/audits/118_ACMCommandsAggregator_certik_20241007.pdf)

#### Deployed contracts

Optimism:

- Normal Timelock: [0x0C6f1E6B4fDa846f63A0d5a8a73EB811E0e0C04b](https://optimistic.etherscan.io/address/0x0C6f1E6B4fDa846f63A0d5a8a73EB811E0e0C04b)
- FastTrack Timelock: [0x508bD9C31E8d6760De04c70fe6c2b24B3cDea7E7](https://optimistic.etherscan.io/address/0x508bD9C31E8d6760De04c70fe6c2b24B3cDea7E7)
- Critical Timelock: [0xB82479bc345CAA7326D7d21306972033226fC185](https://optimistic.etherscan.io/address/0xB82479bc345CAA7326D7d21306972033226fC185)
- AccessControlManagerCommandsAggregator: [0xbbEBaF646e7a3E4064a899e68565B1b439eFdf70](https://optimistic.etherscan.io/address/0xbbEBaF646e7a3E4064a899e68565B1b439eFdf70)
- ACM: [0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6](https://optimistic.etherscan.io/address/0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6)

zkSync Era:

- Normal Timelock: [0x093565Bc20AA326F4209eBaF3a26089272627613](https://explorer.zksync.io/address/0x093565Bc20AA326F4209eBaF3a26089272627613)
- Fasttrack Timelock: [0x32f71c95BC8F9d996f89c642f1a84d06B2484AE9](https://explorer.zksync.io/address/0x32f71c95BC8F9d996f89c642f1a84d06B2484AE9)
- Critical Timelock: [0xbfbc79D4198963e4a66270F3EfB1fdA0F382E49c](https://explorer.zksync.io/address/0xbfbc79D4198963e4a66270F3EfB1fdA0F382E49c)
- AccessControlManagerCommandsAggregator: [0x88B1452e512c8fcf83889DdCfe54dF37D561Db82](https://explorer.zksync.io/address/0x88B1452e512c8fcf83889DdCfe54dF37D561Db82)
- ACM: [0x526159A92A82afE5327d37Ef446b68FD9a5cA914](https://explorer.zksync.io/address/0x526159A92A82afE5327d37Ef446b68FD9a5cA914)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/431)
- Set of permissions configured on each network: [here](https://github.com/VenusProtocol/governance-contracts/pull/100) and [here](https://github.com/VenusProtocol/governance-contracts/pull/102)
- [Code of Omnichain Governance](https://github.com/VenusProtocol/governance-contracts/pull/21)
- [Documentation - Technical article with more details of the Omnichain Governance feature](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance)
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };
  return makeProposal(
    [
      {
        target: ZKSYNC_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNC_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNC_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNC_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNC_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ZKSYNC_ACM_AGGREGATOR],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: OPMAINNET_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPMAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPMAINNET_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPMAINNET_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPMAINNET_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPMAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opmainnet,
      },

      {
        target: ETHEREUM_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ETHEREUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [2],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ETHEREUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: OPBNB_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPBNB_ACM_AGGREGATOR],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNB_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNB_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPBNB_ACM_AGGREGATOR],
        dstChainId: LzChainId.opbnbmainnet,
      },

      {
        target: ARBITRUM_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ARBITRUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ARBITRUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: BSC_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, BSC_ACM_AGGREGATOR],
      },
      {
        target: BSC_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
      },
      {
        target: BSC_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, BSC_ACM_AGGREGATOR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip403;
