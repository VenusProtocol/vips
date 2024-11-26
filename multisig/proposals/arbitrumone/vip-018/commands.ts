import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";

import { ACM, Assets, CONVERTER_NETWORK, converters } from "./addresses";

const { arbitrumone } = NETWORK_ADDRESSES;

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN } = arbitrumone;
const timelocks = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

type IncentiveAndAccessibility = [number, number];

interface AcceptOwnership {
  target: string;
  signature: string;
  params: [];
}

interface CallPermission {
  target: string;
  signature: string;
  params: [string, string, string];
}

export const grant = (target: string, signature: string, caller: string): CallPermission => {
  const config: CallPermission = {
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [target, signature, caller],
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
  }));
};

const generateAddConverterNetworkCommands = () => {
  return converters.map(converter => ({
    target: CONVERTER_NETWORK,
    signature: "addTokenConverter(address)",
    params: [converter],
    dstChainId: LzChainId.arbitrumone,
  }));
};

function generateCallPermissionCommands(convertersArray: string[]): CallPermission[] {
  return convertersArray.flatMap(converter => [
    ...timelocks.flatMap(timelock => [
      grant(converter, "setConversionConfig(address,address,ConversionConfig)", timelock),
      grant(converter, "pauseConversion()", timelock),
      grant(converter, "resumeConversion()", timelock),
      grant(converter, "setMinAmountToConvert(uint256)", timelock),
    ]),
    grant(converter, "pauseConversion()", GUARDIAN),
    grant(converter, "resumeConversion()", GUARDIAN),
  ]);
}

export const incentiveAndAccessibilities = new Array(Assets.length - 1).fill(incentiveAndAccessibility);

export const acceptOwnershipCommandsAllConverters: AcceptOwnership[] = generateAcceptOwnershipCommands(converters);

export const setConverterNetworkCommands = generateSetConverterNetworkCommands();

export const addConverterNetworkCommands = generateAddConverterNetworkCommands();

export const callPermissionCommandsAllConverter: CallPermission[] = generateCallPermissionCommands(converters);
