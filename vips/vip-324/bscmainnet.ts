import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
const vip324 = () => {
  const meta = {
    version: "v2",
    title: "VIP-324 Ethereum: new rsETH market in the Liquid Staked ETH pool",
    description: `#### Summary

If passed, following the Community proposal “[Proposal: Support rsETH as collateral on Venus on Ethereum Mainnet](https://community.venus.io/t/proposal-support-rseth-as-collateral-on-venus-on-ethereum-mainnet/4376)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xc9853c22ee67ec7e56bbe2b71243d022ad7b4b0836ab0755ad3d34c4e1d2e0be), this VIP adds a market for the [rsETH token](https://etherscan.io/address/0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7) ([Kelp DAO](https://kelpdao.xyz/)) into the Liquid Staked ETH pool on Ethereum.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-support-rseth-as-collateral-on-venus-on-ethereum-mainnet/4376/5), the risk parameters for the new market are:

Underlying token: [rsETH](https://etherscan.io/address/0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7)

- Borrow cap: 3,600
- Supply cap: 8,000
- Collateral factor: 80%
- Liquidation threshold: 85%
- Reserve factor: 20%

Bootstrap liquidity: 2 rsETH - provided by the [Kelp DAO](https://etherscan.io/address/0x7AAd74b7f0d60D5867B59dbD377a71783425af47).

Interest rate curve for the new market:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 300%

**Oracles configuration**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Ethereum](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94) is used for rsETH, with the following configuration. The OneJumpOracle is used to get the USD price of rsETH, first getting the conversion rate rsETH/WETH using the feeds from RedStone or Chainlink, and then getting the USD price using the [Chainlink price feed for ETH/USD](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419).

- MAIN oracle
    - Contract: [OneJumpOracle](https://etherscan.io/address/0xf689AD140BDb9425fB83ba6f55866447244b5a23)
    - CORRELATED_TOKEN: [rsETH](https://etherscan.io/address/0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7)
    - UNDERLYING_TOKEN: [WETH](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
    - INTERMEDIATE_ORACLE: [RedStoneOracle](https://etherscan.io/address/0x0FC8001B2c9Ec90352A46093130e284de5889C86), using its price feed [rsETH/ETH](https://etherscan.io/address/0xA736eAe8805dDeFFba40cAB8c99bCB309dEaBd9B)
- PIVOT and FALLBACK:
- Contract: [OneJumpOracle](https://etherscan.io/address/0xD63011ddAc93a6f8348bf7E6Aeb3E30Ad7B46Df8)
- CORRELATED_TOKEN: [rsETH](https://etherscan.io/address/0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7)
- UNDERLYING_TOKEN: [WETH](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
- INTERMEDIATE_ORACLE: [ChainlinkOracle](https://etherscan.io/address/0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2), using its price feed [rsETH/ETH](https://etherscan.io/address/0x03c68933f7a3F76875C0bc670a58e69294cDFD01)
- Thresholds in the bound validator: 0.99 - 1.01

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Quantstamp](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/100_correlated_token_oracles_quantstamp_20240412.pdf), [Certik](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/098_correlated_token_oracles_certik_20240412.pdf) and [Fairyproof](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/101_correlated_token_oracles_fairyproof_20240328.pdf) have audited the OneJumpOracle.
- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Liquid Staked ETH pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to sepolia, and used in the Venus Protocol testnet deployment

#### Deployed contracts

- Mainnet vrsETH_LiquidStakedETH: [0xDB6C345f864883a8F4cae87852Ac342589E76D1B](https://etherscan.io/address/0xDB6C345f864883a8F4cae87852Ac342589E76D1B)
- Testnet vrsETH_LiquidStakedETH: [0x20a83DE526F2CF2fCec2131E07b11F956d8f3Cdf](https://sepolia.etherscan.io/address/0x20a83DE526F2CF2fCec2131E07b11F956d8f3Cdf)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/304)
- [Code of OneJumpOracle](https://github.com/VenusProtocol/oracle/blob/develop/contracts/oracles/OneJumpOracle.sol)
- [Documentation](https://docs-v4.venus.io/risk/resilient-price-oracle#correlated-token-oracles)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xb3aab8386abd6b34cbbe70662d40673024a9465095ca19bc632e729514a63351) VIP passes, this multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.NORMAL_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip324;
