import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const pufETH = "0x6D9f78b57AEeB0543a3c3B32Cc038bFB14a4bA68";
export const pufETHOracle = "0xbD2272b9f426dF6D18468fe5117fCFd547D6882b";
export const ezETH_Chainlink_Oracle = "0x50196dfad5030ED54190F75e5F9d88600A4CA0B4";
export const ezETH_Redstone_Oracle = "0x987010fD82FDCe099174aC605B88E1cc35019ef4";
export const ezETH = "0xB8eb706b85Ae7355c9FE4371a499F50f3484809c";
export const weETHsOracle = "0x660c6d8C5FDDC4F47C749E0f7e03634513f23e0e";
export const weETHs = "0xE233527306c2fa1E159e251a2E5893334505A5E0";
export const PTweETHOracle = "0x5CDE9fec66D89B931fB7a5DB8cFf2cDb642f4e7d";
export const PTweETH = "0x56107201d3e4b7Db92dEa0Edb9e0454346AEb8B5";
export const weETH_ORACLE = "0xf3ebD2A722c2039E6f66179Ad7F9f1462B14D8e0";
export const weETH = "0x3b8b6E96e57f0d1cD366AaCf4CcC68413aF308D0";
export const wstETH = "0x9b87ea90fdb55e1a0f17fbeddcf7eb0ac4d50493";
export const wstETHOracle = "0x8Fe880308A872f98D5631051a91325bfB54b0e71";
export const PTUSDeOracle = "0x16D54113De89ACE580918D15653e9C0d1DE05C35";
export const PTUSDe = "0x74671106a04496199994787B6BcB064d08afbCCf";
export const PTsUSDeOracle = "0x1bB3faB3813267d5b6c2abE5A284C621350544aD";
export const PTsUSDe = "0x3EBa2Aa29eC2498c2124523634324d4ce89c8579";
export const sUSDeOracle = "0x93e19584359C6c5844f1f7E1621983418b5A892F";
export const sUSDe = "0xA3A3e5ecEA56940a4Ae32d0927bfd8821DdA848A";

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

export const SECONDS_PER_YEAR = 31536000;
export const pufETH_InitialExchangeRate = parseUnits("1", 18);
export const pufETH_Timestamp = 1749194547;
export const pufETH_GrowthRate = parseUnits("0.2231", 18); // 22.31%
export const pufETH_SnapshotGap = 185; // 1.85%
export const ezETH_Chainlink_InitialExchangeRate = parseUnits("1", 18);
export const ezETH_Chainlink_Timestamp = 1749194547;
export const ezETH_Redstone_InitialExchangeRate = parseUnits("1", 18);
export const ezETH_Redstone_Timestamp = 1749194547;
export const ezETH_GrowthRate = parseUnits("0.2351", 18); // 23.51%
export const ezETH_SnapshotGap = 196; // 1.96%
export const weETHs_InitialExchangeRate = parseUnits("1.004263421125944312", 18);
export const weETHs_Timestamp = 1749194547;
export const weETHs_GrowthRate = parseUnits("0.0452", 18); // 4.52%
export const weETHs_SnapshotGap = 38; // 0.38%
export const PTweETH_InitialExchangeRate = parseUnits("0.953250807232573837", 18);
export const PTweETH_Timestamp = 1749194547;
export const PTweETH_GrowthRate = SECONDS_PER_YEAR; // 0%
export const PTweETH_SnapshotGap = 400; // 4.00%
export const weETH_InitialExchangeRate = parseUnits("1.035397719468640492", 18);
export const weETH_Timestamp = 1749194547;
export const weETH_GrowthRate = parseUnits("0.053", 18); // 5.3%
export const weETH_SnapshotGap = 44; // 0.44%
export const PTUSDe_InitialExchangeRate = parseUnits("1.1", 18);
export const PTUSDe_Timestamp = 1749194547;
export const PTUSDe_GrowthRate = SECONDS_PER_YEAR; // 0%
export const PTUSDe_SnapshotGap = 400; // 4.00%
export const PTsUSDe_InitialExchangeRate = parseUnits("1.1", 18);
export const PTsUSDe_Timestamp = 1749194547;
export const PTsUSDe_GrowthRate = SECONDS_PER_YEAR; // 0%
export const PTsUSDe_SnapshotGap = 400; // 4.00%
export const sUSDe_InitialExchangeRate = parseUnits("1", 18);
export const sUSDe_Timestamp = 1749194547;
export const sUSDe_GrowthRate = parseUnits("0.2857", 18); // 28.57%
export const sUSDe_SnapshotGap = 236; // 2.36%
export const wstETH_InitialExchangeRate = parseUnits("1", 18);
export const wstETH_Timestamp = 1749194547;
export const wstETH_GrowthRate = parseUnits("0.067", 18); // 6.7%
export const wstETH_SnapshotGap = 55; // 0.55%

