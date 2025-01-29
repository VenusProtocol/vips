import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { COMPTROLLERS as OPBNBMAINNET_COMPTROLLERS } from "../../multisig/proposals/opbnbmainnet/vip-024";
import { VTOKENS as OPBNBMAINNET_VTOKENS } from "../../multisig/proposals/opbnbmainnet/vip-024";
import { POOL_REGISTRY as OPBNBMAINNET_POOL_REGISTRY } from "../../multisig/proposals/opbnbmainnet/vip-024";
import { NTGs as OPBNBMAINNET_NTGs } from "../../multisig/proposals/opbnbmainnet/vip-024";
import { PSR as OPBNBMAINNET_PSR } from "../../multisig/proposals/opbnbmainnet/vip-024";
import { PLP as OPMAINNET_PLP, PRIME as OPMAINNET_PRIME } from "../../multisig/proposals/opmainnet/vip-007";
import { COMPTROLLERS as OPMAINNET_COMPTROLLERS } from "../../multisig/proposals/opmainnet/vip-007";
import { VTOKENS as OPMAINNET_VTOKENS } from "../../multisig/proposals/opmainnet/vip-007";
import { POOL_REGISTRY as OPMAINNET_POOL_REGISTRY } from "../../multisig/proposals/opmainnet/vip-007";
import { NTGs as OPMAINNET_NTGs } from "../../multisig/proposals/opmainnet/vip-007";
import { PSR as OPMAINNET_PSR } from "../../multisig/proposals/opmainnet/vip-007";

export const OPMAINNET_XVS_STORE = "0xFE548630954129923f63113923eF5373E10589d3";
export const OPBNBMAINNET_XVS_STORE = "0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775";
export const OPBNBMAINNET_XVS_BRIDGE_ADMIN = "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831";
export const OPMAINNET_XVS_BRIDGE_ADMIN = "0x3c307DF1Bf3198a2417d9CA86806B307D147Ddf7";

export const OPMAINNET_BOUND_VALIDATOR = "0x37A04a1eF784448377a19F2b1b67cD40c09eA505";
export const OPBNBMAINNET_BOUND_VALIDATOR = "0xd1f80C371C6E2Fa395A5574DB3E3b4dAf43dadCE";

const { opmainnet, opbnbmainnet } = NETWORK_ADDRESSES;

