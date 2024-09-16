import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const vip365 = () => {
  const meta = {
    version: "v2",
    title: "VIP-365 [zkSync] Configuration of markets and Prime, and enable XVS Vault",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Configure the XVS Vault on zkSync Era, including the changes described in the [VIP-360](https://app.venus.io/#/governance/proposal/360)
- Configure the Venus markets on zkSync Era, for [WBTC](https://explorer.zksync.io/address/0xbbeb516fb02a01611cbbe0453fe3c580d7281011), [WETH](https://era.zksync.network/token/0x5aea5775959fbc2557cc8789bc1bf90a239d9a91), [USDC.e](https://explorer.zksync.io/address/0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4), [USDT](https://explorer.zksync.io/address/0x493257fd37edb34451f62edf8d2a0c418852ba4c) and [ZK](https://explorer.zksync.io/address/0x5a7d6b2f92c77fad6ccabd7ee0624e64907eaf3e)
- Configure the [ProtocolShareReserve](https://explorer.zksync.io/address/0xA1193e941BDf34E858f7F276221B4886EfdD040b) contract on zkSync Era
- Configure the [NativeTokenGateway](https://explorer.zksync.io/address/0xeEDE4e1BDaC489BD851970bE3952B729C4238A68) contact for the Venus market of WETH, accepting deposits and withdrawals of ETH
- Configure the [Prime](https://explorer.zksync.io/address/0xdFe62Dcba3Ce0A827439390d7d45Af8baE599978) contract on zkSync Era, allowing users to stake XVS into the XVSVault to start their qualification period

#### Description

Following the [Chaos labs recommendations](https://community.venus.io/t/deploy-venus-protocol-on-zksync-era/4472/12), if passed, this VIP will enable the following Venus markets on zkSync Era:

Underlying token: [WBTC](https://explorer.zksync.io/address/0xbbeb516fb02a01611cbbe0453fe3c580d7281011)

- Borrow cap: 20
- Supply cap: 40
- Collateral factor: 0.77
- Liquidation threshold: 0.8
- Reserve factor: 0.25
- Bootstrap liquidity: 0.075 WBTC - provided by the Venus Treasury

Underlying token: [WETH](https://era.zksync.network/token/0x5aea5775959fbc2557cc8789bc1bf90a239d9a91)

- Borrow cap: 1,700
- Supply cap: 2,000
- Collateral factor: 0.77
- Liquidation threshold: 0.8
- Reserve factor: 0.25
- Bootstrap liquidity: 1.5 WETH - provided by the Venus Treasury

Underlying token: [USDC.e](https://explorer.zksync.io/address/0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4)

- Borrow cap: 4,200,000
- Supply cap: 5,000,000
- Collateral factor: 0.72
- Liquidation threshold: 0.75
- Reserve factor: 0.1
- Bootstrap liquidity: 5,000 USDC.e - provided by the Venus Treasury

Underlying token: [USDT](https://explorer.zksync.io/address/0x493257fd37edb34451f62edf8d2a0c418852ba4c)

- Borrow cap: 3,300,000
- Supply cap: 4,000,000
- Collateral factor: 0.77
- Liquidation threshold: 0.8
- Reserve factor: 0.1
- Bootstrap liquidity: 5,000 USDT - provided by the Venus Treasury

Underlying token: [ZK](https://explorer.zksync.io/address/0x5a7d6b2f92c77fad6ccabd7ee0624e64907eaf3e)

- Borrow cap: 12,500,000
- Supply cap: 25,000,000
- Collateral factor: 0.35
- Liquidation threshold: 0.4
- Reserve factor: 0.25
- Bootstrap liquidity: 25,000 ZK - provided by the Venus Treasury

Initial interest rate curves for the new markets:

- Underlying token: WBTC
    - kink: 0.45
    - base (yearly): 0
    - multiplier (yearly): 0.09
    - jump multiplier (yearly): 2
- Underlying token: WETH
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.0425
    - jump multiplier (yearly): 0.8
- Underlying token: USDC.e, USDT
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.0875
    - jump multiplier (yearly): 0.8
- Underlying token: ZK
    - kink: 0.45
    - base (yearly): 0.02
    - multiplier (yearly): 0.2
    - jump multiplier (yearly): 3

Initial risk parameters for the new pool:

- Close factor: 50%
- Liquidation incentive: 10%

Oracles:

- WBTC: [Chainlink](https://explorer.zksync.io/address/0x4Cba285c15e3B540C474A114a7b135193e4f1EA6) (main)
- WETH: [Chainlink](https://explorer.zksync.io/address/0x6D41d1dc818112880b40e26BD6FD347E41008eDA) (main)
- USDC.e: [Chainlink](https://explorer.zksync.io/address/0x1824D297C6d6D311A204495277B63e943C2D376E) (main)
- USDT: [Chainlink](https://explorer.zksync.io/address/0xB615075979AE1836B476F651f1eB79f0Cd3956a9) (main)
- ZK: [RedStone](https://explorer.zksync.io/address/0x5efDb74da192584746c96EcCe138681Ec1501218) (main) and [Chainlink](https://explorer.zksync.io/address/0xD1ce60dc8AE060DDD17cA8716C96f193bC88DD13) (pivot and fallback)

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation:** in a simulation environment, checking ownership of the contracts and validating the usual operations on the markets
- **Deployment on testnet:** the same contracts have been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Audit:** Certik, Quantstamp and Fairyproof have audited the deployed code

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/088_timeBased_certik_20240117.pdf) (2024/01/17)
- [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/470416836922656783eab52ded54744489e8c345/audits/089_timeBased_quantstamp_20240319.pdf) (2024/03/19)
- [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/094_timeBased_fairyproof_20240304.pdf) (2024/03/04)

#### Deployed contracts on zkSync Era

- Pool registry: [0xFD96B926298034aed9bBe0Cca4b651E41eB87Bc4](https://explorer.zksync.io/address/0xFD96B926298034aed9bBe0Cca4b651E41eB87Bc4)
- Comptroller: [0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1](https://explorer.zksync.io/address/0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1)
- Markets:
    - vWBTC_Core: [0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719](https://explorer.zksync.io/address/0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719)
    - vWETH_Core: [0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8](https://explorer.zksync.io/address/0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8)
    - vUSDC.e_Core: [0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D](https://explorer.zksync.io/address/0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D)
    - vUSDT_Core: [0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46](https://explorer.zksync.io/address/0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46)
    - vZK_Core: [0x697a70779C1A03Ba2BD28b7627a902BFf831b616](https://explorer.zksync.io/address/0x697a70779C1A03Ba2BD28b7627a902BFf831b616)
- [ProtocolShareReserve](https://explorer.zksync.io/address/0xA1193e941BDf34E858f7F276221B4886EfdD040b)
- [NativeTokenGateway](https://explorer.zksync.io/address/0xeEDE4e1BDaC489BD851970bE3952B729C4238A68)
- [Prime](https://explorer.zksync.io/address/0xdFe62Dcba3Ce0A827439390d7d45Af8baE599978)
- [PrimeLiquidityProvider](https://explorer.zksync.io/address/0x0EDE6d7fB474614C5D3d5a16581628bb96CB5dff)

**References**

- [VIP simulation - adding Venus markets](https://github.com/VenusProtocol/vips/pull/377)
- [VIP simulation - ProtocolShareReserve](https://github.com/VenusProtocol/vips/pull/367)
- [VIP simulation - NativeTokenGateway](https://github.com/VenusProtocol/vips/pull/368)
- [VIP simulation - Prime](https://github.com/VenusProtocol/vips/pull/378)
- [[VRC] Deploy Venus Protocol on zkSync Era](https://community.venus.io/t/deploy-venus-protocol-on-zksync-era/4472)
- Snapshot ["Deploy Venus Protocol on zkSync Era"](https://snapshot.org/#/venus-xvs.eth/proposal/0x56aec6471ddf25eddc0a39e00ab1bbb98477fe67576cd84c7993f7d37729a717)
- [Documentation](https://docs-v4.venus.io/)

**Disclaimer for zkSync Era VIPs**

Privilege commands on zkSync Era will be executed by the [Guardian wallet](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x18965d1db2a609964f8b6832d96371d4cbf77daab3ecb54de3818108d71ce89e), [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x2b050a3b262bc6c5084796f93769b82cac8a34c62911cf006c85826b5469a99f), [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x44e1f772b420ee5eeae26623d110c47c1151ba350375377d571498cbe0fb61e4) and [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x57e29b8a10d51202c9d5ac7cd928e83b4ab93222af755117fa849e7b3872f06f) multisig transactions will be executed. Otherwise, they will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
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

export default vip365;
