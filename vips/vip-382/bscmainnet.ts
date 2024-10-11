import { NORMAL_TIMELOCK } from "src/vip-framework";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vip382 = () => {
  const meta = {
    version: "v2",
    title: "VIP-382 [Optimism] Markets configuration",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Configure the Venus markets on Optimism, for [WBTC](https://optimistic.etherscan.io/address/0x68f180fcCe6836688e9084f035309E29Bf0A2095), [WETH](https://optimistic.etherscan.io/address/0x4200000000000000000000000000000000000006), [USDC](https://optimistic.etherscan.io/address/0x0b2c639c533813f4aa9d7837caf62653d097ff85), [USDT](https://optimistic.etherscan.io/address/0x94b008aA00579c1307B0EF2c499aD98a8ce58e58) and [OP](https://optimistic.etherscan.io/address/0x4200000000000000000000000000000000000042)
- Configure the [ProtocolShareReserve](https://optimistic.etherscan.io/address/0x735ed037cB0dAcf90B133370C33C08764f88140a) contract on Optimism
- Configure the [NativeTokenGateway](https://optimistic.etherscan.io/address/0x5B1b7465cfDE450e267b562792b434277434413c) contact for the Venus market of WETH, accepting deposits and withdrawals of ETH
- Configure the [Prime](https://optimistic.etherscan.io/address/0xE76d2173546Be97Fa6E18358027BdE9742a649f7) contract on Optimism, allowing users to stake XVS into the XVSVault to start their qualification period

#### Description

Following the [Chaos labs recommendations](https://community.venus.io/t/deploy-venus-protocol-on-op-mainnet/4512/9), if passed, this VIP will enable the following Venus markets on Optimism:

Underlying token: [WBTC](https://optimistic.etherscan.io/address/0x68f180fcCe6836688e9084f035309E29Bf0A2095)

- Borrow cap: 50
- Supply cap: 100
- Collateral factor: 0.68
- Liquidation threshold: 0.73
- Reserve factor: 0.2
- Bootstrap liquidity: 0.07575825 WBTC - provided by the Venus Treasury

Underlying token: [WETH](https://optimistic.etherscan.io/address/0x4200000000000000000000000000000000000006)

- Borrow cap: 2,700
- Supply cap: 3,000
- Collateral factor: 0.75
- Liquidation threshold: 0.8
- Reserve factor: 0.2
- Bootstrap liquidity: 1.862 WETH - provided by the Venus Treasury

Underlying token: [USDC](https://optimistic.etherscan.io/address/0x0b2c639c533813f4aa9d7837caf62653d097ff85)

- Borrow cap: 9,000,000
- Supply cap: 10,000,000
- Collateral factor: 0.75
- Liquidation threshold: 0.78
- Reserve factor: 0.1
- Bootstrap liquidity: 5,000 USDC - provided by the Venus Treasury

Underlying token: [USDT](https://optimistic.etherscan.io/address/0x94b008aA00579c1307B0EF2c499aD98a8ce58e58)

- Borrow cap: 3,600,000
- Supply cap: 4,000,000
- Collateral factor: 0.75
- Liquidation threshold: 0.78
- Reserve factor: 0.1
- Bootstrap liquidity: 4,998.602 USDT - provided by the Venus Treasury

Underlying token: [OP](https://optimistic.etherscan.io/address/0x4200000000000000000000000000000000000042)

- Borrow cap: 1,500,000
- Supply cap: 3,000,000
- Collateral factor: 0.58
- Liquidation threshold: 0.63
- Reserve factor: 0.2
- Bootstrap liquidity: 2,641.144 OP - provided by the Venus Treasury

Initial interest rate curves for the new markets:

- Underlying token: WBTC, OP
    - kink: 0.45
    - base (yearly): 0
    - multiplier (yearly): 0.15
    - jump multiplier (yearly): 2.5
- Underlying token: USDC, USDT
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.06875
    - jump multiplier (yearly): 2.5
- Underlying token: WETH
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.035
    - jump multiplier (yearly): 2.5

Initial risk parameters for the new pool:

- Close factor: 50%
- Liquidation incentive: 10%

The following steps on the Optimism deployment are:

1. Configure and pause the XVS vault ([VIP-374](https://app.venus.io/#/governance/proposal/374?chainId=56))
2. Enable the Venus markets and configure Prime on Optimism (this VIP)
3. Transfer XVS from BNB Chain to Optimism, that will be used for the rewards
4. Enable rewards on the XVS vault and on the Venus markets

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation:** in a simulation environment, checking ownership of the contracts and validating the usual operations on the markets
- **Deployment on testnet:** the same contracts have been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Audit:** Certik, Quantstamp and Fairyproof have audited the code specific for Optimism

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/088_timeBased_certik_20240117.pdf) (2024/01/17)
- [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/470416836922656783eab52ded54744489e8c345/audits/089_timeBased_quantstamp_20240319.pdf) (2024/03/19)
- [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/094_timeBased_fairyproof_20240304.pdf) (2024/03/04)

#### Deployed contracts on Optimism

- Pool registry: [0x147780799840d541C1d7c998F0cbA996d11D62bb](https://optimistic.etherscan.io/address/0x147780799840d541C1d7c998F0cbA996d11D62bb)
- Comptroller: [0x5593FF68bE84C966821eEf5F0a988C285D5B7CeC](https://optimistic.etherscan.io/address/0x5593FF68bE84C966821eEf5F0a988C285D5B7CeC)
- Markets:
    - vWBTC_Core: [0x9EfdCfC2373f81D3DF24647B1c46e15268884c46](https://optimistic.etherscan.io/address/0x9EfdCfC2373f81D3DF24647B1c46e15268884c46)
    - vWETH_Core: [0x66d5AE25731Ce99D46770745385e662C8e0B4025](https://optimistic.etherscan.io/address/0x66d5AE25731Ce99D46770745385e662C8e0B4025)
    - vUSDC_Core: [0x1C9406ee95B7af55F005996947b19F91B6D55b15](https://optimistic.etherscan.io/address/0x1C9406ee95B7af55F005996947b19F91B6D55b15)
    - vUSDT_Core: [0x37ac9731B0B02df54975cd0c7240e0977a051721](https://optimistic.etherscan.io/address/0x37ac9731B0B02df54975cd0c7240e0977a051721)
    - vOP_Core: [0x6b846E3418455804C1920fA4CC7a31A51C659A2D](https://optimistic.etherscan.io/address/0x6b846E3418455804C1920fA4CC7a31A51C659A2D)
- [ProtocolShareReserve](https://optimistic.etherscan.io/address/0x735ed037cB0dAcf90B133370C33C08764f88140a)
- [NativeTokenGateway](https://optimistic.etherscan.io/address/0x5B1b7465cfDE450e267b562792b434277434413c)
- [Prime](https://optimistic.etherscan.io/address/0xE76d2173546Be97Fa6E18358027BdE9742a649f7)
- [PrimeLiquidityProvider](https://optimistic.etherscan.io/address/0x6412f6cd58D0182aE150b90B5A99e285b91C1a12)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/404)
- [Deploy Venus Protocol on OP Mainnet](https://community.venus.io/t/deploy-venus-protocol-on-op-mainnet/4512)
- Snapshot ["Deploy Venus Protocol to OP Mainnet"](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xe2e59410d7c010600ec869132980f10a8694d78e9ece4b3702f973d1e0ecc93f)
- [Documentation](https://docs-v4.venus.io/)

#### Disclaimer for Optimism VIPs

Privilege commands on Optimism will be executed by the [Guardian wallet](https://optimistic.etherscan.io/address/0x2e94dd14E81999CdBF5deDE31938beD7308354b3), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=oeth:0x2e94dd14E81999CdBF5deDE31938beD7308354b3&id=multisig_0x2e94dd14E81999CdBF5deDE31938beD7308354b3_0x6a8b48597e340c117e433c463aec73003ede82b9455a4411f7c16d245a7c0c54), [this](https://app.safe.global/transactions/tx?safe=oeth:0x2e94dd14E81999CdBF5deDE31938beD7308354b3&id=multisig_0x2e94dd14E81999CdBF5deDE31938beD7308354b3_0x7356431c214c5b4a013dbe4b0fdef58f1e584d73d4a99ce5f51503f5f5e4cf13) and [this](https://app.safe.global/transactions/tx?safe=oeth:0x2e94dd14E81999CdBF5deDE31938beD7308354b3&id=multisig_0x2e94dd14E81999CdBF5deDE31938beD7308354b3_0x0bf3ab582dab1560bd6aa27c9af64f0ff6364ec3d1c5fffd3fee513b7fda9ef3) multisig transactions will be executed. Otherwise, they will be rejected.
`,
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

export default vip382;
