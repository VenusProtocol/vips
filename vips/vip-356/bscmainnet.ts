import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

const vip356 = () => {
  const meta = {
    version: "v2",
    title: "VIP-356 [zkSync] Venus Treasury and Oracles",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Transfer the ownership of the [Venus Treasury on zkSync](https://era.zksync.network/address/0xB2e9174e23382f7744CebF7e0Be54cA001D95599) to the [Guardian wallet](https://era.zksync.network/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa)
- Configure the oracles on zkSync for the initial Venus markets on that network

#### Description

Following the community proposal [Deploy Venus Protocol on ZKsync Era](https://community.venus.io/t/deploy-venus-protocol-on-zksync-era/4472), and the [associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x56aec6471ddf25eddc0a39e00ab1bbb98477fe67576cd84c7993f7d37729a717), this VIP is the first one directly related to the deployment of the Venus protocol to this network.

Apart from the configuration of the Venus Treasury, this VIP configure the Venus Resilient Oracles on zkSync, for the following markets:

- [WETH](https://explorer.zksync.io/address/0x5aea5775959fbc2557cc8789bc1bf90a239d9a91): Chainlink - [0x6D41d1dc818112880b40e26BD6FD347E41008eDA](https://explorer.zksync.io/address/0x6D41d1dc818112880b40e26BD6FD347E41008eDA)
- [WBTC](https://explorer.zksync.io/address/0xbbeb516fb02a01611cbbe0453fe3c580d7281011): Chainlink - [0x4Cba285c15e3B540C474A114a7b135193e4f1EA6](https://explorer.zksync.io/address/0x4Cba285c15e3B540C474A114a7b135193e4f1EA6)
- [USDT](https://explorer.zksync.io/address/0x493257fd37edb34451f62edf8d2a0c418852ba4c): Chainlink - [0xB615075979AE1836B476F651f1eB79f0Cd3956a9](https://explorer.zksync.io/address/0xB615075979AE1836B476F651f1eB79f0Cd3956a9)
- [USDC.e](https://explorer.zksync.io/address/0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4): Chainlink - [0x1824D297C6d6D311A204495277B63e943C2D376E](https://explorer.zksync.io/address/0x1824D297C6d6D311A204495277B63e943C2D376E)
- [ZK](https://explorer.zksync.io/address/0x5a7d6b2f92c77fad6ccabd7ee0624e64907eaf3e): RedStone (MAIN) - [0x5efDb74da192584746c96EcCe138681Ec1501218](https://explorer.zksync.io/address/0x5efDb74da192584746c96EcCe138681Ec1501218) and Chainlink (FALLBACK and PIVOT) - [0xD1ce60dc8AE060DDD17cA8716C96f193bC88DD13](https://explorer.zksync.io/address/0xD1ce60dc8AE060DDD17cA8716C96f193bC88DD13)

The list of initial markets for ZKsync Era follows the [Chaos labs recommendations](https://community.venus.io/t/deploy-venus-protocol-on-zksync-era/4472/12).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation:** in a simulation environment, checking ownership of the contracts and validating the returned prices
- **Deployment on testnet:** the same contracts have been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Audit:**
    - Certik, Quantstamp and Peckshield have audited the VTreasuryV8 code
    - OpenZeppelin, Peckshield, Certik, and Hacken have audited the code of the oracles deployed to zkSync

#### Audit reports

VTreasuryV8:

- [Certik audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/083_multichain_token_bridge_certik_20231226.pdf) (2023/December/26)
- [Quantstamp audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/064_multichain_token_bridge_quantstamp_20231219.pdf) (2023/December/19)
- [Peckshield audit report](https://github.com/VenusProtocol/token-bridge/blob/04b0a8526bb2fa916785c41eefd94b4f84c12819/audits/079_multichain_token_bridge_peckshield_20231020.pdf) (2023/October/20)

Oracles:

- [OpenZeppeling audit report](https://github.com/VenusProtocol/oracle/blob/6f7a3d8769c28881661953e7ee3299b1d5b31e17/audits/026_oracles_openzeppelin_20230606.pdf) (2023/June/06)
- [Peckshield audit report](https://github.com/VenusProtocol/oracle/blob/6f7a3d8769c28881661953e7ee3299b1d5b31e17/audits/013_oracles_peckshield_20230424.pdf) (2023/April/24)
- [Certik audit report](https://github.com/VenusProtocol/oracle/blob/6f7a3d8769c28881661953e7ee3299b1d5b31e17/audits/024_oracles_certik_20230522.pdf) (2023/May/22)
- [Hacken audit report](https://github.com/VenusProtocol/oracle/blob/6f7a3d8769c28881661953e7ee3299b1d5b31e17/audits/016_oracles_hacken_20230426.pdf) (2023/April/26)

#### Deployed contracts on zkSync

- [ResilientOracle](https://explorer.zksync.io/address/0xDe564a4C887d5ad315a19a96DC81991c98b12182)
- [ChainlinkOracle](https://explorer.zksync.io/address/0x4FC29E1d3fFFbDfbf822F09d20A5BE97e59F66E5)
- [RedStoneOracle](https://explorer.zksync.io/address/0xFa1e65e714CDfefDC9729130496AB5b5f3708fdA)
- [BoundValidator](https://explorer.zksync.io/address/0x51519cdCDDD05E2ADCFA108f4a960755D9d6ea8b)

#### References

- [VIP simulation to configure the Venus Treasury on zkSync](https://github.com/VenusProtocol/vips/pull/360)
- [Transaction to configure the Venus Treasury on zkSync](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x3d41da584a31e5178f120af78ef1133a951fcdf7c6a9d65cf96f9ddd262b9c7e)
- [VIP simulation to configure the oracles on zkSync](https://github.com/VenusProtocol/vips/pull/361)
- [Transaction to configure the oracles on zkSync](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x1c8c52bae4a4646312b0b79d4757866312d90e3888c751d2620272ab334b4519)
- [Deploy Venus Protocol on ZKsync Era](https://community.venus.io/t/deploy-venus-protocol-on-zksync-era/4472)
- Snapshot [Proposal: Deploy Venus Protocol on ZKsync Era](https://snapshot.org/#/venus-xvs.eth/proposal/0x56aec6471ddf25eddc0a39e00ab1bbb98477fe67576cd84c7993f7d37729a717)
- [Guardian wallet](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa)
- [Documentation for Resilient Price Oracle](https://docs-v4.venus.io/risk/resilient-price-oracle)

#### Disclaimer for zkSync VIPs

Privilege commands on zkSync will be executed by the [Guardian wallet](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x3d41da584a31e5178f120af78ef1133a951fcdf7c6a9d65cf96f9ddd262b9c7e35) and [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x1c8c52bae4a4646312b0b79d4757866312d90e3888c751d2620272ab334b4519) multisig transactions will be executed. Otherwise, they will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: FAST_TRACK_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip356;
