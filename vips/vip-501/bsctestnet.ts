import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE = "0x8000eca36201dddf5805Aa4BeFD73d1EB4D23264";
export const CHAINLINK_ORACLE = "0x102F0b714E5d321187A4b6E5993358448f7261cE";
export const REDSTONE_ORACLE = "0x4e6269Ef406B4CEE6e67BA5B5197c2FfD15099AE";
export const BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
export const DEFAULT_PROXY_ADMIN = "0x01435866babd91311b1355cf3af488cca36db68e";
export const RESILIENT_ORACLE_IMPLEMENTATION = "0xb4933AF59868986316Ed37fa865C829Eba2df0C7";
export const CHAINLINK_ORACLE_IMPLEMENTATION = "0xDCB0CfA130496c749738Acbe2d6aA06C7C320f06";
export const REDSTONE_ORACLE_IMPLEMENTATION = "0x6150997cd4B2f2366d1B0503F0DE020653b67BFe";
export const BOUND_VALIDATOR_IMPLEMENTATION = "0xB634cd4F8b1CF2132E05381Eee0f994DF964869D";
export const weETH_ORACLE = "0xf3ebD2A722c2039E6f66179Ad7F9f1462B14D8e0";
export const weETH = "0x3b8b6E96e57f0d1cD366AaCf4CcC68413aF308D0";
export const weETHsOracle = "0x660c6d8C5FDDC4F47C749E0f7e03634513f23e0e";
export const weETHs = "0xE233527306c2fa1E159e251a2E5893334505A5E0";
export const sFraxOracle = "0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C";
export const sFrax = "0xd85FfECdB4287587BC53c1934D548bF7480F11C4";
export const PTweETHOracle = "0x5CDE9fec66D89B931fB7a5DB8cFf2cDb642f4e7d";
export const PTweETH = "0x56107201d3e4b7Db92dEa0Edb9e0454346AEb8B5";
export const PTUSDeOracle = "0x16D54113De89ACE580918D15653e9C0d1DE05C35";
export const PTUSDe = "0x74671106a04496199994787B6BcB064d08afbCCf";
export const PTsUSDeOracle = "0x1bB3faB3813267d5b6c2abE5A284C621350544aD";
export const PTsUSDe = "0x3EBa2Aa29eC2498c2124523634324d4ce89c8579";
export const rsETH_Chainlink_Oracle = "0x3a6f2c02ec48dbEE4Ca406d701DCA2CC9d919EaD";
export const rsETH_Redstone_Oracle = "0xA1eA3cB0FeA73a6c53aB07CcC703Dc039D8EAFb4";
export const rsETH = "0xfA0614E5C803E15070d31f7C38d2d430EBe68E47";
export const ezETH_Chainlink_Oracle = "0x50196dfad5030ED54190F75e5F9d88600A4CA0B4";
export const ezETH_Redstone_Oracle = "0x987010fD82FDCe099174aC605B88E1cc35019ef4";
export const ezETH = "0xB8eb706b85Ae7355c9FE4371a499F50f3484809c";
export const sUSDeOracle = "0x93e19584359C6c5844f1f7E1621983418b5A892F";
export const sUSDe = "0xA3A3e5ecEA56940a4Ae32d0927bfd8821DdA848A";
export const sUSDSOracle = "0x5E06A5f48692E4Fff376fDfCA9E4C0183AAADCD1";
export const sUSDS = "0xE9E34fd81982438E96Bd945f5810F910e35F0165";
export const yvUSDCOracle = "0x01690F8b00cB60d4b7F159512e63F24001ebfF8A";
export const yvUSDC = "0x9fE6052B9534F134171F567dAC9c9B22556c1DDb";
export const yvUSDTOracle = "0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E";
export const yvUSDT = "0x5cBA66C5415E56CC0Ace55148ffC63f61327478B";
export const yvUSDSOracle = "0x553C5984d57203D6D36996B55cA3Ba4088016C5b";
export const yvUSDS = "0xC6A0e98B8D9E9F1160E9cE1f2E0172F41FB06BC2";
export const yvWETHOracle = "0x8062dC1b38c0b2CF6188dF605B19cFF3c4dc9b29";
export const yvWETH = "0x99AD7ecf9b1C5aC2A11BB00D7D8a7C54fCd41517";
export const eBTC = "0xd48392CCf3fe028023D0783E570DFc71996859d7";
export const eBTCOracle = "0x93963F31583E445DbBA160ce84F464e41dD330Dc";
export const LBTC = "0x37798CaB3Adde2F4064afBc1C7F9bbBc6A826375";
export const LBTCOracle = "0x8b9a9AFF25C9065CE5b350f1c27215D1446788a7";
export const pufETH = "0x6D9f78b57AEeB0543a3c3B32Cc038bFB14a4bA68";
export const pufETHOracle = "0xbD2272b9f426dF6D18468fe5117fCFd547D6882b";

