import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

const vip295 = () => {
  const meta = {
    version: "v2",
    title: "VIP-295 Ethereum: configure liquidity mining (weETH)",
    description: `#### Summary

If passed, the last block with rewards for the [weETH](https://etherscan.io/address/0xb4933AF59868986316Ed37fa865C829Eba2df0C7) market on Ethereum will be set to [19907005](https://etherscan.io/block/countdown/19907005), 30 days after the rewards were enabled, approximately, assuming 1 block every 12 seconds.

#### Description

Rewards for the weETH market on Ethereum were enabled at block 19691005 in this [transaction](https://etherscan.io/tx/0xab608fa2d5f8be982e0ed164cef2203ea6f7b6817dacee3b6644bdc70c0ec405) (April 19th, 2024 05:35:35 PM +UTC).

The configured rewards are 5,000 USDC for 30 days, 100% for the suppliers, set at [VIP-290](https://app.venus.io/#/governance/proposal/290?chainId=56), following the community proposal "[Proposal: Support weETH collateral on Venus on ETH Mainnet](https://community.venus.io/t/proposal-support-weeth-collateral-on-venus-on-eth-mainnet/4128)".

Simulation of the multisig transaction: [https://github.com/VenusProtocol/vips/pull/269](https://github.com/VenusProtocol/vips/pull/269).

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x4fe4db575f9716b5782407d16d5c0147bc25f44873fa52ac8d7ed54b312d94c9) multisig transaction will be executed. Otherwise, it will be rejected.`,
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

export default vip295;
