import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

const wstETH = "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB";
const weETH = "0xb4933AF59868986316Ed37fa865C829Eba2df0C7";

const vip336 = () => {
  const meta = {
    version: "v2",
    title: "VIP-336 Ethereum Risk Parameters Adjustments (wstETH, weETH)",
    description: `If passed, this VIP will perform the set changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 07/03/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-07-03-24/4459).

- Increase [wstETH’s (Staked ETH)](https://etherscan.io/address/${wstETH}) collateral factor from 90% to 93%
- Increase [wstETH’s (Staked ETH)](https://etherscan.io/address/${wstETH}) liquidation threshold from 93% to 95%
- Increase [weETH (Staked ETH)](https://etherscan.io/address/${weETH}) collateral factor from 90% to 93%
- Increase [weETH (Staked ETH)](https://etherscan.io/address/${weETH}) liquidation threshold from 93% to 95%

Complete analysis and details of these recommendations are available in the above publications.

In order to increase the collateral factor to 93% a new (comptroller implementation)[https://etherscan.io/address/0x25973b6BF39298D87B5498760a6c24CA06C3B40a] is required with the MAX_COLLATERAL_FACTOR_MANTISSA increased to 95%.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/316](https://github.com/VenusProtocol/vips/pull/316)

#### Disclaimer for Ethereum commands

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this]() multisig transaction will be executed. Otherwise, they will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: FAST_TRACK_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip336;
