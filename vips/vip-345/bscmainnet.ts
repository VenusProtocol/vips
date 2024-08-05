import { NORMAL_TIMELOCK } from "src/vip-framework";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const vip345 = () => {
  const meta = {
    version: "v2",
    title: "VIP-345 [Ethereum] New ezETH market in the Liquid Staked ETH pool",
    description: `### Summary

If passed, following the Community proposal “[Support ezETH as collateral on ETH Mainnet and BNB Chain](https://community.venus.io/t/support-ezeth-as-collateral-on-eth-mainnet-and-bnb-chain/4415)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xc2db89a9e361c9da0f9a545411b66b0decb68ed2916fb8171f12c7213a53d088), this VIP adds a market for the [ezETH token](https://etherscan.io/token/0xbf5495Efe5DB9ce00f80364C8B423567e58d2110) ([Renzo Protocol](https://www.renzoprotocol.com/)) into the Liquid Staked ETH pool on Ethereum.

### Description

#### Risk parameters

Following [Chaos Labs recommendations](https://community.venus.io/t/support-ezeth-as-collateral-on-eth-mainnet-and-bnb-chain/4415/4), the risk parameters for the new market are:

Underlying token: [ezETH](https://etherscan.io/token/0xbf5495Efe5DB9ce00f80364C8B423567e58d2110)

* Borrow cap: 1,400
* Supply cap: 14,000
* Collateral factor: 80%
* Liquidation threshold: 85%
* Reserve factor: 20%

Bootstrap liquidity: 1.41 ezETH - provided by the [Renzo Protocol](https://etherscan.io/address/0x1e3233e8d972cffc7d0f83afae4354a0db74e34e).

Interest rate curve for the new market:

* kink: 45%
* base (yearly): 0%
* multiplier (yearly): 9%
* jump multiplier (yearly): 75%

#### Oracles configuration

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Ethereum](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94) is used for ezETH, with the following configuration. The OneJumpOracle is used to get the USD price of ezETH, first getting the conversion rate ezETH/WETH using the feeds from RedStone or Chainlink, and then getting the USD price using the [Chainlink price feed for ETH/USD](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419).

* MAIN oracle
    * Contract: [OneJumpOracle](https://etherscan.io/address/0xf689AD140BDb9425fB83ba6f55866447244b5a23)
    * CORRELATED_TOKEN: [ezETH](https://etherscan.io/token/0xbf5495Efe5DB9ce00f80364C8B423567e58d2110)
    * UNDERLYING_TOKEN: [WETH](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
    * INTERMEDIATE_ORACLE: [RedStoneOracle](https://etherscan.io/address/0x0FC8001B2c9Ec90352A46093130e284de5889C86), using its price feed [ezETH/ETH](https://etherscan.io/address/0xF4a3e183F59D2599ee3DF213ff78b1B3b1923696)
* PIVOT and FALLBACK:
    * Contract: [OneJumpOracle](https://etherscan.io/address/0xD63011ddAc93a6f8348bf7E6Aeb3E30Ad7B46Df8)
    * CORRELATED_TOKEN: [ezETH](https://etherscan.io/token/0xbf5495Efe5DB9ce00f80364C8B423567e58d2110)
    * UNDERLYING_TOKEN: [WETH](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
    * INTERMEDIATE_ORACLE: [ChainlinkOracle](https://etherscan.io/address/0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2), using its price feed [ezETH/ETH](https://etherscan.io/address/0x636A000262F6aA9e1F094ABF0aD8f645C44f641C)
* Thresholds in the bound validator: 0.99 - 1.01

#### Security and additional considerations

We applied the following security procedures for this upgrade:

* **Audits:** [Quantstamp](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/100_correlated_token_oracles_quantstamp_20240412.pdf), [Certik](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/098_correlated_token_oracles_certik_20240412.pdf) and [Fairyproof](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/101_correlated_token_oracles_fairyproof_20240328.pdf) have audited the OneJumpOracle.
* **VIP execution simulation:** in a simulation environment, validating the new market is properly added to the Liquid Staked ETH pool on Ethereum, with the right parameters and the expected bootstrap liquidity
* **Deployment on testnet:** the same market has been deployed to sepolia, and used in the Venus Protocol testnet deployment

#### Deployed contracts

* Mainnet vezETH_LiquidStakedETH: [0xA854D35664c658280fFf27B6eDC6C4195c3229B3](https://etherscan.io/address/0xA854D35664c658280fFf27B6eDC6C4195c3229B3)
* Testnet vezETH_LiquidStakedETH: [0xF4C1B7528f8B266D8ADf1a85c91d93114FeDbA2A](https://sepolia.etherscan.io/address/0xF4C1B7528f8B266D8ADf1a85c91d93114FeDbA2A)

#### References

* [VIP simulation](https://github.com/VenusProtocol/vips/pull/328)
* [Code of OneJumpOracle](https://github.com/VenusProtocol/oracle/blob/develop/contracts/oracles/OneJumpOracle.sol)
* [Documentation](https://docs-v4.venus.io/risk/resilient-price-oracle#correlated-token-oracles) 

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xd2a4cf0ef50774d47f5744e48c1317d5de7c48b7f2340cbaaf0d0b216b1236ac) multisig transaction will be executed. Otherwise, it will be rejected.`,
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

export default vip345;
