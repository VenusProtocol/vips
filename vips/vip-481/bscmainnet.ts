import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const OPBNBMAINNET_VTOKEN_BEACON = "0xfeD1d3a13597c5aBc893Af41ED5cb17e64c847c7";
export const OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION = "0x8Fa6460437F6Ba76808C93108F2134c5D6394D94";
export const OPBNBMAINNET_NEW_XVS_VAULT_IMPLEMENTATION = "0x785BEF8B6dB40E86fA3749b44cD67C14945E2a71";
export const OPBNBMAINNET_XVS_VAULT_PROXY = "0x7dc969122450749A8B0777c0e324522d67737988";
export const OPBNBMAINNET_XVS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const OPBNBMAINNET_RATE_MODEL_SETTER = "0x2953eBE898E964a38533A28B898265dc5d788aa8";
const OPBNBMAINNET_NEW_BLOCK_RATE = 63072000;

export const vip481 = () => {
  const meta = {
    version: "v2",
    title: "VIP-481 [opBNB] Block rate upgrade",
    description: `#### Summary

If passed, following the community proposal "[opBNB Block rate upgrade](https://community.venus.io/t/opbnb-block-rate-upgrade/5049)", this VIP will perform the following changes, taking into account the increase in the block rate on opBNB, from one block per second to one block every 0.5 second:

- Upgrade implementation of every VToken contract, with the new blocks per year (63,072,000)
- Upgrade the implementation of the XVSVaultProxy, and set the blocks per year to the new value
- update the interest rate models of every VToken, using the CheckpointView contract, that will be able to calculate the interest rates considering when the block rate will change on opBNB

#### Description

These changes are mandatory to accommodate the Venus Protocol to the Lorentz hardfork on opBNB: [BEP-543: opBNB Short Block Interval](https://github.com/bnb-chain/BEPs/blob/master/BEPs/BEP-543.md), which will happen on [April 21st, at 3:00AM UTC](https://x.com/BNBCHAIN/status/1910384574938423424).

The interest rate contracts of every market will be replaced with the [CheckpointView contract](https://github.com/VenusProtocol/venus-protocol/pull/576). CheckpointView is a contract that will call a different contract (in this case, a different interest rate contract) depending on the current timestamp. This way, the VToken contracts will consider the right interest rates on every block, being transparently switched under the hood after the hardfork on the opBNB network.

This VIP uses an auxiliary contract [SetCheckpointOpbnbmainnet](https://opbnbscan.com/address/0x2953eBE898E964a38533A28B898265dc5d788aa8) to change every interest rate contract in one transaction.

VToken and XVSVault implementation had a constant value with the number of blocks per year. The VToken implementation has been simply redeployed using the new value. The XVSVault implementation has been redeployed adding a new function to support future changes in the blocks per year.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Certik](https://www.certik.com/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the new implementations and interest rate models are properly set on opBNB, with the right parameters
- **Deployment on testnet**: the same upgrade has been performed on opBNB testnet, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Fairyproof audit report](https://github.com/VenusProtocol/venus-protocol/blob/ee06e15429036841e9bf43c0f0b29c2b1a3d6efc/audits/132_block_rate_fairyproof_20250414.pdf) (2025/04/14)
- Certik audit audit report: it will be published in the following days

#### Deployed contracts

opBNB mainnet

- New VToken implementation: [0x8Fa6460437F6Ba76808C93108F2134c5D6394D94](https://opbnbscan.com/address/0x8Fa6460437F6Ba76808C93108F2134c5D6394D94)
- New XVSVault implementation: [0x785BEF8B6dB40E86fA3749b44cD67C14945E2a71](https://opbnbscan.com/address/0x785BEF8B6dB40E86fA3749b44cD67C14945E2a71)

opBNB testnet

- New VToken implementation: [0x25E034878C9873D780f2D82D22A25481aA8c74F6](https://testnet.opbnbscan.com/address/0x25E034878C9873D780f2D82D22A25481aA8c74F6)
- New XVSVault implementation: [0x6E09f32F94B2d5056431710BA3eEF75aed40C3b1](https://testnet.opbnbscan.com/address/0x6E09f32F94B2d5056431710BA3eEF75aed40C3b1)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/531)
- [Upgrade on opBNB testnet](https://testnet.opbnbscan.com/tx/0xee41d32f961e720d449b4009d01ab7a5e96071aacea6bdaf82e791c32d19db7b)
- [Deployment of the new VToken implementation](https://github.com/VenusProtocol/isolated-pools/pull/500)
- [Deployment of the new XVSVault implementation](https://github.com/VenusProtocol/venus-protocol/pull/574)
- [Deployment of the CheckpointView contracts that will replace the current interest rate contracts](https://github.com/VenusProtocol/isolated-pools/pull/509)
- Community post "[opBNB Block rate upgrade](https://community.venus.io/t/opbnb-block-rate-upgrade/5049)"`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: OPBNBMAINNET_VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [OPBNBMAINNET_NEW_XVS_VAULT_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_NEW_XVS_VAULT_IMPLEMENTATION,
        signature: "_become(address)",
        params: [OPBNBMAINNET_XVS_VAULT_PROXY],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBMAINNET_XVS_VAULT_PROXY,
          "setBlocksPerYear(uint256)",
          NETWORK_ADDRESSES.opbnbmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.opbnbmainnet,
      },
      // set new block rate in xvs vault
      {
        target: OPBNBMAINNET_XVS_VAULT_PROXY,
        signature: "setBlocksPerYear(uint256)",
        params: [OPBNBMAINNET_NEW_BLOCK_RATE],
        dstChainId: LzChainId.opbnbmainnet,
      },
      // update interest rate models
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", OPBNBMAINNET_RATE_MODEL_SETTER],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_RATE_MODEL_SETTER,
        signature: "run()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", OPBNBMAINNET_RATE_MODEL_SETTER],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip481;
