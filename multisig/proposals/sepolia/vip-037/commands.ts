import { ACM, Assets, CONVERTER_NETWORK, GUARDIAN, converters } from "./Addresses";

type IncentiveAndAccessibility = [number, number];

interface AcceptOwnership {
  target: string;
  signature: string;
  params: [];
}

interface ConverterCommand {
  target: string;
  signature: string;
  params: [string];
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

function generateConverterCommands(ConvertersArray: string[]): ConverterCommand[] {
  const commandsArray: ConverterCommand[] = [];

  for (const converter of ConvertersArray) {
    // Add AddConverterNetwork command
    const addConverterNetworkConfig: ConverterCommand = {
      target: converter,
      signature: "setConverterNetwork(address)",
      params: [CONVERTER_NETWORK],
    };

    // Add AddTokenConverter command
    const addTokenConverterConfig: ConverterCommand = {
      target: CONVERTER_NETWORK,
      signature: "addTokenConverter(address)",
      params: [converter],
    };

    commandsArray.push(addConverterNetworkConfig);
    commandsArray.push(addTokenConverterConfig);
  }

  return commandsArray;
}

function generateCallPermissionCommands(ConvertersArray: string[]): CallPermission[] {
  const callPermissionCommandsArray: CallPermission[] = [];

  for (const converter of ConvertersArray) {
    const config1 = grant(converter, "setConversionConfig(address,address,ConversionConfig)", GUARDIAN);
    const config2 = grant(converter, "pauseConversion()", GUARDIAN);
    const config3 = grant(converter, "resumeConversion()", GUARDIAN);
    const config4 = grant(converter, "setMinAmountToConvert(uint256)", GUARDIAN);

    callPermissionCommandsArray.push(config1);
    callPermissionCommandsArray.push(config2);
    callPermissionCommandsArray.push(config3);
    callPermissionCommandsArray.push(config4);
  }
  return callPermissionCommandsArray;
}

export const incentiveAndAccessibilityForUSDTPrimeConverter: IncentiveAndAccessibility[] = [];
export const incentiveAndAccessibilityForUSDCPrimeConverter: IncentiveAndAccessibility[] = [];
export const incentiveAndAccessibilityForWBTCPrimeConverter: IncentiveAndAccessibility[] = [];
export const incentiveAndAccessibilityForWETHPrimeConverter: IncentiveAndAccessibility[] = [];
export const incentiveAndAccessibilityForXVSVaultConverter: IncentiveAndAccessibility[] = [];

for (let i = 0; i < Assets.length - 1; i++) {
  incentiveAndAccessibilityForUSDTPrimeConverter.push(incentiveAndAccessibility);

  incentiveAndAccessibilityForUSDCPrimeConverter.push(incentiveAndAccessibility);

  incentiveAndAccessibilityForWBTCPrimeConverter.push(incentiveAndAccessibility);

  incentiveAndAccessibilityForWETHPrimeConverter.push(incentiveAndAccessibility);

  incentiveAndAccessibilityForXVSVaultConverter.push(incentiveAndAccessibility);
}

export const acceptOwnershipCommandsAllConverters: AcceptOwnership[] = generateAcceptOwnershipCommands(converters);

export const converterCommands: ConverterCommand[] = generateConverterCommands(converters);

export const callPermissionCommandsAllConverter: CallPermission[] = generateCallPermissionCommands(converters);
