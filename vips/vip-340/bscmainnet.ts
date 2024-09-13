import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

const vip340 = () => {
  const meta = {
    version: "v2",
    title: "VIP-340 [Ethereum] Prime synchronisation in the Core and Curve pools",
    description: `If passed, this VIP allows the automatic update of the Prime rewards every time a Prime holder interacts with a Prime market of the Core and Curve pools.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new configuration is the expected one
- This VIP doesn’t upgrade any smart contract. It only configures the Prime contract on the Core and Curve comptrollers

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/324)
- [VIP-339 [Ethereum] : Venus Prime Deployment - Q3 2024](https://app.venus.io/#/governance/proposal/339)
- [Documentation](https://docs-v4.venus.io/whats-new/prime-yield)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x2aab4f994d730c4a9ec9dcdcbc348bc6a9e5d7ed7995927671f938c636a6fd86) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: CRITICAL_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip340;
