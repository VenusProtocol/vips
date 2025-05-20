import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const increaseExchangeRateByPercentage = (
  exchangeRate: BigNumber,
  percentage: BigNumber, // BPS value (e.g., 10000 for 100%)
) => {
  const increaseAmount = exchangeRate.mul(percentage).div(10000);
  return exchangeRate.add(increaseAmount).toString();
};

export const weETH = "0x3B3aCc90D848981E69052FD461123EA19dca6cAF";
export const wstETH = "0x114B3fD3dA17F8EDBc19a3AEE43aC168Ca5b03b4";
export const WETH_ORACLE = "0xa980158116316d0759C56D7E812D7D8cEf18B425";
export const WSTETH_ORACLE = "0x555bD5dc1dCf87EEcC39778C3ba9DDCc40dF05c0";

const weETH_Initial_Exchange_Rate = parseUnits("1.06778921", 18);
const wstETH_Initial_Exchange_Rate = parseUnits("1.20297267", 18);

export const DAYS_30 = 30 * 24 * 60 * 60;

export const vip500 = () => {
  const meta = {
    version: "v2",
    title: "[VIP-500]",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // weETH Oracle
      {
        target: unichainsepolia.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            weETH,
            [WETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: WETH_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [increaseExchangeRateByPercentage(weETH_Initial_Exchange_Rate, BigNumber.from("503")), 1747589544],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: WETH_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.053", 18), DAYS_30], // 5.3%
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: WETH_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [parseUnits("0.0044", 18)], // 0.44%
        dstChainId: LzChainId.unichainsepolia,
      },

      // wstETH Oracle
      {
        target: unichainsepolia.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wstETH,
            [WSTETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: WSTETH_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [increaseExchangeRateByPercentage(wstETH_Initial_Exchange_Rate, BigNumber.from("607")), 1747589544],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: WSTETH_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.067", 18), DAYS_30], // 6.7%
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: WSTETH_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [parseUnits("0.0055", 18)], // 0.55%
        dstChainId: LzChainId.unichainsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip500;
