import { Assets, BaseAssets } from "./Assets";

const converters: string[] = [
  "0x62EC4E011983F9b8Ca943BA12DfE2a2b1E1dd865", // RiskFundConverter
  "0x0F58902b3b2B4Ff55477f3f98b3AA2aeA76de78F", // USDTPrimeConverter
  "0x7D8FceD094225688EDcB4eF6D8F5710EF07A1837", // USDCPrimeConverter
  "0xc0f7157E5f0703Ab76F6DeD3B88d72F4Fb0ABC32", // BTCBPrimeConverter
  "0x55488A4740170b71c058a406913f5C0c0d26Dc53", // ETHPrimeConverter
  "0x1Dff591c2A40870f618A0B1f90547DB3b43BEC2a", // XVSVaultConverter
];

type IncentiveAndAccessibility = [number, number];
interface ConversionConfig {
  target: string;
  signature: string;
  params: [string, string, IncentiveAndAccessibility];
}

function getIncentiveAndAccessibility(tokenIn: string, tokenOut: string): IncentiveAndAccessibility {
  const validTokenIns = [
    "0x16227D60f7a0e586C66B005219dfc887D13C9531",
    "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4",
    "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7",
    "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff",
  ];

  if (validTokenIns.includes(tokenIn) && tokenOut === "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c") {
    return [0, 2];
  } else {
    return [0, 1];
  }
}

function generateConversionConfigCommandsArray(
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

export const conversionConfigArrayForAllConverters: ConversionConfig[] = [];

for (let i = 0; i < converters.length; i++) {
  const result = generateConversionConfigCommandsArray(Assets, BaseAssets[i], converters[i]);
  console.log(result);
  conversionConfigArrayForAllConverters.push(...result);
}

console.log(conversionConfigArrayForAllConverters);
