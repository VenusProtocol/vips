import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet, sepolia } = NETWORK_ADDRESSES;

export const PTsUSDE26JUN2025Oracle = "0x85201328baa52061E6648d9b4c285529411Cd33B";
export const PTsUSDE26JUN2025 = "0x95e58161BA2423c3034658d957F3f5b94DeAbf81";
export const sUSDe_Chainlink_Oracle = "0x4678BcB5B8eDd9f853725F64d59Ba592F9e41565";
export const sUSDe_Redstone_Oracle = "0xA5b51bF1625c1F90341c4527AFa5B0865F15ac70";
export const sUSDe = "0xcFec590e417Abb378cfEfE6296829E35fa25cEbd";
export const xSolvBTCOracle = "0x33a2BDcBB401a81C590215a6953A9a4B90aD57b9";
export const xSolvBTC = "0x3ea87323806586A0282b50377e0FEa76070F532B";
export const ankrBNBOracle = "0x7655d558c3C865913013D82fF4d1e70e97cDf906";
export const ankrBNB = "0x5269b7558D3d5E113010Ef1cFF0901c367849CC9";
export const asBNBOracle = "0xb31909f6687Da5bEc559DB7baeed41E14f5Dc17E";
export const asBNB = "0xc625f060ad25f4A6c2d9eBF30C133dB61B7AF072";
export const BNBxOracle = "0x068945930785e6816faE855a2A2e8c59BAD380f0";
export const BNBx = "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8";
export const slisBNBOracle = "0x6a8154699b6670Ba6166ba59d1c094663E603cA8";
export const slisBNB = "0xd2aF6A916Bc77764dc63742BC30f71AF4cF423F4";

export const wstETH = "0x9b87ea90fdb55e1a0f17fbeddcf7eb0ac4d50493";
export const wstETH_ORACLE = "0xA33f06dB4c0DD8E41BA3d2C8917a27e6B9200662";

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
export const sUSDe_Chainlink_InitialExchangeRate = parseUnits("1.1", 18);
export const sUSDe_Chainlink_Timestamp = 1751269105;
export const sUSDe_Redstone_InitialExchangeRate = parseUnits("1.1", 18);
export const sUSDe_Redstone_Timestamp = 1751269105;
export const sUSDe_GrowthRate = parseUnits("0.2827", 18); // 28.27% per year
export const sUSDe_SnapshotGap = 236; // 2.36%
export const PTsUSDE26JUN2025_InitialExchangeRate = parseUnits("0.85", 18);
export const PTsUSDE26JUN2025_Timestamp = 1751269105;
export const PTsUSDE26JUN2025_GrowthRate = SECONDS_PER_YEAR; // 0% per yeat
export const PTsUSDE26JUN2025_SnapshotGap = 400; // 4.00% 
export const xSolvBTC_InitialExchangeRate = parseUnits("1.", 18);
export const xSolvBTC_Timestamp = 1751269105;
export const xSolvBTC_GrowthRate = SECONDS_PER_YEAR; // 0%
export const xSolvBTC_SnapshotGap = 400; // 4.00%
export const BNBx_InitialExchangeRate = parseUnits("1.857886913843483194", 18);
export const BNBx_Timestamp = 1751269105;
export const BNBx_GrowthRate = parseUnits("0.0753", 18); // 7.53% per year
export const BNBx_SnapshotGap = 63; // 0.63%
export const ankrBNB_InitialExchangeRate = parseUnits("1.080640588742602582", 18);
export const ankrBNB_Timestamp = 1751269105;
export const ankrBNB_GrowthRate = parseUnits("0.0612", 18); // 6.12% per year
export const ankrBNB_SnapshotGap = 51; // 0.51%
export const slisBNB_InitialExchangeRate = parseUnits("4.192864677240396787", 18);
export const slisBNB_Timestamp = 1751269105;
export const slisBNB_GrowthRate = parseUnits("0.0412", 18); // 4.12% per year
export const slisBNB_SnapshotGap = 35; // 0.35%
export const asBNB_InitialExchangeRate = parseUnits("1", 18);
export const asBNB_Timestamp = 1751269105;
export const asBNB_GrowthRate = parseUnits("0.3049", 18); // 30.49% per year
export const asBNB_SnapshotGap = 254; // 2.54%

