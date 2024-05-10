import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BNB_TREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const ETH_AMOUNT = parseUnits("1.188225443", 18);
export const USDT_AMOUNT = parseUnits("10518.73", 18);
export const BNB_AMOUNT = parseUnits("3", 18);

export const vip304 = () => {
  const meta = {
    version: "v2",
    title: "VIP-304 Refund of expenses to the Community Wallet",
    description: `#### Summary

If passed, this VIP will transfer the following tokens from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to the [Community Wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391), to refund of below transactions:

- **10,518.73 USDT**
- **1.188225443 ETH**
- **3 BNB**

#### Details

List of transactions performed by the Community wallet, to be refunded by this VIP:

- Concept: Ethereum mainnet deployment
    - [TX](https://etherscan.io/tx/0x8c4a78b3e9d1569740784f1a37d170c617367c10c673004ffcdbd20c8801bf2a). Value: 0.502 ETH
    - [TX](https://etherscan.io/tx/0x82f2e63d68629d3456e54f02baa2d212746b9c610059242a33e839a549ac897c). Value: 0.501 ETH
    - [TX](https://etherscan.io/tx/0xa0ae773cc7a08b4ea5e05fa1f15b0f0325fea74a42862667ef0e61f4ab22e371). Value: 2,084 USDT (swapped for 0.5 ETH)
    - [TX](https://etherscan.io/tx/0x39ff1fa37314c5bc5bd10dbf1fab3f1438f9eaae42684f33064d866164668a2a). Value: 1,812.70 USDT (swapped for 0.51 ETH)
    - [TX](https://etherscan.io/tx/0xf7724f7b374cec4bfb4950654b5bd59d9827fb4c037e26729dbc09cf6caaecf6). Value: 1,522 USDT (swapped for 0.5017995 ETH)
- Concept: deployment of contracts to BNB chain
    - [TX](https://bscscan.com/tx/0x91788213a24abf3596d5b9619262a05ee3cdf6729652369b6fa8d41e1058a277). Value: 297.4 USDT (swapped for 0.5 BNB)
    - [TX](https://bscscan.com/tx/0x583511155379862fb651ccb46503a8eb1b13a07c49c58dd675ddb45c4978ae0f). Value: 588 USDT (swapped for 1 BNB)
- Concept: token conversions using the Token Converters
    - [TX](https://bscscan.com/tx/0x3522e207eff9b93db568ec05b2466aea320158e6c0c0046af56d85120510a8b9). Value: 1 BNB
    - [TX](https://bscscan.com/tx/0xddcc3355e3f03a9bf26fa5bf05045be3648bc6526b62dca15d4b065127a34053). Value: 446.72 USDT (swapped for 1 BNB)
    - [TX](https://bscscan.com/tx/0x40a48bb31a2cee602785fca762555ea905c66452ad77c89e65b11c864050634e). Value: 897 USDC (swapped for 2 BNB)
    - [TX](https://bscscan.com/tx/0xca140ccef11cfabfdd52aa1d53ac02ddc6ed17537c0e0d7f97d3ae276102df66). Value: 1,034 USDT (swapped for 2 BNB)
    - [TX](https://bscscan.com/tx/0x15ee0cd35b72af4eed9ba7cc3b9add16387add387363da643b4b50bba3345ac4). Value: 1,250 USDT (swapped for 2.04 BNB)
    - [TX](https://bscscan.com/tx/0x37473d059f5251cd10a3cb019371f80ab3b5cc3ed04e05e16aa76e2f626593ff). Value: 586.91 USDT (swapped for 1 BNB)
    - [TX](https://bscscan.com/tx/0x851deb51bf8e99365156dbc36300089b7d3789fe2f83e54cf9d32c6bfeae4455). Value: 2 BNB
- Concept: gas to inject XVS liquidity to Uniswap V3
    - [TX](https://etherscan.io/tx/0x2b2929acc61f0464399dfa3b7f028333f9341551011d92a2e197cbe5cb14157c). Value: 0.175 ETH
- Concept: subgraph for the EtherFi Tracking system
    - [TX](https://etherscan.io/tx/0x2a5d444303a52ae9a6b4a0b92cac8dbfb997fb8fba49a85e9fea87a9e6d4c725). Value: 0.01 ETH`,

    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_AMOUNT, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip304;
