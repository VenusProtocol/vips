import { parseUnits } from "ethers/lib/utils";

import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { RemoteBridgeCommand, RemoteBridgeEntry } from "./types";

export const BASE_MAINNET_TRUSTED_REMOTE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";

export const MIN_DST_GAS = "300000";

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
];

function getRemoteBridgeCommands(remoteBridgeEntry: RemoteBridgeEntry): RemoteBridgeCommand[] {
  return [
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setTrustedRemoteAddress(uint16,bytes)",
      params: [LzChainId.basemainnet, BASE_MAINNET_TRUSTED_REMOTE],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMinDstGas(uint16,uint16,uint256)",
      params: [LzChainId.basemainnet, 0, MIN_DST_GAS],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [LzChainId.basemainnet, remoteBridgeEntry.maxDailyLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [LzChainId.basemainnet, remoteBridgeEntry.maxSingleTransactionLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [LzChainId.basemainnet, remoteBridgeEntry.maxDailyReceiveLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [LzChainId.basemainnet, remoteBridgeEntry.maxSingleReceiveTransactionLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
  ];
}

const vip500 = () => {
  const meta = {
    version: "v2",
    title: "VIP-500 Enable Base sepolia bridge",
    description: `#### Summary Enable Base bridge`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(remoteBridgeEntries.flatMap(getRemoteBridgeCommands), meta, ProposalType.REGULAR);
};

export default vip500;
