import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

const vip353 = () => {
  const meta = {
    version: "v2",
    title: "VIP-353 [Ethereum] Risk Parameters Adjustments (WETH)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 08/02/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-08-02-24/4502).

- [WETH (Liquid Staked ETH)](https://etherscan.io/address/0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2):
    - Reduce Collateral Factor, from 90% to 0%
    - Increase Kink, from 80% to 90%
    - Increase Multiplier, from 3.5% to 4.5%
    - Increase Reserve Factor, from 15% to 25%

Complete analysis and details of these recommendations are available in the above publication.

Please note that reducing the collateral factor to 0% will not cause current borrowers to be liquidated as the liquidation threshold will not be modified.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/356)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xab824acf17443e1c50231fa0d6ad1d854269941db67704518104867ac9181083) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
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

export default vip353;
