import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../networkAddresses";
import { setMaxStalePeriod } from "../../utils";
import CHAINLINK_ORACLE_ABI from "../abi/chainlinkOracle.json";
import ERC20_ABI from "../abi/erc20.json";
import COMPTROLLER_ABI from "../abi/il_comptroller.json";
import POOL_REGISTRY_ABI from "../abi/poolRegistry.json";
import RESILIENT_ORACLE_ABI from "../abi/resilientOracle.json";
import VTOKEN_ABI from "../abi/vToken.json";

const NORMAL_TIMELOCK = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].NORMAL_TIMELOCK;
const ACCOUNT = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].VTREASURY;
const POOL_REGISTRY = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].POOL_REGISTRY;
const RESILIENT_ORACLE = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].RESILIENT_ORACLE;

interface PoolMetadata {
  name: string;
  creator: string;
  comptroller: string;
  blockPosted: BigNumber;
  timestampPosted: BigNumber;
}

interface MarketMetadata {
  isListed: boolean;
  collateralFactorMantissa: BigNumber;
  liquidationThresholdMantissa: BigNumber;
}

const calculateBorrowableAmount = async (
  comptroller: Contract,
  resilientOracle: Contract,
  supplyMarket: Contract,
  borrowMarket: Contract,
  borrowUnderlyingDecimals: BigNumber,
  suppliedAmount: BigNumber,
): Promise<BigNumber> => {
  const EXP_SCALE = parseUnits("1", 18);
  const marketData: MarketMetadata = await comptroller.markets(supplyMarket.address);
  const supplyMarketCF = marketData.collateralFactorMantissa;
  const supplyTokenPrice = await resilientOracle.getUnderlyingPrice(supplyMarket.address);
  const borrowTokenPrice = await resilientOracle.getUnderlyingPrice(borrowMarket.address);
  const supplyTokenUSDAmountScaled = suppliedAmount.mul(supplyTokenPrice).div(EXP_SCALE);
  const borrowableAmountUSD = supplyTokenUSDAmountScaled.mul(supplyMarketCF).div(EXP_SCALE);
  const borrowTokenPriceScaled = borrowTokenPrice.mul(parseUnits("1", borrowUnderlyingDecimals)).div(EXP_SCALE); // scaled to 18 decimals
  const borrowTokenAmount = borrowableAmountUSD.div(borrowTokenPriceScaled);

  return parseUnits(borrowTokenAmount.toString(), borrowUnderlyingDecimals);
};

