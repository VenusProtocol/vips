import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BNB = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const { bscmainnet } = NETWORK_ADDRESSES;

export const vip492 = () => {
  const meta = {
    version: "v2",
    title: "VIP-492 [BNB Chain] Configure Binance Oracle as the Fallback oracle for BNB on BNB Chain",
    description: `#### Summary

If passed, following the community proposal “[Proposal: Increase robustness of feeds configuration](https://community.venus.io/t/proposal-increase-robustness-of-feeds-configuration/4837)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xac3ec7729cce1cc99aa5b16d08ae1908a84ddbb25c4cc6ae22fd5e3722311dd9)), this VIP will set Binance Oracle as the fallback oracle for BNB on BNB Chain, instead of Chainlink, which will remain as the pivot oracle.

#### Description

The current Resilient Oracle setup for BNB on BNB Chain is:

- MAIN - [RedStone oracle](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a)
- PIVOT - [Chainlink oracle](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F)
- FALLBACK - [Chainlink oracle](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F)

The proposed Oracle setup for BNB on BNB Chain is:

- MAIN - [RedStone oracle](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a)
- PIVOT - [Chainlink oracle](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F)
- FALLBACK - [Binance oracle](https://bscscan.com/address/0x594810b741d136f1960141C0d8Fb4a91bE78A820)

[Chaos Labs reviewed and accepted this change](https://community.venus.io/t/proposal-increase-robustness-of-feeds-configuration/4837/8). It should increase the robustness of the protocol, by relying on multiple providers acting in three different roles (main, pivot and fallback).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the BNB price returned by the Resilient Oracle is the same before and after the VIP execution, and the expected behavior if any of the three oracles fail or provide a significantly different price

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/465)
- [BNB/USD price feed information on Binance Oracle](https://oracle.binance.com/data-feeds/detail/bsc/BNB-USD)
- [Documentation about Resilient Oracle](https://docs-v4.venus.io/risk/resilient-price-oracle)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["BNB", "100"],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            BNB,
            [bscmainnet.REDSTONE_ORACLE, bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE],
            [true, true, true],
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip492;
