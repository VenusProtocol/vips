import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const IL_RATE_MODEL_SETTER = "0x0b086B866A5A91D5882ed355a34d268c62f8BE66";
export const CORE_POOL_RATE_MODEL_SETTER = "0xB3eE9073a1a394ef242d27267C1A5D3b9ed739fA";

export const vip486 = () => {
  const meta = {
    version: "v2",
    title: "VIP-486 [BNB Chain] Block Rate Upgrade (1/2)",
    description: `#### Summary

If passed, following the community proposal “[Venus Upgrades for BNB Chain Lorentz Hardfork](https://community.venus.io/t/venus-upgrades-for-bnb-chain-lorentz-hardfork/5060)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x3629a746aafc7b683242db64e24388728140fd3beefb3642e8d34c837486c1c2)), this VIP will perform the following changes, taking into account the increase in the block rate on BNB Chain, from one block every 3 seconds to one block every 1.5 seconds:

- update the interest rate models of every VToken, using the CheckpointView contract, that will be able to calculate the interest rates considering when the block rate will change on BNB Chain

#### Description

These changes are mandatory to accommodate the Venus Protocol to the Lorentz hardfork on BNB Chain: [BEP-520: Short Block Interval Phase One: 1.5 seconds](https://github.com/bnb-chain/BEPs/blob/master/BEPs/BEP-520.md), which will happen on [April 29th, at 5:05AM UTC](https://x.com/BNBCHAIN/status/1910384574938423424).

The interest rate contracts of every market will be replaced with the [CheckpointView contract](https://github.com/VenusProtocol/venus-protocol/pull/576). CheckpointView is a contract that will call a different contract (in this case, a different interest rate contract) depending on the current timestamp. This way, the VToken contracts will consider the right interest rates on every block, being transparently switched under the hood after the hardfork on the BNB Chain network.

This VIP uses the following auxiliary contracts, to change every interest rate contract in one transaction:

- [SetCheckpointBscmainnet](https://bscscan.com/address/0xB3eE9073a1a394ef242d27267C1A5D3b9ed739fA), for the Core pool interest rate models
- [SetCheckpointBscmainnet](https://bscscan.com/address/0x0b086B866A5A91D5882ed355a34d268c62f8BE66), for the interest rate models on the Isolated pools

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Certik](https://www.certik.com/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the new interest rate models are properly set on BNB Chain, with the right parameters
- **Deployment on testnet**: the same upgrade has been performed on BNB Chain testnet, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Fairyproof audit report](https://github.com/VenusProtocol/venus-protocol/blob/ee06e15429036841e9bf43c0f0b29c2b1a3d6efc/audits/132_block_rate_fairyproof_20250414.pdf) (2025/04/14)
- [Certik audit audit report](https://github.com/VenusProtocol/venus-protocol/blob/0246a8913216a56bab0f9a9ea3e772a5cbd69f99/audits/133_block_rate_certik_20250417.pdf) (2025/04/17)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/540)
- [Upgrade on BNB Chain testnet](https://testnet.bscscan.com/tx/0xd51a4c42475e332ff53b6f6c78a74135def955417e216e869666a5c80f7c7863)
- [Deployment of the CheckpointView contracts that will replace the current interest rate contracts](https://github.com/VenusProtocol/venus-protocol/pull/587)
- Community post “[Venus Upgrades for BNB Chain Lorentz Hardfork](https://community.venus.io/t/venus-upgrades-for-bnb-chain-lorentz-hardfork/5060)”
    `,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", IL_RATE_MODEL_SETTER],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VBNB_ADMIN, "setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
      },
      {
        target: IL_RATE_MODEL_SETTER,
        signature: "run()",
        params: [],
      },
      {
        target: CORE_POOL_RATE_MODEL_SETTER,
        signature: "run()",
        params: [],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setInterestRateModel(address)", IL_RATE_MODEL_SETTER],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [VBNB_ADMIN, "_setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip486;
