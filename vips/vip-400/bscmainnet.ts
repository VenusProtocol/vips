import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  BaseAssets,
  USDCPrimeConverterTokenOuts,
  USDC_PRIME_CONVERTER,
  USDTPrimeConverterTokenOuts,
  USDT_PRIME_CONVERTER,
  WBTCPrimeConverterTokenOuts,
  WBTC_PRIME_CONVERTER,
  WETHPrimeConverterTokenOuts,
  WETH_PRIME_CONVERTER,
  XVSVaultConverterTokenOuts,
  XVS_VAULT_CONVERTER,
} from "../../multisig/proposals/arbitrumone/vip-018/addresses";
import {
  addConverterNetworkCommands,
  incentiveAndAccessibilities,
} from "../../multisig/proposals/arbitrumone/vip-018/commands";

export const ARBITRUM_COMPTROLLER_CORE = "0x317c1A5739F39046E20b08ac9BeEa3f10fD43326";
export const ARBITRUM_COMPTROLLER_LST = "0x52bAB1aF7Ff770551BD05b9FC2329a0Bf5E23F16";
export const ARBITRUM_PRIME = "0xFE69720424C954A2da05648a0FAC84f9bf11Ef49";
export const ARBITRUM_PLP = "0x86bf21dB200f29F21253080942Be8af61046Ec29";

export const ARBITRUM_USDT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
export const ARBITRUM_USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
export const ARBITRUM_WBTC = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";
export const ARBITRUM_WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

export const ARBITRUM_VUSDT_CORE = "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD";
export const ARBITRUM_VUSDC_CORE = "0x7D8609f8da70fF9027E9bc5229Af4F6727662707";
export const ARBITRUM_VWBTC_CORE = "0xaDa57840B372D4c28623E87FC175dE8490792811";
export const ARBITRUM_VWETH_LST = "0x39D6d13Ea59548637104E40e729E4aABE27FE106";

export const ARBITRUM_PROTOCOL_SHARE_RESERVE_PROXY = "0xF9263eaF7eB50815194f26aCcAB6765820B13D41";
export const ARBITRUM_VTREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";

