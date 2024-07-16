import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vip322 = () => {
  const meta = {
    version: "v2",
    title: "VIP-329 Ethereum: new sfrxETH market in the Liquid Staked ETH pool",
    description: `#### Summary

If passed, following the Community proposal “[List Frax Finance assets on Venus on Mainnet and BSC](https://community.venus.io/t/list-frax-finance-assets-on-venus-on-mainnet-and-bsc/4114)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x1716b6daa8ce1ce4a098a5ad29bc4bfe1bec42b4a318f418bd66da2573ea725d), this VIP adds a market for the [Staked Frax Ether (sfrxETH) token](https://etherscan.io/address/0xac3E018457B222d93114458476f3E3416Abbe38F) into the Liquid Staked ETH pool on Ethereum.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/list-frax-finance-assets-on-venus-on-mainnet-and-bsc/4114/14), the risk parameters for the new market are:

Underlying token: [sfrxETH](https://etherscan.io/address/0xac3E018457B222d93114458476f3E3416Abbe38F)

- Borrow cap: 10,000
- Supply cap: 1,000
- Collateral factor: 90%
- Liquidation threshold: 93%
- Reserve factor: 20%

Bootstrap liquidity: 1.2 sfrxETH - provided by the [FRAX project](https://etherscan.io/address/0x6e74053a3798e0fC9a9775F7995316b27f21c4D2).

Interest rate curve for the new market:

- kink: 40%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 300%

**Oracles configuration**

The [SFrxETHOracle](https://github.com/VenusProtocol/oracle/blob/36f63b5e1199f7da589780357e9a7772eac72e2f/contracts/oracles/SFrxETHOracle.sol) is used to get the USD price of sfrxETH, first getting the prices from the [SfrxEthFraxOracle contract](https://etherscan.io/address/0x3d3d868522b5a4035adcb67bf0846d61597a6a6f) ([provided by the FRAX project](https://docs.frax.finance/frax-oracle/advanced-concepts#frax-oracles)), and after checking the discrepancies on the obtained prices, returning the average.

**Market Emissions**

2,400 XVS allocated as liquidity incentives, for 90 days. Only for suppliers in the new market. Provided by the [Venus Treasury](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Quantstamp](https://github.com/VenusProtocol/oracle/blob/0b221a7bb7d8e04fd8b013806facb93bcb4038b9/audits/111_sfrxETHOracle_quantstamp_20240530.pdf) and [Certik](https://github.com/VenusProtocol/oracle/blob/0b221a7bb7d8e04fd8b013806facb93bcb4038b9/audits/110_sfrxETHOracle_certik_20240517.pdf) have audited the SFrxETHOracle.
- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Liquid Staked ETH pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to sepolia, and used in the Venus Protocol testnet deployment

#### Deployed contracts

- Mainnet vsfrxETH_LiquidStakedETH: [0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E](https://etherscan.io/address/0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E)
- Sepolia vsfrxETH_LiquidStakedETH: [0x83F63118dcAAdAACBFF36D78ffB88dd474309e70](https://sepolia.etherscan.io/address/0x83F63118dcAAdAACBFF36D78ffB88dd474309e70)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/302)
- Code of [SFrxETHOracle](https://github.com/VenusProtocol/oracle/blob/36f63b5e1199f7da589780357e9a7772eac72e2f/contracts/oracles/SFrxETHOracle.sol)
- [Documentation](https://docs-v4.venus.io/risk/resilient-price-oracle)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x37468f0cf5b168e69e669ab9dc616d75424bf8d5bc2f5399e58d76b94a968fff) multisig transaction will be executed. Otherwise, it will be rejected.`,
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

export default vip322;
