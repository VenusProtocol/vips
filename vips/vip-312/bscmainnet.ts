import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

const vip312 = () => {
  const meta = {
    version: "v2",
    title: "VIP-312 [Arbitrum] Venus Treasury and Oracles",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Transfer the ownership of the [Venus Treasury on Arbitrum one](https://arbiscan.io/address/0x8a662ceac418daef956bc0e6b2dd417c80cda631) to the [Guardian wallet](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0)
- Configure the oracles on Arbitrum one for the initial Venus markets on that network

#### Description

Following the community proposal [[VRC] Deploy Venus Protocol on Arbitrum](https://community.venus.io/t/vrc-deploy-venus-protocol-on-arbitrum/3721), and the [associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xfc1f42609bda5d7d14660b0b91b19ca63ea1b2ea50169ddab79adfbfbdce323f), this VIP is the first one directly related to the deployment of the Venus protocol to this network.

Apart from the configuration of the Venus Treasury, this VIP configure the Venus Resilient Oracles on Arbitrum one, for the following markets:

- [USDT](https://arbiscan.io/address/0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9): Chainlink - [0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7](https://arbiscan.io/address/0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7)
- [USDC](https://arbiscan.io/address/0xaf88d065e77c8cc2239327c5edb3a432268e5831): Chainlink - [0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3](https://arbiscan.io/address/0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3)
- [WETH](https://arbiscan.io/address/0x82af49447d8a07e3bd95bd0d56f35241523fbab1): Chainlink - [0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612](https://arbiscan.io/address/0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612)
- [WBTC](https://arbiscan.io/address/0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f): Chainlink - [0x6ce185860a4963106506C203335A2910413708e9](https://arbiscan.io/address/0x6ce185860a4963106506C203335A2910413708e9)
- [ARB](https://arbiscan.io/address/0x912ce59144191c1204e64559fe8253a0e49e6548): Chainlink - [0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6](https://arbiscan.io/address/0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6)
- [XVS](https://arbiscan.io/address/0xc1Eb7689147C81aC840d4FF0D298489fc7986d52): RedStone - [0xd9a66Ff1D660aD943F48e9c606D09eA672f312E8](https://arbiscan.io/address/0xd9a66Ff1D660aD943F48e9c606D09eA672f312E8)

The list of initial markets for Arbitrum one follows the [Chaos labs recommendations](https://community.venus.io/t/vrc-deploy-venus-protocol-on-arbitrum/3721/7).

#### Deployed contracts on Arbitrum one

- [ResilientOracle](https://arbiscan.io/address/0xd55A98150e0F9f5e3F6280FC25617A5C93d96007)
- [ChainlinkOracle](https://arbiscan.io/address/0x9cd9Fcc7E3dEDA360de7c080590AaD377ac9F113)
- [RedStoneOracle](https://arbiscan.io/address/0xF792C4D3BdeF534D6d1dcC305056D00C95453dD6)
- [BoundValidator](https://arbiscan.io/address/0x2245FA2420925Cd3C2D889Ddc5bA1aefEF0E14CF)

#### References

- [VIP simulation to configure the Venus Treasury on Arbitrum one](https://github.com/VenusProtocol/vips/pull/281)
- [Transaction to configure the Venus Treasury on Arbitrum one](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0xeeca96f02ec6d28bc229435292fa217447bab8dbfb67560890cbd227055b3956)
- [VIP simulation to configure the oracles on Arbitrum one](https://github.com/VenusProtocol/vips/pull/283)
- [Transaction to configure the oracles on Arbitrum one](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x636c66b76b440c621e3377981633f9c29dd4728e8cb7c5840a96c434b6c9db51)
- [[VRC] Deploy Venus Protocol on Arbitrum](https://community.venus.io/t/vrc-deploy-venus-protocol-on-arbitrum/3721)
- Snapshot ["Deploy Venus Protocol on Arbitrum"](https://snapshot.org/#/venus-xvs.eth/proposal/0xfc1f42609bda5d7d14660b0b91b19ca63ea1b2ea50169ddab79adfbfbdce323f)
- [Guardian wallet](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0)
- [Documentation for Resilient Price Oracle](https://docs-v4.venus.io/risk/resilient-price-oracle)

#### Disclaimer for Arbitrum one VIPs

Privilege commands on Arbitrum one will be executed by the [](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67)[Guardian wallet](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x79ca5d7ef82648f5c52054aa996356da270a60e95a959c595ee3c29defc6a4ca)[this](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0xeeca96f02ec6d28bc229435292fa217447bab8dbfb67560890cbd227055b3956) and [this](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x636c66b76b440c621e3377981633f9c29dd4728e8cb7c5840a96c434b6c9db51) multisig transactions will be executed. Otherwise, it will be rejected.`,
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

export default vip312;
