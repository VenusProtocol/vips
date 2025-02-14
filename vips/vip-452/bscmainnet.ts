import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { RemoteBridgeCommand, RemoteBridgeEntry } from "./types";

const { bscmainnet, unichainmainnet } = NETWORK_ADDRESSES;

export const UNICHAIN_MAINNET_TRUSTED_REMOTE = "0x9c95f8aa28fFEB7ECdC0c407B9F632419c5daAF8";

export const MIN_DST_GAS = "300000";

export const XVS_BRIDGE_BNB_CHAIN = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const CORE_COMPTROLLER = bscmainnet.UNITROLLER;
export const VANGUARD_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const XVS_AMOUNT_TO_BRIDGE = parseUnits("19500", 18);
export const XVS_AMOUNT_TO_DEX = parseUnits("5000", 18);
export const USDT_AMOUNT_TO_DEX = parseUnits("27000", 18);

export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
const BRIDGE_FEES = parseUnits("0.5", 18);

export const remoteBridgeEntries: RemoteBridgeEntry[] = [
  {
    bridgeAdmin: "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21",
    proxyOFT: "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854",
    dstChainId: undefined,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96",
    proxyOFT: "0x888E317606b4c590BBAD88653863e8B345702633",
    dstChainId: LzChainId.ethereum,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831",
    proxyOFT: "0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2",
    dstChainId: LzChainId.opbnbmainnet,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784",
    proxyOFT: "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6",
    dstChainId: LzChainId.arbitrumone,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0x2471043F05Cc41A6051dd6714DC967C7BfC8F902",
    proxyOFT: "0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116",
    dstChainId: LzChainId.zksyncmainnet,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0x3c307DF1Bf3198a2417d9CA86806B307D147Ddf7",
    proxyOFT: "0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4",
    dstChainId: LzChainId.opmainnet,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0x6303FEcee7161bF959d65df4Afb9e1ba5701f78e",
    proxyOFT: "0x3dd92fb51a5d381ae78e023dfb5dd1d45d2426cd",
    dstChainId: LzChainId.basemainnet,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
];

function getRemoteBridgeCommands(remoteBridgeEntry: RemoteBridgeEntry): RemoteBridgeCommand[] {
  return [
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [LzChainId.unichainmainnet, UNICHAIN_MAINNET_TRUSTED_REMOTE],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMinDstGas(uint16,uint16,uint256)",
      params: [LzChainId.unichainmainnet, 0, MIN_DST_GAS],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [LzChainId.unichainmainnet, remoteBridgeEntry.maxDailyLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [LzChainId.unichainmainnet, remoteBridgeEntry.maxSingleTransactionLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [LzChainId.unichainmainnet, remoteBridgeEntry.maxDailyReceiveLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [LzChainId.unichainmainnet, remoteBridgeEntry.maxSingleReceiveTransactionLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
  ];
}

const vip452 = () => {
  const meta = {
    version: "v2",
    title: "VIP-452 XVS bridge among Unichain and every supported network",
    description: `#### Summary

Following the community proposal [Deploy Venus on Unichain](https://community.venus.io/t/deploy-venus-on-unichain/4859), and the [associated](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xbf2fff03c4f84620a8b3ece2e31d879224ee03c42aefc6dc94e9c2b40a5a634b) [snapshots](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x6fb0e2eadd6713e6ed073122f3c7a576fa3499eed0bd4149fa7c081ab6d5f324), if passed, this VIP will enable the XVS Bridge on [Unichain](https://unichain.org/), and transfer funds to be used as incentives and Uniswap liquidity on the new chain, following the community proposal “[[Unichain] XVS Incentives Model Proposal](https://community.venus.io/t/unichain-xvs-incentives-model-proposal/4864)”.

#### Description

If passed, this VIP will perform the following actions:

- Enable the XVS Bridge among Unichain and the supported networks (BNB Chain, Ethereum, opBNB, Arbitrum one, zkSync Era, Optimism and Base) using [LayerZero](https://layerzero.network/) ([snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x62440d98cb7513d4873662203b7a27f9441880afa73105c55a733005de7ac9a1))
- Transfer funds to be used for rewards and DEX liquidity, following the community proposal “[[Unichain] XVS Incentives Model Proposal](https://community.venus.io/t/unichain-xvs-incentives-model-proposal/4864)” and the associated [snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x906bc08a32ad6474fcd7a9404c2b57975840a40483012d804c0e44fd3903e6d0):
    - Bridge 19,500 XVS from the [Core pool Comptroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the Venus Treasury on Unichain, to incentivize the markets and the XVS Vault on Unichain
    - Transfer 27,000 USDT from the Venus Treasury on BNB Chain to the [Vanguard Treasury](https://bscscan.com/address/0xf645a387180F5F74b968305dF81d54EB328d21ca), to fund the Uniswap pool XVS/UNI on Unichain
    - Transfer 5,000 XVS from the [Core pool Comptroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the [Vanguard Treasury](https://bscscan.com/address/0xf645a387180F5F74b968305dF81d54EB328d21ca), to fund the Uniswap pool XVS/UNI on Unichain

#### XVS Bridge

- Link the bridge contract on Unichain with the bridges on the different supported networks, setting the trustworthiness relationships
- Configuration of limits (they could be updated in the future with a new VIP):
    - Maximum bridged XVS in a single transaction: 20,000 USD
    - Maximum bridged XVS in 24 hours: 100,000 USD
    - Mintable XVS on Unichain: 500,000 XVS
- Governance is whitelisted, so it could bridge any amount of XVS to/from Unichain

The bridge contracts use LayerZero, specifically the [Omnichain Fungible Token V2 standard](https://layerzero.gitbook.io/docs/evm-guides/layerzero-omnichain-contracts/oft/oftv2):

- BNB chain → Unichain: XVS tokens are locked in BNB Chain bridge contract, and minted on Unichain
- Unichain → BNB chain: XVS tokens are burnt on Unichain, and released on BNB Chain
- Unichain ↔ rest of the networks: XVS tokens are burnt on the source network, and minted on the destination network

The Venus UI includes a section to allow the bridge of XVS tokens from a web user interface. A detailed technical guide is provided in the [Venus official documentation site](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge), to bridge XVS tokens directly interacting with the contracts.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, checking every configuration is correct
- **Deployment on testnet**: the same contracts have been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Audits**: Certik, Peckshield and Quantstamp have audited the deployed code related to the bridge. Moreover, the [LayerZero](https://layerzero.network/) team reviewed the design and the code directly related to the bridge. Certik, Quantstamp and Fairyproof have audited the code of the XVSVault on Unichain.

#### Audit reports

- [Certik audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/083_multichain_token_bridge_certik_20231226.pdf) (2023/December/26)
- [Quantstamp audit report](https://github.com/VenusProtocol/token-bridge/blob/323e95fa3c0167cca2fc1d2807e911e0bae54de9/audits/064_multichain_token_bridge_quantstamp_20231219.pdf) (2023/December/19)
- [Peckshield audit report](https://github.com/VenusProtocol/token-bridge/blob/04b0a8526bb2fa916785c41eefd94b4f84c12819/audits/079_multichain_token_bridge_peckshield_20231020.pdf) (2023/October/20)

#### Deployed contracts on Unichain

- [XVSBridgeAdmin](https://uniscan.xyz/address/0x2EAaa880f97C9B63d37b39b0b316022d93d43604)
- [XVSProxyOFTDest](https://uniscan.xyz/address/0x9c95f8aa28fFEB7ECdC0c407B9F632419c5daAF8)
- [XVS](https://uniscan.xyz/address/0x81908BBaad3f6fC74093540Ab2E9B749BB62aA0d)
- [Guardian](https://uniscan.xyz/address/0x1803Cf1D3495b43cC628aa1d8638A981F8CD341C)

#### Bridge contract on the rest of supported networks

- [Ethereum](https://etherscan.io/address/0x888E317606b4c590BBAD88653863e8B345702633)
- [BNB Chain](https://bscscan.com/address/0xf8F46791E3dB29a029Ec6c9d946226f3c613e854)
- [opBNB](https://opbnbscan.com/address/0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2)
- [Arbitrum one](https://arbiscan.io/address/0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6)
- [zkSync Era](https://explorer.zksync.io/address/0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116)
- [Optimism](https://optimistic.etherscan.io/address/0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4)
- [Base](https://basescan.org/address/0x3dD92fB51a5d381Ae78E023dfB5DD1D45D2426Cd)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/489)
- Snapshot [“Deploy Venus on Unichain”](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xbf2fff03c4f84620a8b3ece2e31d879224ee03c42aefc6dc94e9c2b40a5a634b)
- Snapshot [“[Unichain] XVS Incentives Model Proposal”](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x6fb0e2eadd6713e6ed073122f3c7a576fa3499eed0bd4149fa7c081ab6d5f324)
- [Technical article about the XVS Bridge](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...remoteBridgeEntries.flatMap(getRemoteBridgeCommands),
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT_TO_DEX, VANGUARD_TREASURY],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [VANGUARD_TREASURY, XVS_AMOUNT_TO_DEX],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, XVS_AMOUNT_TO_BRIDGE],
      },
      {
        target: bscmainnet.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_BNB_CHAIN, XVS_AMOUNT_TO_BRIDGE],
      },
      {
        target: XVS_BRIDGE_BNB_CHAIN,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.unichainmainnet,
          ethers.utils.defaultAbiCoder.encode(["address"], [unichainmainnet.VTREASURY]),
          XVS_AMOUNT_TO_BRIDGE,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: bscmainnet.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_BNB_CHAIN, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip452;
