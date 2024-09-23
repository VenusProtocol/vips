import { parseEther } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { FAST_TRACK_TIMELOCK } from "src/vip-framework";

export const vwETH = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";
export const INTEREST_RATE_MODEL_base0bps_slope300bps_jump8000bps_kink9000bps =
  "0xe1747F8D64C297DBB482c4FD8fd11EA73F7Dc85a";

export const LIQUID_STAKED_ETH_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const NINETY_PERCENT_CF = parseEther("0.9");
export const CURRENT_WETH_LT = parseEther("0.93");

const vip374 = () => {
  const meta = {
    version: "v2",
    title: "VIP-374 ",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in these Venus community forum publications:

- [Chaos Labs - Risk Parameter Updates - 09/20/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-09-20-24/4581)

Changes:
- Ethereum
  - [wETH (Liquid Staked ETH)](https://etherscan.io/address/${vwETH}): increase collateral factor from 0 to ${NINETY_PERCENT_CF}
  - [wETH (Liquid Staked ETH)](https://etherscan.io/address/${vwETH}): Set new [interest rate model](https://etherscan.io/address/0xe1747F8D64C297DBB482c4FD8fd11EA73F7Dc85a) with decreased interest rate multiplier to 3%

Complete analysis and details of these recommendations are available in the above publications.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/391](https://github.com/VenusProtocol/vips/pull/391)

#### Disclaimer for Ethereum commands

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?) multisig transaction will be executed. Otherwise, it will be rejected.`,
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

export default vip374;