const vip433 = () => {
  const meta = {
    version: "v2",
    title: "VIP-433 [Optimism][opBNB] Transfer contracts to Omnichain Governance",
    description: `#### Summary

Following the community proposals [Deploy Venus Protocol on OP Mainnet](https://community.venus.io/t/deploy-venus-protocol-on-op-mainnet/4512) and [Deploy Venus Protocol on opBNB](https://community.venus.io/t/deploy-venus-protocol-on-opbnb/3995), and the associated snapshots ([here](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xe2e59410d7c010600ec869132980f10a8694d78e9ece4b3702f973d1e0ecc93f) and [here](https://snapshot.org/#/venus-xvs.eth/proposal/0xbde3c7b8acf4bba025ad838f3f515c9d9e6f4c2eb0e68fca7f37234baf4ed103)), if passed, this VIP will transfer every Venus contract on Optimism and opBNB to the Normal Timelock

#### Description

If passed, this VIP will transfer the following contracts, from the [Guardian wallet](https://optimistic.etherscan.io/address/0x2e94dd14E81999CdBF5deDE31938beD7308354b3) to the [Normal Timelock](https://optimistic.etherscan.io/address/0x0C6f1E6B4fDa846f63A0d5a8a73EB811E0e0C04b) on Optimism:

- [Pool registry](https://optimistic.etherscan.io/address/0x147780799840d541C1d7c998F0cbA996d11D62bb)
- [ComptrollerBeacon](https://optimistic.etherscan.io/address/0x64f9306496ccF7b7369d02d68D6abcA2Edfb871d)
- [Comptroller (Core pool)](https://optimistic.etherscan.io/address/0x5593FF68bE84C966821eEf5F0a988C285D5B7CeC)
- [NativeTokenGateway (vWETH Core pool)](https://optimistic.etherscan.io/address/0x5B1b7465cfDE450e267b562792b434277434413c)
- [VTokenBeacon](https://optimistic.etherscan.io/address/0xd550Bdfa9402e215De0BabCb99F7294BE0268367)
- Markets:
    - [vWBTC_Core](https://optimistic.etherscan.io/address/0x9EfdCfC2373f81D3DF24647B1c46e15268884c46)
    - [vWETH_Core](https://optimistic.etherscan.io/address/0x66d5AE25731Ce99D46770745385e662C8e0B4025)
    - [vUSDC_Core](https://optimistic.etherscan.io/address/0x1C9406ee95B7af55F005996947b19F91B6D55b15)
    - [vUSDT_Core](https://optimistic.etherscan.io/address/0x37ac9731B0B02df54975cd0c7240e0977a051721)
    - [vOP_Core](https://optimistic.etherscan.io/address/0x6b846E3418455804C1920fA4CC7a31A51C659A2D)
- Oracles:
    - [BoundValidator](https://optimistic.etherscan.io/address/0x37A04a1eF784448377a19F2b1b67cD40c09eA505)
    - [RedStoneOracle](https://optimistic.etherscan.io/address/0x7478e4656F6CCDCa147B6A7314fF68d0C144751a)
    - [ResilientOracle](https://optimistic.etherscan.io/address/0x21FC48569bd3a6623281f55FC1F8B48B9386907b)
    - [SequencerChainlinkOracle](https://optimistic.etherscan.io/address/0x1076e5A60F1aC98e6f361813138275F1179BEb52)
- [ProtocolShareReserve](https://optimistic.etherscan.io/address/0x735ed037cB0dAcf90B133370C33C08764f88140a)
- [Prime](https://optimistic.etherscan.io/address/0xE76d2173546Be97Fa6E18358027BdE9742a649f7)
- [PrimeLiquidityProvider](https://optimistic.etherscan.io/address/0x6412f6cd58D0182aE150b90B5A99e285b91C1a12)
- [VTreasuryV8](https://optimistic.etherscan.io/address/0x104c01EB7b4664551BE6A9bdB26a8C5c6Be7d3da)
- [XVS](https://optimistic.etherscan.io/address/0x4a971e87ad1F61f7f3081645f52a99277AE917cF)
- [XVSStore](https://optimistic.etherscan.io/address/0xFE548630954129923f63113923eF5373E10589d3)
- [XVSVaultProxy](https://optimistic.etherscan.io/address/0x133120607C018c949E91AE333785519F6d947e01)
- [XVSBridgeAdmin](https://optimistic.etherscan.io/address/0x3c307DF1Bf3198a2417d9CA86806B307D147Ddf7)
- [DefaultProxyAdmin](https://optimistic.etherscan.io/address/0xeaF9490cBEA6fF9bA1D23671C39a799CeD0DCED2)

If passed, this VIP will transfer the following contracts, from the [Guardian wallet](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207) to the [Normal Timelock](https://opbnbscan.com/address/0x10f504e939b912569Dca611851fDAC9E3Ef86819) on opBNB:

- [Pool registry](https://opbnbscan.com/address/0x345a030Ad22e2317ac52811AC41C1A63cfa13aEe)
- [ComptrollerBeacon](https://opbnbscan.com/address/0x11C3e19236ce17729FC66b74B537de00C54d44e7)
- [Comptroller (Core pool)](https://opbnbscan.com/address/0xD6e3E2A1d8d95caE355D15b3b9f8E5c2511874dd)
- [NativeTokenGateway (vWBNB Core pool)](https://opbnbscan.com/address/0x7bAf6019C90B93aD30f8aD6a2EcCD2B11427b29f)
- [VTokenBeacon](https://opbnbscan.com/address/0xfeD1d3a13597c5aBc893Af41ED5cb17e64c847c7)
- Markets:
    - [vBTCB_Core](https://opbnbscan.com/address/0xED827b80Bd838192EA95002C01B5c6dA8354219a)
    - [vETH_Core](https://opbnbscan.com/address/0x509e81eF638D489936FA85BC58F52Df01190d26C)
    - [vFDUSD_Core](https://opbnbscan.com/address/0x13B492B8A03d072Bab5C54AC91Dba5b830a50917)
    - [vUSDT_Core](https://opbnbscan.com/address/0xb7a01Ba126830692238521a1aA7E7A7509410b8e)
    - [vWBNB_Core](https://opbnbscan.com/address/0x53d11cB8A0e5320Cd7229C3acc80d1A0707F2672)
- Oracles:
    - [BoundValidator](https://opbnbscan.com/address/0xd1f80C371C6E2Fa395A5574DB3E3b4dAf43dadCE)
    - [ResilientOracle](https://opbnbscan.com/address/0x8f3618c4F0183e14A218782c116fb2438571dAC9)
    - [BinanceOracle](https://opbnbscan.com/address/0xB09EC9B628d04E1287216Aa3e2432291f50F9588)
- [ProtocolShareReserve](https://opbnbscan.com/address/0xA2EDD515B75aBD009161B15909C19959484B0C1e)
- [VTreasuryV8](https://opbnbscan.com/address/0xDDc9017F3073aa53a4A8535163b0bf7311F72C52)
- [XVS](https://opbnbscan.com/address/0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61)
- [XVSStore](https://opbnbscan.com/address/0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775)
- [XVSVaultProxy](https://opbnbscan.com/address/0x7dc969122450749A8B0777c0e324522d67737988)
- [XVSBridgeAdmin](https://opbnbscan.com/address/0x52fcE05aDbf6103d71ed2BA8Be7A317282731831)
- [DefaultProxyAdmin](https://opbnbscan.com/address/0xF77bD1D893F67b3EB2Cd256239c98Ba3F238fb52)

From now on, every privilege function executable only by the governance contract should be executed with a Normal VIP. To transfer this contract, [this](https://app.safe.global/transactions/tx?safe=oeth:0x2e94dd14E81999CdBF5deDE31938beD7308354b3&id=multisig_0x2e94dd14E81999CdBF5deDE31938beD7308354b3_0xabc5f4d739a8228e8e2b687602811abfed6fd09fcdc0bb06123a448c23a09515) and [this](https://multisig.bnbchain.org/transactions/tx?safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207&id=multisig_0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207_0xb055f47e9da1123babcbef3d21bd1e7e584cd694a71c4dee29fecf4aac3326f7) transactions are required, where the two steps transfer is initiated by the Guardian wallets. If this VIP passes, those transactions will be executed. Otherwise, they will be rejected.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the contracts are properly transferred and the Normal Timelock can execute the privilege functions
- **Deployment on testnet**: the same transfer has been performed on testnet

#### References

- [VIP simulation, and links to the testnet transactions](https://github.com/VenusProtocol/vips/pull/450)
- [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge)    
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };
  return makeProposal(
    [
      {
        target: opmainnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: opbnbmainnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPMAINNET_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPMAINNET_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [opmainnet.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPBNBMAINNET_XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [opbnbmainnet.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPMAINNET_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPBNBMAINNET_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: opmainnet.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPMAINNET_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: opmainnet.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: opmainnet.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: opbnbmainnet.BINANCE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: opbnbmainnet.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },

      {
        target: opmainnet.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: opbnbmainnet.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },

      {
        target: OPMAINNET_PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPMAINNET_PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },

      {
        target: OPMAINNET_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      ...OPMAINNET_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opmainnet,
        };
      }),
      ...OPMAINNET_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opmainnet,
        };
      }),
      {
        target: OPBNBMAINNET_POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
      ...OPBNBMAINNET_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opbnbmainnet,
        };
      }),
      ...OPBNBMAINNET_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opbnbmainnet,
        };
      }),
      ...OPMAINNET_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opmainnet,
        };
      }),

      ...OPBNBMAINNET_NTGs.map(ntg => {
        return {
          target: ntg,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.opbnbmainnet,
        };
      }),

      {
        target: OPMAINNET_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opmainnet,
      },
      {
        target: OPBNBMAINNET_PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip433;
