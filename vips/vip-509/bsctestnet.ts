import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const bsctestnet = NETWORK_ADDRESSES.bsctestnet;
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const GUARDIAN = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

// Converters
const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
const FDUSD = "0xcF27439fA231af9931ee40c4f27Bb77B83826F3C";
const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
const WBNB_PRIME_CONVERTER = "0xad721D647C83B05DCdce996E99034cd3A8a7e8Fa";
const FDUSD_PRIME_CONVERTER = "0x8F2925af604D2CA33a1cBE0E92d191cA03Ec3dDB";
export const CONVERSION_INCENTIVE = 1e14;

export const converterBaseAssets = {
  [WBNB_PRIME_CONVERTER]: WBNB,
  [FDUSD_PRIME_CONVERTER]: FDUSD,
};

const configureConverters = (fromAssets: string[], incentive: BigNumberish = CONVERSION_INCENTIVE) => {
  enum ConversionAccessibility {
    NONE = 0,
    ALL = 1,
    ONLY_FOR_CONVERTERS = 2,
    ONLY_FOR_USERS = 3,
  }

  return Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => {
    const conversionConfigs = fromAssets.map(() => [incentive, ConversionAccessibility.ALL]);
    return {
      target: converter,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [baseAsset, fromAssets, conversionConfigs],
    };
  });
};

const markets = {
  AAVE: "0x4B7268FC7C727B88c5Fc127D41b491BfAe63e144",
  // ADA: "0xcD34BC54106bd45A04Ed99EBcC2A6a3e70d7210F",
  // BTCB: "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4",
  // BUSD: "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47",
  // CAKE: "0xe8bd7cCC165FAEb9b81569B05424771B9A20cbEF",
  // DOGE: "0x67D262CE2b8b846d9B94060BC04DC40a83F0e25B",
  // ETH: "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7",
  // FDUSD: "0xcF27439fA231af9931ee40c4f27Bb77B83826F3C",
  // lisUSD: "0xe73774DfCD551BF75650772dC2cC56a2B6323453",
  // LTC: "0x969F147B6b8D81f86175de33206A4FD43dF17913",
  // LUNA: "0xf36160EC62E3B191EA375dadfe465E8Fa1F8CabB",
  // MATIC: "0xcfeb0103d4BEfa041EA4c2dACce7B3E83E1aE7E3",
  // PT_sUSDE_26JUN2025: "0x95e58161BA2423c3034658d957F3f5b94DeAbf81",
  // SOL: "0xC337Dd0390FdFD0Ee5D2b682E425986EDD7b59da",
  // SolvBTC: "0x6855E14A6df91b8E4D55163d068E9ef2530fd4CE",
  // sUSDe: "0xcFec590e417Abb378cfEfE6296829E35fa25cEbd",
  // SXP: "0x75107940Cf1121232C0559c747A986DEfbc69DA9",
  // THE: "0x952653d23cB9bef19E442D2BF8fBc8843A968052",
  // TRX: "0x7D21841DC10BA1C5797951EFc62fADBBDD06704B",
  // TRXOLD: "0x19E7215abF8B2716EE807c9f4b83Af0e7f92653F",
  // TUSD: "0xB32171ecD878607FFc4F8FC0bCcE6852BB3149E0",
  // TUSDOLD: "0xFeC3A63401Eb9C1476200d7C32c4009Be0154169",
  // TWT: "0xb99c6b26fdf3678c6e2aff8466e3625a0e7182f8",
  // UNI: "0x8D2f061C75780d8D91c10A7230B907411aCBC8fC",
  // USDC: "0x16227D60f7a0e586C66B005219dfc887D13C9531",
  // USDe: "0x986C30591f5aAb401ea3aa63aFA595608721B1B9",
  // USDT: "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c",
  // USD1: "0x7792af341a10ccc4B1CDd7B317F0460a37346a0A",
  // UST: "0x5A79efD958432E72211ee73D5DDFa9bc8f248b5F",
  // VAI: "0x5fFbE5302BadED40941A403228E6AD03f93752d9",
  // WBETH: "0xf9F98365566F4D55234f24b99caA1AfBE6428D44",
  // XRP: "0x3022A32fdAdB4f02281E8Fab33e0A6811237aab0",
  // xSolvBTC: "0x3ea87323806586A0282b50377e0FEa76070F532B",
  // XVS: "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff",
  // PT_SolvBTC_BBN_27MAR2025: "0x964Ea3dC70Ee5b35Ea881cf8416B7a5F50E13f56",
  // ALPACA: "0x6923189d91fdF62dBAe623a55273F1d20306D9f2",
  // ANKR: "0xe4a90EB942CF2DA7238e8F6cC9EF510c49FC8B4B",
  // ankrBNB: "0x5269b7558D3d5E113010Ef1cFF0901c367849CC9",
  // BSW: "0x7FCC76fc1F573d8Eb445c236Cc282246bC562bCE",
  // PLANET: "0x52b4E1A2ba407813F829B4b3943A1e57768669A9",
  // USDD: "0x2E2466e22FcbE0732Be385ee2FBb9C59a1098382",
  // FLOKI: "0xb22cF15FBc089d470f8e532aeAd2baB76bE87c88",
  // RACA: "0xD60cC803d888A3e743F21D0bdE4bF2cAfdEA1F26",
  // asBNB: "0xc625f060ad25f4A6c2d9eBF30C133dB61B7AF072",
  // BNBx: "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8",
  // PT_clisBNB_24APR2025: "0x14AECeEc177085fd09EA07348B4E1F7Fcc030fA1",
  // snBNB: "0xd2aF6A916Bc77764dc63742BC30f71AF4cF423F4",
  // stkBNB: "0x2999C176eBf66ecda3a646E70CeB5FF4d5fCFb8C",
  // WBNB: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
  // weETH: "0x7df9372096c8ca2401f30B3dF931bEFF493f1FdC",
  // wstETH: "0x4349016259FCd8eE452f696b2a7beeE31667D129",
  // BabyDoge: "0x4FA37fFA9f36Ec0e0e685C06a7bF169bb50409ce",
  // agEUR: "0x63061de4A25f24279AAab80400040684F92Ee319",
  // BTT: "0xE98344A7c691B200EF47c9b8829110087D832C64",
  // WIN: "0x2E6Af3f3F059F43D764060968658c9F3c8f9479D",
}

