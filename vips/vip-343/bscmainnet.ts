import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vBNBAdmin_Implementation = "0xaA8D9558d8D45666552a72CECbdd0a746aeaCDc9";
export const vBNBAdmin = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const ProxyAdmin = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";

export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
export const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
export const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";

const vip343 = () => {
  const meta = {
    version: "v2",
    title: "VIP-343 Authorize Fast-track and Critical timelocks to update the interest rate on the VBNB market",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Update the implementation of the [VBNBAdmin contract](https://bscscan.com/address/0x9A7890534d9d91d473F28cB97962d176e2B65f1d)
- Grant [Normal](https://bscscan.com/address/0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396), [Fast-track](https://bscscan.com/address/0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02) and [Critical](https://bscscan.com/address/0x213c446ec11e45b15a6E29C1C1b402B8897f606d) timelocks to execute the function setInterestRateModel on the VBNBAdmin contract

#### Description

[VBNBAdmin](https://bscscan.com/address/0x9A7890534d9d91d473F28cB97962d176e2B65f1d) is the admin of the [VBNB market](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36). The VBNBAdmin contract was added in the [VIP-189](https://app.venus.io/#/governance/proposal/189), to facilitate the Automatic Income Allocation feature in the VBNB market (that is not upgradable).

With the change included in this VIP, a new function to the VBNBAdmin contract is added: setInterestRateModel. This new function:

1. checks the required permission in the [AccessControlManager contract](https://bscscan.com/address/0x4788629abc6cfca10f9f969efdeaa1cf70c23555)
2. invoke the privilege function in the VBNB contract

By integrating the ACM, it will be possible to grant the different timelock contracts for the execution of the new function, and therefore it will be able to change the Interest Rate contract of the VBNB market with Normal, Fast-track and Critical VIP's (nowadays, only the Normal timelock can do this, because the ACM is not integrated, and it is required to be the admin of the VBNB market to perform this update).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Configuration post VIP**: in a simulation environment, validating the new implementation
- **Deployment on testnet**: the same upgrade and configuration have been performed on BNB testnet
- **Audit**: [Certik](https://github.com/VenusProtocol/venus-protocol/blob/5e4563ab0f2f98a04659e065b6c49acebf00df3b/audits/112_VBNBAdmin_certik_20240717.pdf) has audited the updated code

#### Deployed contracts

- [New VBNBAdmin implementation on BNB chain](https://bscscan.com/address/0xaA8D9558d8D45666552a72CECbdd0a746aeaCDc9)
- [New VBNBAdmin implementation on BNB testnet](https://testnet.bscscan.com/address/0x90c891bb2b1821ADE159ECa6FbA0418b2bD1b86D)

#### References

- [Pull request with the changes in the VBNBAdmin contract](https://github.com/VenusProtocol/venus-protocol/pull/487)
- [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/297)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ProxyAdmin,
        signature: "upgrade(address,address)",
        params: [vBNBAdmin, vBNBAdmin_Implementation],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [vBNBAdmin, "setInterestRateModel(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [vBNBAdmin, "setInterestRateModel(address)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [vBNBAdmin, "setInterestRateModel(address)", CRITICAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip343;
