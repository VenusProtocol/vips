import { FAST_TRACK_TIMELOCK } from "src/vip-framework";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vip368 = () => {
  const meta = {
    version: "v2",
    title: "VIP-368 [Optimism] Venus Treasury and Oracles",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Transfer the ownership of the [Venus Treasury on Optimisim](https://optimistic.etherscan.io/address/0x104c01EB7b4664551BE6A9bdB26a8C5c6Be7d3da) to the [Guardian wallet](https://optimistic.etherscan.io/address/0x2e94dd14E81999CdBF5deDE31938beD7308354b3)
- Configure the oracles on Optimism for the initial Venus markets on that network

#### Description

Following the community proposal [Deploy Venus Protocol on OP Mainnet](https://community.venus.io/t/deploy-venus-protocol-on-op-mainnet/4512), and the [associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xe2e59410d7c010600ec869132980f10a8694d78e9ece4b3702f973d1e0ecc93f), this VIP is the first one directly related to the deployment of the Venus protocol to this network.

Apart from the configuration of the Venus Treasury, this VIP configures the Venus Resilient Oracles on Optimism, for the following markets:

- [USDT](https://optimistic.etherscan.io/address/0x94b008aA00579c1307B0EF2c499aD98a8ce58e58): Chainlink - [0xECef79E109e997bCA29c1c0897ec9d7b03647F5E](https://optimistic.etherscan.io/address/0xECef79E109e997bCA29c1c0897ec9d7b03647F5E)
- [USDC](https://optimistic.etherscan.io/address/0x7F5c764cBc14f9669B88837ca1490cCa17c31607): Chainlink - [0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3](https://optimistic.etherscan.io/address/0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3)
- [WETH](https://optimistic.etherscan.io/address/0x4200000000000000000000000000000000000006): Chainlink - [0x13e3Ee699D1909E989722E753853AE30b17e08c5](https://optimistic.etherscan.io/address/0x13e3Ee699D1909E989722E753853AE30b17e08c5)
- [WBTC](https://optimistic.etherscan.io/address/0x68f180fcCe6836688e9084f035309E29Bf0A2095): Chainlink - [0xD702DD976Fb76Fffc2D3963D037dfDae5b04E593](https://optimistic.etherscan.io/address/0xD702DD976Fb76Fffc2D3963D037dfDae5b04E593)
- [OP](https://optimistic.etherscan.io/address/0x4200000000000000000000000000000000000042): Chainlink - [0x0D276FC14719f9292D5C1eA2198673d1f4269246](https://optimistic.etherscan.io/address/0x0D276FC14719f9292D5C1eA2198673d1f4269246)
- [XVS](https://optimistic.etherscan.io/address/0x4a971e87ad1F61f7f3081645f52a99277AE917cF): RedStone - [0x414F8f961969A8131AbE53294600c6C515E68f81](https://optimistic.etherscan.io/address/0x414F8f961969A8131AbE53294600c6C515E68f81)

The list of initial markets for Optimism follows the [Chaos labs recommendations](https://community.venus.io/t/deploy-venus-protocol-on-op-mainnet/4512/9).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation:** in a simulation environment, checking ownership of the contracts and validating the returned prices
- **Deployment on testnet:** the same contracts have been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Audit:**
    - Certik, Quantstamp and Peckshield have audited the VTreasuryV8 code
    - Certik, Quantstamp and Fairyproof have audited the code of the oracles on Optimism

#### Audit reports

VTreasuryV8:

- [Certik audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/083_multichain_token_bridge_certik_20231226.pdf) (2023/December/26)
- [Quantstamp audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/064_multichain_token_bridge_quantstamp_20231219.pdf) (2023/December/19)
- [Peckshield audit report](https://github.com/VenusProtocol/token-bridge/blob/04b0a8526bb2fa916785c41eefd94b4f84c12819/audits/079_multichain_token_bridge_peckshield_20231020.pdf) (2023/October/20)

Oracles on Optimism:

- [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/088_timeBased_certik_20240117.pdf) (2024/01/17)
- [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/470416836922656783eab52ded54744489e8c345/audits/089_timeBased_quantstamp_20240319.pdf) (2024/03/19)
- [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/094_timeBased_fairyproof_20240304.pdf) (2024/03/04)

#### Deployed contracts on Optimism

- [ResilientOracle](https://optimistic.etherscan.io/address/0x21FC48569bd3a6623281f55FC1F8B48B9386907b)
- [ChainlinkOracle](https://optimistic.etherscan.io/address/0x1076e5A60F1aC98e6f361813138275F1179BEb52)
- [RedStoneOracle](https://optimistic.etherscan.io/address/0x7478e4656F6CCDCa147B6A7314fF68d0C144751a)
- [BoundValidator](https://optimistic.etherscan.io/address/0x37A04a1eF784448377a19F2b1b67cD40c09eA505)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/386)
- [Deploy Venus Protocol on OP Mainnet](https://community.venus.io/t/deploy-venus-protocol-on-op-mainnet/4512)
- Snapshot ["Deploy Venus Protocol on OP Mainnet"](https://snapshot.org/#/venus-xvs.eth/proposal/0xe2e59410d7c010600ec869132980f10a8694d78e9ece4b3702f973d1e0ecc93f)
- [Guardian wallet](https://optimistic.etherscan.io/address/0x2e94dd14E81999CdBF5deDE31938beD7308354b3)
- [Documentation for Resilient Price Oracle](https://docs-v4.venus.io/risk/resilient-price-oracle)

#### Disclaimer for Optimism VIPs

Privilege commands on Optimism will be executed by the [Guardian wallet](https://optimistic.etherscan.io/address/0x2e94dd14E81999CdBF5deDE31938beD7308354b3), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=oeth:0x2e94dd14E81999CdBF5deDE31938beD7308354b3&id=multisig_0x2e94dd14E81999CdBF5deDE31938beD7308354b3_0x2b3de12644f5002434c3494a65ddca98ed8d124b1c6d271527013cad7c1b3187) multisig transaction will be executed. Otherwise, it will be rejected.
`,
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

export default vip368;
