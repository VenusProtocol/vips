import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NORMAL_TRACK_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vip305 = () => {
  const meta = {
    version: "v2",
    title: "VIP-305 Ethereum: new PT-weETH-26DEC2024 (Pendle) market in the Liquid Staked ETH pool",
    description: `#### Summary

If passed, following the Community proposal “[[VRC] Support Pendle’s LRT PT Tokens as collateral on Venus Protocol](https://community.venus.io/t/vrc-support-pendle-s-lrt-pt-tokens-as-collateral-on-venus-protocol/4118)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x9e704b24b252abda2a3bf6c6724a24ee7185f71fa833b87c83cb56a3b11140f4), this VIP adds a market for the Pendle token [PT-weETH-26DEC2024](https://etherscan.io/address/0x6ee2b5e19ecba773a352e5b21415dc419a700d1d) into the Liquid Staked ETH pool on Ethereum.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/vrc-support-pendle-s-lrt-pt-tokens-as-collateral-on-venus-protocol/4118/9), the risk parameters for the new market are:

Underlying token: [PT-weETH-26DEC2024](https://etherscan.io/address/0x6ee2b5e19ecba773a352e5b21415dc419a700d1d)

- Borrow cap: 0 (Non-borrowable)
- Supply cap: 1,200
- Collateral factor: 75%
- Liquidation threshold: 80%
- Reserve factor: 20%

Bootstrap liquidity: 1.799 PT-weETH-26DEC2024 - provided by the [Venus Treasury](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA).

Interest rate curve for the new market:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 75%

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Quantstamp](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/100_correlated_token_oracles_quantstamp_20240412.pdf), [Certik](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/098_correlated_token_oracles_certik_20240412.pdf) and [Fairyproof](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/101_correlated_token_oracles_fairyproof_20240328.pdf) have audited the PendleOracle.
- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Liquid Staked ETH pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to sepolia, and used in the Venus Protocol testnet deployment
- **Oracles**: following the approach exposed in the community post “[Two-Step Oracle Method for Accurate LST Pricing](https://community.venus.io/t/two-step-oracle-method-for-accurate-lst-pricing/4094)”, the PendleOracle contract calculates the USD price of PT-weETH-26DEC2024 first getting the eETH price using on-chain information, and then getting the USD price using the [Chainlink price feed for ETH/USD](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419) (assuming 1 ETH = 1 eETH).

#### Contracts on mainnet

- New market vPT-weETH-26DEC2024_LiquidStakedETH: [0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C](https://etherscan.io/address/0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C)
- Oracle PendleOracle: [0xA1eA3cB0FeA73a6c53aB07CcC703Dc039D8EAFb4](https://etherscan.io/address/0xA1eA3cB0FeA73a6c53aB07CcC703Dc039D8EAFb4)
- Oracle WeETHOracle using market price: [0x660c6d8c5fddc4f47c749e0f7e03634513f23e0e](https://etherscan.io/address/0x660c6d8c5fddc4f47c749e0f7e03634513f23e0e)

#### Contracts on testnet

- New market vPT-weETH-26DEC2024_LiquidStakedETH: [0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1](https://sepolia.etherscan.io/address/0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1)
- Oracle PendleOracle: [0xAF83f9C9d849B6FF3A33da059Bf14A0E85493eb4](https://sepolia.etherscan.io/address/0xAF83f9C9d849B6FF3A33da059Bf14A0E85493eb4)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/271)
- [New PendleOracle](https://github.com/VenusProtocol/oracle/blob/develop/contracts/oracles/PendleOracle.sol)
- [Documentation](https://docs-v4.venus.io/risk/resilient-price-oracle#correlated-token-oracles)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this multisig transaction](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x82ed88c2c7e9fb2c7a832dd02d4dd22bc26e9d08bc91aec61ed98eba9d81d8a9) will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: NORMAL_TRACK_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip305;
