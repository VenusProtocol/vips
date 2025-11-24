import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const AAVE = "0xfb6115445Bff7b52FeB98650C87f44907E58f802";
export const ADA = "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47";
export const asBNB = "0x77734e70b6E88b4d82fE632a168EDf6e700912b6";
export const BCH = "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf";
export const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
export const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
export const DOGE = "0xbA2aE424d960c26247Dd6c32edC70B295c744C43";
export const DOT = "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402";
export const FDUSD = "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409";
export const FIL = "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153";
export const LINK = "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD";
export const LTC = "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94";
export const SOL = "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF";
export const SolvBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
export const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
export const TUSD = "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9";
export const UNI = "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1";
export const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
export const WBETH = "0xa2e3356610840701bdf5611a53974510ae27e2e1";
export const XRP = "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

export const asBNBOracle = "0x652B90D1d45a7cD5BE82c5Fb61a4A00bA126dde5";
export const WBETHOracle = "0x49938fc72262c126eb5D4BdF6430C55189AEB2BA";
export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";

export const HEARTBEAT_25_HOURS = 25 * 60 * 60;
export const HEARTBEAT_20_MINUTES = 20 * 60;
export const HEARTBEAT_13_HOURS = 13 * 60 * 60;

export const PRICE_LOWER_BOUND = parseUnits("0.95", 18);
export const PRICE_UPPER_BOUND = parseUnits("1.05", 18);

export const vip571 = () => {
  const meta = {
    version: "v2",
    title: "VIP-571",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["AAVE", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["ADA", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["asBNB", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["BCH", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["CAKE", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["DAI", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["DOGE", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["DOT", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["FDUSD", HEARTBEAT_20_MINUTES],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["FIL", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["LINK", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["LTC", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["SOL", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["SolvBTC", HEARTBEAT_13_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["THE", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["TUSD", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["UNI", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["VAI", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["WBETH", HEARTBEAT_20_MINUTES],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["XRP", HEARTBEAT_25_HOURS],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["XVS", HEARTBEAT_20_MINUTES],
      },
      {
        target: bscmainnet.BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["Cake", "CAKE"],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            [
              AAVE,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              ADA,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [asBNB, [asBNBOracle, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero], [true, true, false], false],
            [
              BCH,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              CAKE,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              DAI,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              DOGE,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              DOT,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              FDUSD,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              FIL,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              LINK,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              LTC,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              SOL,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              SolvBTC,
              [bscmainnet.REDSTONE_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              THE,
              [bscmainnet.REDSTONE_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              TUSD,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              UNI,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              VAI,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [WBETH, [WBETHOracle, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero], [true, true, false], false],
            [
              XRP,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
            [
              XVS,
              [bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE, ethers.constants.AddressZero],
              [true, true, false],
              false,
            ],
          ],
        ],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfigs((address,uint256,uint256)[])",
        params: [
          [
            [AAVE, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [ADA, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [asBNB, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [BCH, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [CAKE, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [DAI, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [DOGE, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [DOT, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [FDUSD, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [FIL, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [LINK, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [LTC, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [SOL, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [SolvBTC, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [THE, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [TUSD, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [UNI, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [VAI, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [WBETH, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [XRP, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
            [XVS, PRICE_UPPER_BOUND, PRICE_LOWER_BOUND],
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip571;