export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const NORMAL_TIMELOCK = "0xc332F7D8D5eA72cf760ED0E1c0485c8891C6E0cF";
export const CRITICAL_TIMELOCK = "0xA24A7A65b8968a749841988Bd7d05F6a94329fDe";
export const FASTTRACK_TIMELOCK = "0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182";

export const SECONDS_PER_YEAR = 31_536_000;

export const sFrax_Initial_Exchange_Rate = parseUnits("1.041208475916013035", 18);
export const sFrax_Snapshot_Timestamp = 1747055328;
export const sFrax_Snapshot_Gap = BigNumber.from("450"); // 4.5%
export const sFrax_Annual_Growth_Rate = parseUnits("0.5404", 18); // 54.04%

export const sUSDS_Initial_Exchange_Rate = parseUnits("1.000000000000000000", 18);
export const sUSDS_Snapshot_Timestamp = 1747131084;
export const sUSDS_Snapshot_Gap = BigNumber.from("135"); // 1.35%
export const sUSDS_Annual_Growth_Rate = parseUnits("0.1624", 18); // 16.24%

export const yvUSDC_Initial_Exchange_Rate = parseUnits("1.000000", 6);
export const yvUSDC_Snapshot_Timestamp = 1747131156;
export const yvUSDC_Snapshot_Gap = BigNumber.from("107"); // 1.07%
export const yvUSDC_Annual_Growth_Rate = parseUnits("0.1221", 18); // 12.21%

export const yvUSDT_Initial_Exchange_Rate = parseUnits("1.000000", 6);
export const yvUSDT_Snapshot_Timestamp = 1747131168;
export const yvUSDT_Snapshot_Gap = BigNumber.from("92"); // 0.92%
export const yvUSDT_Annual_Growth_Rate = parseUnits("0.1108", 18); // 11.08%

export const yvUSDS_Initial_Exchange_Rate = parseUnits("1.000000000000000000", 18);
export const yvUSDS_Snapshot_Timestamp = 1747131192;
export const yvUSDS_Snapshot_Gap = BigNumber.from("185"); // 1.85%
export const yvUSDS_Annual_Growth_Rate = parseUnits("0.2212", 18); // 22.12%

export const yvWETH_Initial_Exchange_Rate = parseUnits("1.000000000000000000", 18);
export const yvWETH_Snapshot_Timestamp = 1747131204;
export const yvWETH_Snapshot_Gap = BigNumber.from("43"); // 0.43%
export const yvWETH_Annual_Growth_Rate = parseUnits("0.0518", 18); // 5.18%

export const LBTC_Initial_Exchange_Rate = parseUnits("1.10000000", 8);
export const LBTC_Snapshot_Timestamp = 1747055328;
export const LBTC_Snapshot_Gap = BigNumber.from("400"); // 4%
export const LBTC_Annual_Growth_Rate = SECONDS_PER_YEAR; // 0%

export const eBTC_Initial_Exchange_Rate = parseUnits("1.00000000", 8);
export const eBTC_Snapshot_Timestamp = 1747915775;
export const eBTC_Snapshot_Gap = BigNumber.from("400"); // 4%
export const eBTC_Annual_Growth_Rate = SECONDS_PER_YEAR; // 0%

export const DAYS_30 = 30 * 24 * 60 * 60;
export const increaseExchangeRateByPercentage = (
  exchangeRate: BigNumber,
  percentage: BigNumber, // BPS value (e.g., 10000 for 100%)
) => {
  const increaseAmount = exchangeRate.mul(percentage).div(10000);
  return exchangeRate.add(increaseAmount).toString();
};
export const getSnapshotGap = (
  exchangeRate: BigNumber,
  percentage: number, // BPS value (e.g., 10000 for 100%)
) => {
  // snapshot gap is percentage of the exchange rate
  const snapshotGap = exchangeRate.mul(percentage).div(10000);
  return snapshotGap.toString();
};

