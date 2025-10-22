import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const WBETHOracle = "0x49938fc72262c126eb5D4BdF6430C55189AEB2BA";
export const WBETH = "0xa2E3356610840701BDf5611a53974510Ae27E2e1";

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
export const WBETH_InitialExchangeRate = parseUnits("1.080802207066000000", 18);
export const WBETH_Timestamp = 1760151751;
export const WBETH_GrowthRate = parseUnits("0.0464", 18); // 4.64% per year
export const WBETH_SnapshotGap = 39; // 0.39%

export const vip557 = () => {
  const meta = {
    version: "v2",
    title: "VIP-557 [BNB Chain] Enable the WBETHOracle for WBETH on BNB Chain ",
    description: `If passed, this VIP will perform the changes recommended by [Chaos Labs](https://community.venus.io/t/chaos-labs-wbeth-oracle-update/5463) to update the WBETH oracle configuration and introduce a capped pricing mechanism.

**Oracle configuration for WBETH**

- Replace the current [Binance oracle](https://bscscan.com/address/0x594810b741d136f1960141C0d8Fb4a91bE78A820#readProxyContract).
- Use the [exchangeRate()](https://bscscan.com/token/0xa2e3356610840701bdf5611a53974510ae27e2e1#readProxyContract) function from the [WBETH contract](https://bscscan.com/token/0xa2e3356610840701bdf5611a53974510ae27e2e1) to calculate the WBETH/ETH conversion rate.
- Apply Venus’ [Resilient Price Oracle](https://docs-v4.venus.io/risk/resilient-price-oracle) to determine the ETH/USD price.
- Combine both to produce the WBETH/USD price feed.

**Capped Price Oracle (CAPO) configuration**

- Introduce a CAPO layer to limit WBETH price growth and reduce overpricing risk.
- Parameters:
    - Annual Growth Rate: **4.64%**
    - Snapshot Interval: **30 days**
    - Snapshot Gap: **0.39%**

Complete analysis and details of these recommendations are available in [Chaos’ Labs post](https://community.venus.io/t/chaos-labs-wbeth-oracle-update/5463).`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: WBETHOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(WBETH_InitialExchangeRate, BigNumber.from(WBETH_SnapshotGap)),
          WBETH_Timestamp,
        ],
      },
      {
        target: WBETHOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [WBETH_GrowthRate, DAYS_30],
      },
      {
        target: WBETHOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(WBETH_InitialExchangeRate, WBETH_SnapshotGap)],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            [
              WBETH,
              [WBETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
          ],
        ],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip557;
