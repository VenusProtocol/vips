import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum } = NETWORK_ADDRESSES;

export const PTsUSDe_ORACLE = "0xC407403fa78Bce509821D776b6Be7f91cC04474f";
export const PTsUSDE_26JUN2025 = "0xDD809435ba6c9d6903730f923038801781cA66ce";
export const SUSDE_ONEJUMP_CHAINLINK_ORACLE = "0xA67F01322AF8EBa444D788Ee398775b446de51a0";
export const SUSDE_ONEJUMP_REDSTONE_ORACLE = "0x2B2895104f958E1EC042E6Ba5cbfeCbAD3C5beDb";
export const SUSDE = "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2";
export const USDE = "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34";
export const XSOLVBTC_ONEJUMP_REDSTONE_ORACLE = "0xf5534f78Df9b610B19A63956d498d00CFaD8B9D3";
export const XSOLVBTC = "0x1346b618dC92810EC74163e4c27004c921D446a5";
export const AnkrBNB_ORACLE = "0x4512e9579734f7B8730f0a05Cd0D92DC33EB2675";
export const AnkrBNB = "0x52f24a5e03aee338da5fd9df68d2b6fae1178827";
export const AsBNB_ORACLE = "0x652B90D1d45a7cD5BE82c5Fb61a4A00bA126dde5";
export const AsBNB = "0x77734e70b6E88b4d82fE632a168EDf6e700912b6";
export const BNBx_ORACLE = "0xC2E2b6f9CdE2BFA5Ba5fda2Dd113CAcD781bdb31";
export const BNBx = "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275";
export const SlisBNB_ORACLE = "0xDDE6446E66c786afF4cd3D183a908bCDa57DF9c1";
export const SlisBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";

