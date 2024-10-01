import { formatUnits, parseEther } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { FAST_TRACK_TIMELOCK } from "src/vip-framework";

export const vwETH = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";
export const INTEREST_RATE_MODEL_base0bps_slope300bps_jump8000bps_kink9000bps =
  "0xe1747F8D64C297DBB482c4FD8fd11EA73F7Dc85a";

export const LIQUID_STAKED_ETH_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const NINETY_PERCENT_CF = parseEther("0.9");
export const CURRENT_WETH_LT = parseEther("0.93");

const vip377 = () => {
  const meta = {
    version: "v2",
    title: "VIP-377 [Ethereum] Risk Parameters Adjustments",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ recommendations in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 09/20/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-09-20-24/4581) (updated [here](https://community.venus.io/t/chaos-labs-risk-parameter-updates-09-20-24/4581/7)).

- [WETH (Liquid Staked ETH)](https://etherscan.io/address/${vwETH}):
  - Increase Collateral Factor from 0 to ${formatUnits(NINETY_PERCENT_CF, 18)}
  - Reduce multiplier of the Interest Rate model, from 4.5% to 3%

Complete analysis and details of these recommendations are available in the above publications.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/391)
- [New Interest Rate contract for the vWETH market](https://etherscan.io/address/0xe1747F8D64C297DBB482c4FD8fd11EA73F7Dc85a)

#### Disclaimer for Ethereum commands

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xdba09947f52a34516fbebccdfbab5d8bbd82ab01d7bdf4a5868bbc0d863845e8) multisig transaction will be executed. Otherwise, it will be rejected.`,
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

export default vip377;
