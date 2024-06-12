import { BigNumber, Contract, Signer } from "ethers";
import { Result, formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import fs from "fs/promises";

import { NORMAL_TIMELOCK, forking } from "../../../src/vip-framework";
import COMPROLLER_ABI from "../abi/Comptroller.json";
import ERC20_ABI from "../abi/IERC20.json";
import VAI_CONTROLLER_ABI from "../abi/VAIController.json";
import VTOKEN_ABI from "../abi/VBep20.json";
import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { initMainnetUser } from "../../../src/utils";
import { AccountSnapshotUsd, MANTISSA_ONE, Market, MarketDebtData, Value } from "./types";
import { Codegen } from "./codegen";
import { AccountSnapshotsCache, BorrowBalancesCache } from "./cache";
import allAccounts from "./accounts";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VAI_CONTROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const MULTICALL = "0xcA11bde05977b3631167028862bE2a173976CA11";
const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const SXPOLD = "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A";
const ACCOUNT_LENS = "0x9659F447EB89C49E37f49f24979C0ee2c1a3c823";
const RESILIENT_ORACLE = NETWORK_ADDRESSES.bscmainnet.RESILIENT_ORACLE;
const CHAINLINK_ORACLE = NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE;

const VIP_REPAYMENT_THRESHOLD = parseUnits("15", 18); // Repaying debts > $15 in the VIP, the rest to be repaid by community
const COLLATERAL_THRESHOLD = parseUnits("10", 18); // Debt would be repaid if the collateral is < $10
const SXPOLD_DEBANK_PRICE = parseUnits("0.006", 18); // Use DeBank price for SXPOLD token as it's more realistic than assuming SXPOLD == SXP

const CHAINLINK_ORACLE_ABI = [
  "function setDirectPrice(address asset, uint256 price) external",
];

const ORACLE_ABI = [
  "function getPrice(address asset) external view returns (uint256)",
];

const MULTICALL_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) public returns (uint256 blockNumber, bytes[] returnData)",
];

const ACCOUNT_LENS_ABI = [
  "function getSupplyAndBorrowsUsd(address comptroller, address account) external view returns (uint256 supplyUsd, uint256 borrowsUsd)",
];

const multicall = new ethers.Contract(MULTICALL, MULTICALL_ABI, ethers.provider);
const comptroller = new ethers.Contract(COMPTROLLER, COMPROLLER_ABI, ethers.provider);
const vaiController = new ethers.Contract(VAI_CONTROLLER, VAI_CONTROLLER_ABI, ethers.provider);
const accountLens = new ethers.Contract(ACCOUNT_LENS, ACCOUNT_LENS_ABI, ethers.provider);
const oracle = new ethers.Contract(RESILIENT_ORACLE, ORACLE_ABI, ethers.provider);
const chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);

const vaiMarket = new Market({
  address: VAI_CONTROLLER,
  underlying: ethers.constants.AddressZero, // todo: fixme
  exchangeRate: MANTISSA_ONE,
  symbol: "VAI",
  underlyingSymbol: "VAI",
  underlyingDecimals: 18,
  underlyingPrice: MANTISSA_ONE,
});

class VTokenAdapter {
  public readonly vTokenOrVaiController: Contract;

  constructor(market: Market) {
    if (market.address !== VAI_CONTROLLER) {
      this.vTokenOrVaiController = new ethers.Contract(market.address, VTOKEN_ABI, ethers.provider);
    } else {
      this.vTokenOrVaiController = vaiController;
    }
  }

  isVai() {
    return this.vTokenOrVaiController.address === VAI_CONTROLLER;
  }

  async accrueInterest(signer: Signer) {
    if (this.vTokenOrVaiController.address === VAI_CONTROLLER) {
      return this.vTokenOrVaiController.connect(signer).accrueVAIInterest();
    } else {
      return this.vTokenOrVaiController.connect(signer).accrueInterest();
    }
  }

  encodeBorrowBalanceRequest(account: string) {
    const functionName = this.isVai() ? "getVAIRepayAmount" : "borrowBalanceStored";
    return this.vTokenOrVaiController.interface.encodeFunctionData(functionName, [account]);
  }

  decodeBorrowBalanceResult(result: string) {
    const functionName = this.isVai() ? "getVAIRepayAmount" : "borrowBalanceStored";
    return this.vTokenOrVaiController.interface.decodeFunctionResult(functionName, result)[0];
  }
}

