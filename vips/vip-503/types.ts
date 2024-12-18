import { BigNumber } from "ethers";

import { LzChainId } from "../../src/types";

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
