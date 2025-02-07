import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { CONVERTERS as ARBITRUM_ONE_CONVERTERS } from "../../multisig/proposals/arbitrumone/vip-020";
import { PLP as ARBITRUMONE_PLP, PRIME as ARBITRUMONE_PRIME } from "../../multisig/proposals/arbitrumone/vip-020";
import { COMPTROLLERS as ARBITRUMONE_COMPTROLLERS } from "../../multisig/proposals/arbitrumone/vip-020";
import { VTOKENS as ARBITRUMONE_VTOKENS } from "../../multisig/proposals/arbitrumone/vip-020";
import { POOL_REGISTRY as ARBITRUMONE_POOL_REGISTRY } from "../../multisig/proposals/arbitrumone/vip-020";
import { NTGs as ARBITRUMONE_NTGs } from "../../multisig/proposals/arbitrumone/vip-020";
import { CONVERTER_NETWORK as ARBITRUM_ONE_CONVERTER_NETWORK } from "../../multisig/proposals/arbitrumone/vip-020";
import { PSR as ARBITRUMONE_PSR } from "../../multisig/proposals/arbitrumone/vip-020";
import { CONVERTERS as ETHEREUM_CONVERTERS } from "../../multisig/proposals/ethereum/vip-073";
import { CONVERTER_NETWORK as ETHEREUM_CONVERTER_NETWORK } from "../../multisig/proposals/ethereum/vip-073";
import { PLP as ETHEREUM_PLP, PRIME as ETHEREUM_PRIME } from "../../multisig/proposals/ethereum/vip-073";
import { POOL_REGISTRY as ETHEREUM_POOL_REGISTRY } from "../../multisig/proposals/ethereum/vip-073";
import { NTGs as ETHEREUM_NTGs } from "../../multisig/proposals/ethereum/vip-073";
import { PSR as ETHEREUM_PSR } from "../../multisig/proposals/ethereum/vip-073";
import { COMPTROLLERS as ZKSYNCMAINNET_COMPTROLLERS } from "../../multisig/proposals/zksyncmainnet/vip-020";
import { VTOKENS as ZKSYNCMAINNET_VTOKENS } from "../../multisig/proposals/zksyncmainnet/vip-020";
import { POOL_REGISTRY as ZKSYNCMAINNET_POOL_REGISTRY } from "../../multisig/proposals/zksyncmainnet/vip-020";
import { NTGs as ZKSYNCMAINNET_NTGs } from "../../multisig/proposals/zksyncmainnet/vip-020";
import { PSR as ZKSYNCMAINNET_PSR } from "../../multisig/proposals/zksyncmainnet/vip-020";
import { PLP as ZKSYNCMAINNET_PLP, PRIME as ZKSYNCMAINNET_PRIME } from "../../multisig/proposals/zksyncmainnet/vip-020";
import { REWARD_DISTRIBUTORS as ZKSYNCMAINNET_REWARD_DISTRIBUTORS } from "../../multisig/proposals/zksyncmainnet/vip-020";

export const ARBITRUM_ONE_XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";
export const ETHEREUM_XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
export const ZKSYNCMAINNET_XVS_STORE = "0x84266F552756cBed893b1FFA85248cD99501e3ce";
export const ETHEREUM_XVS_BRIDGE_ADMIN = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";
export const ZKSYNCMAINNET_XVS_BRIDGE_ADMIN = "0x2471043F05Cc41A6051dd6714DC967C7BfC8F902";
export const ARBITRUM_XVS_BRIDGE_ADMIN = "0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784";

export const ARBITRUM_ONE_BOUND_VALIDATOR = "0x2245FA2420925Cd3C2D889Ddc5bA1aefEF0E14CF";
export const ETHEREUM_BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";
export const ZKSYNCMAINNET_BOUND_VALIDATOR = "0x51519cdCDDD05E2ADCFA108f4a960755D9d6ea8b";
export const ETHEREUM_sFrxETH_ORACLE = "0x5E06A5f48692E4Fff376fDfCA9E4C0183AAADCD1";

const { arbitrumone, ethereum, zksyncmainnet } = NETWORK_ADDRESSES;

