import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const OPBNBMAINNET_VTOKEN_BEACON = "0xfeD1d3a13597c5aBc893Af41ED5cb17e64c847c7";
export const OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION = "0x8778088536607917cBb5F1428988fe7088daE971";
export const OPBNBMAINNET_XVS_VAULT_PROXY = "0x7dc969122450749A8B0777c0e324522d67737988";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";

export const OPBNBMAINNET_RATE_MODEL_SETTER = "0x5305CB5Dc76281d7e895aC4E492435167D5A95b1";

export const NEW_OPBNB_BLOCK_RATE = 126144000;

export interface SpeedRecord {
  market: string;
  symbol: string;
  supplySideSpeed: string;
  borrowSideSpeed: string;
}

export const vip579 = () => {
  const meta = {
    version: "v2",
    title: "VIP-579 [opBNB] Fourier Hardfork block rate upgrade",
    description: `#### Summary
If passed, following the community proposal "[OpBNB Mainnet Fourier Hardfork Update](https://community.venus.io/t/opbnb-mainnet-fourier-hardfork-update/5623)", this VIP will perform the following changes, taking into account the increase in the block rate on opBNB, from two blocks per second to four blocks per second:
- Upgrade implementation of every VToken contract, with the new blocks per year (126,144,000)
- Set the blocks per year to the new value
- update the interest rate models of every VToken, using the CheckpointView contract, that will be able to calculate the interest rates considering when the block rate will change on opBNB
#### Description
These changes are mandatory to accommodate the Venus Protocol to [the Fourier hardfork on opBNB](https://github.com/bnb-chain/opbnb/releases/tag/v0.5.5), which will happen on Jan-07-2026 03:00:00 AM +UTC.
The interest rate contracts of every market will be replaced with the [CheckpointView contract](https://github.com/VenusProtocol/isolated-pools/pull/546). CheckpointView is a contract that will call a different contract (in this case, a different interest rate contract) depending on the current timestamp. This way, the VToken contracts will consider the right interest rates on every block, being transparently switched under the hood after the hardfork on the opBNB network.
This VIP uses an auxiliary contract [SetCheckpointOpbnbmainnet](https://github.com/VenusProtocol/isolated-pools/pull/546) to change every interest rate contract in one transaction.
VToken had a constant value with the number of blocks per year. The VToken implementation has been simply redeployed using the new value. The XVSVault has a setBlocksPerYear function to support future changes in the blocks per year, so we just set the new value accordingly.`,
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

      // set new block rate in xvs vault
      {
        target: OPBNBMAINNET_XVS_VAULT_PROXY,
        signature: "setBlocksPerYear(uint256)",
        params: [NEW_OPBNB_BLOCK_RATE],
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

export default vip579;
