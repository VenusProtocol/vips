import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const vip363 = () => {
  const meta = {
    version: "v2",
    title: "VIP-363 [Arbitrum] Add Liquid Staked ETH pool to Arbitrum one",
    description: `#### Summary

If passed, this VIP will perform the following actions:

* Add pool "Liquid Staked ETH" to the [PoolRegistry contract](https://arbiscan.io/address/0x382238f07Bc4Fe4aA99e561adE8A4164b5f815DA) on Arbitrum one
* Add the following markets to the new pool, following the [Chaos labs recommendations](https://community.venus.io/t/chaos-labs-launch-parameters-for-liquid-staked-eth-pool-on-arbitrum-06-08-24/4514):
    * [WETH](https://arbiscan.io/address/0x82af49447d8a07e3bd95bd0d56f35241523fbab1)
    * [wstETH](https://arbiscan.io/address/0x5979D7b546E38E414F7E9822514be443A4800529)
    * [weETH](https://arbiscan.io/address/0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe)

#### Description

Initial risk parameters for the new pool:

* Close factor: 50%
* Liquidation incentive: 2%

#### Risk parameters of the new markets

Underlying token: [WETH](https://arbiscan.io/address/0x82af49447d8a07e3bd95bd0d56f35241523fbab1)

* Borrow cap: 14,000
* Supply cap: 12,500
* Collateral factor: 0
* Liquidation threshold: 0
* Reserve factor: 0.2
* Bootstrap liquidity: 1.9678 WETH - provided by the [Venus Treasury](https://arbiscan.io/address/0x8a662ceac418daef956bc0e6b2dd417c80cda631)
* Interest rates:
    * kink: 0.8
    * base (yearly): 0
    * multiplier (yearly): 0.035
    * jump multiplier (yearly): 0.8

Underlying token: [wstETH](https://arbiscan.io/address/0x5979D7b546E38E414F7E9822514be443A4800529)

* Borrow cap: 8,000
* Supply cap: 800
* Collateral factor: 0.93
* Liquidation threshold: 0.95
* Reserve factor: 0.25
* Bootstrap liquidity: 3.55 wstETH - provided by the [Lido project](https://arbiscan.io/address/0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61)
* Interest rates:
    * kink: 0.45
    * base (yearly): 0
    * multiplier (yearly): 0.09
    * jump multiplier (yearly): 3

Underlying token: [weETH](https://arbiscan.io/address/0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe)

* Borrow cap: 4,600
* Supply cap: 2,300
* Collateral factor: 0.93
* Liquidation threshold: 0.95
* Reserve factor: 0.25
* Bootstrap liquidity: 4 weETH - provided by the [Ether.fi project](https://arbiscan.io/address/0x46cba1e9b1e5db32da28428f2fb85587bcb785e7)
* Interest rates:
    * kink: 0.45
    * base (yearly): 0
    * multiplier (yearly): 0.09
    * jump multiplier (yearly): 3

#### Liquidity mining rewards

Following the “[Incentive Model Proposal for Arbitrum Deployment](https://community.venus.io/t/incentive-model-proposal-for-arbitrum-deployment/4408)” proposal, the follow rewards will be configured for the new markets:

* wstETH: 2,550 XVS for 90 days - 100% suppliers
* weETH: 2,550 XVS for 90 days - 100% suppliers
* WETH: 10,200 XVS for 90 days - 30% suppliers / 70% borrowers

The source of the XVS (15,300 XVS total) is the [Venus Treasury on Arbitrum one](https://arbiscan.io/address/0x8a662ceac418daef956bc0e6b2dd417c80cda631)

#### Security and additional considerations

We applied the following security procedures for this upgrade:

* **No changes in the deployed code.** The deployed contracts (markets, rewards, comptroller, etc.) have not been modified. It’s the same codebase used for the Core pool on Arbitrum one
* **Audit:** Certik, Peckshield, Hacken and Code4rena have audited the deployed code
* **VIP execution simulation:** in a simulation environment, validating the markets are properly added to the pool with the right parameters and the expected bootstrap liquidity
* **Deployment on testnet:** the same pool has been deployed to testnet, and used in the Venus Protocol testnet deployment
* **Fork tests:** in a simulation environment, verifying the main actions of the protocol are executable as expected with real data

The ownership of every contract has been transferred to Governance.

#### Audit reports

* [Certik audit report](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/036_isolatedPools_certik_20230619.pdf) (2023/June/19)
* [Code4rena contest](https://code4rena.com/contests/2023-05-venus-protocol-isolated-pools) (2023/May/05)
* [Hacken audit report](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/016_isolatedPools_hacken_20230426.pdf) (2023/April/26)
* [Peckshield audit report 1](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/003_isolatedPools_peckshield_20230112.pdf) (2023/January/12)
* [Peckshield audit report 2](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/037_isolatedPools_peckshield_20230625.pdf) (2023/June/25)

#### Contracts on mainnet

* Comptroller: [0x52bAB1aF7Ff770551BD05b9FC2329a0Bf5E23F16](https://arbiscan.io/address/0x52bAB1aF7Ff770551BD05b9FC2329a0Bf5E23F16)
* Markets:
    * VToken_vWETH_LiquidStakedETH: [0x39D6d13Ea59548637104E40e729E4aABE27FE106](https://arbiscan.io/address/0x39D6d13Ea59548637104E40e729E4aABE27FE106)
    * VToken_vweETH_LiquidStakedETH: [0x246a35E79a3a0618535A469aDaF5091cAA9f7E88](https://arbiscan.io/address/0x246a35E79a3a0618535A469aDaF5091cAA9f7E88)
    * VToken_vwstETH_LiquidStakedETH: [0x9df6B5132135f14719696bBAe3C54BAb272fDb16](https://arbiscan.io/address/0x9df6B5132135f14719696bBAe3C54BAb272fDb16)
* NativeTokenGateway: [0xD1e89806BAB8Cd7680DFc7425D1fA6d7D5F0C3FE](https://arbiscan.io/address/0xD1e89806BAB8Cd7680DFc7425D1fA6d7D5F0C3FE)

#### Contracts on testnet

* Comptroller: [0x3D04F926b2a165BBa17FBfccCCB61513634fa5e4](https://sepolia.arbiscan.io/address/0x3D04F926b2a165BBa17FBfccCCB61513634fa5e4)
* Markets:
    * VToken_vWETH_LiquidStakedETH: [0xd7057250b439c0849377bB6C3263eb8f9cf49d98](https://sepolia.arbiscan.io/address/0xd7057250b439c0849377bB6C3263eb8f9cf49d98)
    * VToken_vweETH_LiquidStakedETH: [0x75f841b14305935D8D7E806f249D9FA52EF1550B](https://sepolia.arbiscan.io/address/0x75f841b14305935D8D7E806f249D9FA52EF1550B)
    * VToken_vwstETH_LiquidStakedETH: [0x253515E19e8b888a4CA5a0a3363B712402ce4046](https://sepolia.arbiscan.io/address/0x253515E19e8b888a4CA5a0a3363B712402ce4046)
* NativeTokenGateway: [0x63cEE24b12648E36d708163587aC17a777096a47](https://sepolia.arbiscan.io/address/0x63cEE24b12648E36d708163587aC17a777096a47)

#### References

* [Repository](https://github.com/VenusProtocol/isolated-pools)
* [VIP simulation](https://github.com/VenusProtocol/vips/pull/366)
* [Chaos labs recommendations](https://community.venus.io/t/chaos-labs-launch-parameters-for-liquid-staked-eth-pool-on-arbitrum-06-08-24/4514)
* Snapshot “[Deployment of New Liquid Staked ETH Isolated Pools on BNB Chain and Arbitrum](https://snapshot.org/#/venus-xvs.eth/proposal/0x4ed323fc73862e547b84f9d9a0458a1b6698ea63facbc162a8c3d3ee48c6af47)”
* Snapshot “[Incentive Model Proposal for Arbitrum Deployment](https://snapshot.org/#/venus-xvs.eth/proposal/0x3afa725eab1907db932650d017eede9eff93f8cc5289ee351e2604b326d1420b)”
* [Documentation](https://docs.venus.io/whats-new/isolated-pools) 

#### Disclaimer for Arbitrum one VIPs

Privilege commands on Arbitrum one will be executed by the [Guardian wallet](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x3ebae884a0189141ce4e178b53e04b0c2a6f996ea40115f613b0a671dc5b37ad) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "Process to configure and launch the new Isolated pool",
    againstDescription: "Defer configuration and launch of the new Isolated pool",
    abstainDescription: "No opinion on the matter",
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

export default vip363;
