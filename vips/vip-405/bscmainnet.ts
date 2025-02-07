import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { FAST_TRACK_TIMELOCK } from "src/vip-framework";

const vip405 = () => {
  const meta = {
    version: "v2",
    title: "VIP-405 [Base] Venus Treasury and Oracles",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Transfer the ownership of the [Venus Treasury on Base](https://basescan.org/address/0xbefD8d06f403222dd5E8e37D2ba93320A97939D1) to the [Guardian wallet](https://basescan.org/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C)
- Configure the oracles on Base for the initial Venus markets on that network

#### Description

Following the community proposal [Deploy Venus on Base](https://community.venus.io/t/deploy-venus-on-base/4630), and the [associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x353f5fb23ff895d89c21271ea1904af65e60557aeec317b24ce56d728d29b8c1), this VIP is the first one directly related to the deployment of the Venus protocol to this network.

Apart from the configuration of the Venus Treasury, this VIP configures the Venus Resilient Oracles on Base, for the following markets:

- [USDC](https://basescan.org/token/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913): Chainlink - [0x7e860098F58bBFC8648a4311b374B1D669a2bc6B](https://basescan.org/address/0x7e860098F58bBFC8648a4311b374B1D669a2bc6B)
- [WETH](https://basescan.org/address/0x4200000000000000000000000000000000000006): Chainlink - [0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70](https://basescan.org/address/0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70)
- [cbBTC](https://basescan.org/address/0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf): Chainlink - [0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D](https://basescan.org/address/0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D)
- [XVS](https://basescan.org/address/0xebB7873213c8d1d9913D8eA39Aa12d74cB107995): RedStone - [0x5ED849a45B4608952161f45483F4B95BCEa7f8f0](https://basescan.org/address/0x5ED849a45B4608952161f45483F4B95BCEa7f8f0)

The list of initial markets for Base follows the [Chaos labs recommendations](https://community.venus.io/t/deploy-venus-on-base/4630/13).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, checking ownership of the contracts and validating the returned prices
- **Deployment on testnet**: the same contracts have been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Audit:**
    - Certik, Quantstamp and Peckshield have audited the VTreasuryV8 code
    - Certik, Quantstamp and Fairyproof have audited the code of the oracles on Optimism

#### Audit reports

VTreasuryV8:

- [Certik audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/083_multichain_token_bridge_certik_20231226.pdf) (2023/December/26)
- [Quantstamp audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/064_multichain_token_bridge_quantstamp_20231219.pdf) (2023/December/19)
- [Peckshield audit report](https://github.com/VenusProtocol/token-bridge/blob/04b0a8526bb2fa916785c41eefd94b4f84c12819/audits/079_multichain_token_bridge_peckshield_20231020.pdf) (2023/October/20)

Oracles on Base:

- [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/088_timeBased_certik_20240117.pdf) (2024/01/17)
- [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/470416836922656783eab52ded54744489e8c345/audits/089_timeBased_quantstamp_20240319.pdf) (2024/03/19)
- [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/094_timeBased_fairyproof_20240304.pdf) (2024/03/04)

#### Deployed contracts on Base

- [ResilientOracle](https://basescan.org/address/0xcBBf58bD5bAdE357b634419B70b215D5E9d6FbeD)
- [ChainlinkOracle](https://basescan.org/address/0x6F2eA73597955DB37d7C06e1319F0dC7C7455dEb)
- [RedStoneOracle](https://basescan.org/address/0xd101Bf51937A6718F402dA944CbfdcD12bB6a6eb)
- [BoundValidator](https://basescan.org/address/0x66dDE062D3DC1BB5223A0096EbB89395d1f11DB0)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/438)
- [Deploy Venus on Base](https://community.venus.io/t/deploy-venus-on-base/4630)
- Snapshot ["Deploy Venus on Base"](https://snapshot.org/#/venus-xvs.eth/proposal/0x353f5fb23ff895d89c21271ea1904af65e60557aeec317b24ce56d728d29b8c1)
- [Guardian wallet](https://basescan.org/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C)
- [Documentation for Resilient Price Oracle](https://docs-v4.venus.io/risk/resilient-price-oracle)

#### Disclaimer for Base VIPs

Privilege commands on Base will be executed by the [Guardian wallet](https://basescan.org/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled on that chain. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=base:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0x484db9fa2593aefa9698cd4c9149138e334adb467048ef90fe0091935f8ad0d1) multisig transaction will be executed. Otherwise, it will be rejected.
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

export default vip405;
