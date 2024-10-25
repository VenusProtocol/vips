import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

export const vip389 = () => {
  const meta = {
    version: "v2",
    title: "VIP-389 Incentives for Token Converters",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- set to 0.01% the incentive for every conversion pair in every Token Converter contract used by the Venus Protocol on Ethereum Chainnet, following the [Chaos Labs recommendations](https://community.venus.io/t/chaos-labs-ethereum-token-converter-10-24-24/4673).

#### Description

Token Converters are permissionless: anyone is able to perform a conversion on those contracts. Incentives on the Token Converters should create arbitrage opportunities, returning on each conversion slightly more than the expected amounts only considering the oracle prices of the tokens involved, or requiring fewer tokens than expected (depending on the type of conversion set by the caller). The community is expected to take advantage of these arbitrages and operate the Token Converter contracts fluidly because they should be economically profitable.

#### References

- [VIP Simulation](https://github.com/VenusProtocol/vips/pull/)
- [Token Converters documentation](https://docs-v4.venus.io/whats-new/token-converter)
- [Technical article about Token Converters](https://docs-v4.venus.io/technical-reference/reference-technical-articles/token-converters)
- [Addresses of the deployed Token Converter contracts](https://docs-v4.venus.io/deployed-contracts/token-converters)
- [Chaos Labs recommendation](https://community.venus.io/)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xb8066698a60f8c9f47c1cc8de33b428ad986a68d52393777d35ebe70f3ace1aa) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: NORMAL_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip389;