export const vip509 = () => {
  const meta = {
    version: "v2",
    title: "VIP-509",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: pufETHOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(pufETH_InitialExchangeRate, BigNumber.from(pufETH_SnapshotGap)),
          pufETH_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: pufETHOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [pufETH_GrowthRate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: pufETHOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(pufETH_InitialExchangeRate, pufETH_SnapshotGap)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ezETH_Chainlink_Oracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(ezETH_Chainlink_InitialExchangeRate, BigNumber.from(ezETH_SnapshotGap)),
          ezETH_Chainlink_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ezETH_Chainlink_Oracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [ezETH_GrowthRate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ezETH_Chainlink_Oracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(ezETH_Chainlink_InitialExchangeRate, ezETH_SnapshotGap)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ezETH_Redstone_Oracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(ezETH_Redstone_InitialExchangeRate, BigNumber.from(ezETH_SnapshotGap)),
          ezETH_Redstone_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ezETH_Redstone_Oracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [ezETH_GrowthRate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ezETH_Redstone_Oracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(ezETH_Redstone_InitialExchangeRate, ezETH_SnapshotGap)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: weETHsOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(weETHs_InitialExchangeRate, BigNumber.from(weETHs_SnapshotGap)),
          weETHs_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: weETHsOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [weETHs_GrowthRate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: weETHsOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(weETHs_InitialExchangeRate, weETHs_SnapshotGap)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: PTweETHOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(PTweETH_InitialExchangeRate, BigNumber.from(PTweETH_SnapshotGap)),
          PTweETH_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: PTweETHOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [PTweETH_GrowthRate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: PTweETHOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(PTweETH_InitialExchangeRate, PTweETH_SnapshotGap)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: weETH_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(weETH_InitialExchangeRate, BigNumber.from(weETH_SnapshotGap)),
          weETH_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: weETH_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [weETH_GrowthRate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: weETH_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(weETH_InitialExchangeRate, weETH_SnapshotGap)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: PTUSDeOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(PTUSDe_InitialExchangeRate, BigNumber.from(PTUSDe_SnapshotGap)),
          PTUSDe_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: PTUSDeOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [PTUSDe_GrowthRate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: PTUSDeOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(PTUSDe_InitialExchangeRate, PTUSDe_SnapshotGap)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: PTsUSDeOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(PTsUSDe_InitialExchangeRate, BigNumber.from(PTsUSDe_SnapshotGap)),
          PTsUSDe_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: PTsUSDeOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [PTsUSDe_GrowthRate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: PTsUSDeOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(PTsUSDe_InitialExchangeRate, PTsUSDe_SnapshotGap)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDeOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(sUSDe_InitialExchangeRate, BigNumber.from(sUSDe_SnapshotGap)),
          sUSDe_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDeOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [sUSDe_GrowthRate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDeOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(sUSDe_InitialExchangeRate, sUSDe_SnapshotGap)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: wstETHOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(wstETH_InitialExchangeRate, BigNumber.from(wstETH_SnapshotGap)),
          wstETH_Timestamp,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: wstETHOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [wstETH_GrowthRate, DAYS_30],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: wstETHOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(wstETH_InitialExchangeRate, wstETH_SnapshotGap)],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip509;
