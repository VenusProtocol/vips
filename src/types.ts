import { BigNumber, BigNumberish } from "ethers";

export type SUPPORTED_NETWORKS =
  | "bsctestnet"
  | "bscmainnet"
  | "sepolia"
  | "ethereum"
  | "arbitrumsepolia"
  | "arbitrumone"
  | "opbnbtestnet"
  | "opbnbmainnet"
  | "zksyncsepolia"
  | "zksyncmainnet"
  | "opsepolia"
  | "opmainnet"
  | "basesepolia"
  | "basemainnet"
  | "unichainsepolia"
  | "unichainmainnet";

export type REMOTE_NETWORKS = Exclude<SUPPORTED_NETWORKS, "bscmainnet" | "bsctestnet">;

export const REMOTE_TESTNET_NETWORKS = [
  "sepolia",
  "opbnbtestnet",
  "arbitrumsepolia",
  "zksyncsepolia",
  "opsepolia",
  "basesepolia",
  "unichainsepolia",
];
export const REMOTE_MAINNET_NETWORKS = [
  "ethereum",
  "opbnbmainnet",
  "arbitrumone",
  "zksyncmainnet",
  "opmainnet",
  "basemainnet",
  "unichainmainnet",
];

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
  // 1 means no change, 2 means double the gas fee. Will always be whole numbers.
  gasFeeMultiplicationFactor?: number[];
  // 1 means no change, 2 means double the gas fee. Will always be whole numbers.
  gasLimitMultiplicationFactor?: number[];
  meta?: ProposalMeta;
  type?: ProposalType;
  aggregatorBatches?: AggregatorBatch[];
}

export interface Command {
  target: string;
  signature: string;
  params: any[];
  value?: string;
  dstChainId?: LzChainId;
  // only matters for simulations. For some network forks, the gas fee estimation is not accurate. Should be a whole number.
  gasFeeMultiplicationFactor?: number;
  // only matters for simulations. For some network forks, the gas limit estimation is not accurate. Should be a whole number.
  gasLimitMultiplicationFactor?: number;
  // function string the aggregator is granted for this command when the target's ACM check differs from `signature`
  aclSignature?: string;
  // set by batch(): the commands of one batch() call form one aggregator batch
  batchGroup?: BatchOptions;
}

export interface BatchOptions {
  // stores the batch at this index, which must be the chain's next free index unless the batch is already stored there
  expectedIndex?: number;
  // the index the batch is already stored at: the stored calls must match, and the batch is never stored again
  actualIndex?: number;
}

export interface AggregatorCall {
  target: string;
  data: string;
  // not stored on-chain; names the call in simulation failures
  signature: string;
}

export interface CallPermission {
  target: string;
  signature: string;
}

export interface AggregatorBatch {
  network: SUPPORTED_NETWORKS;
  aggregator: string;
  // actualIndex, else expectedIndex, else the chain's next free index; undefined when the chain was not read
  index?: BigNumber;
  // whether `calls` are stored at `index` on the chain the proposal was built against
  seeded: boolean;
  calls: AggregatorCall[];
  // granted to the aggregator at the start of the batch and revoked at its end
  permissions: CallPermission[];
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
  basesepolia = 10245,
  basemainnet = 184,
  unichainsepolia = 10333,
  unichainmainnet = 320,
}
