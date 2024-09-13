import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vip290 = () => {
  const meta = {
    version: "v2",
    title: "VIP-290 Ethereum: new weETH market in the Liquid Staked ETH pool",
    description: `#### Summary

If passed, following the Community proposal “[Proposal: Support weETH collateral on Venus on ETH Mainnet](https://community.venus.io/t/proposal-support-weeth-collateral-on-venus-on-eth-mainnet/4128)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x8bbdf216c0326b3ad55b75a7c171232f38309675536113e7746cfb021f409807), this VIP adds a market for the [weETH](https://etherscan.io/token/0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee) token into the Liquid Staked ETH pool on Ethereum.

#### Risk parameters

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-support-weeth-collateral-on-venus-on-eth-mainnet/4128/11), the risk parameters for the new market are:

Underlying token: [weETH](https://etherscan.io/token/0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee)

- Borrow cap: 750
- Supply cap: 7,500
- Collateral factor: 90%
- Liquidation threshold: 93%
- Reserve factor: 20%

Bootstrap liquidity: 2.76 weETH - provided by the [Ether.fi](https://ether.fi/) team.

Interest rate curve for the new market:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 75%

#### Liquidity Mining Rewards

5,000 [USDC](https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48) for 30 days, provided by the [Ether.fi](https://ether.fi/) team. 100% for suppliers in the new weETH market.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Quantstamp](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/100_correlated_token_oracles_quantstamp_20240412.pdf), [Certik](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/098_correlated_token_oracles_certik_20240412.pdf) and [Fairyproof](https://github.com/VenusProtocol/oracle/blob/5cd52976a4c4d24e11ab34ca3aa5f99837eef593/audits/101_correlated_token_oracles_fairyproof_20240328.pdf) have audited the WeETHOracle.
- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Liquid Staked ETH pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to sepolia, and used in the Venus Protocol testnet deployment
- **Oracles**: following the approach exposed in the community post “[Two-Step Oracle Method for Accurate LST Pricing](https://community.venus.io/t/two-step-oracle-method-for-accurate-lst-pricing/4094)”, the WeETHOracle contract used to calculate the USD price of weETH first gets the eETH price using on-chain information, and then gets the USD price using the [Chainlink price feed for ETH/USD](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419) (assuming 1 ETH = 1 eETH). There is a secondary oracle deployed, only used for monitoring discrepancies, getting the weETH/USD price using first the [Chainlink price feed for weETH/ETH](https://etherscan.io/address/0x5c9C449BbC9a6075A2c061dF312a35fd1E05fF22) and then the [Chainlink price feed for ETH/USD](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419).

#### Contracts on mainnet

- New market vweETH_LiquidStakedETH: [0xb4933AF59868986316Ed37fa865C829Eba2df0C7](https://etherscan.io/address/0xb4933AF59868986316Ed37fa865C829Eba2df0C7)
- RewardsDistributor: [0xDCB0CfA130496c749738Acbe2d6aA06C7C320f06](https://etherscan.io/address/0xDCB0CfA130496c749738Acbe2d6aA06C7C320f06)
- Oracle WeETHOracle: [0xEa687c54321Db5b20CA544f38f08E429a4bfCBc8](https://etherscan.io/address/0xEa687c54321Db5b20CA544f38f08E429a4bfCBc8)
- Oracle WeETHOracle using market price: [0x660c6d8c5fddc4f47c749e0f7e03634513f23e0e](https://etherscan.io/address/0x660c6d8c5fddc4f47c749e0f7e03634513f23e0e)

#### Contracts on testnet

- New market vweETH_LiquidStakedETH: [0x30c31bA6f4652B548fe7a142A949987c3f3Bf80b](https://sepolia.etherscan.io/address/0x30c31bA6f4652B548fe7a142A949987c3f3Bf80b)
- RewardsDistributor: [0x92e8E3C202093A495e98C10f9fcaa5Abe288F74A](https://sepolia.etherscan.io/address/0x92e8E3C202093A495e98C10f9fcaa5Abe288F74A)
- Oracle WeETHOracle: [0xc7b78b5c1433C81c455CD1e9A68FF18764acbCe1](https://sepolia.etherscan.io/address/0xc7b78b5c1433C81c455CD1e9A68FF18764acbCe1)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/256)
- [New WeETHOracle](https://github.com/VenusProtocol/oracle/pull/165)
- [Documentation](https://docs-v4.venus.io/deployed-contracts/oracles)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this multisig transaction](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x27a9da650b3e95a1ea56938d93004df27f9a5388a8378fa85822c41d98dc9d5c) will be executed. Otherwise, it will be rejected.`,
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

export default vip290;
