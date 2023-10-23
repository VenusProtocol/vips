import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

export interface storageLayout {
  name: string;
  symbol: string;
  decimals: number;
  owner: string;
  comptroller: string;
  interestRateModel: string;
  reserveFactorMantissa: BigNumber;
  accrualBlockNumber: BigNumber;
  borrowIndex: BigNumber;
  totalBorrows: BigNumber;
  totalSupply: BigNumber;
  totalReserves: BigNumber;
  underlying: string;
  accountBalance: BigNumber;
  borrowBalance: BigNumber;
  borrowRatePerBlock: BigNumber;
  pendingOwner: string;
  protocolShareReserve: string;
  shortfall: string;
  supplyRatePerBlock: BigNumber;
}

export const fetchVTokenStorageIL = async (vToken: ethers.Contract, user: string) => {
  const name = await vToken.name();
  const symbol = await vToken.symbol();
  const decimals = await vToken.decimals();
  const owner = await vToken.owner();
  const comptroller = await vToken.comptroller();
  const interestRateModel = await vToken.interestRateModel();
  const reserveFactorMantissa = await vToken.reserveFactorMantissa();
  const accrualBlockNumber = await vToken.accrualBlockNumber();
  const borrowIndex = await vToken.borrowIndex();
  const totalBorrows = await vToken.totalBorrows();
  const totalSupply = await vToken.totalSupply();
  const totalReserves = await vToken.totalReserves();
  const underlying = await vToken.underlying();
  const accountBalance = await vToken.callStatic.balanceOf(user);
  const borrowBalance = await vToken.callStatic.borrowBalanceStored(user);
  const borrowRatePerBlock = await vToken.borrowRatePerBlock();
  const pendingOwner = await vToken.pendingOwner();
  const protocolShareReserve = await vToken.protocolShareReserve();
  const shortfall = await vToken.shortfall();
  const supplyRatePerBlock = await vToken.supplyRatePerBlock();

  return {
    name,
    symbol,
    decimals,
    owner,
    comptroller,
    interestRateModel,
    reserveFactorMantissa,
    accrualBlockNumber,
    borrowIndex,
    totalBorrows,
    totalSupply,
    totalReserves,
    underlying,
    accountBalance,
    borrowBalance,
    borrowRatePerBlock,
    pendingOwner,
    protocolShareReserve,
    shortfall,
    supplyRatePerBlock,
  };
};

export const fetchVTokenStorageCore = async (vToken: ethers.Contract, user: string) => {
  const name = await vToken.name();
  const symbol = await vToken.symbol();
  const decimals = await vToken.decimals();
  const owner = await vToken.admin();
  const comptroller = await vToken.comptroller();
  const interestRateModel = await vToken.interestRateModel();
  const reserveFactorMantissa = await vToken.reserveFactorMantissa();
  const accrualBlockNumber = await vToken.accrualBlockNumber();
  const borrowIndex = await vToken.borrowIndex();
  const totalBorrows = await vToken.totalBorrows();
  const totalSupply = await vToken.totalSupply();
  const totalReserves = await vToken.totalReserves();
  const underlying = await vToken.underlying();
  const accountBalance = await vToken.callStatic.balanceOf(user);
  const borrowBalance = await vToken.callStatic.borrowBalanceStored(user);
  const borrowRatePerBlock = await vToken.borrowRatePerBlock();
  const pendingOwner = await vToken.pendingAdmin();
  const supplyRatePerBlock = await vToken.supplyRatePerBlock();

  return {
    name,
    symbol,
    decimals,
    owner,
    comptroller,
    interestRateModel,
    reserveFactorMantissa,
    accrualBlockNumber,
    borrowIndex,
    totalBorrows,
    totalSupply,
    totalReserves,
    underlying,
    accountBalance,
    borrowBalance,
    borrowRatePerBlock,
    pendingOwner,
    supplyRatePerBlock,
  };
};

export const performVTokenBasicActions = async (
  marketAddress: string,
  user: SignerWithAddress,
  mintAmount: BigNumber,
  borrowAmount: BigNumber,
  repayAmount: BigNumber,
  redeemAmount: BigNumber,
  vToken: ethers.Contract,
  underlying: ethers.Contract,
  isUnderlyingMock: boolean,
) => {
  const underlyingDecimals = await underlying.decimals();
  const symbol = await underlying.symbol();

  if (symbol === "WBNB") {
    mintAmount = parseUnits("1", 18);
    borrowAmount = parseUnits("0.5", 18);
    repayAmount = parseUnits("0.25", 18);
    redeemAmount = parseUnits("0.5", 18);
    await underlying.connect(user).deposit({ value: mintAmount });
  }
  if (underlyingDecimals == 6) {
    mintAmount = parseUnits("200", 6);
    borrowAmount = parseUnits("50", 6);
    repayAmount = parseUnits("25", 6);
    redeemAmount = parseUnits("50", 6);
  }
  if (process.env.FORK_TESTNET === "true" && isUnderlyingMock) {
    try {
      await underlying.connect(user).faucet(mintAmount.add(repayAmount));
    } catch (error) {
      await underlying.connect(user).allocateTo(user.address, mintAmount.add(repayAmount));
    }
  }

  let previousBalance = await vToken.balanceOf(user.address);
  let previousBorrowBalance = await vToken.borrowBalanceStored(user.address);

  // Approve market
  await underlying.connect(user).approve(marketAddress, mintAmount.add(repayAmount));

  // Mint tokens
  await vToken.connect(user).mint(mintAmount);
  expect(await vToken.balanceOf(user.address)).to.be.greaterThan(previousBalance);
  previousBalance = await vToken.balanceOf(user.address);

  // Borrow tokens
  await vToken.connect(user).borrow(borrowAmount);
  expect(await vToken.borrowBalanceStored(user.address)).to.be.greaterThan(previousBorrowBalance);
  previousBorrowBalance = await vToken.borrowBalanceStored(user.address);

  // Repay borrowed tokens
  await vToken.connect(user).repayBorrow(repayAmount);
  expect(await vToken.borrowBalanceStored(user.address)).to.be.lessThan(previousBorrowBalance);

  // Redeem tokens
  await vToken.connect(user).redeemUnderlying(redeemAmount);
  expect(await vToken.balanceOf(user.address)).to.be.lessThan(previousBalance);
};
