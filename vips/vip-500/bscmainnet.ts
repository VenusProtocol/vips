import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;

export const increaseExchangeRateByPercentage = (
  exchangeRate: BigNumber,
  percentage: BigNumber, // BPS value (e.g., 10000 for 100%)
) => {
  const increaseAmount = exchangeRate.mul(percentage).div(10000);
  return exchangeRate.add(increaseAmount).toString();
};

export const weETH = "0x7DCC39B4d1C53CB31e1aBc0e358b43987FEF80f7";
export const wstETH = "0xc02fE7317D4eb8753a02c35fe019786854A92001";
export const WETH_ORACLE = "0xF9ECA470E2458Fe2B6FcAe660bEd1e2C0FB87E01";
export const WSTETH_ORACLE = "0x3938D6414c261C6F450f1bD059DF9af2BBfb603D";

const weETH_Initial_Exchange_Rate = parseUnits("1.06786522", 18);
const wstETH_Initial_Exchange_Rate = parseUnits("1.20307347", 18);

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
        target: unichainmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            weETH,
            [WETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WETH_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [increaseExchangeRateByPercentage(weETH_Initial_Exchange_Rate, BigNumber.from("503")), 1747675954],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WETH_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.053", 18), DAYS_30], // 5.3%
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WETH_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [parseUnits("0.0044", 18)], // 0.44%
        dstChainId: LzChainId.unichainmainnet,
      },

      // wstETH Oracle
      {
        target: unichainmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wstETH,
            [WSTETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WSTETH_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [increaseExchangeRateByPercentage(wstETH_Initial_Exchange_Rate, BigNumber.from("607")), 1747675954],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WSTETH_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.067", 18), DAYS_30], // 6.7%
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WSTETH_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [parseUnits("0.0055", 18)], // 0.55%
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip500;