export const wstETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
export const wstETH_ORACLE = "0x6b51Ee3aF70b350AaADc05f418502b330c5Aad7c";

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
export const sUSDe_Chainlink_InitialExchangeRate = parseUnits("1.179598528113768899", 18);
export const sUSDe_Chainlink_Timestamp = 1751269105;
export const sUSDe_Redstone_InitialExchangeRate = parseUnits("1.17966662", 18);
export const sUSDe_Redstone_Timestamp = 1751269105;
export const sUSDe_GrowthRate = parseUnits("0.2827", 18); // 28.27% per year
export const sUSDe_SnapshotGap = 236; // 2.36%
export const PTsUSDE26JUN2025_InitialExchangeRate = parseUnits("0.847697123107543722", 18);
export const PTsUSDE26JUN2025_Timestamp = 1751269105;
export const PTsUSDE26JUN2025_GrowthRate = SECONDS_PER_YEAR; // 0% per yeat
export const PTsUSDE26JUN2025_SnapshotGap = 400; // 4.00% 
export const xSolvBTC_InitialExchangeRate = parseUnits("1", 18);
export const xSolvBTC_Timestamp = 1751269105;
export const xSolvBTC_GrowthRate = SECONDS_PER_YEAR; // 0%
export const xSolvBTC_SnapshotGap = 400; // 4.00%
export const BNBx_InitialExchangeRate = parseUnits("1.104244614844799120", 18);
export const BNBx_Timestamp = 1751269105;
export const BNBx_GrowthRate = parseUnits("0.0753", 18); // 7.53% per year
export const BNBx_SnapshotGap = 63; // 0.63%
export const ankrBNB_InitialExchangeRate = parseUnits("1.097701721231826695", 18);
export const ankrBNB_Timestamp = 1751269105;
export const ankrBNB_GrowthRate = parseUnits("0.0612", 18); // 6.12% per year
export const ankrBNB_SnapshotGap = 51; // 0.51%
export const slisBNB_InitialExchangeRate = parseUnits("1.030088514324890934", 18);
export const slisBNB_Timestamp = 1751269105;
export const slisBNB_GrowthRate = parseUnits("0.0412", 18); // 4.12% per year
export const slisBNB_SnapshotGap = 35; // 0.35%
export const asBNB_InitialExchangeRate = parseUnits("1.026229121794947588", 18);
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
        target: SUSDE_ONEJUMP_CHAINLINK_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(sUSDe_Chainlink_InitialExchangeRate, BigNumber.from(sUSDe_SnapshotGap)),
          sUSDe_Chainlink_Timestamp,
        ],
      },
      // {
      //   target: SUSDE_ONEJUMP_CHAINLINK_ORACLE,
      //   signature: "setGrowthRate(uint256,uint256)",
      //   params: [sUSDe_GrowthRate, DAYS_30],
      // },
      // {
      //   target: SUSDE_ONEJUMP_CHAINLINK_ORACLE,
      //   signature: "setSnapshotGap(uint256)",
      //   params: [getSnapshotGap(sUSDe_Chainlink_InitialExchangeRate, sUSDe_SnapshotGap)],
      // },     
      // {
      //   target: SUSDE_ONEJUMP_REDSTONE_ORACLE,
      //   signature: "setSnapshot(uint256,uint256)",
      //   params: [
      //     increaseExchangeRateByPercentage(sUSDe_Redstone_InitialExchangeRate, BigNumber.from(sUSDe_SnapshotGap)),
      //     sUSDe_Redstone_Timestamp,
      //   ],
      // },
      // {
      //   target: SUSDE_ONEJUMP_REDSTONE_ORACLE,
      //   signature: "setGrowthRate(uint256,uint256)",
      //   params: [sUSDe_GrowthRate, DAYS_30],
      // },
      // {
      //   target: SUSDE_ONEJUMP_REDSTONE_ORACLE,
      //   signature: "setSnapshotGap(uint256)",
      //   params: [getSnapshotGap(sUSDe_Redstone_InitialExchangeRate, sUSDe_SnapshotGap)],
      // },
      // {
      //   target: PTsUSDe_ORACLE,
      //   signature: "setSnapshot(uint256,uint256)",
      //   params: [
      //     increaseExchangeRateByPercentage(PTsUSDE26JUN2025_InitialExchangeRate, BigNumber.from(PTsUSDE26JUN2025_SnapshotGap)),
      //     PTsUSDE26JUN2025_Timestamp,
      //   ],
      // },
      // {
      //   target: PTsUSDe_ORACLE,
      //   signature: "setGrowthRate(uint256,uint256)",
      //   params: [PTsUSDE26JUN2025_GrowthRate, DAYS_30],
      // },
      // {
      //   target: PTsUSDe_ORACLE,
      //   signature: "setSnapshotGap(uint256)",
      //   params: [getSnapshotGap(PTsUSDE26JUN2025_InitialExchangeRate, PTsUSDE26JUN2025_SnapshotGap)],
      // },
      // {
      //   target: XSOLVBTC_ONEJUMP_REDSTONE_ORACLE,
      //   signature: "setSnapshot(uint256,uint256)",
      //   params: [
      //     increaseExchangeRateByPercentage(xSolvBTC_InitialExchangeRate, BigNumber.from(xSolvBTC_SnapshotGap)),
      //     xSolvBTC_Timestamp,
      //   ],
      // },
      // {
      //   target: XSOLVBTC_ONEJUMP_REDSTONE_ORACLE,
      //   signature: "setGrowthRate(uint256,uint256)",
      //   params: [xSolvBTC_GrowthRate, DAYS_30],
      // },
      // {
      //   target: XSOLVBTC_ONEJUMP_REDSTONE_ORACLE,
      //   signature: "setSnapshotGap(uint256)",
      //   params: [getSnapshotGap(xSolvBTC_InitialExchangeRate, xSolvBTC_SnapshotGap)],
      // },
      // {
      //   target: BNBx_ORACLE,
      //   signature: "setSnapshot(uint256,uint256)",
      //   params: [
      //     increaseExchangeRateByPercentage(BNBx_InitialExchangeRate, BigNumber.from(BNBx_SnapshotGap)),
      //     BNBx_Timestamp,
      //   ],
      // },
      // {
      //   target: BNBx_ORACLE,
      //   signature: "setGrowthRate(uint256,uint256)",
      //   params: [BNBx_GrowthRate, DAYS_30],
      // },
      // {
      //   target: BNBx_ORACLE,
      //   signature: "setSnapshotGap(uint256)",
      //   params: [getSnapshotGap(BNBx_InitialExchangeRate, BNBx_SnapshotGap)],
      // },
      // {
      //   target: AnkrBNB_ORACLE,
      //   signature: "setSnapshot(uint256,uint256)",
      //   params: [
      //     increaseExchangeRateByPercentage(ankrBNB_InitialExchangeRate, BigNumber.from(ankrBNB_SnapshotGap)),
      //     ankrBNB_Timestamp,
      //   ],
      // },
      // {
      //   target: AnkrBNB_ORACLE,
      //   signature: "setGrowthRate(uint256,uint256)",
      //   params: [ankrBNB_GrowthRate, DAYS_30],
      // },
      // {
      //   target: AnkrBNB_ORACLE,
      //   signature: "setSnapshotGap(uint256)",
      //   params: [getSnapshotGap(ankrBNB_InitialExchangeRate, ankrBNB_SnapshotGap)],
      // },
      // {
      //   target: SlisBNB_ORACLE,
      //   signature: "setSnapshot(uint256,uint256)",
      //   params: [
      //     increaseExchangeRateByPercentage(slisBNB_InitialExchangeRate, BigNumber.from(slisBNB_SnapshotGap)),
      //     slisBNB_Timestamp,
      //   ],
      // },
      // {
      //   target: SlisBNB_ORACLE,
      //   signature: "setGrowthRate(uint256,uint256)",
      //   params: [slisBNB_GrowthRate, DAYS_30],
      // },
      // {
      //   target: SlisBNB_ORACLE,
      //   signature: "setSnapshotGap(uint256)",
      //   params: [getSnapshotGap(slisBNB_InitialExchangeRate, slisBNB_SnapshotGap)],
      // },
      // {
      //   target: AsBNB_ORACLE,
      //   signature: "setSnapshot(uint256,uint256)",
      //   params: [
      //     increaseExchangeRateByPercentage(asBNB_InitialExchangeRate, BigNumber.from(asBNB_SnapshotGap)),
      //     asBNB_Timestamp,
      //   ],
      // },
      // {
      //   target: AsBNB_ORACLE,
      //   signature: "setGrowthRate(uint256,uint256)",
      //   params: [asBNB_GrowthRate, DAYS_30],
      // },
      // {
      //   target: AsBNB_ORACLE,
      //   signature: "setSnapshotGap(uint256)",
      //   params: [getSnapshotGap(asBNB_InitialExchangeRate, asBNB_SnapshotGap)],
      // },
      // {
      //   target: ethereum.RESILIENT_ORACLE,
      //   signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
      //   params: [
      //     [
      //       [
      //         wstETH,
      //         [wstETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
      //         [true, false, false],
      //         false,
      //       ],
      //     ],
      //   ],
      //   dstChainId: LzChainId.ethereum,
      // },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip517;
