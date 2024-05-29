import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
export const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

export const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";

export const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
export const NEW_XVS_IMPLEMENTATION = "0x413c1E1b77190BC84717F8cCe6EeAb0594E0af4e";

export const BNB_BLOCKS_PER_YEAR = 10_512_000; // assuming a block is mined every 3 seconds

const vip314 = () => {
  const meta = {
    version: "v2",
    title: "VIP-314 XVSVault contract upgrade",
    description: `#### Summary

If passed this VIP will upgrade the implementation of the XVSVault contract on [BNB Chain](https://bscscan.com/address/0x051100480289e704d20e9DB4804837068f3f9204), [Ethereum](https://etherscan.io/address/0xA0882C2D5DF29233A092d2887A258C2b90e9b994) and [opBNB](https://opbnbscan.com/address/0x7dc969122450749A8B0777c0e324522d67737988), exposing the total amount of pending withdrawals.

#### Description

The XVSVault contract tracks the pending withdrawals (withdrawals requested but not completed), in a private variable. Pending withdrawals do not accrue rewards from the moment of the request, since [VIP-127](https://app.venus.io/#/governance/proposal/127). To properly calculate the APY of the XVSVault, this information is needed. This upgrade makes this information public (accessible by any client, including the [official Venus dapp](https://app.venus.io/)).

Apart from the mentioned change, the new XVSVault implementations use the new codebase compatible with “time-based” chains, like Arbitrum one. This codebase will be used across the different chains, with different setup.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **XVSVault contract behavior post upgrade**: in a simulation environment, validating deposits, withdrawal and claims work as expected after the upgrade
- **Deployment on testnet**: the same XVSVault has been deployed to the testnets, and used in the Venus Protocol testnet deployment
- **Audits**: Certik, Quantstamp and Fairyproof have audited the code of the time-based contracts

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/088_timeBased_certik_20240117.pdf) (2024/01/17)
- [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/470416836922656783eab52ded54744489e8c345/audits/089_timeBased_quantstamp_20240319.pdf) (2024/03/19)
- [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/094_timeBased_fairyproof_20240304.pdf) (2024/03/04)

#### Deployed contracts on mainnet

- BNB Chain: [0x413c1E1b77190BC84717F8cCe6EeAb0594E0af4e](https://bscscan.com/address/0x413c1E1b77190BC84717F8cCe6EeAb0594E0af4e)
- Ethereum: [0x437042777255A1f25BE60eD25C814Dea6E43bC28](https://etherscan.io/address/0x437042777255A1f25BE60eD25C814Dea6E43bC28)
- opBNB: [0xc3D1F7CC89dce0A1245803fe9e0E62B8EC351196](https://opbnbscan.com/address/0xc3D1F7CC89dce0A1245803fe9e0E62B8EC351196)

#### References

- [Change in the XVSVault codebase](https://github.com/VenusProtocol/venus-protocol/pull/476)
- [Simulations post upgrade](https://github.com/VenusProtocol/vips/pull/270)
- [Documentation](https://docs-v4.venus.io)

#### Disclaimer for Ethereum and opBNB commands

Privilege commands on Ethereum and opBNB will be executed by the Guardian wallets ([Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [opBNB](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207)), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x72c9bf352f1cd3fee101feb96d19866865c9587c3b396820bc4fb17935992bba) and [this](https://multisig.bnbchain.org/transactions/tx?safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207&id=multisig_0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207_0x9db5f3bdb58854eb3ed85567042f8a14d691c0c9aaf043d656a0b96bcf2636ce) multisig transactions will be executed. Otherwise, they will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [NEW_XVS_IMPLEMENTATION],
      },
      {
        target: NEW_XVS_IMPLEMENTATION,
        signature: "_become(address)",
        params: [XVS_VAULT_PROXY],
      },
      {
        target: XVS_VAULT_PROXY,
        signature: "initializeTimeManager(bool,uint256)",
        params: [false, BNB_BLOCKS_PER_YEAR],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlock(address,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_PROXY, "setRewardAmountPerBlockOrSecond(address,uint256)", CRITICAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip314;
