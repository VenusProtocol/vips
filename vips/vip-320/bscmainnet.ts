import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vip320 = () => {
  const meta = {
    version: "v2",
    title: "VIP-320 [Arbitrum] Configuration of markets",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Configure the Venus markets on Arbitrum one, for [WBTC](https://arbiscan.io/address/0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f), [WETH](https://arbiscan.io/address/0x82af49447d8a07e3bd95bd0d56f35241523fbab1), [USDC](https://arbiscan.io/address/0xaf88d065e77c8cc2239327c5edb3a432268e5831), [USDT](https://arbiscan.io/address/0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9) and [ARB](https://arbiscan.io/address/0x912ce59144191c1204e64559fe8253a0e49e6548)
- Configure the [ProtocolShareReserve](https://arbiscan.io/address/0xF9263eaF7eB50815194f26aCcAB6765820B13D41) contract on Arbitrum one
- Configure the [NativeTokenGateway](https://arbiscan.io/address/0xc8e51418cadc001157506b306C6d0b878f1ff755) contact for the Venus market of WETH, accepting deposits and withdrawals of ETH
- Configure the [Prime](https://arbiscan.io/address/0xFE69720424C954A2da05648a0FAC84f9bf11Ef49) contract on Arbitrum one, allowing users to stake XVS into the XVSVault to start their qualification period

#### Description

Following the [Chaos labs recommendations](https://community.venus.io/t/vrc-deploy-venus-protocol-on-arbitrum/3721/7), if passed, this VIP will enable the following Venus markets on Arbitrum one:

Underlying token: [WBTC](https://arbiscan.io/address/0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f)

- Borrow cap: 500
- Supply cap: 900
- Collateral factor: 0.75
- Liquidation threshold: 0.8
- Reserve factor: 0.2
- Bootstrap liquidity: 0.0731263 WBTC - provided by the Venus Treasury

Underlying token: [WETH](https://arbiscan.io/address/0x82af49447d8a07e3bd95bd0d56f35241523fbab1)

- Borrow cap: 23,500
- Supply cap: 26,000
- Collateral factor: 0.75
- Liquidation threshold: 0.8
- Reserve factor: 0.2
- Bootstrap liquidity: 1.317651 WETH - provided by the Venus Treasury

Underlying token: [USDC](https://arbiscan.io/address/0xaf88d065e77c8cc2239327c5edb3a432268e5831)

- Borrow cap: 49,000,000
- Supply cap: 54,000,000
- Collateral factor: 0.78
- Liquidation threshold: 0.8
- Reserve factor: 0.1
- Bootstrap liquidity: 5,000 USDC - provided by the Venus Treasury

Underlying token: [USDT](https://arbiscan.io/address/0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9)

- Borrow cap: 18,000,000
- Supply cap: 20,000,000
- Collateral factor: 0.78
- Liquidation threshold: 0.8
- Reserve factor: 0.1
- Bootstrap liquidity: 5,000 USDT - provided by the Venus Treasury

Underlying token: [ARB](https://arbiscan.io/address/0x912ce59144191c1204e64559fe8253a0e49e6548)

- Borrow cap: 9,000,000
- Supply cap: 16,000,000
- Collateral factor: 0.55
- Liquidation threshold: 0.6
- Reserve factor: 0.2
- Bootstrap liquidity: 4,453 ARB - provided by the Venus Treasury

Initial interest rate curves for the new markets:

- Underlying token: WBTC, ARB
    - kink: 0.45
    - base (yearly): 0
    - multiplier (yearly): 0.15
    - jump multiplier (yearly): 2.5
- Underlying token: USDC, USDT
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.0875
    - jump multiplier (yearly): 2.5
- Underlying token: WETH
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.035
    - jump multiplier (yearly): 2.5

Initial risk parameters for the new pool:

- Close factor: 50%
- Liquidation incentive: 10%

The following steps on the Arbitrum deployment are:

1. Configure and pause the XVS vault ([VIP-319](https://app.venus.io/#/governance/proposal/319))
2. Enable the Venus markets and configure Prime on Arbitrum one (this VIP)
3. Transfer XVS from BNB Chain to Arbitrum one, that will be used for the rewards
4. Enable rewards on the XVS vault and on the Venus markets

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, checking ownership of the contracts and validating the usual operations on the markets
- **Deployment on testnet**: the same contracts have been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Audits**: Certik, Quantstamp and Fairyproof have audited the code specific for Arbitrum one

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/088_timeBased_certik_20240117.pdf) (2024/01/17)
- [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/470416836922656783eab52ded54744489e8c345/audits/089_timeBased_quantstamp_20240319.pdf) (2024/03/19)
- [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/094_timeBased_fairyproof_20240304.pdf) (2024/03/04)

#### Deployed contracts on Arbitrum one

- Pool registry: [0x382238f07Bc4Fe4aA99e561adE8A4164b5f815DA](https://arbiscan.io/address/0x382238f07Bc4Fe4aA99e561adE8A4164b5f815DA)
- Comptroller: [0x317c1A5739F39046E20b08ac9BeEa3f10fD43326](https://arbiscan.io/address/0x317c1A5739F39046E20b08ac9BeEa3f10fD43326)
- Markets:
    - vWBTC_Core: [0xaDa57840B372D4c28623E87FC175dE8490792811](https://arbiscan.io/address/0xaDa57840B372D4c28623E87FC175dE8490792811)
    - vWETH_Core: [0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0](https://arbiscan.io/address/0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0)
    - vUSDC_Core: [0x7D8609f8da70fF9027E9bc5229Af4F6727662707](https://arbiscan.io/address/0x7D8609f8da70fF9027E9bc5229Af4F6727662707)
    - vUSDT_Core: [0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD](https://arbiscan.io/address/0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD)
    - vARB_Core: [0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6](https://arbiscan.io/address/0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6)
- [ProtocolShareReserve](https://arbiscan.io/address/0xF9263eaF7eB50815194f26aCcAB6765820B13D41)
- [NativeTokenGateway](https://arbiscan.io/address/0xc8e51418cadc001157506b306C6d0b878f1ff755)
- [Prime](https://arbiscan.io/address/0xFE69720424C954A2da05648a0FAC84f9bf11Ef49)
- [PrimeLiquidityProvider](https://arbiscan.io/address/0x86bf21dB200f29F21253080942Be8af61046Ec29)

#### References

- [VIP simulation - adding Venus markets](https://github.com/VenusProtocol/vips/pull/248)
- [VIP simulation - ProtocolShareReserve](https://github.com/VenusProtocol/vips/pull/251)
- [VIP simulation - NativeTokenGateway](https://github.com/VenusProtocol/vips/pull/252)
- [VIP simulation - Prime](https://github.com/VenusProtocol/vips/pull/264)
- [[VRC] Deploy Venus Protocol on Arbitrum](https://community.venus.io/t/vrc-deploy-venus-protocol-on-arbitrum/3721)
- Snapshot ["Deploy Venus Protocol on Arbitrum"](https://snapshot.org/#/venus-xvs.eth/proposal/0xfc1f42609bda5d7d14660b0b91b19ca63ea1b2ea50169ddab79adfbfbdce323f)
- [Documentation](https://docs-v4.venus.io/)

#### Disclaimer for Arbitrum one VIPs

Privilege commands on Arbitrum one will be executed by the [Guardian wallet](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x7f02a5a663c147347fa5e728bfebbbd784fd27e5765f50e310e776bbcd23b47d&safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0), [this](https://app.safe.global/transactions/tx?id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0xd50cedf02ecd61a5d8df7cd3a8049a8d9dde8f66526723aac80fb29d17627f59&safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0), [this](https://app.safe.global/transactions/tx?id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x060e8b3f3044c2b7348f2a107b147d0716c4daf9011ebb211607223802ac7f5b&safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0) and [this](https://app.safe.global/transactions/tx?id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x888df86d2fd88dc17a8a32254c69133f791850bf58c6e4d67714311463321150&safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0) multisig transactions will be executed. Otherwise, they will be rejected.`,
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

export default vip320;