const getAccountSnapshots = async (
  accounts: ReadonlyArray<string>,
  chunkSize: number,
  cache: AccountSnapshotsCache,
): Promise<[string, AccountSnapshotUsd][]> => {
  let snapshots = cache.readAll();
  const remainingAccounts = accounts.filter((account) => !cache.has(account));
  const runChunk = async (accountsChunk: ReadonlyArray<string>) => {
    const [, multicallResult] = await multicall.callStatic.aggregate(
      accountsChunk.flatMap(account => [
        [ accountLens.address, accountLens.interface.encodeFunctionData("getSupplyAndBorrowsUsd", [COMPTROLLER, account]) ],
        [ comptroller.address, comptroller.interface.encodeFunctionData("getAccountLiquidity", [account]) ],
      ]),
    );
    const chunk: [string, AccountSnapshotUsd][] = accountsChunk.map(
      (account: string, idx: number): [string, AccountSnapshotUsd] => {
        const supplyAndBorrows = accountLens.interface.decodeFunctionResult("getSupplyAndBorrowsUsd", multicallResult[idx * 2])
        const [_, liquidity, shortfall] = comptroller.interface.decodeFunctionResult("getAccountLiquidity", multicallResult[idx * 2 + 1]);
        return [
          account,
          {
            supplyUsd: supplyAndBorrows.supplyUsd,
            borrowsUsd: supplyAndBorrows.borrowsUsd,
            liquidity: liquidity,
            shortfall: shortfall,
          }
        ];
      }
    );
    await cache.append(chunk);
    return chunk;
  }
  for (let start = 0; start < remainingAccounts.length; start += chunkSize) {
    console.log(`Getting snapshots for accounts ${start} to ${start + chunkSize} of ${remainingAccounts.length}`);
    snapshots = [...snapshots, ...await runChunk(remainingAccounts.slice(start, start + chunkSize))];
  }
  return snapshots;
};

const getMarkets = async () => {
  const getUnderlyingInfo = async (vToken: Contract) => {
    if (vToken.address == VBNB) {
      return {
        underlying: ethers.constants.AddressZero,
        underlyingSymbol: "BNB",
        underlyingDecimals: 18,
        underlyingPrice: await oracle.getPrice("0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"),
      }
    }
    const underlyingAddress = await vToken.underlying();
    const erc20 = new ethers.Contract(underlyingAddress, ERC20_ABI, ethers.provider);
    return {
      underlying: underlyingAddress,
      underlyingSymbol: await erc20.symbol(),
      underlyingDecimals: await erc20.decimals(),
      underlyingPrice: await oracle.getPrice(underlyingAddress),
    };
  }
  const marketAddresses = await comptroller.getAllMarkets();
  const markets: Market[] = [];
  for (const address of marketAddresses) {
    const vToken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
    const exchangeRate = await vToken.callStatic.exchangeRateCurrent();
    const symbol = await vToken.symbol();
    markets.push(new Market({
      address,
      exchangeRate,
      symbol,
      ...await getUnderlyingInfo(vToken),
    }));
  }
  return markets;
};

const getMarketDebts = async (
  market: Market,
  accounts: ReadonlyArray<string>,
  chunkSize: number,
  cache: BorrowBalancesCache
) => {
  const [signer] = await ethers.getSigners();
  const vToken = new VTokenAdapter(market);
  await vToken.accrueInterest(signer);
  const remainingAccounts = accounts.filter((account) => !cache.has(account));

  const runChunk = async (chunk: ReadonlyArray<string>): Promise<[string, BigNumber][]> => {
    const [, multicallResult] = await multicall.callStatic.aggregate(
      chunk.map(account => [market.address, vToken.encodeBorrowBalanceRequest(account)]),
    );
    return multicallResult.map(
      (r: string, idx: number): [string, BigNumber] => ([chunk[idx], vToken.decodeBorrowBalanceResult(r)]),
    );
  }
  let borrowBalances: [string, BigNumber][] = cache.readKeys(accounts);
  for (let start = 0; start < remainingAccounts.length; start += chunkSize) {
    console.log(`Getting ${market.symbol} borrow balances for accounts ${start} to ${start + chunkSize} of ${remainingAccounts.length}`);
    const chunk = await runChunk(remainingAccounts.slice(start, start + chunkSize));
    cache.append(chunk);
    borrowBalances = [...borrowBalances, ...chunk];
  }
  return market.marketDebtDataFromBorrowBalances(borrowBalances);
};

const balanceOf = async (token: string, account: string) => {
  if (token === ethers.constants.AddressZero) {
    return ethers.provider.getBalance(account);
  }
  const erc20 = new ethers.Contract(token, ERC20_ABI, ethers.provider);
  return erc20.balanceOf(account);
};

