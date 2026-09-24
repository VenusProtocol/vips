import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import CORE_POOL_RATE_MODEL_ABI from "./abi/JumpRateModel.json";
import RATE_MODEL_ABI from "./abi/JumpRateModelV2.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vtoken.json";

export type VTokenContractAndSymbol = {
  symbol: string;
  contract: Contract;
};

export const getVTokenContractAndSymbol = async (vTokenAddress: string) => {
  const contract = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
  const symbol: string = await contract.symbol();
  return { contract, symbol };
};

export const getPoolVTokens = async (
  comptrollerAddress: string,
  options?: { onlyListed?: boolean },
): Promise<VTokenContractAndSymbol[]> => {
  const comptrollerContract = await ethers.getContractAt(COMPTROLLER_ABI, comptrollerAddress);
  let vTokenAddresses: string[] = await comptrollerContract.getAllMarkets();
  if (options?.onlyListed) {
    const listed = await Promise.all(
      vTokenAddresses.map(async vTokenAddress => {
        const { isListed } = await comptrollerContract.markets(vTokenAddress);
        return isListed;
      }),
    );
    vTokenAddresses = vTokenAddresses.filter((_, idx) => listed[idx]);
  }
  return Promise.all(vTokenAddresses.map(getVTokenContractAndSymbol));
};

export const getAllVTokens = async (poolRegistry: Contract) => {
  const pools = await poolRegistry.getAllPools();
  const marketPromises: Promise<VTokenContractAndSymbol[]>[] = pools.map((pool: { comptroller: string }) =>
    getPoolVTokens(pool.comptroller),
  );
  return (await Promise.all(marketPromises)).flat();
};

export const interestRatePointParams = [
  { cash: "100", borrows: "0" }, // 0% utilization
  { cash: "70", borrows: "30" }, // 30% utilization
  { cash: "50", borrows: "50" }, // 50% utilization
  { cash: "20", borrows: "80" }, // 80% utilization
  { cash: "10", borrows: "90" }, // 90% utilization
  { cash: "0", borrows: "100" }, // 100% utilization
] as const;
const DUMMY_RESERVE_FACTOR = parseUnits("0.2", 18);

export type Rates = {
  utilizationRate: BigNumber;
  supplyRate: BigNumber;
  borrowRate: BigNumber;
};
export type RateCurvePoints = Rates[];

export const getRateCurve = async (vTokenContract: Contract): Promise<RateCurvePoints> => {
  const rateModelAddress = await vTokenContract.interestRateModel();
  const rateModel = await ethers.getContractAt(RATE_MODEL_ABI, rateModelAddress);
  return await Promise.all(
    interestRatePointParams.map(async ({ cash, borrows }): Promise<Rates> => {
      return {
        utilizationRate: await rateModel.utilizationRate(cash, borrows, 0, 0),
        supplyRate: await rateModel.getSupplyRate(cash, borrows, 0, DUMMY_RESERVE_FACTOR, 0),
        borrowRate: await rateModel.getBorrowRate(cash, borrows, 0, 0),
      };
    }),
  );
};

export const getCorePoolRateCurve = async (vTokenContract: Contract): Promise<RateCurvePoints> => {
  const rateModelAddress = await vTokenContract.interestRateModel();
  const rateModel = await ethers.getContractAt(CORE_POOL_RATE_MODEL_ABI, rateModelAddress);
  return await Promise.all(
    interestRatePointParams.map(async ({ cash, borrows }): Promise<Rates> => {
      return {
        utilizationRate: await rateModel.utilizationRate(cash, borrows, 0),
        supplyRate: await rateModel.getSupplyRate(cash, borrows, 0, DUMMY_RESERVE_FACTOR),
        borrowRate: await rateModel.getBorrowRate(cash, borrows, 0),
      };
    }),
  );
};
