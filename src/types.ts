import { BigNumberish } from "ethers";

export type SUPPORTED_NETWORKS =
  | "bsctestnet"
  | "bscmainnet"
  | "sepolia"
  | "ethereum"
  | "opbnbtestnet"
  | "opbnbmainnet"
  | "xlayertestnet"
  | "zksyncsepolia";

export type REMOTE_NETWORKS =
  | "sepolia"
  | "ethereum"
  | "opbnbtestnet"
  | "opbnbmainnet"
  | "arbitrumsepolia"
  | "arbitrumone";

export const REMOTE_TESTNET_NETWORKS = ["sepolia", "opbnbtestnet", "arbitrumsepolia", "zksyncsepolia"];
export const REMOTE_MAINNET_NETWORKS = ["ethereum", "opbnbmainnet", "arbitrumone", "zksyncmainnet"];
export interface ProposalMeta {
  version: string;
  title: string;
  description: string;
  forDescription: string;
  againstDescription: string;
  abstainDescription: string;
}

export enum ProposalType {
  REGULAR = 0,
  FAST_TRACK = 1,
  CRITICAL = 2,
}

export interface Proposal {
  targets: string[];
  values: BigNumberish[];
  signatures: string[];
  params: any[][];
  meta?: ProposalMeta;
  type?: ProposalType;
}

export interface Command {
  target: string;
  signature: string;
  params: any[];
  value?: string;
  dstChainId?: LzChainId;
}

export interface TokenConfig {
  asset: string;
  oracles: string[];
  enableFlagsForOracles: boolean[];
}

export enum LzChainId {
  bscmainnet = 102,
  bsctestnet = 10102,
  ethereum = 101,
  sepolia = 10161,
  opbnbmainnet = 202,
  opbnbtestnet = 10202,
  arbitrumsepolia = 10231,
  arbitrumone = 110,
  zksyncsepolia = 10248,
  zksyncmainnet = 165,
  opsepolia = 10232,
  opmainnet = 111,
}