const runPoolTests = async (pool: PoolMetadata) => {
  console.log(`${pool.name} > generic comptroller checks for pool`);
  let supplyMarket: Contract;
  let borrowMarket: Contract;
  let supplyUnderlying: Contract;
  let borrowUnderlying: Contract;

  impersonateAccount(ACCOUNT);
  await setBalance(ACCOUNT, ethers.utils.parseEther("5"));
  impersonateAccount(NORMAL_TIMELOCK);
  const signer: Signer = await ethers.getSigner(ACCOUNT);
  const timelockSigner: Signer = await ethers.getSigner(NORMAL_TIMELOCK);

  const comptroller: Contract = await ethers.getContractAt(COMPTROLLER_ABI, pool.comptroller, signer);
  const resilientOracle: Contract = await ethers.getContractAt(RESILIENT_ORACLE_ABI, RESILIENT_ORACLE);

  const markets: string[] = await comptroller.getAllMarkets();

  for (const market of markets) {
    const marketData: MarketMetadata = await comptroller.markets(market);
    if (marketData.collateralFactorMantissa.isZero() && !supplyMarket) continue;
    if (!supplyMarket) {
      supplyMarket = await ethers.getContractAt(VTOKEN_ABI, market, signer);
      supplyUnderlying = await ethers.getContractAt(ERC20_ABI, await supplyMarket.underlying(), signer);
      const balance = await supplyUnderlying.balanceOf(ACCOUNT);
      if (balance.isZero()) {
        supplyMarket = undefined;
        continue;
      }
    } else if (!borrowMarket) {
      borrowMarket = await ethers.getContractAt(VTOKEN_ABI, market, signer);
      borrowUnderlying = await ethers.getContractAt(ERC20_ABI, await borrowMarket.underlying(), signer);
      break; // Exit the loop if both supplyMarket and borrowMarket are initialized
    }
  }

  await setMaxStalePeriod(resilientOracle, supplyUnderlying);
  await setMaxStalePeriod(resilientOracle, borrowUnderlying);

  console.log(`${pool.name} > check if comptroller`);
  expect(await comptroller.isComptroller()).to.equal(true);

  console.log(
    `${
      pool.name
    } > operations - supplying ${await supplyUnderlying.symbol()} | borrowing ${await borrowUnderlying.symbol()}`,
  );
  const supplyUnderlyingDecimals = await supplyUnderlying.decimals();
  const initialSupplyAmount = parseUnits("2", supplyUnderlyingDecimals);
  const balance = await supplyUnderlying.balanceOf(ACCOUNT);
  const supplyAmountScaled = initialSupplyAmount.gt(balance) ? balance : initialSupplyAmount;
  const originalSupplyMarketBalance = await supplyMarket.balanceOf(ACCOUNT);

  await supplyUnderlying.approve(supplyMarket.address, supplyAmountScaled);
  await supplyMarket.mint(supplyAmountScaled);

  expect(await supplyMarket.balanceOf(ACCOUNT)).to.be.gt(originalSupplyMarketBalance);

  await comptroller.enterMarkets([borrowMarket.address, supplyMarket.address]);
  const borrowMarketBalance = await borrowMarket.balanceOf(ACCOUNT);
  let borrowUnderlyingBalance = await borrowUnderlying.balanceOf(ACCOUNT);
  const borrowUnderlyingDecimals = await borrowUnderlying.decimals();

  let borrowAmount = await calculateBorrowableAmount(
    comptroller,
    resilientOracle,
    supplyMarket,
    borrowMarket,
    borrowUnderlyingDecimals,
    supplyAmountScaled,
  );
  borrowAmount = borrowAmount.isZero() ? BigNumber.from(1) : borrowAmount;

  await borrowMarket.borrow(borrowAmount);
  expect(await borrowUnderlying.balanceOf(ACCOUNT)).to.gt(borrowMarketBalance);

  borrowUnderlyingBalance = await borrowUnderlying.balanceOf(ACCOUNT);
  await borrowUnderlying.approve(borrowMarket.address, borrowAmount);
  await borrowMarket.repayBorrow(borrowAmount);
  expect(await borrowUnderlying.balanceOf(ACCOUNT)).to.lt(borrowUnderlyingBalance);

  const supplyUnderlyingBalance = await supplyUnderlying.balanceOf(ACCOUNT);
  await supplyMarket.redeemUnderlying(parseUnits("0.1", supplyUnderlyingDecimals));
  expect(await supplyUnderlying.balanceOf(ACCOUNT)).to.gt(supplyUnderlyingBalance);

  console.log(`${pool.name} > set storage`);
  const originalOracle = await comptroller.oracle();

  await comptroller.connect(timelockSigner).setPriceOracle("0x50F618A2EAb0fB55e87682BbFd89e38acb2735cD");
  expect(await comptroller.oracle()).to.be.equal("0x50F618A2EAb0fB55e87682BbFd89e38acb2735cD");
  await comptroller.connect(timelockSigner).setPriceOracle(originalOracle);
};

export const checkIsolatedPoolsComptrollers = (): void => {
  describe.only("generic Isolated pool comptroller checks", () => {
    let pools: PoolMetadata[];

    it("generic Isolated pool comptroller checks", async () => {
      const poolRegistry: Contract = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
      pools = await poolRegistry.callStatic.getAllPools();
      if (!pools || pools.length === 0) {
        throw new Error("Pools not initialized or no pools available");
      }

      for (const pool of pools) {
        // Dynamically creating a describe block for each pool
        await runPoolTests(pool);
      }
    });
  });
};
