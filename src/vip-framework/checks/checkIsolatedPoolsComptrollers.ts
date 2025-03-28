import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { FORKED_NETWORK, ethers } from "hardhat";
import { ORACLE_BNB } from "src/networkAddresses";

import { getForkedNetworkAddress, initMainnetUser, setMaxStalePeriod } from "../../utils";
import ERC20_ABI from "../abi/erc20.json";
import COMPTROLLER_ABI from "../abi/il_comptroller.json";
import POOL_REGISTRY_ABI from "../abi/poolRegistry.json";
import RESILIENT_ORACLE_ABI from "../abi/resilientOracle.json";
import VTOKEN_ABI from "../abi/vToken.json";

const NORMAL_TIMELOCK = getForkedNetworkAddress("NORMAL_TIMELOCK");
const DEFAULT_SUPPLIER = getForkedNetworkAddress("VTREASURY");
const POOL_REGISTRY = getForkedNetworkAddress("POOL_REGISTRY");
const RESILIENT_ORACLE = getForkedNetworkAddress("RESILIENT_ORACLE");

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
  const borrowTokenAmountScaled = borrowableAmountUSD.div(borrowTokenPriceScaled);
  const borrowTokenAmount = parseUnits(borrowTokenAmountScaled.toString(), borrowUnderlyingDecimals);
  await borrowMarket.accrueInterest();
  const cash = await borrowMarket.getCash();
  const reserves = await borrowMarket.totalReserves();
  const availableCash = cash.sub(reserves).mul(9).div(10); // applying 0.9 factor to account for interests

  return borrowTokenAmount.gt(availableCash) ? availableCash : borrowTokenAmount;
};