export const vip517 = () => {
  const meta = {
    version: "v2",
    title: "VIP-518 [BNB Chain]",
    description: "[VIP-18] Update oracles implementation in BNB",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: sUSDe_Chainlink_Oracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(sUSDe_Chainlink_InitialExchangeRate, BigNumber.from(sUSDe_SnapshotGap)),
          sUSDe_Chainlink_Timestamp,
        ],
      },
      {
        target: sUSDe_Chainlink_Oracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [sUSDe_GrowthRate, DAYS_30],
      },
      {
        target: sUSDe_Chainlink_Oracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(sUSDe_Chainlink_InitialExchangeRate, sUSDe_SnapshotGap)],
      },     
      {
        target: sUSDe_Redstone_Oracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(sUSDe_Redstone_InitialExchangeRate, BigNumber.from(sUSDe_SnapshotGap)),
          sUSDe_Redstone_Timestamp,
        ],
      },
      {
        target: sUSDe_Redstone_Oracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [sUSDe_GrowthRate, DAYS_30],
      },
      {
        target: sUSDe_Redstone_Oracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(sUSDe_Redstone_InitialExchangeRate, sUSDe_SnapshotGap)],
      },
      {
        target: PTsUSDE26JUN2025Oracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(PTsUSDE26JUN2025_InitialExchangeRate, BigNumber.from(PTsUSDE26JUN2025_SnapshotGap)),
          PTsUSDE26JUN2025_Timestamp,
        ],
      },
      {
        target: PTsUSDE26JUN2025Oracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [PTsUSDE26JUN2025_GrowthRate, DAYS_30],
      },
      {
        target: PTsUSDE26JUN2025Oracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(PTsUSDE26JUN2025_InitialExchangeRate, PTsUSDE26JUN2025_SnapshotGap)],
      },
      {
        target: xSolvBTCOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(xSolvBTC_InitialExchangeRate, BigNumber.from(xSolvBTC_SnapshotGap)),
          xSolvBTC_Timestamp,
        ],
      },
      {
        target: xSolvBTCOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [xSolvBTC_GrowthRate, DAYS_30],
      },
      {
        target: xSolvBTCOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(xSolvBTC_InitialExchangeRate, xSolvBTC_SnapshotGap)],
      },
      {
        target: BNBxOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(BNBx_InitialExchangeRate, BigNumber.from(BNBx_SnapshotGap)),
          BNBx_Timestamp,
        ],
      },
      {
        target: BNBxOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [BNBx_GrowthRate, DAYS_30],
      },
      {
        target: BNBxOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(BNBx_InitialExchangeRate, BNBx_SnapshotGap)],
      },
      {
        target: ankrBNBOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(ankrBNB_InitialExchangeRate, BigNumber.from(ankrBNB_SnapshotGap)),
          ankrBNB_Timestamp,
        ],
      },
      {
        target: ankrBNBOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [ankrBNB_GrowthRate, DAYS_30],
      },
      {
        target: ankrBNBOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(ankrBNB_InitialExchangeRate, ankrBNB_SnapshotGap)],
      },
      {
        target: slisBNBOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(slisBNB_InitialExchangeRate, BigNumber.from(slisBNB_SnapshotGap)),
          slisBNB_Timestamp,
        ],
      },
      {
        target: slisBNBOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [slisBNB_GrowthRate, DAYS_30],
      },
      {
        target: slisBNBOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(slisBNB_InitialExchangeRate, slisBNB_SnapshotGap)],
      },
      {
        target: asBNBOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(asBNB_InitialExchangeRate, BigNumber.from(asBNB_SnapshotGap)),
          asBNB_Timestamp,
        ],
      },
      {
        target: asBNBOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [asBNB_GrowthRate, DAYS_30],
      },
      {
        target: asBNBOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(asBNB_InitialExchangeRate, asBNB_SnapshotGap)],
      },
      {
        target: sepolia.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            [
              wstETH,
              [wstETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip517;
