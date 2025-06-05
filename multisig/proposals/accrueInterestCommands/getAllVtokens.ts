import * as fs from "fs";
import { ethers } from "hardhat";
import * as path from "path";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

const comptrollerAbi = ["function getAllMarkets() external view returns (address[] memory)"];
const poolRegistryAbi = [
  "function getAllPools() external view returns (tuple(string name, address creator, address comptroller, uint256 blockPosted, uint256 timestampPosted )[] memory)",
];

const filePath = path.join(__dirname, "address.json");

async function getAllVTokens(): Promise<string[]> {
  const allVtokens: string[] = [];

  // Core pool
  const coreComptroller = await ethers.getContractAt(comptrollerAbi, UNITROLLER);
  const coreMarkets = await coreComptroller.getAllMarkets();
  allVtokens.push(...coreMarkets);

  // IL pools
  const poolRegistry = await ethers.getContractAt(poolRegistryAbi, NETWORK_ADDRESSES.bscmainnet.POOL_REGISTRY);
  const pools = await poolRegistry.getAllPools();

  for (const pool of pools) {
    const ilComptroller = await ethers.getContractAt(comptrollerAbi, pool.comptroller);
    const ilMarkets = await ilComptroller.getAllMarkets();
    allVtokens.push(...ilMarkets);
  }
  return allVtokens;
}

getAllVTokens()
  .then(vTokens => {
    fs.writeFileSync(filePath, JSON.stringify(vTokens, null, 2), "utf8");
    console.log(`VToken addresses written to ${filePath}`);
  })
  .catch(console.error);
