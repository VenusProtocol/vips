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
export const LIQUIDITY_PROVIDER = "0xe4E14BdC7dAD60F1d60ec8153D04322Ff2f9B100";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

export const XVS_AMOUNT_TO_BRIDGE = parseUnits("19500", 18);
export const XVS_AMOUNT_TO_DEX = parseUnits("5000", 18);
export const USDT_AMOUNT_TO_DEX = parseUnits("27000", 18);

export const ETH_AMOUNT_TO_LIQUIDITY_PROVIDER = parseUnits("1", 18);
export const USDC_AMOUNT_TO_VANGUARD_TREASURY = parseUnits("5000", 18);

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

const vip455 = () => {
  const meta = {
    version: "v2",
    title: "VIP-455 ",
    description: `#### Summary`,
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
        params: [USDC, USDC_AMOUNT_TO_VANGUARD_TREASURY, VANGUARD_TREASURY],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT_TO_LIQUIDITY_PROVIDER, LIQUIDITY_PROVIDER],
      },
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip455;