export const TimelocksArray = [bsctestnet.NORMAL_TIMELOCK, bsctestnet.FAST_TRACK_TIMELOCK, bsctestnet.CRITICAL_TIMELOCK];

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

function generateCallPermissionCommands(ConvertersArray: string[]): CallPermission[] {
  const callPermissionCommandsArray: CallPermission[] = [];

  for (const converter of ConvertersArray) {
    for (const timelock of TimelocksArray) {
      const config1 = grant(converter, "setConversionConfig(address,address,ConversionConfig)", timelock);
      const config2 = grant(converter, "pauseConversion()", timelock);
      const config3 = grant(converter, "resumeConversion()", timelock);
      const config4 = grant(converter, "setMinAmountToConvert(uint256)", timelock);

      callPermissionCommandsArray.push(config1);
      callPermissionCommandsArray.push(config2);
      callPermissionCommandsArray.push(config3);
      callPermissionCommandsArray.push(config4);
    }

    callPermissionCommandsArray.push(grant(converter, "pauseConversion()", GUARDIAN));
    callPermissionCommandsArray.push(grant(converter, "resumeConversion()", GUARDIAN));
  }
  return callPermissionCommandsArray;
}

export const callPermissionCommandsAllConverter: CallPermission[] = generateCallPermissionCommands(
  Object.keys(converterBaseAssets)
);

export const vip509 = () => {
  const meta = {
    version: "v2",
    title: "VIP-509",
    description: "VIP-509",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      
      {
        target: PROTOCOL_SHARE_RESERVE,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 0, BTCB_PRIME_CONVERTER],
            [0, 0, ETH_PRIME_CONVERTER],
            [0, 177, WBNB_PRIME_CONVERTER],
            [0, 211, FDUSD_PRIME_CONVERTER],
          ],
        ],
      },
      {
        target: PROTOCOL_SHARE_RESERVE,
        signature: "removeDistributionConfig(uint8,address)",
        params: [
          0,
          ETH_PRIME_CONVERTER
        ],
      },
      {
        target: PROTOCOL_SHARE_RESERVE,
        signature: "removeDistributionConfig(uint8,address)",
        params: [
          0,
          BTCB_PRIME_CONVERTER
        ],
      },
      {
        target: WBNB_PRIME_CONVERTER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: FDUSD_PRIME_CONVERTER,
        signature: "acceptOwnership()",
        params: [],
      },
      ...callPermissionCommandsAllConverter,
      ...configureConverters(Object.values(markets))
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip509;
