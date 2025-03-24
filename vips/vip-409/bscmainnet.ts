import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { PSR } from "../../multisig/proposals/basemainnet/vip-003";
import {
  BOUND_VALIDATOR,
  COMPTROLLERS,
  NATIVE_TOKEN_GATEWAY,
  PLP,
  POOL_REGISTRY,
  PRIME,
  VTOKENS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_STORE,
} from "../../multisig/proposals/basemainnet/vip-007";

export type RemoteBridgeEntry = {
  bridgeAdmin: string;
  proxyOFT: string;
  dstChainId: LzChainId | undefined;
};

export type RemoteBridgeCommand = {
  target: string;
  signature: string;
  params: any[];
  dstChainId: LzChainId | undefined;
};

export const BASE_MAINNET_TRUSTED_REMOTE = "0x3dD92fB51a5d381Ae78E023dfB5DD1D45D2426Cd";

export const remoteBridgeEntries: RemoteBridgeEntry[] = [
  {
    bridgeAdmin: "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21",
    proxyOFT: "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854",
    dstChainId: undefined,
  },
  {
    bridgeAdmin: "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96",
    proxyOFT: "0x888E317606b4c590BBAD88653863e8B345702633",
    dstChainId: LzChainId.ethereum,
  },
  {
    bridgeAdmin: "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831",
    proxyOFT: "0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2",
    dstChainId: LzChainId.opbnbmainnet,
  },
  {
    bridgeAdmin: "0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784",
    proxyOFT: "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6",
    dstChainId: LzChainId.arbitrumone,
  },
  {
    bridgeAdmin: "0x2471043F05Cc41A6051dd6714DC967C7BfC8F902",
    proxyOFT: "0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116",
    dstChainId: LzChainId.zksyncmainnet,
  },
  {
    bridgeAdmin: "0x3c307DF1Bf3198a2417d9CA86806B307D147Ddf7",
    proxyOFT: "0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4",
    dstChainId: LzChainId.opmainnet,
  },
];

function getRemoteBridgeCommands(remoteBridgeEntry: RemoteBridgeEntry): RemoteBridgeCommand[] {
  return [
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [LzChainId.basemainnet, BASE_MAINNET_TRUSTED_REMOTE],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
  ];
}

