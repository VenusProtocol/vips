import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

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

const bscmainnet = NETWORK_ADDRESSES.bscmainnet;
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
export const CONVERTER_NETWORK = "0xF7Caad5CeB0209165f2dFE71c92aDe14d0F15995";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const FDUSD = "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409";
export const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
export const WBNB_PRIME_CONVERTER = "0x55a4b16A6d133085Fc15E32972af7AE518b2FC4d";
export const FDUSD_PRIME_CONVERTER = "0xF4Ff8Bf521113667eF9BC3a58E576AF3A5A4f8C5";
export const CONVERSION_INCENTIVE = 1e14;
export const PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
export const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";

export const converterBaseAssets = {
  [WBNB_PRIME_CONVERTER]: WBNB,
  [FDUSD_PRIME_CONVERTER]: FDUSD,
};

const markets = {
  AAVE: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
  ADA: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
  BCH: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
  BETH: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
  BTCB: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  CAKE: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
  DAI: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  DOGE: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
  DOT: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
  ETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
  FIL: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
  LINK: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
  lisUSD: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
  LTC: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
  MATIC: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
  PT_sUSDE_26JUN2025: "0xDD809435ba6c9d6903730f923038801781cA66ce",
  SOL: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
  SolvBTC: "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7",
  sUSDe: "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2",
  SXP: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
  THE: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
  TRX: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
  TRXOLD: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
  TUSD: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
  TUSDOLD: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
  TWT: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
  UNI: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
  USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  USDe: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  USD1: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
  VAI: "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7",
  WBETH: "0xa2e3356610840701bdf5611a53974510ae27e2e1",
  XRP: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
  xSolvBTC: "0x1346b618dC92810EC74163e4c27004c921D446a5",
  XVS: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
  PT_SolvBTC_27MAR2025_BBN: "0x541b5eeac7d4434c8f87e2d32019d67611179606",
  ALPACA: "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
  ANKR: "0xf307910A4c7bbc79691fD374889b36d8531B08e3",
  ankrBNB: "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
  BSW: "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1",
  PLANET: "0xCa6d678e74f553f0E59cccC03ae644a3c2c5EE7d",
  USDD: "0xd17479997f34dd9156deef8f95a52d81d265be9c",
  FLOKI: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
  RACA: "0x12BB890508c125661E03b09EC06E404bc9289040",
  asBNB: "0x77734e70b6E88b4d82fE632a168EDf6e700912b6",
  BNBx: "0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275",
  PT_clisBNB_25APR2025: "0xe8f1c9804770e11ab73395be54686ad656601e9e",
  slisBNB: "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B",
  stkBNB: "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16",
  weETH: "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A",
  wstETH: "0x26c5e01524d2E6280A48F2c50fF6De7e52E9611C",
  BabyDoge: "0xc748673057861a797275CD8A068AbB95A902e8de",
  EURA: "0x12f31B73D812C6Bb0d735a218c086d44D5fe5f89",
  BTT: "0x352Cb5E19b12FC216548a2677bD0fce83BaE434B",
  WIN: "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99",
};

const wbnbConverterMarkets = {
  ...markets,
  FDUSD: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
};

const fdusdConverterMarkets = {
  ...markets,
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
};

const TimelocksArray = [bscmainnet.NORMAL_TIMELOCK, bscmainnet.FAST_TRACK_TIMELOCK, bscmainnet.CRITICAL_TIMELOCK];

const configureConverters = (
  converter: string,
  baseAsset: string,
  fromAssets: string[],
  incentive: BigNumberish = CONVERSION_INCENTIVE,
) => {
  enum ConversionAccessibility {
    NONE = 0,
    ALL = 1,
    ONLY_FOR_CONVERTERS = 2,
    ONLY_FOR_USERS = 3,
  }

  const conversionConfigs = fromAssets.map(() => [incentive, ConversionAccessibility.ALL]);
  return {
    target: converter,
    signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
    params: [baseAsset, fromAssets, conversionConfigs],
  };
};

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

const grant = (target: string, signature: string, caller: string): CallPermission => {
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

const callPermissionCommandsAllConverter: CallPermission[] = generateCallPermissionCommands(
  Object.keys(converterBaseAssets),
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
            [0, 100, WBNB_PRIME_CONVERTER], // change percentage
            [0, 200, FDUSD_PRIME_CONVERTER], // change percentage
          ],
        ],
      },
      {
        target: PROTOCOL_SHARE_RESERVE,
        signature: "removeDistributionConfig(uint8,address)",
        params: [0, ETH_PRIME_CONVERTER],
      },
      {
        target: PROTOCOL_SHARE_RESERVE,
        signature: "removeDistributionConfig(uint8,address)",
        params: [0, BTCB_PRIME_CONVERTER],
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
      ...generateConverterCommands(Object.keys(converterBaseAssets)),
      configureConverters(WBNB_PRIME_CONVERTER, WBNB, Object.values(wbnbConverterMarkets)),
      configureConverters(FDUSD_PRIME_CONVERTER, FDUSD, Object.values(fdusdConverterMarkets)),
      {
        target: PLP,
        signature: "initializeTokens(address[])",
        params: [[WBNB, FDUSD]],
      },
      {
        target: PLP,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [WBNB, FDUSD],
          [
            100, // change it
            100, // change it
          ],
        ],
      },
      {
        target: PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          COMPTROLLER,
          vBNB,
          ethers.utils.parseEther("2"), // change it
          ethers.utils.parseEther("4"), // change it
        ],
      },
      {
        target: PRIME,
        signature: "addMarket(address,address,uint256,uint256)",
        params: [
          COMPTROLLER,
          vFDUSD,
          ethers.utils.parseEther("2"), // change it
          ethers.utils.parseEther("4"), // change it
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip509;
