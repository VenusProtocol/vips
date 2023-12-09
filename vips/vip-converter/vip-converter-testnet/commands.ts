import {
  ACM,
  Assets,
  BTCB_PRIME_CONVERTER,
  BaseAssets,
  CONVERTER_NETWORK,
  ETH_PRIME_CONVERTER,
  NORMAL_TIMELOCK,
  RISK_FUND_CONVERTER,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
  converters,
} from "./Addresses";

type IncentiveAndAccessibility = [number, number];
interface ConversionConfig {
  target: string;
  signature: string;
  params: [string, string, IncentiveAndAccessibility];
}

interface AcceptOwnership {
  target: string;
  signature: string;
  params: [];
}

interface AddTokenConverter {
  target: string;
  signature: string;
  params: [string];
}

interface AddConverterNetwork {
  target: string;
  signature: string;
  params: [string];
}

interface CallPermissionConverters {
  target: string;
  signature: string;
  params: [string, string, string];
}

function getIncentiveAndAccessibility(tokenIn: string, tokenOut: string): IncentiveAndAccessibility {
  const validTokenIns = [BaseAssets[2], BaseAssets[3], BaseAssets[4], BaseAssets[5]];

  if (validTokenIns.includes(tokenIn) && tokenOut === BaseAssets[0]) {
    return [0, 2];
  } else {
    return [0, 1];
  }
}

export function generateConversionConfigCommandsArray(
  tokenOutArray: string[],
  tokenIn: string,
  Converter: string,
): ConversionConfig[] {
  const conversionConfigCommandsArray: ConversionConfig[] = [];

  for (const tokenOut of tokenOutArray) {
    const incentiveAndAccessibility: IncentiveAndAccessibility = getIncentiveAndAccessibility(tokenIn, tokenOut);

    if (tokenOut !== tokenIn) {
      const config: ConversionConfig = {
        target: Converter,
        signature: "setConversionConfig(address,address,(uint256,uint8))",
        params: [tokenIn, tokenOut, incentiveAndAccessibility],
      };

      conversionConfigCommandsArray.push(config);
    }
  }

  return conversionConfigCommandsArray;
}

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

function generateAddTokenConverterCommands(ConvertersArray: string[]): AddTokenConverter[] {
  const addTokenConverterCommandsArray: AddTokenConverter[] = [];

  for (const converter of ConvertersArray) {
    const config: AddTokenConverter = {
      target: CONVERTER_NETWORK,
      signature: "addTokenConverter(address)",
      params: [converter],
    };

    addTokenConverterCommandsArray.push(config);
  }
  return addTokenConverterCommandsArray;
}

function generateAddConverterNetworkCommands(ConvertersArray: string[]): AddConverterNetwork[] {
  const addConverterNetworkCommandsArray: AddConverterNetwork[] = [];

  for (const converter of ConvertersArray) {
    const config: AddConverterNetwork = {
      target: converter,
      signature: "setConverterNetwork(address)",
      params: [CONVERTER_NETWORK],
    };

    addConverterNetworkCommandsArray.push(config);
  }
  return addConverterNetworkCommandsArray;
}

function generateCallPermissionCommands(ConvertersArray: string[]): CallPermissionConverters[] {
  const callPermissionCommandsArray: CallPermissionConverters[] = [];

  for (const converter of ConvertersArray) {
    const config1: CallPermissionConverters = {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "setConversionConfig(address,address,ConversionConfig)", NORMAL_TIMELOCK],
    };
    const config2: CallPermissionConverters = {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "pauseConversion()", NORMAL_TIMELOCK],
    };
    const config3: CallPermissionConverters = {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "resumeConversion()", NORMAL_TIMELOCK],
    };
    const config4: CallPermissionConverters = {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [converter, "setMinAmountToConvert(uint256)", NORMAL_TIMELOCK],
    };

    callPermissionCommandsArray.push(config1);
    callPermissionCommandsArray.push(config2);
    callPermissionCommandsArray.push(config3);
    callPermissionCommandsArray.push(config4);
  }

  return callPermissionCommandsArray;
}

export const conversionConfigCommandsRiskFundConverter: ConversionConfig[] = generateConversionConfigCommandsArray(
  Assets,
  BaseAssets[0],
  RISK_FUND_CONVERTER,
);

export const conversionConfigCommandsUSDTPrimeConverter: ConversionConfig[] = generateConversionConfigCommandsArray(
  Assets,
  BaseAssets[1],
  USDT_PRIME_CONVERTER,
);

export const conversionConfigCommandsUSDCPrimeConverter: ConversionConfig[] = generateConversionConfigCommandsArray(
  Assets,
  BaseAssets[2],
  USDC_PRIME_CONVERTER,
);

export const conversionConfigCommandsBTCBPrimeConverter: ConversionConfig[] = generateConversionConfigCommandsArray(
  Assets,
  BaseAssets[3],
  BTCB_PRIME_CONVERTER,
);

export const conversionConfigCommandsETHPrimeConverter: ConversionConfig[] = generateConversionConfigCommandsArray(
  Assets,
  BaseAssets[4],
  ETH_PRIME_CONVERTER,
);

export const conversionConfigCommandsXVSVaultConverter: ConversionConfig[] = generateConversionConfigCommandsArray(
  Assets,
  BaseAssets[5],
  XVS_VAULT_CONVERTER,
);

export const acceptOwnershipCommandsAllConverters: AcceptOwnership[] = generateAcceptOwnershipCommands(converters);

export const addTokenConverterCommandsAllConverters: AddTokenConverter[] =
  generateAddTokenConverterCommands(converters);

export const addConverterNetworkCommandsAllConverters: AddConverterNetwork[] =
  generateAddConverterNetworkCommands(converters);

export const callPermissionCommandsAllConverter: CallPermissionConverters[] =
  generateCallPermissionCommands(converters);