const computeTreasuryWithdrawals = async (
  marketDebtData: MarketDebtData[],
): Promise<{
  vTokenWithdrawals: Record<string, Value>;
  underlyingWithdrawals: Record<string, Value>;
  errors: string[];
}> => {
  const vTokenWithdrawals: Record<string, Value> = {};
  const underlyingWithdrawals: Record<string, Value> = {};
  const errors: string[] = [];
  for (const { market, totalDebt } of marketDebtData) {
    const vTokenBalance = await balanceOf(market.address, VTREASURY);
    if (vTokenBalance.gt(totalDebt.vTokenAmount)) {
      const marketLiquidity = await balanceOf(market.underlying, market.address);
      if (marketLiquidity.gt(totalDebt.underlyingAmount)) {
        vTokenWithdrawals[market.symbol] = totalDebt;
        continue;
      } else {
        errors.push(`Insufficient market liquidity to redeem ${market.symbol}`);
        // We still try to withdraw underlying in this case
      }
    }
    const underlyingBalance = await balanceOf(market.underlying, VTREASURY);
    if (underlyingBalance.gt(totalDebt.underlyingAmount)) {
      underlyingWithdrawals[market.symbol] = totalDebt;
      continue;
    }
    // We do not try to combine underlying withdrawals and vToken withdrawals
    errors.push(`Insufficient treasury balance to repay ${market.symbol} debt`);
  }
  return { vTokenWithdrawals, underlyingWithdrawals, errors };
};

const filterDebts = ({ market, debts }: MarketDebtData, filterFn: (arg: [string, Value]) => boolean): MarketDebtData => {
  const filtered = Object.entries(debts).filter(filterFn);
  const totalDebtInUnderlying = filtered.reduce(
    (acc: BigNumber, [_, x]: [string, Value]) => acc.add(x.underlyingAmount), BigNumber.from(0)
  );
  const totalDebt = market.valueFromUnderlyingAmount(totalDebtInUnderlying);
  return {
    market,
    debts: Object.fromEntries(filtered),
    totalDebt,
  };
}

const main = async () => {
  const signer = await initMainnetUser(NORMAL_TIMELOCK, parseUnits("2", 18));
  await chainlinkOracle.connect(signer).setDirectPrice(SXPOLD, SXPOLD_DEBANK_PRICE);
  const markets = await getMarkets();
  const snapshotsCache = await AccountSnapshotsCache.create();
  const accountSnapshots = await getAccountSnapshots(allAccounts, 50, snapshotsCache);
  const underwaterAccounts = accountSnapshots.filter(([_, { shortfall }]) => shortfall.gt(0));

  const accounts = underwaterAccounts.map(([account, _]) => account);
  const unfilteredMarketDebtData = await Promise.all(markets.map(async (market) => {
    const cache = await BorrowBalancesCache.create(market);
    console.log("Loaded " + market.symbol + " cache, " + cache.readAll().length + " entries");
    return getMarketDebts(market, accounts, 100, cache);
  }));
  const marketDebtData = unfilteredMarketDebtData.filter(({ totalDebt }) => totalDebt.underlyingAmount.gt(0));
  const vaiCache = await BorrowBalancesCache.create(vaiMarket);
  const vaiDebts = await getMarketDebts(vaiMarket, accounts, 100, vaiCache);
  
  const codegen = new Codegen();
  const shouldRepayInVip = ([account, debt]: [string, Value]) => {
    const bigDebt = debt.usdValue.gt(VIP_REPAYMENT_THRESHOLD);
    const lowCollateral = Object.fromEntries(accountSnapshots)[account].supplyUsd.lt(COLLATERAL_THRESHOLD);
    return bigDebt && lowCollateral;
  }

  const filteredDebts = marketDebtData.map((debts) => filterDebts(debts, shouldRepayInVip));
  const debtsToRepay = filteredDebts.filter((debtData) => debtData.totalDebt.underlyingAmount.gt(0));
  const marketsWithNoVipRepayment = filteredDebts.filter((debtData) => debtData.totalDebt.underlyingAmount.eq(0)).map(({ market }) => market.symbol);
  console.log("export const shortfalls = " + codegen.printAnnotatedDebts(debtsToRepay));
  const { vTokenWithdrawals, underlyingWithdrawals, errors } = await computeTreasuryWithdrawals(marketDebtData);
  console.log("export const vTokenWithdrawals = " + codegen.printVTokenAmounts(vTokenWithdrawals));
  console.log("export const underlyingWithdrawals = " + codegen.printUnderlyingAmounts(underlyingWithdrawals));
  for (const error of errors) {
    console.warn(error);
  }

  const totalVaiDebt = vaiDebts.totalDebt.underlyingAmount;
  console.log("export const vaiDebts = " + codegen.printVaiDebts(filterDebts(vaiDebts, shouldRepayInVip)));
  console.log(`export const totalVAIDebt = parseUnits("${formatUnits(totalVaiDebt, 18)}", 18);`);
  console.log(`export const plainTransfers = [${ marketsWithNoVipRepayment.map(m => `"${m}"`).join(", ") })}]`)
};

// @kkirka: I couldn't make `hardhat run` preserve the --fork parameter: scripts are launched
// in a subprocess, so the configuration and custom params are reset. Thus, this script expects
// to be run in a test environment (i.e. `npx hardhat test --fork bscmainnet ./get-debt-data.ts`)
forking(39144000, () => {
  it("prints the data for the VIP", main);
});
