import { Contract } from "ethers";
import { ethers } from "hardhat";

import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vtoken.json";

export type VTokenContractAndSymbol = {
  symbol: string;
  contract: Contract;
};

const getVTokenContractAndSymbol = async (vTokenAddress: string) => {
  const contract = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
  const symbol: string = await contract.symbol();
  return { contract, symbol };
};

export const getAllVTokens = async (poolRegistry: Contract) => {
  const pools = await poolRegistry.getAllPools();
  const marketPromises: Promise<VTokenContractAndSymbol[]>[] = pools.map(
    async ({ comptroller: comptrollerAddress }: { comptroller: string }): Promise<VTokenContractAndSymbol[]> => {
      const comptrollerContract = await ethers.getContractAt(COMPTROLLER_ABI, comptrollerAddress);
      const vTokenAddresses: string[] = await comptrollerContract.getAllMarkets();
      return Promise.all(vTokenAddresses.map(getVTokenContractAndSymbol));
    },
  );
  return (await Promise.all(marketPromises)).flat();
};
