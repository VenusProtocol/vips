import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

const vip287 = () => {
  const meta = {
    version: "v2",
    title: "VIP-287 Ethereum: configure liquidity mining",
    description: `#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this multisig transaction](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x86a931eeb4a32df9e71c0c1396ac10d9ec697bf7f6c10d169743d4e6fd6068fe) will be executed. Otherwise, it will be rejected.

#### Summary

If passed, the last block with rewards for the following Ethereum markets will be set:

- Core pool:
    - WETH
    - WBTC
    - USDT
    - USDC
    - crvUSD
- Curve pool
    - crvUSD
    - CRV
- Lido pool
    - WETH
    - wstETH

#### Description

Rewards on Ethereum were enabled at block 19562819 in this [transaction](https://etherscan.io/tx/0x832d6510cb2d9595d04216436a5fb6248fd2820fd33d0a147497fc3bac07e2f9) (April 1st, 2024 06:39:47 PM +UTC). The configured rewards, and the last blocks with rewards on each case will be:

- [vWETH_Core](https://etherscan.io/address/0x7c8ff7d2A1372433726f879BD945fFb250B94c65):
    - XVS rewards: 4,500 XVS for 90 days. 40% suppliers / 60% borrowers. Last block with rewards: [20210819](https://etherscan.io/block/countdown/20210819)
- [vWBTC_Core](https://etherscan.io/address/0x8716554364f20BCA783cb2BAA744d39361fd1D8d):
    - XVS rewards: 13,500 XVS for 90 days. 40% suppliers / 60% borrowers. Last block with rewards: [20210819](https://etherscan.io/block/countdown/20210819)
- [vUSDT_Core](https://etherscan.io/address/0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E):
    - XVS rewards: 13,500 XVS for 90 days. 40% suppliers / 60% borrowers. Last block with rewards: [20210819](https://etherscan.io/block/countdown/20210819)
- [vUSDC_Core](https://etherscan.io/address/0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb):
    - XVS rewards: 13,500 XVS for 90 days. 40% suppliers / 60% borrowers. Last block with rewards: [20210819](https://etherscan.io/block/countdown/20210819)
- [vcrvUSD_Core](https://etherscan.io/address/0x672208C10aaAA2F9A6719F449C4C8227bc0BC202):
    - XVS rewards: 6,000 XVS for 90 days. 40% suppliers / 60% borrowers. Last block with rewards: [20210819](https://etherscan.io/block/countdown/20210819)
    - CRV rewards: 125,000 CRV for 90 days. 40% suppliers / 60% borrowers. Last block with rewards: [20210819](https://etherscan.io/block/countdown/20210819)
- [vcrvUSD_Curve](https://etherscan.io/address/0x2d499800239C4CD3012473Cb1EAE33562F0A6933):
    - XVS rewards: 6,000 XVS for 90 days. 40% suppliers / 60% borrowers. Last block with rewards: [20210819](https://etherscan.io/block/countdown/20210819)
    - CRV rewards: 125,000 CRV for 90 days. 40% suppliers / 60% borrowers. Last block with rewards: [20210819](https://etherscan.io/block/countdown/20210819)
- [vCRV_Curve](https://etherscan.io/address/0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa):
    - XVS rewards: 1,500 XVS for 90 days. 40% suppliers / 60% borrowers. Last block with rewards: [20210819](https://etherscan.io/block/countdown/20210819)
- [vWETH_LiquidStakedETH](https://etherscan.io/address/0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2):
    - XVS rewards: 55,000 XVS for 90 days. 30% suppliers / 70% borrowers. Last block with rewards: [20210819](https://etherscan.io/block/countdown/20210819)
- [vwstETH_LiquidStakedETH](https://etherscan.io/address/0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB):
    - XVS rewards: 14,400 XVS for 90 days. 100% suppliers / 0% borrowers. Last block with rewards: [20210819](https://etherscan.io/block/countdown/20210819)
    - wstETH rewards: 15.5 wstETH for 30 days. 100% suppliers / 0% borrowers. Last block with rewards: [19778819](https://etherscan.io/block/countdown/19778819)

Simulation of the multisig transaction: [https://github.com/VenusProtocol/vips/pull/244](https://github.com/VenusProtocol/vips/pull/244)`,
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

export default vip287;