const vip400 = () => {
  const meta = {
    version: "v2",
    title: "VIP-400 [Arbitrum] Enable Venus Prime (stage 1/2)",
    description: `#### Summary

If passed, following the Community post “[Venus Prime Deployment Proposal for Arbitrum](https://community.venus.io/t/venus-prime-deployment-proposal-for-arbitrum/4696)” and the associated [snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x38c03ac9f3a4c71671162219af33a9b322270ecd57349e174d0d98ee03003ecb), this VIP will:

- Enable claiming the Prime tokens on Arbitrum one. Eligible users will be able to claim their Prime tokens as soon as this VIP is executed
- Configure the [Token Converters](https://docs-v4.venus.io/technical-reference/reference-technical-articles/token-converters) contracts, to automatically convert the protocol income allocated to Prime into the expected tokens
- Configure the distribution rules in the [ProtocolShareReserve contract](https://arbiscan.io/address/0xF9263eaF7eB50815194f26aCcAB6765820B13D41), following the percentages proposed by the community

#### Details

This Prime parameters are similar to the configuration on the Ethereum and BNB Chain:

- Markets:
    - Core pool:
        - USDT, USDC, WBTC
    - Liquid Staked ETH
        - WETH
- Minimum XVS to qualify: 1,000 XVS
- Maximum XVS cap: 100,000 XVS
- Number of days staking XVS to qualify: 90
- Limit to the number of Prime holders: 500 revocable tokens, 0 irrevocable tokens
- Alpha: 0.5 (staked XVS and borrowed/supplied amounts have the same weight calculating the Prime user score)
- Supply multiplier: 2 (for the 4 markets)
- Borrow multiplier: 4 (for the 4 markets)

Following the [Tokenomics](https://docs-v4.venus.io/governance/tokenomics), 20% of the protocol reserves are allocated to Prime. This VIP configures the distribution rules in the ProtocolShareReserve contract to distribute this 20% among the Prime markets, considering the [community proposal](https://community.venus.io/t/venus-prime-deployment-proposal-for-arbitrum/4696):

- USDT (Core pool): 25%
- USDC (Core pool): 25%
- WBTC (Core pool): 15%
- WETH (Liquid Staked ETH pool): 35%

No rewards are configured in this VIP. They would be configured in the future, with a different VIP.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Configuration post VIP**: in a simulation environment, validating the ownerships of the contracts are the expected ones after the VIP, and conversions can be performed.
- **Deployment on testnet**: the same contracts were deployed and configured to testnet, and used in the Venus Protocol testnet deployment
- **Audit**: OpenZeppelin, Certik, Peckshield and Fairyproof have audited the deployed code. Additionally, OpenZeppelin and Certik audited the private conversions feature.

Ownership of the contracts will be transferred to the [Guardian wallet](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0). Ownership will be transferred to Governance after fully enabling the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x0dd00b537e67face5454e3c9595d7ec8ccdf5f05969d78e9c4dccabb36128321) multisig transaction will be executed. Otherwise, it will be rejected.

#### Audit reports

- Token converters
    - [OpenZeppelin audit report (2023/10/10)](https://github.com/VenusProtocol/protocol-reserve/blob/f31dc8bb433f1cff6c2124d27742004d82b24c32/audits/066_tokenConverter_openzeppelin_20231010.pdf)
    - [Certik audit audit report (2023/11/07)](https://github.com/VenusProtocol/protocol-reserve/blob/f31dc8bb433f1cff6c2124d27742004d82b24c32/audits/074_tokenConverter_certik_20231107.pdf)
    - [Peckshield audit report (2023/09/27)](https://github.com/VenusProtocol/protocol-reserve/blob/f31dc8bb433f1cff6c2124d27742004d82b24c32/audits/068_tokenConverter_peckshield_20230927.pdf)
    - [Fairyproof audit report (2023/08/28)](https://github.com/VenusProtocol/protocol-reserve/blob/f31dc8bb433f1cff6c2124d27742004d82b24c32/audits/067_tokenConverter_fairyproof_20230828.pdf)
- Private conversions
    - [Certik audit report (2023/11/27)](https://github.com/VenusProtocol/protocol-reserve/blob/f31dc8bb433f1cff6c2124d27742004d82b24c32/audits/081_privateConversions_certik_20231127.pdf)
    - [OpenZeppelin report (2024/01/09)](https://github.com/VenusProtocol/protocol-reserve/blob/f31dc8bb433f1cff6c2124d27742004d82b24c32/audits/082_privateConversions_openzeppelin_20240109.pdf)
- Prime
    - [OpenZeppelin audit report (2023/10/03)](https://github.com/VenusProtocol/venus-protocol/blob/e02832bb2716bc0a178d910f6698877bf1b191e1/audits/065_prime_openzeppelin_20231003.pdf)
    - [Certik audit audit report (2023/11/13)](https://github.com/VenusProtocol/venus-protocol/blob/2425501070d28c36a73861d9cf6970f641403735/audits/060_prime_certik_20231113.pdf)
    - [Peckshield audit report (2023/08/26)](https://github.com/VenusProtocol/venus-protocol/blob/e02832bb2716bc0a178d910f6698877bf1b191e1/audits/055_prime_peckshield_20230826.pdf)
    - [Fairyproof audit report (2023/09/10)](https://github.com/VenusProtocol/venus-protocol/blob/e02832bb2716bc0a178d910f6698877bf1b191e1/audits/056_prime_fairyproof_20230910.pdf)
    - [Code4rena contest (2023/09/28)](https://code4rena.com/contests/2023-09-venus-prime)

#### Deployed contracts to main net

- [XVSVaultTreasury](https://arbiscan.io/address/0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58)
- [SingleTokenConverterBeacon](https://arbiscan.io/address/0x993900Ab4ef4092e5B76d4781D09A2732086F0F0)
- [USDTPrimeConverter](https://arbiscan.io/address/0x435Fac1B002d5D31f374E07c0177A1D709d5DC2D)
- [USDCPrimeConverter](https://arbiscan.io/address/0x6553C9f9E131191d4fECb6F0E73bE13E229065C6)
- [WBTCPrimeConverter](https://arbiscan.io/address/0xF91369009c37f029aa28AF89709a352375E5A162)
- [WETHPrimeConverter](https://arbiscan.io/address/0x4aCB90ddD6df24dC6b0D50df84C94e72012026d0)
- [XVSVaultConverter](https://arbiscan.io/address/0x9c5A7aB705EA40876c1B292630a3ff2e0c213DB1)
- [ConverterNetwork](https://arbiscan.io/address/0x2F6672C9A0988748b0172D97961BecfD9DC6D6d5)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/429)
- [Tokenomics](https://docs-v4.venus.io/governance/tokenomics)
- Community post [Venus Prime Deployment Proposal for Arbitrum](https://community.venus.io/t/venus-prime-deployment-proposal-for-arbitrum/4696)
- Snapshot “[Deploy Venus Prime on Arbitrum](https://snapshot.org/#/venus-xvs.eth/proposal/0x38c03ac9f3a4c71671162219af33a9b322270ecd57349e174d0d98ee03003ecb)”
- [Source code of Prime contracts](https://github.com/VenusProtocol/venus-protocol/tree/main/contracts/Tokens/Prime)
- [Source code of Token Converters](https://github.com/VenusProtocol/protocol-reserve/tree/main/contracts/TokenConverter)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ARBITRUM_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_COMPTROLLER_CORE,
          ARBITRUM_VWBTC_CORE,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_COMPTROLLER_CORE,
          ARBITRUM_VUSDC_CORE,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_COMPTROLLER_CORE,
          ARBITRUM_VUSDT_CORE,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          ARBITRUM_COMPTROLLER_LST,
          ARBITRUM_VWETH_LST,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_PRIME,
        signature: "setLimit(uint256,uint256)",
        params: [
          0, // irrevocable
          500, // revocable
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 6000, ARBITRUM_VTREASURY],
            [0, 2000, XVS_VAULT_CONVERTER],
            [0, 500, USDC_PRIME_CONVERTER], // 25% of the Prime allocation
            [0, 500, USDT_PRIME_CONVERTER], // 25% of the Prime allocation
            [0, 300, WBTC_PRIME_CONVERTER], // 15% of the Prime allocation
            [0, 700, WETH_PRIME_CONVERTER], // 35% of the Prime allocation
            [1, 8000, ARBITRUM_VTREASURY],
            [1, 2000, XVS_VAULT_CONVERTER],
          ],
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], USDTPrimeConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], USDCPrimeConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], WBTCPrimeConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], WETHPrimeConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], XVSVaultConverterTokenOuts, incentiveAndAccessibilities],
        dstChainId: LzChainId.arbitrumone,
      },
      ...addConverterNetworkCommands,
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip400;
