import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ARBITRUM_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const BASE_ACM = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
export const OPBNB_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const OP_ACM = "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const UNICHAIN_ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";
export const ZKSYNC_ACM = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const { arbitrumone, basemainnet, opbnbmainnet, opmainnet, ethereum, unichainmainnet, zksyncmainnet } =
  NETWORK_ADDRESSES;

export const vip475 = () => {
  const meta = {
    version: "v2",
    title: "VIP-475 Omnichain Governance - Remove permissions from Guardian wallet",
    description: `If passed, this VIP will remove the DEFAULT_ADMIN role from the Guardian wallets on [Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [opBNB](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207), [Arbitrum one](https://arbiscan.io/address/0x14e0e151b33f9802b3e75b621c1457afc44dcaa0), [Base](https://basescan.org/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C), [Optimism](https://optimistic.etherscan.io/address/0x2e94dd14E81999CdBF5deDE31938beD7308354b3), [ZKsync Era](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa) and [Unichain](https://uniscan.xyz/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C). This role allowed the Guardian wallets to configure permissions for every Venus contract. That was useful during the multichain deployment of the protocol, but it’s not needed anymore. After the execution of this VIP, only Governance (with a Normal VIP) will be able to configure the Venus permissions on the listed networks.

BNB Chain is not affected because in that network the Guardian doesn’t have the mentioned role, and only Governance can configure the permissions.

**Security and additional considerations**

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the role is properly removed.
- **Deployment on testnet**: the same commands have been executed on testnets

#### References

- [VIP simulation, and links to the testnet transactions](https://github.com/VenusProtocol/vips/pull/364)
- [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/omnichain-governance)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ARBITRUM_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, arbitrumone.GUARDIAN],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: BASE_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, basemainnet.GUARDIAN],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: OPBNB_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, opbnbmainnet.GUARDIAN],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OP_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, opmainnet.GUARDIAN],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ethereum.GUARDIAN],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: UNICHAIN_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, unichainmainnet.GUARDIAN],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: ZKSYNC_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, zksyncmainnet.GUARDIAN],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip475;