const runPoolTests = async (pool: PoolMetadata, poolSupplier: string) => {
  console.log(`${pool.name} > generic comptroller checks for pool`);
  let supplyMarket: Contract | undefined = undefined;
  let borrowMarket: Contract | undefined = undefined;
  let supplyUnderlying: Contract | undefined = undefined;
  let borrowUnderlying: Contract | undefined = undefined;

  const signer = await initMainnetUser(poolSupplier, ethers.utils.parseEther("50"));
  const timelockSigner = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("5"));

  const comptroller: Contract = await ethers.getContractAt(COMPTROLLER_ABI, pool.comptroller, signer);
  const resilientOracle: Contract = await ethers.getContractAt(RESILIENT_ORACLE_ABI, RESILIENT_ORACLE);

  const markets: string[] = await comptroller.getAllMarkets();

  for (const market of markets) {
    const isListed = (await comptroller.markets(market)).isListed;
    if (!isListed) continue;

    const marketData: MarketMetadata = await comptroller.markets(market);
    if (!supplyMarket && !marketData.collateralFactorMantissa.isZero()) {
      supplyMarket = await ethers.getContractAt(VTOKEN_ABI, market, signer);
      supplyUnderlying = await ethers.getContractAt(ERC20_ABI, await supplyMarket.underlying(), signer);
      const balance = await supplyUnderlying.balanceOf(poolSupplier);
      if (balance.isZero()) {
        supplyMarket = undefined;
      }
    }

    if (
      !borrowMarket &&
      !(supplyMarket && supplyMarket.address === market) &&
      !(await comptroller.actionPaused(market, 2))
    ) {
      borrowMarket = await ethers.getContractAt(VTOKEN_ABI, market, signer);
      borrowUnderlying = await ethers.getContractAt(ERC20_ABI, await borrowMarket.underlying(), signer);
    }

    if (supplyMarket && borrowMarket) break; // Exit the loop if both supplyMarket and borrowMarket are initialized
  }

  if (!supplyMarket || !borrowMarket) {
    return;
  }

  if (FORKED_NETWORK == "bscmainnet") {
    await setMaxStalePeriod(resilientOracle, await ethers.getContractAt(ERC20_ABI, ORACLE_BNB, signer));
  }

  await setMaxStalePeriod(resilientOracle, supplyUnderlying as Contract);
  await setMaxStalePeriod(resilientOracle, borrowUnderlying as Contract);

  console.log(`${pool.name} > check if comptroller`);
  expect(await comptroller.isComptroller()).to.equal(true);

  console.log(
    `${
      pool.name
    } > operations - supplying ${await supplyUnderlying?.symbol()} | borrowing ${await borrowUnderlying?.symbol()}`,
  );
  const supplyUnderlyingDecimals = await supplyUnderlying?.decimals();
  const initialSupplyAmount = parseUnits("0.1", supplyUnderlyingDecimals);
  const balance = await supplyUnderlying?.balanceOf(poolSupplier);
  const supplyAmountScaled = initialSupplyAmount.gt(balance) ? balance : initialSupplyAmount;
  const originalSupplyMarketBalance = await supplyMarket?.balanceOf(poolSupplier);

  // NOTE: this is causing a state change that we'll restore before the end of this function
  const originalSupplyCap = await comptroller.supplyCaps(supplyMarket?.address);
  await comptroller.connect(timelockSigner).setMarketSupplyCaps([supplyMarket?.address], [ethers.constants.MaxUint256]);

  await supplyUnderlying?.approve(supplyMarket?.address, supplyAmountScaled);
  await supplyMarket?.mint(supplyAmountScaled);
  expect(await supplyMarket?.balanceOf(poolSupplier)).to.be.gt(originalSupplyMarketBalance);

  await comptroller.enterMarkets([borrowMarket?.address, supplyMarket?.address]);
  let borrowUnderlyingBalance = await borrowUnderlying?.balanceOf(poolSupplier);
  const borrowUnderlyingDecimals = await borrowUnderlying?.decimals();

  let borrowAmount = await calculateBorrowableAmount(
    comptroller,
    resilientOracle,
    supplyMarket as Contract,
    borrowMarket as Contract,
    borrowUnderlyingDecimals,
    supplyAmountScaled,
  );
  borrowAmount = borrowAmount.isZero() ? BigNumber.from(1) : borrowAmount;

  const totalBorrows = await borrowMarket?.totalBorrows();
  const borrowCap = await comptroller.borrowCaps(borrowMarket?.address);

  if (totalBorrows.add(borrowAmount).lt(borrowCap)) {
    await borrowMarket?.borrow(borrowAmount);
    expect(await borrowUnderlying?.balanceOf(poolSupplier)).to.gt(borrowUnderlyingBalance);

    borrowUnderlyingBalance = await borrowUnderlying?.balanceOf(poolSupplier);
    await borrowUnderlying?.approve(borrowMarket?.address, borrowAmount);
    await borrowMarket?.repayBorrow(borrowAmount);
    expect(await borrowUnderlying?.balanceOf(poolSupplier)).to.lt(borrowUnderlyingBalance);
  }

  const supplyUnderlyingBalance = await supplyUnderlying?.balanceOf(poolSupplier);
  await supplyMarket?.redeemUnderlying(parseUnits("0.01", supplyUnderlyingDecimals));
  expect(await supplyUnderlying?.balanceOf(poolSupplier)).to.gt(supplyUnderlyingBalance);

  const comptrollerOwner = await comptroller.owner();
  if (NORMAL_TIMELOCK != comptrollerOwner) {
    console.log(
      `Skipping the set storage test because the owner of the comptroller (${comptrollerOwner}) is not (${NORMAL_TIMELOCK})`,
    );
  } else {
    console.log(`${pool.name} > set storage`);
    await setBalance(NORMAL_TIMELOCK, ethers.utils.parseEther("5"));

    const originalOracle = await comptroller.oracle();
    await comptroller.connect(timelockSigner).setPriceOracle("0x50F618A2EAb0fB55e87682BbFd89e38acb2735cD");
    expect(await comptroller.oracle()).to.be.equal("0x50F618A2EAb0fB55e87682BbFd89e38acb2735cD");
    await comptroller.connect(timelockSigner).setPriceOracle(originalOracle);
  }

  // Restoring the original supply cap
  await comptroller.connect(timelockSigner).setMarketSupplyCaps([supplyMarket?.address], [originalSupplyCap]);
};

// NOTE: The default supplier for each pool will be VTreasury, if in case VTreasury has no
//       underlying token balance in any or only in the last market in the list, you can use the
//       poolToSupplierMap in order to specify a supplier per pool
//       You can check multisig/simulations/vip-010/vip-010-ethereum/simulations.ts for example.
export const checkIsolatedPoolsComptrollers = (poolToSupplierMap: { [comptroller: string]: string } = {}): void => {
  describe("generic Isolated pool comptroller checks", () => {
    let pools: PoolMetadata[];

    it("generic Isolated pool comptroller checks", async () => {
      const poolRegistry: Contract = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
      pools = await poolRegistry.callStatic.getAllPools();
      if (!pools || pools.length === 0) {
        throw new Error("Pools not initialized or no pools available");
      }

      for (const pool of pools) {
        const poolSupplier: string = poolToSupplierMap[pool.comptroller] || DEFAULT_SUPPLIER;
        // Dynamically creating a describe block for each pool
        await runPoolTests(pool, poolSupplier);
      }
    });
  });
};