export const vip501 = () => {
  const meta = {
    version: "v2",
    title: "",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE, RESILIENT_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE, CHAINLINK_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE, REDSTONE_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR, BOUND_VALIDATOR_IMPLEMENTATION],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            [
              weETH,
              [weETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              weETHs,
              [weETHsOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              sFrax,
              [sFraxOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              PTweETH,
              [PTweETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              PTUSDe,
              [PTUSDeOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              PTsUSDe,
              [PTsUSDeOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [rsETH, [rsETH_Redstone_Oracle, rsETH_Chainlink_Oracle, rsETH_Chainlink_Oracle], [true, true, true], false],
            [ezETH, [ezETH_Redstone_Oracle, ezETH_Chainlink_Oracle, ezETH_Chainlink_Oracle], [true, true, true], false],
            [
              sUSDe,
              [sUSDeOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              sUSDS,
              [sUSDSOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              yvUSDC,
              [yvUSDCOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              yvUSDT,
              [yvUSDTOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              yvUSDS,
              [yvUSDSOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              yvWETH,
              [yvWETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              eBTC,
              [eBTCOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              LBTC,
              [LBTCOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              pufETH,
              [pufETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sFraxOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(sFrax_Initial_Exchange_Rate, sFrax_Snapshot_Gap),
          sFrax_Snapshot_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sFraxOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [sFrax_Annual_Growth_Rate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sFraxOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(sFrax_Initial_Exchange_Rate, sFrax_Snapshot_Gap.toNumber())],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDSOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(sUSDS_Initial_Exchange_Rate, sUSDS_Snapshot_Gap),
          sUSDS_Snapshot_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDSOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [sUSDS_Annual_Growth_Rate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDSOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(sUSDS_Initial_Exchange_Rate, sUSDS_Snapshot_Gap.toNumber())],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: yvUSDCOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(yvUSDC_Initial_Exchange_Rate, yvUSDC_Snapshot_Gap),
          yvUSDC_Snapshot_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: yvUSDCOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [yvUSDC_Annual_Growth_Rate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: yvUSDCOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(yvUSDC_Initial_Exchange_Rate, yvUSDC_Snapshot_Gap.toNumber())],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: yvUSDTOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(yvUSDT_Initial_Exchange_Rate, yvUSDT_Snapshot_Gap),
          yvUSDT_Snapshot_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: yvUSDTOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [yvUSDT_Annual_Growth_Rate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: yvUSDTOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(yvUSDT_Initial_Exchange_Rate, yvUSDT_Snapshot_Gap.toNumber())],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: yvUSDSOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(yvUSDS_Initial_Exchange_Rate, yvUSDS_Snapshot_Gap),
          yvUSDS_Snapshot_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: yvUSDSOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [yvUSDS_Annual_Growth_Rate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: yvUSDSOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(yvUSDS_Initial_Exchange_Rate, yvUSDS_Snapshot_Gap.toNumber())],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: yvWETHOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(yvWETH_Initial_Exchange_Rate, yvWETH_Snapshot_Gap),
          yvWETH_Snapshot_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: yvWETHOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [yvWETH_Annual_Growth_Rate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: yvWETHOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(yvWETH_Initial_Exchange_Rate, yvWETH_Snapshot_Gap.toNumber())],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: LBTCOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(LBTC_Initial_Exchange_Rate, LBTC_Snapshot_Gap),
          LBTC_Snapshot_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: LBTCOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [LBTC_Annual_Growth_Rate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: LBTCOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(LBTC_Initial_Exchange_Rate, LBTC_Snapshot_Gap.toNumber())],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: eBTCOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(eBTC_Initial_Exchange_Rate, eBTC_Snapshot_Gap),
          eBTC_Snapshot_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: eBTCOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [eBTC_Annual_Growth_Rate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: eBTCOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(eBTC_Initial_Exchange_Rate, eBTC_Snapshot_Gap.toNumber())],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip501;
