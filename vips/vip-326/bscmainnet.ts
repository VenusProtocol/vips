import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vip302 = () => {
  const meta = {
    version: "v2",
    title: "VIP-326 Ethereum: Token converters and Prime markets",
    description: `#### Summary

If passed, this VIP will enable the Token Converter contracts and configure the Prime markets on Ethereum. Specifically this VIP would:

- Configure token conversions considering every underlying token currently available in Venus on Ethereum, and the [tokenomics rules](https://snapshot.org/#/venus-xvs.eth/proposal/0x21c89f6b5d7c9e453b3bac64b23c1d81fe52ff4f23ba0b64674c34217c3f9245)
- Link the [Automatic Income Allocation system](https://docs-v4.venus.io/whats-new/automatic-income-allocation) with the converters, allowing anyone to send the market reserves from the [ProtocolShareReserve](https://etherscan.io/address/0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E) contract to the converters
- Configure the markets for the Prime program: [USDT](https://app.venus.io/#/core-pool/market/0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E?chainId=1), [USDC](https://app.venus.io/#/core-pool/market/0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb?chainId=1) and [WBTC](https://app.venus.io/#/core-pool/market/0x8716554364f20BCA783cb2BAA744d39361fd1D8d?chainId=1) from the Core pool, and [WETH](https://app.venus.io/#/staked-eth-pool/market/0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2?chainId=1) from the Liquid Staked ETH pool

After executing this VIP, anyone (token converters are permissionless) will be able to convert the Venus reserves. The contracts enforce it following the protocol tokenomics.

#### Description

This VIP is part of the proposal [Automatic Income Allocation & Token Converter](https://community.venus.io/t/automatic-income-allocation-token-converter/3702), published in the Venus community forum. Specifically, this VIP is related to the Token Converter subsystem.

Token converters are permissionless: they allow anyone to convert the available tokens in the converters for the required tokens according to the Venus tokenomics. Specifically, the following converters will be enabled:

- [XVSVaultConverter](https://etherscan.io/address/0x1FD30e761C3296fE36D9067b1e398FD97B4C0407): accepting [XVS](https://etherscan.io/address/0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A), offering 20% of the interest reserves and 20% of the liquidation income
- Prime converters (offering 20% of the interest reserves):
    - [USDTPrimeConverter](https://etherscan.io/address/0x4f55cb0a24D5542a3478B0E284259A6B850B06BD): accepting [USDT](https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7) and offering 1.4% of the interest reserves
    - [USDCPrimeConverter](https://etherscan.io/address/0xcEB9503f10B781E30213c0b320bCf3b3cE54216E): accepting [USDC](https://etherscan.io/address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) and offering 1.4% of the interest reserves
    - [WBTCPrimeConverter](https://etherscan.io/address/0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0): accepting [WBTC](https://etherscan.io/address/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599) and offering 1.4% of the interest reserves
    - [WETHPrimeConverter](https://etherscan.io/address/0xb8fD67f215117FADeF06447Af31590309750529D): accepting [WETH](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2) and offering 15.8% of the interest reserves

The configured incentive of every conversion is zero. This can be changed in the future via VIP.

Private conversions are configured: when new funds arrive at a token converter contract, the rest of the converters are checked, and a private conversion will be performed if possible.

Apart from the converters, distribution rules will be configured on the ProtocolShareReserve contract to send 60% of the interest reserves and 80% of the liquidation income to the [Venus Treasury](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA), following the [tokenomics rules](https://snapshot.org/#/venus-xvs.eth/proposal/0x21c89f6b5d7c9e453b3bac64b23c1d81fe52ff4f23ba0b64674c34217c3f9245)

#### Prime parameters on Ethereum

- Minimum XVS to qualify: 1,000 XVS
- Maximum XVS cap: 100,000 XVS
- Number of days staking XVS to qualify: 90
- Limit to the number of Prime holders: 500 revocable tokens, 0 irrevocable tokens
- Alpha: 0.5 (staked XVS and borrowed/supplied amounts have the same weight calculating the Prime user score)
- Supply multiplier: 2 (for the 4 markets)
- Borrow multiplier: 4 (for the 4 markets)

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Configuration post VIP**: in a simulation environment, validating the parameters of the Token Converter contracts, and the behavior of the Venus Prime tokens, are the expected ones after the VIP execution.
- **Token conversions**: in a simulation environment, validating the token reserves generated by the protocol can be converted to the expected tokens following the tokenomics, including private conversions.
- **Deployment on testnet**: the same contracts were deployed and configured to testnet, and used in the Venus Protocol testnet deployment
- **Audit**: OpenZeppelin, Certik, Peckshield and Fairyproof have audited the token converters and the Prime contracts. Moreover, OpenZeppelin and Certik audited the private conversions feature, and a code4rena contest was performed for the Prime contracts.

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

- [Prime](https://etherscan.io/address/0x14C4525f47A7f7C984474979c57a2Dccb8EACB39)
- [PrimeLiquidityProvider](https://etherscan.io/address/0x8ba6aFfd0e7Bcd0028D1639225C84DdCf53D8872)
- [XVSVaultTreasury](https://etherscan.io/address/0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE)
- [SingleTokenConverterBeacon](https://etherscan.io/address/0x5C0b5D09388F2BA6441E74D40666C4d96e4527D1)
- [ConverterNetwork](https://etherscan.io/address/0x232CC47AECCC55C2CAcE4372f5B268b27ef7cac8)

#### References

- Community proposal “[Venus Prime Deployment Proposal for Ethereum Mainnet](https://community.venus.io/t/venus-prime-deployment-proposal-for-ethereum-mainnet/4417)”
- Snapshot “[Venus Prime Deployment Proposal for Ethereum Mainnet](https://snapshot.org/#/venus-xvs.eth/proposal/0x0a8305d81d70bf6ec05b2a652754cdec746de64a45e53d43473c6979b1e5f535)”
- Community post “[Proposal for Revision of Venus Protocol Tokenomics V4](https://community.venus.io/t/proposal-for-revision-of-venus-protocol-tokenomics-v4/4411)”
- Snapshot “[Proposal for Revision of Venus Protocol Tokenomics V4](https://snapshot.org/#/venus-xvs.eth/proposal/0x21c89f6b5d7c9e453b3bac64b23c1d81fe52ff4f23ba0b64674c34217c3f9245)”
- [Pull request with the Token Converter contracts](https://github.com/VenusProtocol/protocol-reserve/pull/94)
- [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/303)
- [Documentation - Token converters](https://docs-v4.venus.io/whats-new/token-converter)
- [Documentation - Prime](https://docs-v4.venus.io/whats-new/prime-yield)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, this multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: NORMAL_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip302;
