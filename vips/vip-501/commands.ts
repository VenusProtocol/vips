import { LzChainId } from "src/types";

import { ACM, Assets, CONVERTER_NETWORK, converters } from "./testnetAddresses";

type IncentiveAndAccessibility = [number, number];

interface AcceptOwnership {
  target: string;
  signature: string;
  params: [];
  dstChainId: number;
}

interface CallPermission {
  target: string;
  signature: string;
  params: [string, string, string];
  dstChainId: number;
}

export const grant = (target: string, signature: string, caller: string): CallPermission => {
  const config: CallPermission = {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [target, signature, caller],
    dstChainId: LzChainId.unichainsepolia,
  };

  return config;
};

const incentiveAndAccessibility: IncentiveAndAccessibility = [0, 1];

function generateAcceptOwnershipCommands(ConvertersArray: string[]): AcceptOwnership[] {
  const acceptOwnershipCommandsArray: AcceptOwnership[] = [];

  for (const converter of ConvertersArray) {
    const config: AcceptOwnership = {
      target: converter,
      signature: "acceptOwnership()",
      params: [],
      dstChainId: LzChainId.unichainsepolia,
    };

    acceptOwnershipCommandsArray.push(config);
  }

  return acceptOwnershipCommandsArray;
}

const generateSetConverterNetworkCommands = () => {
  return converters.map(converter => ({
    target: converter,
    signature: "setConverterNetwork(address)",
    params: [CONVERTER_NETWORK],
    dstChainId: LzChainId.unichainsepolia,
  }));
};

const generateAddConverterNetworkCommands = () => {
  return converters.map(converter => ({
    target: CONVERTER_NETWORK,
    signature: "addTokenConverter(address)",
    params: [converter],
    dstChainId: LzChainId.unichainsepolia,
  }));
};

export const incentiveAndAccessibilities = new Array(Assets.length - 1).fill(incentiveAndAccessibility);

export const acceptOwnershipCommandsAllConverters: AcceptOwnership[] = generateAcceptOwnershipCommands(converters);

export const setConverterNetworkCommands = generateSetConverterNetworkCommands();

export const addConverterNetworkCommands = generateAddConverterNetworkCommands();
