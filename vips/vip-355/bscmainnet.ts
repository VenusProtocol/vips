import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vip355 = () => {
  const meta = {
    version: "v2",
    title: "VIP-355 [Ethereum] New weETHs market in the Liquid Staked ETH pool",
    description: `#### Summary

If passed, following the Community proposal “[Support weETHs collateral on Venus on ETH Mainnet](https://community.venus.io/t/support-weeths-collateral-on-venus-on-eth-mainnet/4493)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xc0bfe98cfcfa95aff48c9503f1c0b866a94454e89a06e19be6faf55149c8bc6b), this VIP adds a market for [weETHs](https://etherscan.io/token/0x917cee801a67f933f2e6b33fc0cd1ed2d5909d88) ([ether.fi](http://ether.fi/)) into the Liquid Staked ETH pool on Ethereum.

#### Risk parameters

Following [Chaos Labs recommendations](https://community.venus.io/t/support-weeths-collateral-on-venus-on-eth-mainnet/4493/4), the risk parameters for the new market are:

Underlying token: [weETHs](https://etherscan.io/token/0x917cee801a67f933f2e6b33fc0cd1ed2d5909d88)

- Borrow cap: 0
- Supply cap: 180
- Collateral factor: 80%
- Liquidation threshold: 85%
- Reserve factor: 25%

Bootstrap liquidity: 10 weETHs - provided by [ether.fi](http://ether.fi/).

Interest rate curve for the new market:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 75%

#### Oracles configuration

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Ethereum](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94) is used for weETHs, with the following configuration. The new WeETHAccountantOracle is used to get the USD price of weETHs, first getting the conversion rate weETHs/WETH from the Accountant contract, managed by ether.fi, and then getting the USD price using the [Chainlink price feed for ETH/USD](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419).

- MAIN oracle
    - Contract: [WeETHAccountantOracle](https://etherscan.io/address/0x132f91AA7afc590D591f168A780bB21B4c29f577)
    - CORRELATED_TOKEN: [weETHs](https://etherscan.io/token/0x917cee801a67f933f2e6b33fc0cd1ed2d5909d88)
    - UNDERLYING_TOKEN: [WETH](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
    - ACCOUNTANT: [0xbe16605B22a7faCEf247363312121670DFe5afBE](https://etherscan.io/address/0xbe16605B22a7faCEf247363312121670DFe5afBE)

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Certik](https://github.com/VenusProtocol/oracle/blob/93a79c97e867f61652fc063abb5df323acc9bed4/audits/116_WeETHAccountantOracle_certik_20240823.pdf) has audited the WeETHAccountantOracle.
- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Liquid Staked ETH pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to sepolia, and used in the Venus Protocol testnet deployment

#### Deployed contracts

- Mainnet vweETHs_LiquidStakedETH: [0xEF26C64bC06A8dE4CA5D31f119835f9A1d9433b9](https://etherscan.io/address/0xEF26C64bC06A8dE4CA5D31f119835f9A1d9433b9)
- Testnet vweETHs_LiquidStakedETH: [0xB3A201887396F57bad3fF50DFd02022fE1Fd1774](https://sepolia.etherscan.io/address/0xB3A201887396F57bad3fF50DFd02022fE1Fd1774)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/357)
- [Code of WeETHAccountantOracle](https://github.com/VenusProtocol/oracle/blob/develop/contracts/oracles/WeETHAccountantOracle.sol)
- [Deployment to sepolia](https://sepolia.etherscan.io/tx/0x516b4e1015ac798051b9a04139b45c94137b80c78872566f95bdcff406d46a6a)
- [Documentation](https://docs-v4.venus.io/risk/resilient-price-oracle#correlated-token-oracles)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xfb324c6722a8b22f2452f0cfdb70d86fc4d2309e626a87b7bafaaa7b2007fec8) multisig transaction will be executed. Otherwise, it will be rejected.`,
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

export default vip355;
