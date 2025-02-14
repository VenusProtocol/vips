import { parseUnits } from "ethers/lib/utils";

import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { RemoteBridgeCommand, RemoteBridgeEntry } from "./types";

export const UNICHAIN_SEPOLIA_TRUSTED_REMOTE = "0xCAF833318a6663bb23aa7f218e597c2F7970b4D2";

export const MIN_DST_GAS = "300000";

export const remoteBridgeEntries: RemoteBridgeEntry[] = [
  {
    bridgeAdmin: "0xB164Cb262328Ca44a806bA9e3d4094931E658513",
    proxyOFT: "0x0E132cd94fd70298b747d2b4D977db8d086e5fD0",
    dstChainId: undefined,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0xd3c6bdeeadB2359F726aD4cF42EAa8B7102DAd9B",
    proxyOFT: "0xc340b7d3406502F43dC11a988E4EC5bbE536E642",
    dstChainId: LzChainId.sepolia,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff",
    proxyOFT: "0xA03205bC635A772E533E7BE36b5701E331a70ea3",
    dstChainId: LzChainId.opbnbtestnet,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0xc94578caCC89a29B044a0a1D54d20d48A645E5C8",
    proxyOFT: "0xFdC5cEC63FD167DA46cF006585b30D03B104eFD4",
    dstChainId: LzChainId.arbitrumsepolia,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0x28cfE3f2D7D8944FAd162a058260ec922C19065E",
    proxyOFT: "0x760461ccB2508CAAa2ECe0c28af3a4707b853043",
    dstChainId: LzChainId.zksyncsepolia,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0x6bBcB95eCF9BEc9AE91d5Ad227783e3913145321",
    proxyOFT: "0x79a36dc9a43D05Db4747c59c02F48ed500e47dF1",
    dstChainId: LzChainId.opsepolia,
    maxDailyLimit: parseUnits("100000", 18),
    maxSingleTransactionLimit: parseUnits("20000", 18),
    maxDailyReceiveLimit: parseUnits("102000", 18),
    maxSingleReceiveTransactionLimit: parseUnits("20400", 18),
  },
  {
    bridgeAdmin: "0xE431E82d8fFfd81E7c082BeC7Fe2C306f5c988aD",
    proxyOFT: "0xD5Cd1fD17B724a391C1bce55Eb9d88E3205eED60",
    dstChainId: LzChainId.basesepolia,
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
      params: [LzChainId.unichainsepolia, UNICHAIN_SEPOLIA_TRUSTED_REMOTE],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMinDstGas(uint16,uint16,uint256)",
      params: [LzChainId.unichainsepolia, 0, MIN_DST_GAS],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [LzChainId.unichainsepolia, remoteBridgeEntry.maxDailyLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [LzChainId.unichainsepolia, remoteBridgeEntry.maxSingleTransactionLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [LzChainId.unichainsepolia, remoteBridgeEntry.maxDailyReceiveLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [LzChainId.unichainsepolia, remoteBridgeEntry.maxSingleReceiveTransactionLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
  ];
}

const vip452 = () => {
  const meta = {
    version: "v2",
    title: "VIP-452 Enable Unichain sepolia bridge",
    description: `#### Summary Enable Unichain sepolia bridge`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(remoteBridgeEntries.flatMap(getRemoteBridgeCommands), meta, ProposalType.REGULAR);
};

export default vip452;
