import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NORMAL_TRACK_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vip351 = () => {
  const meta = {
    version: "v2",
    title: "VIP-351 [opBNB] Update XVS address in the XVSVault",
    description: `#### Summary

If passed, this VIP will update the XVS address considered by the [XVSVault](https://opbnbscan.com/address/0x7dc969122450749A8B0777c0e324522d67737988) contract on opBNB, using [0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61](https://opbnbscan.com/address/0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61)

#### Description

The XVSVault contract on opBNB is using an old version of the XVS token address deployed to that network. This VIP sets the right XVS token address in the vault, which is the one used by the [bridge contracts](https://opbnbscan.com/address/0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2). No actions are required from users.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the XVS address is properly set
- **Deployment on testnet**: the same operation has been [successfully executed on opBNB testnet](https://testnet.opbnbscan.com/tx/0xceb6a8db450e8495a961019a631a9dfcd356fe6c26486448676cc8de01bb0aaa?tab=overview)
- **XVSVault is paused on opBNB**, so no funds are at risk

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/308)
- [TX on opBNB testnet](https://testnet.opbnbscan.com/tx/0xceb6a8db450e8495a961019a631a9dfcd356fe6c26486448676cc8de01bb0aaa?tab=overview)
- [Temporary XVSVault contract used to set the XVS address](https://opbnbscan.com/address/0xF23CB7f0e4742506EB45ad3D663Fa461512B56B8)

#### Disclaimer for opBNB VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://multisig.bnbchain.org/home?safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://multisig.bnbchain.org/transactions/tx?safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207&id=multisig_0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207_0x724682986f6558b650782f09f4f9519404ecde2746f3d20cc4daac4b4566f615) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: NORMAL_TRACK_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip351;
