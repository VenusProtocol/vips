import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const VANGUARD_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const LIQUIDITY_PROVIDER = "0xe4E14BdC7dAD60F1d60ec8153D04322Ff2f9B100";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

export const ETH_AMOUNT_TO_LIQUIDITY_PROVIDER = parseUnits("1", 18);
export const USDC_AMOUNT_TO_VANGUARD_TREASURY = parseUnits("5000", 18);

const vip449 = () => {
  const meta = {
    version: "v2",
    title: "VIP-449 [Unichain] Venus Protocol Deployment",
    description: `#### Summary

Following the community proposal [Deploy Venus on Unichain](https://community.venus.io/t/deploy-venus-on-unichain/4859), and the [associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x6fb0e2eadd6713e6ed073122f3c7a576fa3499eed0bd4149fa7c081ab6d5f324), if passed, this VIP will configure the Venus Protocol contracts on [Unichain](https://unichain.org/), and refund the bootstrap liquidity providers.

#### Description

If passed, this VIP will perform the following actions:

- Transfer the Venus Treasury on Unichain to the Guardian wallet
- Configure the oracles on Unichain for the initial Venus markets on that network
- Prepare the XVS Bridge on Unichain, waiting for the activation on the other supported chains (BNB Chain, Ethereum, opBNB, Arbitrum one, zkSync Era, Optimism and Base) using [LayerZero](https://layerzero.network/) ([snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x62440d98cb7513d4873662203b7a27f9441880afa73105c55a733005de7ac9a1)), that will be performed in a different VIP
- Configure the Venus markets on Unichain, for [WETH](https://uniscan.xyz/token/0x4200000000000000000000000000000000000006) and [USDC](https://uniscan.xyz/token/0x078d782b760474a361dda0af3839290b0ef57ad6)
- Configure the ProtocolShareReserve contract on Unichain
- Configure the NativeTokenGateway contact for the Venus market of WETH, accepting deposits and withdrawals of ETH
- Configure the Prime contract on Unichain, allowing users to stake XVS into the XVSVault to start their qualification period
- Refund bootstrap liquidity providers

#### Venus markets on Unichain

Following the [Chaos Labs recommendations](https://community.venus.io/t/deploy-venus-on-unichain/4859/9), the following markets will be enabled on Unichain:

Underlying token: [WETH](https://uniscan.xyz/address/0x4200000000000000000000000000000000000006)

- Borrow cap: 300 WETH
- Supply cap: 350 WETH
- Collateral factor: 0.7
- Liquidation threshold: 0.75
- Reserve factor: 0.1
- Bootstrap liquidity: 1 WETH - provided by the market supporter 0xe4E14BdC7dAD60F1d60ec8153D04322Ff2f9B100
- Interest rate curve:
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.03
    - jump multiplier (yearly): 3

Underlying token: [USDC](https://uniscan.xyz/address/0x078D782b760474a361dDA0AF3839290b0EF57AD6)

- Borrow cap: 850,000 USDC
- Supply cap: 1,000,000 USDC
- Collateral factor: 0.7
- Liquidation threshold: 0.75
- Reserve factor: 0.1
- Bootstrap liquidity: 5,000 USDC - provided by the [Vanguard Treasury](https://bscscan.com/address/0xf645a387180F5F74b968305dF81d54EB328d21ca)
- Interest rate curve:
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.125
    - jump multiplier (yearly): 3

Initial risk parameters for the new pool:

- Close factor: 50%
- Liquidation incentive: 10%

#### Oracle price feeds

- USDC. RedStone: [0xD15862FC3D5407A03B696548b6902D6464A69b8c](https://unichain.blockscout.com/address/0xD15862FC3D5407A03B696548b6902D6464A69b8c)
- ETH. RedStone: [0xe8D9FbC10e00ecc9f0694617075fDAF657a76FB2](https://unichain.blockscout.com/address/0xe8D9FbC10e00ecc9f0694617075fDAF657a76FB2)

#### Refund liquidity providers

- Transfer 1 ETH to 0xe4E14BdC7dAD60F1d60ec8153D04322Ff2f9B100
- Transfer 5,000 USDC to the [Vanguard Treasury](https://bscscan.com/address/0xf645a387180F5F74b968305dF81d54EB328d21ca)

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, checking every configuration is correct
- **Deployment on testnet**: the same contracts have been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Audits**:
    - Certik, Quantstamp and Peckshield have audited the VTreasuryV8 code
    - Certik, Quantstamp and Fairyproof have audited the code of the oracles on Unichain
    - Certik, Peckshield and Quantstamp have audited the deployed code related to the bridge. Moreover, the [LayerZero](https://layerzero.network/) team reviewed the design and the code directly related to the bridge. Certik, Quantstamp and [Fairyproof](https://www.fairyproof.com/) have audited the code of the XVSVault on Unichain.

#### Audit reports

VTreasuryV8:

- [Certik audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/083_multichain_token_bridge_certik_20231226.pdf) (2023/December/26)
- [Quantstamp audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/064_multichain_token_bridge_quantstamp_20231219.pdf) (2023/December/19)
- [Peckshield audit report](https://github.com/VenusProtocol/token-bridge/blob/04b0a8526bb2fa916785c41eefd94b4f84c12819/audits/079_multichain_token_bridge_peckshield_20231020.pdf) (2023/October/20)

Oracles on Unichain:

- [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/088_timeBased_certik_20240117.pdf) (2024/01/17)
- [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/470416836922656783eab52ded54744489e8c345/audits/089_timeBased_quantstamp_20240319.pdf) (2024/03/19)
- [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/094_timeBased_fairyproof_20240304.pdf) (2024/03/04)

Bridge:

- [Certik audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/083_multichain_token_bridge_certik_20231226.pdf) (2023/December/26)
- [Quantstamp audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/064_multichain_token_bridge_quantstamp_20231219.pdf) (2023/December/19)
- [Peckshield audit report](https://github.com/VenusProtocol/token-bridge/blob/04b0a8526bb2fa916785c41eefd94b4f84c12819/audits/079_multichain_token_bridge_peckshield_20231020.pdf) (2023/October/20)

XVS Vault:

- [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/088_timeBased_certik_20240117.pdf) (2024/01/17)
- [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/470416836922656783eab52ded54744489e8c345/audits/089_timeBased_quantstamp_20240319.pdf) (2024/03/19)
- [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/094_timeBased_fairyproof_20240304.pdf) (2024/03/04)

#### Deployed contracts on Unichain

- [VTreasuryV8](https://uniscan.xyz/address/0x958F4C84d3ad523Fa9936Dc465A123C7AD43D69B)
- [ResilientOracle](https://uniscan.xyz/address/0x86D04d6FE928D888076851122dc6739551818f7E)
- [RedStoneOracle](https://uniscan.xyz/address/0x4d41a36D04D97785bcEA57b057C412b278e6Edcc)
- [BoundValidator](https://uniscan.xyz/address/0xfdaA5dEEA7850997dA8A6E2F2Ab42E60F1011C19)
- [XVSBridgeAdmin](https://uniscan.xyz/address/0x2EAaa880f97C9B63d37b39b0b316022d93d43604)
- [XVSProxyOFTDest](https://uniscan.xyz/address/0x9c95f8aa28fFEB7ECdC0c407B9F632419c5daAF8)
- [XVS](https://uniscan.xyz/address/0x81908BBaad3f6fC74093540Ab2E9B749BB62aA0d)
- [XVSStore](https://uniscan.xyz/address/0x0ee4b35c2cEAb19856Bf35505F81608d12B2a7Bb)
- [XVSVaultProxy](https://uniscan.xyz/address/0x5ECa0FBBc5e7bf49dbFb1953a92784F8e4248eF6)
- [Guardian](https://uniscan.xyz/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C)
- [Pool registry](https://uniscan.xyz/address/0x0C52403E16BcB8007C1e54887E1dFC1eC9765D7C)
- [PoolLens](https://uniscan.xyz/address/0xe192aeDBDBd235DBF33Ea1444f2B908Ea3E78419)
- [Comptroller](https://uniscan.xyz/address/0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe)
- Markets:
    - [vWETH_Core](https://uniscan.xyz/address/0xc219BC179C7cDb37eACB03f993f9fDc2495e3374)
    - [vUSDC_Core](https://uniscan.xyz/address/0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95)
- [ProtocolShareReserve](https://uniscan.xyz/address/0x0A93fBcd7B53CE6D335cAB6784927082AD75B242)
- [NativeTokenGateway](https://uniscan.xyz/address/0x4441aE3bCEd3210edbA35d0F7348C493E79F1C52)
- [Prime](https://uniscan.xyz/address/0x600aFf613d40D87C8Fe90Cb2e78e8e6667c0C872)
- [PrimeLiquidityProvider](https://uniscan.xyz/address/0x045a45603E1b073F444fe3Be7d5C7e0a5035afB7)

#### Bridge contract on the rest of supported networks

- [Ethereum](https://etherscan.io/address/0x888E317606b4c590BBAD88653863e8B345702633)
- [BNB Chain](https://bscscan.com/address/0xf8F46791E3dB29a029Ec6c9d946226f3c613e854)
- [opBNB](https://opbnbscan.com/address/0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2)
- [Arbitrum one](https://arbiscan.io/address/0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6)
- [zkSync Era](https://explorer.zksync.io/address/0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116)
- [Optimism](https://optimistic.etherscan.io/address/0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4)
- [Base](https://basescan.org/address/0x3dD92fB51a5d381Ae78E023dfB5DD1D45D2426Cd)

#### Simulations

- [VIP commands](https://github.com/VenusProtocol/vips/pull/497)
- [Venus Treasury](https://github.com/VenusProtocol/vips/pull/487)
- [Oracles](https://github.com/VenusProtocol/vips/pull/490)
- [XVS & XVS Bridge](https://github.com/VenusProtocol/vips/pull/489)
- [XVS Vault](https://github.com/VenusProtocol/vips/pull/488)
- [Markets](https://github.com/VenusProtocol/vips/pull/491)
- [Native Token Gateway and Protocol Share Reserve](https://github.com/VenusProtocol/vips/pull/492)
- [Prime](https://github.com/VenusProtocol/vips/pull/493)

#### Disclaimer for Unichain VIPs

Privilege commands on Unichain will be executed by the [](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67)Guardian wallet, until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled on that chain. If this VIP gets quorum, [](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x79ca5d7ef82648f5c52054aa996356da270a60e95a959c595ee3c29defc6a4ca)the following multisig transactions will be executed.

1. [Treasury](https://app.safe.global/transactions/tx?safe=unichain:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0x05255451624924ae3917e7df043874acfdbf0d9bc16b5ce4c87ba9b35dfbb21b)
2. [Oracles](https://app.safe.global/transactions/tx?safe=unichain:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0xa51accca191ad80a39fba53312dad3e2109b4ff61077315016428060e81bf27b)
3. [XVSVault](https://app.safe.global/transactions/tx?safe=unichain:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0xa862059fba2ab9530ca73a6c61c5260d60c8dcd27a3d6ade8d600681a8ac4798)
4. [XVS Bridge](https://app.safe.global/transactions/tx?safe=unichain:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0x334ab2c34f1b71f1713ac4543c129b9f22d7febc2e21a4b4f96a938c0a83e6bb)
5. [Markets](https://app.safe.global/transactions/tx?safe=unichain:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0xaf7d306aa4a0d4a7230eea06e01bc34e6db894aa83e0d887f4f839c490b5edfc)
6. [Native Token Gateway and Protocol Share Reserve](https://app.safe.global/transactions/tx?safe=unichain:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0x706d56f11b234eaad1a9a98c851fbe128db9c5c4ab1dd57f3ef156c7fcc61b71)
7. [Prime](https://app.safe.global/transactions/tx?safe=unichain:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0x09e556a04f3b45436fa93b3f519253990ae549f75a308c8812b4baa62f0d5433)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, USDC_AMOUNT_TO_VANGUARD_TREASURY, VANGUARD_TREASURY],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT_TO_LIQUIDITY_PROVIDER, LIQUIDITY_PROVIDER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip449;
