import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vip302 = () => {
  const meta = {
    version: "v2",
    title: "VIP-302 Ethereum: new FRAX and sFRAX markets in the Core pool",
    description: `#### Summary

If passed, following the Community proposal “[List Frax Finance assets on Venus on Mainnet and BSC](https://community.venus.io/t/list-frax-finance-assets-on-venus-on-mainnet-and-bsc/4114)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x1716b6daa8ce1ce4a098a5ad29bc4bfe1bec42b4a318f418bd66da2573ea725d), this VIP adds markets for [FRAX](https://etherscan.io/address/0x853d955acef822db058eb8505911ed77f175b99e) and [sFRAX](https://etherscan.io/address/0xa663b02cf0a4b149d2ad41910cb81e23e1c41c32) tokens into the Core pool on Ethereum.

#### Description

Following [Chaos Labs recommendations](https://community.venus.io/t/list-frax-finance-assets-on-venus-on-mainnet-and-bsc/4114/14), the **risk parameters** for the new market are:

Underlying token: [FRAX](https://etherscan.io/address/0x853d955acef822db058eb8505911ed77f175b99e)

- Borrow cap: 8,000,000
- Supply cap: 10,000,000
- Collateral factor: 75%
- Liquidation threshold: 80%
- Reserve factor: 10%

Bootstrap liquidity: 5,000 FRAX - provided by the [FRAX team](https://etherscan.io/address/0x6e74053a3798e0fc9a9775f7995316b27f21c4d2).

Interest rate curve for the new market:

- kink: 80%
- base (yearly): 0%
- multiplier (yearly): 15%
- jump multiplier (yearly): 250%

Underlying token: [sFRAX](https://etherscan.io/address/0xa663b02cf0a4b149d2ad41910cb81e23e1c41c32)

- Borrow cap: 1,000,000
- Supply cap: 10,000,000
- Collateral factor: 75%
- Liquidation threshold: 80%
- Reserve factor: 10%

Bootstrap liquidity: 4,800 sFRAX - provided by the [FRAX team](https://etherscan.io/address/0x6e74053a3798e0fc9a9775f7995316b27f21c4d2).

Interest rate curve for the new market:

- kink: 80%
- base (yearly): 0%
- multiplier (yearly): 15%
- jump multiplier (yearly): 250%

#### Liquidity Mining Rewards

FRAX market: 2,400 [XVS](https://etherscan.io/address/0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A) for 90 days, provided by the Venus Protocol. 40% for suppliers, 60% for borrowers

sFRAX market: 2,400 [XVS](https://etherscan.io/address/0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A) for 90 days, provided by the Venus Protocol. 60% for suppliers, 40% for borrowers

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Quantstamp](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/100_correlated_token_oracles_quantstamp_20240412.pdf), [Certik](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/098_correlated_token_oracles_certik_20240412.pdf) and [Fairyproof](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/101_correlated_token_oracles_fairyproof_20240328.pdf) have audited the SFraxOracle.
- **VIP execution simulation**: in a simulation environment, validating the new markets are properly added to the Core pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same markets have been deployed to sepolia, and used in the Venus Protocol testnet deployment
- **Oracles**: following the approach exposed in the community post “[Two-Step Oracle Method for Accurate LST Pricing](https://community.venus.io/t/two-step-oracle-method-for-accurate-lst-pricing/4094)”, the SFraxOracle contract used to calculate the USD price of sFRAX first gets the FRAX price using on-chain information, and then gets the USD price using the [Chainlink price feed for FRAX/USD](https://etherscan.io/address/0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD).

#### Contracts on mainnet

- New market vFRAX_Core: [0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95](https://etherscan.io/address/0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95)
- New market vsFRAX_Core: [0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe](https://etherscan.io/address/0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe)
- RewardsDistributor: [0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8](https://etherscan.io/address/0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8)
- Oracle SFraxOracle: [0x27F811933cA276387554eAffD9860e513bA95AC3](https://etherscan.io/address/0x27F811933cA276387554eAffD9860e513bA95AC3)

#### Contracts on testnet

- New market vFRAX_Core: [0x33942B932159A67E3274f54bC4082cbA4A704340](https://sepolia.etherscan.io/address/0x33942B932159A67E3274f54bC4082cbA4A704340)
- New market vsFRAX_Core: [0x18995825f033F33fa30CF59c117aD21ff6BdB48c](https://sepolia.etherscan.io/address/0x18995825f033F33fa30CF59c117aD21ff6BdB48c)
- RewardsDistributor: [0xB60666395bEFeE02a28938b75ea620c7191cA77a](https://sepolia.etherscan.io/address/0xB60666395bEFeE02a28938b75ea620c7191cA77a)
- Oracle SFraxOracle: [0x163cA9Eb6340643154F8691C5DAd3aC844266717](https://sepolia.etherscan.io/address/0x163cA9Eb6340643154F8691C5DAd3aC844266717)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/277)
- [New SFraxOracle](https://github.com/VenusProtocol/oracle/pull/165)
- [Transaction on testnet adding the new markets](https://sepolia.etherscan.io/tx/0x5f31126e305657a54a82182b2a727262941d9e59c5f3158d6da5740d1f037609)
- [Documentation](https://docs-v4.venus.io/deployed-contracts/oracles)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xda3f6d10470d5cf95688be1970e0301fcb242824b5d5b3c42a895c5ae9e59502) multisig transaction will be executed. Otherwise, it will be rejected.`,
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
