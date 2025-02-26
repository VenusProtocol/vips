import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { berachainbartio } = NETWORK_ADDRESSES;

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0x1ba10ca9a744131aD8428D719767816A693c3b71";
export const ACM = "0xEf368e4c1f9ACC9241E66CD67531FEB195fF7536";
export const XVS_BRIDGE_ADMIN_PROXY = "0xdE489177E607F1C6D9d27325FA38152fA462F7cC";
export const XVS = "0x75A3668f0b0d06E45601C883b0c66f7Dd2364208";
export const XVS_BRIDGE_DEST = "0x95676A9Ec0d7c11f207Bc180350Bd53bfed31a59";
export const XVS_STORE = "0xED54Eaa582f07886c15A22eF81582f68dBd987C1";

export const OPBNB_TESTNET_TRUSTED_REMOTE = "0xa03205bc635a772e533e7be36b5701e331a70ea3";
export const SEPOLIA_TRUSTED_REMOTE = "0xc340b7d3406502f43dc11a988e4ec5bbe536e642";
export const BNB_TESTNET_TRUSTED_REMOTE = "0x0e132cd94fd70298b747d2b4d977db8d086e5fd0";
export const ARBITRUM_SEPOLIA_REMOTE = "0xfdc5cec63fd167da46cf006585b30d03b104efd4";
export const ZYSYNC_SEPOLIA_REMOTE = "0x760461ccb2508caaa2ece0c28af3a4707b853043";
export const OP_SEPOLIA_TRUSTED_REMOTE = "0x79a36dc9a43d05db4747c59c02f48ed500e47df1";
export const UNICHAIN_SEPOLIA_TRUSTED_REMOTE = "0xcaf833318a6663bb23aa7f218e597c2f7970b4d2";
export const BASE_SEPOLIA_TRUSTED_REMOTE = "0xd5cd1fd17b724a391c1bce55eb9d88e3205eed60";

export const XVS_MINT_LIMIT = parseUnits("500000", 18);
export const MIN_DST_GAS = "300000";

export type RemoteBridgeEntry = {
  bridgeAdmin: string;
  proxyOFT: string;
  maxDailyLimit: BigNumber | number;
  maxSingleTransactionLimit: BigNumber | number;
  maxDailyReceiveLimit: BigNumber | number;
  maxSingleReceiveTransactionLimit: BigNumber | number;
  dstChainId: LzChainId | undefined;
};

export type RemoteBridgeCommand = {
  target: string;
  signature: string;
  params: any[];
  dstChainId: LzChainId | undefined;
};

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
    bridgeAdmin: "0xc570c62bbECCd0a63408de95d9418ad7b89Ff63F",
    proxyOFT: "0xCAF833318a6663bb23aa7f218e597c2F7970b4D2",
    dstChainId: LzChainId.unichainsepolia,
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
      params: [LzChainId.berachainbartio, XVS_BRIDGE_DEST],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMinDstGas(uint16,uint16,uint256)",
      params: [LzChainId.berachainbartio, 0, MIN_DST_GAS],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxDailyLimit(uint16,uint256)",
      params: [LzChainId.berachainbartio, remoteBridgeEntry.maxDailyLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxSingleTransactionLimit(uint16,uint256)",
      params: [LzChainId.berachainbartio, remoteBridgeEntry.maxSingleTransactionLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxDailyReceiveLimit(uint16,uint256)",
      params: [LzChainId.berachainbartio, remoteBridgeEntry.maxDailyReceiveLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
    {
      target: remoteBridgeEntry.bridgeAdmin,
      signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
      params: [LzChainId.berachainbartio, remoteBridgeEntry.maxSingleReceiveTransactionLimit],
      dstChainId: remoteBridgeEntry.dstChainId,
    },
  ];
}

const vip459 = () => {
  const meta = {
    version: "v2",
    title: "VIP-459",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [10],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.bsctestnet, BNB_TESTNET_TRUSTED_REMOTE],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.opbnbtestnet, OPBNB_TESTNET_TRUSTED_REMOTE],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.sepolia, SEPOLIA_TRUSTED_REMOTE],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.arbitrumsepolia, ARBITRUM_SEPOLIA_REMOTE],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.zksyncsepolia, ZYSYNC_SEPOLIA_REMOTE],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.opsepolia, OP_SEPOLIA_TRUSTED_REMOTE],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.unichainsepolia, UNICHAIN_SEPOLIA_TRUSTED_REMOTE],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setTrustedRemoteAddress(uint16,bytes)",
        params: [LzChainId.basesepolia, BASE_SEPOLIA_TRUSTED_REMOTE],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setWhitelist(address,bool)",
        params: [berachainbartio.VTREASURY, true],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: XVS_BRIDGE_ADMIN_PROXY,
        signature: "setWhitelist(address,bool)",
        params: [berachainbartio.NORMAL_TIMELOCK, true],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: XVS,
        signature: "setMintCap(address,uint256)",
        params: [XVS_BRIDGE_DEST, XVS_MINT_LIMIT],
        dstChainId: LzChainId.berachainbartio,
      },
      ...remoteBridgeEntries.flatMap(getRemoteBridgeCommands),
      {
        target: berachainbartio.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.XVS_VAULT_PROXY,
        signature: "add(address,uint256,address,uint256,uint256)",
        params: [XVS, 100, XVS, "0", 300],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.XVS_VAULT_PROXY,
        signature: "pause()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip459;
