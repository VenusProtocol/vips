import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const DEV_WALLET = "0x48e9d2128321cbf75cd108321459865357c00f15";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";

export const WBNB_AMOUNT_DEV_FUND = parseUnits("1346.675274370561653", 18); // $834,400, assuming 1 BNB = $619.60
export const ETH_AMOUNT_DEV_FUND = parseUnits("48.850456948485718", 18); // $178,800, assuming 1 ETH = $3,660.15
export const BTC_AMOUNT_DEV_FUND = parseUnits("1.469313741732117", 18); // $104,300, assuming 1 BTC = $70,985.52

export const REQUIRED_VUSDC_FOR_USDC_DEV_FUND = parseUnits("15625069", 8); // assuming 1 USDC=41.94649395 vUSDC
export const USDC_AMOUNT_DEV_FUND = parseUnits("372500", 18);

export const ETH_AMOUNT_COMMUNITY_WALLET = parseUnits("1.188225443", 18);
export const USDC_AMOUNT_COMMUNITY_WALLET = parseUnits("10518.73", 18); // Sending USDC instead of USDT
export const BNB_AMOUNT_COMMUNITY_WALLET = parseUnits("3", 18);

export const vip307 = () => {
  const meta = {
    version: "v2",
    title: "VIP-307 H1-2024 Development Funding",
    description: `#### Summary

Following the community post [H1-2024 Development Funding](https://community.venus.io/t/h1-2024-development-funding/4310), and the associated [snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x4092c51400c3fe3128c35c9533b049bfcf85f497094425b147e7b18a8deb063c), if passed, this VIP will transfer the following tokens to the [Development Team](https://bscscan.com/address/0x48e9d2128321cbf75cd108321459865357c00f15):

- 1,349.67 BNB
- 383,018.73 USDC
- 50.038 ETH
- 1.46 BTC

#### Details

After a year filled with significant accomplishments and improvements in protocol, the path is set forward to support the initiatives that the community advocates for.

This proposal aims to reimburse efforts from the first quarter (Q1) of 2024 and to fund the following quarter (Q2) for continued support, totaling $1,490,000.

#### Key Developments for H1-2024

The roadmap for Venus Protocol in 2024 includes strategic deployments, enhancements, and integrations designed to increase TVL, revenue, and user engagement.

#### Highlights of accomplishments so far:

- VIPs: A total of 80 VIPs have been executed in 2024.
- ETH Mainnet XVS Bridge: Developed and deployed an XVS Bridge, successfully bridging more than 530K XVS.
- ETH Mainnet Deployment: Successfully deployed on the ETH Mainnet
- Automatic Allocator: Automated, transparent, and decentralized income distribution following the protocol tokenomics for all chain deployments.
- Token Converter: Automated, transparent, and decentralized token converter for all chain deployments.
- Automatic Native Token Interaction with Wrapped Token Markets: Enables users to interact with wrapped markets using native token denominations. For example, users can use ETH to interact with the WETH market.

#### Planned developments for the first half of 2024:

- Multichain Deployments: Expansion for a total of three or more EVM-compatible chains.
- Improved Oracles for Liquid Staked Tokens and Liquid Restake Tokens: Two-step method for improved accuracy and risk mitigation.
- Multichain Governance: Governance management on the BNB chain for all other chain deployments.

#### Maintenance and Support

Continual maintenance and support for all chains are vital to ensuring the protocol’s robustness, security, and responsiveness to community needs. Our team will dedicate resources to:

- Security Audits and Risk Management: Collaboration with leading security firms to maintain Venus as the most secure protocol in its category.
- Technical Support and Community Engagement: Providing round-the-clock technical support and actively engaging with our community through AMAs, surveys, and forums.
- New pools and markets: Provide support in developing new markets or pools based on community proposals.
- Protocol Documentation: Update and maintain protocol documentation for new releases and changes.

#### Funding Request

For the reimbursement of efforts during the first quarter of 2024 and the successful execution of the deployments set for the following quarter, a $1,490,000 funding request is needed to cover operational expenses. This amount will be transferred in tokens, based on protocol treasury allocation:

- BNB: 56% ($834,400). 1,346.67 BNB will be transferred, assuming 1 BNB = $619.6
- USDC: 16% ($238,400). 372,500 USDC will be transferred, including the USDT part
- ETH: 13% ($178,800). 48.85 ETH will be transferred, assuming 1 ETH = $3,660.15
- USDT: 9% ($134,100). 0 USDT will be transferred. It will be replaced with USDC tokens
- BTC: 7% ($104,300). 1.46 BTC will be transferred, assuming 1 BTC = $70,985.52

This budget will ensure continuous support, progress and the delivery of planned developments to the Venus ecosystem.

USD prices have been considered on May 21st, 2024.

#### Refund the Community Wallet

It is also required to refund the Community Wallet, which provided the following tokens beforehand to fund development operations:

- 10,518.73 USDC (instead of USDT)
- 1.188225443 ETH
- 3 BNB

List of transactions performed by the Community Wallet, funding development operations:

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
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBNB, WBNB_AMOUNT_DEV_FUND, bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: WBNB,
        signature: "withdraw(uint256)",
        params: [WBNB_AMOUNT_DEV_FUND],
      },
      {
        target: DEV_WALLET,
        signature: "",
        params: [],
        value: WBNB_AMOUNT_DEV_FUND.toString(),
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDC, REQUIRED_VUSDC_FOR_USDC_DEV_FUND, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [vUSDC, DEV_WALLET, USDC_AMOUNT_DEV_FUND, bscmainnet.VTREASURY],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT_DEV_FUND, DEV_WALLET],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BTC, BTC_AMOUNT_DEV_FUND, DEV_WALLET],
      },

      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT_COMMUNITY_WALLET, DEV_WALLET],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, USDC_AMOUNT_COMMUNITY_WALLET, DEV_WALLET],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_AMOUNT_COMMUNITY_WALLET, DEV_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip307;
