import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const IL_RATE_MODEL_SETTER = "0xe17aB0c10be44c64d9B41385a2d3C2335f57701B";
export const CORE_POOL_RATE_MODEL_SETTER = "0xCD6956823F1Aaa5be19a6827aFC6d32AD1ef8800";
export const LORENTZ_CORE_POOL_RATE_MODEL_SETTER = "0xB3eE9073a1a394ef242d27267C1A5D3b9ed739fA";

export const vip520 = () => {
  const meta = {
    version: "v2",
    title: "VIP-520 [BNB Chain] Block Rate Upgrade (1/2)",
    description: `#### Summary

If passed, following the community proposal “[Maxwell Hardfork Upgrade Pt 2](https://community.venus.io/t/maxwell-hardfork-upgrade-pt-2/5154)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xfc592b816f1a327bf432d20877c706d807f4d2f3dbb934958a2a074f7a033f6d)), this VIP will perform the following changes, taking into account the increase in the block rate on BNB Chain, from one block every 1.5 seconds to one block every 0.75 seconds:

- update the interest rate models of every VToken, using the [CheckpointView](https://github.com/VenusProtocol/venus-protocol/blob/develop/contracts/Utils/CheckpointView.sol) contract, that will be able to calculate the interest rates considering when the block rate will change on BNB Chain

#### Description

These changes are mandatory to accommodate the Venus Protocol to the Maxwell hardfork on BNB Chain: [BEP-524: Short Block Interval Phase Two: 0.75 seconds](https://github.com/bnb-chain/BEPs/blob/master/BEPs/BEP-524.md), which will happen on [June 30th, at 2:30AM UTC](https://github.com/bnb-chain/bsc/releases/tag/v1.5.16).

The interest rate contracts of every market will be replaced with the [CheckpointView contract](https://github.com/VenusProtocol/venus-protocol/pull/576). CheckpointView is a contract that will call a different contract (in this case, a different interest rate contract) depending on the current timestamp. This way, the VToken contracts will consider the right interest rates on every block, being transparently switched under the hood after the hardfork on the BNB Chain network.

This VIP uses the following auxiliary contracts, to change every interest rate contract in one transaction:

- [SetCheckpointBscmainnet](https://bscscan.com/address/0xCD6956823F1Aaa5be19a6827aFC6d32AD1ef8800), for the Core pool interest rate models
- [SetCheckpointBscmainnet](https://bscscan.com/address/0xe17aB0c10be44c64d9B41385a2d3C2335f57701B), for the interest rate models on the Isolated pools

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Certik](https://www.certik.com/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation:** in a simulation environment, validating the new interest rate models are properly set on BNB Chain, with the right parameters
- **Deployment on testnet:** the same upgrade has been performed on BNB Chain testnet, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Fairyproof audit report](https://github.com/VenusProtocol/venus-protocol/blob/ee06e15429036841e9bf43c0f0b29c2b1a3d6efc/audits/132_block_rate_fairyproof_20250414.pdf) (2025/04/14)
- [Certik audit audit report](https://github.com/VenusProtocol/venus-protocol/blob/0246a8913216a56bab0f9a9ea3e772a5cbd69f99/audits/133_block_rate_certik_20250417.pdf) (2025/04/17)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/575)
- [Upgrade on BNB Chain testnet](https://testnet.bscscan.com/tx/0x72f70b5d1dbb5d286deeb9549adf1aa3dc2d5acfc36d0c7946b0776eb92faa8e)
- Deployment of the CheckpointView contracts that will replace the current interest rate contracts in the [Core pool](https://github.com/VenusProtocol/venus-protocol/pull/597), and in the [Isolated pools](https://github.com/VenusProtocol/isolated-pools/pull/534)
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
        params: [VBNB_ADMIN, "setInterestRateModel(address)", CORE_POOL_RATE_MODEL_SETTER],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [VBNB_ADMIN, "setInterestRateModel(address)", LORENTZ_CORE_POOL_RATE_MODEL_SETTER],
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

export default vip520;
