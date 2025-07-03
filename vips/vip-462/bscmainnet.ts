import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  BOUND_VALIDATOR,
  COMPTROLLER,
  NTG,
  PLP,
  POOL_REGISTRY,
  PRIME,
  PSR,
  REWARD_DISTRIBUTOR,
  VTOKENS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_STORE,
} from "../../multisig/proposals/unichainmainnet/vip-010";

const { unichainmainnet } = NETWORK_ADDRESSES;
export const ACM_AGGREGATOR = "0x904D11b00bdB2740d16176cc00DE139d0d626115";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";

const vip462 = () => {
  const meta = {
    version: "v2",
    title: "VIP-462 [Unichain] Transfer contracts to Omnichain Governance",
    description: `#### Summary

If passed, this VIP will transfer the contracts on Unichain to the Normal Timelock, following the community proposals [Deploy Venus on Unichain](https://community.venus.io/t/deploy-venus-on-unichain/4859), and the associated [snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xbf2fff03c4f84620a8b3ece2e31d879224ee03c42aefc6dc94e9c2b40a5a634b).

#### Description

If passed, this VIP will transfer the following contracts, from the [Guardian wallet](https://uniscan.xyz/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C) to the [Normal Timelock](https://uniscan.xyz/address/0x918532A78d22419Da4091930d472bDdf532BE89a) on Unichain:

- [ComptrollerBeacon](https://uniscan.xyz/address/0xE57824ffF03fB19D7f93139A017a7E70f6F25166)
- [VTokenBeacon](https://uniscan.xyz/address/0x42c1Efb9Dd9424c5ac8e6EcEa4eb03940c4a15Fc)
- [XVS](https://uniscan.xyz/address/0x81908BBaad3f6fC74093540Ab2E9B749BB62aA0d)
- [DefaultProxyAdmin](https://uniscan.xyz/address/0x78e9fff2ab8daAB8559070d897C399E5e1C5074c)
- Markets of the Core pool
    - [USDC](https://uniscan.xyz/address/0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95)
    - [WETH](https://uniscan.xyz/address/0xc219BC179C7cDb37eACB03f993f9fDc2495e3374)
    - [UNI](https://uniscan.xyz/address/0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2) (to be enabled soon)
- [RewardsDistributor](https://uniscan.xyz/address/0x4630B71C1BD27c99DD86aBB2A18C50c3F75C88fb)
- [Core pool comptroller](https://uniscan.xyz/address/0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe)
- [Pool registry](https://uniscan.xyz/address/0x0C52403E16BcB8007C1e54887E1dFC1eC9765D7C)
- [NativeTokenGateway (vWETH Core pool)](https://uniscan.xyz/address/0x4441aE3bCEd3210edbA35d0F7348C493E79F1C52)
- Oracles:
    - [BoundValidator](https://uniscan.xyz/address/0xfdaA5dEEA7850997dA8A6E2F2Ab42E60F1011C19)
    - [RedStoneOracle](https://uniscan.xyz/address/0x4d41a36D04D97785bcEA57b057C412b278e6Edcc)
    - [ResilientOracle](https://uniscan.xyz/address/0x86D04d6FE928D888076851122dc6739551818f7E)
- [ProtocolShareReserve](https://uniscan.xyz/address/0x0A93fBcd7B53CE6D335cAB6784927082AD75B242)
- [Prime](https://uniscan.xyz/address/0x600aFf613d40D87C8Fe90Cb2e78e8e6667c0C872)
- [PrimeLiquidityProvider](https://uniscan.xyz/address/0x045a45603E1b073F444fe3Be7d5C7e0a5035afB7)
- [XVSStore](https://uniscan.xyz/address/0x0ee4b35c2cEAb19856Bf35505F81608d12B2a7Bb)
- [XVSVaultProxy](https://uniscan.xyz/address/0x5ECa0FBBc5e7bf49dbFb1953a92784F8e4248eF6)
- [XVSBridgeAdmin](https://uniscan.xyz/address/0x2EAaa880f97C9B63d37b39b0b316022d93d43604)

From now on, every privileged function executable only by the Governance contract should be executed with a Normal VIP. To transfer these contracts, [this](https://app.safe.global/transactions/tx?id=multisig_0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C_0x35c351c09754542bafa6c99f8f6378e1839611bcc6a49dba022628bb4ba25f8f&safe=unichain:0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C) transaction is required, where the two steps transfer is initiated by the Guardian wallet. If this VIP passes, this transaction will be executed. Otherwise, it will be rejected.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the contracts are properly transferred and the Normal Timelock can execute the privilege functions
- **Deployment on testnet**: the same transfer has been performed on testnet

#### References

- [VIP simulation, and links to the testnet transactions](https://github.com/VenusProtocol/vips/pull/509)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };
  return makeProposal(
    [
      {
        target: unichainmainnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setWhitelist(address,bool)",
        params: [unichainmainnet.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: unichainmainnet.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: PLP,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: REWARD_DISTRIBUTOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: COMPTROLLER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
      ...VTOKENS.map(vtoken => {
        return {
          target: vtoken,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.unichainmainnet,
        };
      }),
      {
        target: NTG,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip462;