const vip438 = () => {
  const meta = {
    version: "v2",
    title: "VIP-438 [Ethereum][Arbitrum][ZKsync] Transfer contracts to Omnichain Governance (2/2)",
    description: `#### Summary

This is a follow-up of the [VIP-436 [Ethereum][Arbitrum] Transfer contracts to Omnichain Governance (1/2)](https://app.venus.io/#/governance/proposal/436?chainId=56).

If passed, this VIP will transfer the rest of the contracts on Ethereum and Arbitrum one, and every contract on ZKsync Era, to the Normal Timelock, following the community proposals [[VRC] Deploy Venus Protocol on Ethereum Mainnet](https://community.venus.io/t/vrc-deploy-venus-protocol-on-ethereum-mainnet/3885), [[VRC] Deploy Venus Protocol on Arbitrum](https://community.venus.io/t/vrc-deploy-venus-protocol-on-arbitrum/3721) and [Deploy Venus Protocol on ZKsync Era](https://community.venus.io/t/deploy-venus-protocol-on-zksync-era/4472), and the associated snapshots ([here](https://snapshot.org/#/venus-xvs.eth/proposal/0x68be3a2cf0d4e72459c286ecb3dfae7d6f489ba9d962747987be3a46771a0df2), [here](https://snapshot.org/#/venus-xvs.eth/proposal/0xfc1f42609bda5d7d14660b0b91b19ca63ea1b2ea50169ddab79adfbfbdce323f) and [here](https://snapshot.org/#/venus-xvs.eth/proposal/0x56aec6471ddf25eddc0a39e00ab1bbb98477fe67576cd84c7993f7d37729a717)).

#### Description

If passed, this VIP will transfer the following contracts, from the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67) to the [Normal Timelock](https://etherscan.io/address/0xd969E79406c35E80750aAae061D402Aab9325714) on Ethereum:

- [Pool registry](https://etherscan.io/address/0x61CAff113CCaf05FFc6540302c37adcf077C5179)
- [NativeTokenGateway (vWETH Core pool)](https://etherscan.io/address/0x044dd75b9E043ACFD2d6EB56b6BB814df2a9c809)
- [NativeTokenGateway (vWETH Liquid Staked ETH pool)](https://etherscan.io/address/0xBC1471308eb2287eBE137420Eb1664A964895D21)
- Oracles:
    - [BoundValidator](https://etherscan.io/address/0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58)
    - [RedStoneOracle](https://etherscan.io/address/0x0FC8001B2c9Ec90352A46093130e284de5889C86)
    - [ResilientOracle](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94)
    - [ChainlinkOracle](https://etherscan.io/address/0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2)
    - [SFrxETHOracle](https://etherscan.io/address/0x5E06A5f48692E4Fff376fDfCA9E4C0183AAADCD1)
- [ProtocolShareReserve](https://etherscan.io/address/0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E)
- [Prime](https://etherscan.io/address/0x14C4525f47A7f7C984474979c57a2Dccb8EACB39)
- [PrimeLiquidityProvider](https://etherscan.io/address/0x8ba6aFfd0e7Bcd0028D1639225C84DdCf53D8872)
- [XVSStore](https://etherscan.io/address/0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B)
- [XVSVaultProxy](https://etherscan.io/address/0xA0882C2D5DF29233A092d2887A258C2b90e9b994)
- [XVSBridgeAdmin](https://etherscan.io/address/0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96)
- [ConverterNetwork](https://etherscan.io/address/0x232CC47AECCC55C2CAcE4372f5B268b27ef7cac8)
- [XVSVaultTreasury](https://etherscan.io/address/0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE)
- Token Converters:
    - [USDCPrimeConverter](https://etherscan.io/address/0xcEB9503f10B781E30213c0b320bCf3b3cE54216E)
    - [USDTPrimeConverter](https://etherscan.io/address/0x4f55cb0a24D5542a3478B0E284259A6B850B06BD)
    - [WBTCPrimeConverter](https://etherscan.io/address/0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0)
    - [WETHPrimeConverter](https://etherscan.io/address/0xb8fD67f215117FADeF06447Af31590309750529D)
    - [XVSVaultConverter](https://etherscan.io/address/0x1FD30e761C3296fE36D9067b1e398FD97B4C0407)

If passed, this VIP will transfer the following contracts, from the [Guardian wallet](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0) to the [Normal Timelock](https://arbiscan.io/address/0x4b94589Cc23F618687790036726f744D602c4017) on Arbitrum one:

- [Pool registry](https://arbiscan.io/address/0x382238f07Bc4Fe4aA99e561adE8A4164b5f815DA)
- [Comptroller (Core pool)](https://arbiscan.io/address/0x317c1A5739F39046E20b08ac9BeEa3f10fD43326)
- [Comptroller (Liquid Staked ETH)](https://arbiscan.io/address/0x52bAB1aF7Ff770551BD05b9FC2329a0Bf5E23F16)
- [NativeTokenGateway (vWETH Core pool)](https://arbiscan.io/address/0xc8e51418cadc001157506b306C6d0b878f1ff755)
- [NativeTokenGateway (vWETH Liquid Staked ETH pool)](https://arbiscan.io/address/0xD1e89806BAB8Cd7680DFc7425D1fA6d7D5F0C3FE)
- Markets:
    - [vWBTC_Core](https://arbiscan.io/address/0xaDa57840B372D4c28623E87FC175dE8490792811)
    - [vWETH_Core](https://arbiscan.io/address/0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0)
    - [vUSDC_Core](https://arbiscan.io/address/0x7D8609f8da70fF9027E9bc5229Af4F6727662707)
    - [vUSDT_Core](https://arbiscan.io/address/0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD)
    - [vARB_Core](https://arbiscan.io/address/0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6)
    - [vWETH_LiquidStakedETH](https://arbiscan.io/address/0x39D6d13Ea59548637104E40e729E4aABE27FE106)
    - [vweETH_LiquidStakedETH](https://arbiscan.io/address/0x246a35E79a3a0618535A469aDaF5091cAA9f7E88)
    - [vwstETH_LiquidStakedETH](https://arbiscan.io/address/0x9df6B5132135f14719696bBAe3C54BAb272fDb16)
- Oracles:
    - [BoundValidator](https://arbiscan.io/address/0x2245FA2420925Cd3C2D889Ddc5bA1aefEF0E14CF)
    - [RedStoneOracle](https://arbiscan.io/address/0xF792C4D3BdeF534D6d1dcC305056D00C95453dD6)
    - [ResilientOracle](https://arbiscan.io/address/0xd55A98150e0F9f5e3F6280FC25617A5C93d96007)
    - [SequencerChainlinkOracle](https://arbiscan.io/address/0x9cd9Fcc7E3dEDA360de7c080590AaD377ac9F113)
- [ProtocolShareReserve](https://arbiscan.io/address/0xF9263eaF7eB50815194f26aCcAB6765820B13D41)
- [Prime](https://arbiscan.io/address/0xFE69720424C954A2da05648a0FAC84f9bf11Ef49)
- [PrimeLiquidityProvider](https://arbiscan.io/address/0x86bf21dB200f29F21253080942Be8af61046Ec29)
- [XVSStore](https://arbiscan.io/address/0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e)
- [XVSVaultProxy](https://arbiscan.io/address/0x8b79692AAB2822Be30a6382Eb04763A74752d5B4)
- [XVSBridgeAdmin](https://arbiscan.io/address/0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784)
- [ConverterNetwork](https://arbiscan.io/address/0x2F6672C9A0988748b0172D97961BecfD9DC6D6d5)
- [XVSVaultTreasury](https://arbiscan.io/address/0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58)
- Token Converters:
    - [USDCPrimeConverter](https://arbiscan.io/address/0x6553C9f9E131191d4fECb6F0E73bE13E229065C6)
    - [USDTPrimeConverter](https://arbiscan.io/address/0x435Fac1B002d5D31f374E07c0177A1D709d5DC2D)
    - [WBTCPrimeConverter](https://arbiscan.io/address/0xF91369009c37f029aa28AF89709a352375E5A162)
    - [WETHPrimeConverter](https://arbiscan.io/address/0x4aCB90ddD6df24dC6b0D50df84C94e72012026d0)
    - [XVSVaultConverter](https://arbiscan.io/address/0x9c5A7aB705EA40876c1B292630a3ff2e0c213DB1)

If passed, this VIP will transfer the following contracts, from the [Guardian wallet](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa) to the [Normal Timelock](https://explorer.zksync.io/address/0x093565Bc20AA326F4209eBaF3a26089272627613) on ZKsync Era:

- [Pool registry](https://explorer.zksync.io/address/0xFD96B926298034aed9bBe0Cca4b651E41eB87Bc4)
- [Comptroller (Core pool)](https://explorer.zksync.io/address/0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1)
- [NativeTokenGateway (vWETH Core pool)](https://explorer.zksync.io/address/0xeEDE4e1BDaC489BD851970bE3952B729C4238A68)
- Markets:
    - [vWBTC_Core](https://explorer.zksync.io/address/0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719)
    - [vWETH_Core](https://explorer.zksync.io/address/0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8)
    - [vUSDC_Core](https://explorer.zksync.io/address/0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a)
    - [vUSDC.e_Core](https://explorer.zksync.io/address/0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D)
    - [vUSDT_Core](https://explorer.zksync.io/address/0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46)
    - [vZK_Core](https://explorer.zksync.io/address/0x697a70779C1A03Ba2BD28b7627a902BFf831b616)
- Oracles:
    - [BoundValidator](https://explorer.zksync.io/address/0x51519cdCDDD05E2ADCFA108f4a960755D9d6ea8b)
    - [RedStoneOracle](https://explorer.zksync.io/address/0xFa1e65e714CDfefDC9729130496AB5b5f3708fdA)
    - [ResilientOracle](https://explorer.zksync.io/address/0xDe564a4C887d5ad315a19a96DC81991c98b12182)
    - [ChainlinkOracle](https://explorer.zksync.io/address/0x4FC29E1d3fFFbDfbf822F09d20A5BE97e59F66E5)
- [RewardsDistributor](https://explorer.zksync.io/address/0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894)
- [ProtocolShareReserve](https://explorer.zksync.io/address/0xA1193e941BDf34E858f7F276221B4886EfdD040b)
- [Prime](https://explorer.zksync.io/address/0xdFe62Dcba3Ce0A827439390d7d45Af8baE599978)
- [PrimeLiquidityProvider](https://explorer.zksync.io/address/0x0EDE6d7fB474614C5D3d5a16581628bb96CB5dff)
- [XVSStore](https://explorer.zksync.io/address/0x84266F552756cBed893b1FFA85248cD99501e3ce)
- [XVSVaultProxy](https://explorer.zksync.io/address/0xbbB3C88192a5B0DB759229BeF49DcD1f168F326F)
- [XVSBridgeAdmin](https://explorer.zksync.io/address/0x2471043F05Cc41A6051dd6714DC967C7BfC8F902)

From now on, every privilege function executable only by the governance contract should be executed with a Normal VIP. To transfer these contracts, [this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0xe6699815d0700f9522b4137775926359373b885be72c3b85383ae3ae799917c0) transaction is required, where the two steps transfer is initiated by the Guardian wallet on ZKsync Era. If this VIP passes, this transaction will be executed. Otherwise, it will be rejected.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the contracts are properly transferred and the Normal Timelock can execute the privilege functions
- **Deployment on testnet**: the same transfer has been performed on testnet

#### References

- [VIP simulation, and links to the testnet transactions](https://github.com/VenusProtocol/vips/pull/450)
- [Documentation](https://docs-v4.venus.io)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      ...ZKSYNCMAINNET_REWARD_DISTRIBUTORS.map(rewardDistirbutor => {
        return {
          target: rewardDistirbutor,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.zksyncmainnet,
        };
      }),
      {
        target: arbitrumone.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ethereum.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: zksyncmainnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ARBITRUM_ONE_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [arbitrumone.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ETHEREUM_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [ethereum.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ZKSYNCMAINNET_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [zksyncmainnet.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ETHEREUM_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ZKSYNCMAINNET_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ARBITRUM_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ZKSYNCMAINNET_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ETHEREUM_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: arbitrumone.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: zksyncmainnet.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zksyncmainnet.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ARBITRUM_ONE_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: zksyncmainnet.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: ethereum.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ethereum.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_sFrxETH_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      ...ETHEREUM_CONVERTERS.map(converter => {
        return {
          target: converter,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.ethereum,
        };
      }),
      ...ARBITRUM_ONE_CONVERTERS.map(converter => {
        return {
          target: converter,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
      {
        target: ETHEREUM_CONVERTER_NETWORK,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUM_ONE_CONVERTER_NETWORK,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ZKSYNCMAINNET_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZKSYNCMAINNET_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ETHEREUM_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ETHEREUM_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      ...ARBITRUMONE_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
      ...ARBITRUMONE_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
      {
        target: ZKSYNCMAINNET_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
      ...ZKSYNCMAINNET_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.zksyncmainnet,
        };
      }),
      ...ZKSYNCMAINNET_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.zksyncmainnet,
        };
      }),
      ...ARBITRUMONE_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.arbitrumone,
        };
      }),
      ...ETHEREUM_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.ethereum,
        };
      }),
      ...ZKSYNCMAINNET_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.zksyncmainnet,
        };
      }),
      {
        target: ETHEREUM_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ZKSYNCMAINNET_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip438;