const basemainnet = NETWORK_ADDRESSES.basemainnet;
const vip409 = () => {
  const meta = {
    version: "v2",
    title: "VIP-409 [Base] Transfer ownership of contracts to Governance and enable XVS bridge",
    description: `#### Summary

Following the community proposal [Deploy Venus on Base](https://community.venus.io/t/deploy-venus-on-base/4630), and the [associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x353f5fb23ff895d89c21271ea1904af65e60557aeec317b24ce56d728d29b8c1), if passed, if passed, this VIP will:

- Transfer the ownership of every Venus contract on Base to the Normal Timelock
- Configure the right trustworthiness relationships among the XVS bridge contracts of the supported networks and Base

#### Description

If passed, this VIP will transfer the ownership of the following contracts, from the Guardian wallet to the [Normal Timelock](https://basescan.org/address/0x21c12f2946a1a66cBFf7eb997022a37167eCf517):

- [AccessControlManager](https://basescan.org/address/0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB)
- [ComptrollerBeacon](https://basescan.org/address/0x1b6dE1C670db291bcbF793320a42dbBD858E67aC)
- [CorePoolComptroller](https://basescan.org/address/%220x0C7973F9598AA62f9e03B94E92C967fD5437426C%22)
- [NativeTokenGateway](https://basescan.org/address/0x8e890ca3829c740895cdEACd4a3BE36ff9343643)
- Markets:
    - [vUSDC_Core](https://basescan.org/address/0x3cb752d175740043Ec463673094e06ACDa2F9a2e)
    - [vWETH_Core](https://basescan.org/address/0xEB8A79bD44cF4500943bf94a2b4434c95C008599)
    - [vcbBTC_Core](https://basescan.org/address/0x7bBd1005bB24Ec84705b04e1f2DfcCad533b6D72)
- Oracles:
    - [BoundValidator](https://basescan.org/address/0x66dDE062D3DC1BB5223A0096EbB89395d1f11DB0)
    - [ResilientOracle](https://basescan.org/address/0xcBBf58bD5bAdE357b634419B70b215D5E9d6FbeD)
    - [ChainlinkOracle](https://basescan.org/address/0x6F2eA73597955DB37d7C06e1319F0dC7C7455dEb)
    - [RedStoneOracle](https://basescan.org/address/0xcBBf58bD5bAdE357b634419B70b215D5E9d6FbeD)
- [PoolRegistry](https://basescan.org/address/0xeef902918DdeCD773D4B422aa1C6e1673EB9136F)
- Prime:
    - [Prime](https://basescan.org/address/0xD2e84244f1e9Fca03Ff024af35b8f9612D5d7a30)
    - [PrimeLiquidityProvider](https://basescan.org/address/0xcB293EB385dEFF2CdeDa4E7060974BB90ee0B208)
- [ProtocolShareReserve](https://basescan.org/address/0x3565001d57c91062367C3792B74458e3c6eD910a)
- [ProxyAdmin](https://basescan.org/address/0x7B06EF6b68648C61aFE0f715740fE3950B90746B)
- [VTokenBeacon](https://basescan.org/address/0x87a6476510368c4Bfb70d04A3B0e5a881eC7f0d1)
- [VTreasury](https://basescan.org/address/0xbefD8d06f403222dd5E8e37D2ba93320A97939D1)
- [XVS](https://basescan.org/address/0xebB7873213c8d1d9913D8eA39Aa12d74cB107995)
- [XVSBridgeAdmin](https://basescan.org/address/0x6303FEcee7161bF959d65df4Afb9e1ba5701f78e)
- [XVSStore](https://basescan.org/address/0x11b084Cfa559a82AAC0CcD159dBea27899c7955A)
- [XVSVaultProxy](https://basescan.org/address/0x708B54F2C3f3606ea48a8d94dab88D9Ab22D7fCd)

From now on, every privilege function executable only the owner/admin of the contract should be executed with a Normal VIP. To transfer the ownership of this contract, [this](https://app.safe.global/transactions/tx?safe=base:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C&id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0x27fce7f893b9ee2f09171e507f69cad2ee78580c0801d0851b66f2e4966bad7d) transaction is required, where the two steps transfer is initiated by the Guardian wallet. If this VIP passes, that transaction will be executed. Otherwise, it will be rejected.

Moreover, this VIP sets the trustworthiness relationships among the XVS bridge contracts of the supported networks and Base, wrongly set in the [VIP-407](https://app.venus.io/#/governance/proposal/407?chainId=56).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the ownership is properly transferred and the Normal Timelock can execute the privilege functions
- **Deployment on testnet**: the same transfer has been performed on testnet

#### Deployed contracts on Base

- XVSBridgeAdmin: [0x6303FEcee7161bF959d65df4Afb9e1ba5701f78e](https://basescan.org/address/0x6303FEcee7161bF959d65df4Afb9e1ba5701f78e)
- XVSProxyOFTDest: [0x3dD92fB51a5d381Ae78E023dfB5DD1D45D2426Cd](https://basescan.org/address/0x3dD92fB51a5d381Ae78E023dfB5DD1D45D2426Cd)
- Guardian: [0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C](https://basescan.org/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C)

#### Bridge contract on the rest of supported networks

- [Ethereum](https://etherscan.io/address/0x888E317606b4c590BBAD88653863e8B345702633)
- [**BNB Chain**](https://bscscan.com/address/0xf8F46791E3dB29a029Ec6c9d946226f3c613e854)
- [opBNB](https://opbnbscan.com/address/0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2)
- [Arbitrum one](https://arbiscan.io/address/0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6)
- [zkSync Era](https://explorer.zksync.io/address/0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116)
- [Optimism](https://optimistic.etherscan.io/address/0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4)

#### References

- [VIP simulation, and links to the testnet transactions](https://github.com/VenusProtocol/vips/pull/441)
- [Chaos labs recommendations about the deployment on Base](https://community.venus.io/t/deploy-venus-on-base/4630/13)
- [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge)
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };
  return makeProposal(
    [
      {
        target: PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },

      {
        target: PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },

      {
        target: POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      ...COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.basemainnet,
        };
      }),
      ...VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.basemainnet,
        };
      }),
      {
        target: basemainnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },

      {
        target: XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: basemainnet.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: basemainnet.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: basemainnet.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: basemainnet.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: NATIVE_TOKEN_GATEWAY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setWhitelist(address,bool)",
        params: [basemainnet.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.basemainnet,
      },
      ...remoteBridgeEntries.flatMap(getRemoteBridgeCommands),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip409;
