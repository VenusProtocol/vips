import { BigNumber } from "ethers";

import { LzChainId } from "../../src/types";

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
