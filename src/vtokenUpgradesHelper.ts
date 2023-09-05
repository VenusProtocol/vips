import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Signer } from "ethers";
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
  underlying: string;
  accountBalance: BigNumber;
  borrowBalance: BigNumber;
  borrowRatePerBlock: BigNumber;
  pendingOwner: string;
  protocolShareReserve: string;
  shortfall: string;
  supplyRatePerBlock: BigNumber;
}

export const fetchStorage = async (vToken: ethers.Contract, user: string) => {
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

export const performVTokenBasicActions = async (
  marketAddress: string,
  user: SignerWithAddress,
  impersonatedTimelock: Signer,
  mintAmount: BigNumber,
  borrowAmount: BigNumber,
  repayAmount: BigNumber,
  redeemAmount: BigNumber,
  vToken: ethers.Contract,
  underlying: ethers.Contract,
  comptroller: ethers.Contract,
) => {
  await comptroller
    .connect(impersonatedTimelock)
    .setCollateralFactor(marketAddress, parseUnits("0.8", 18), parseUnits("0.9", 18));
  const underlyingDecimals = await underlying.decimals();
  const symbol = await underlying.symbol();

  await comptroller.connect(impersonatedTimelock).setMarketBorrowCaps([marketAddress], [parseUnits("2", 38)]);
  await comptroller.connect(impersonatedTimelock).setMarketSupplyCaps([marketAddress], [parseUnits("2", 38)]);

  if (symbol === "WBNB") {
    mintAmount = parseUnits("1", 18);
    borrowAmount = parseUnits("0.5", 18);
    repayAmount = parseUnits("0.25", 18);
    redeemAmount = parseUnits("0.5", 18);
    await underlying.connect(user).deposit({ value: mintAmount });
  } else if (underlyingDecimals === 18) {
    await underlying.connect(user).faucet(mintAmount.add(repayAmount));
  } else {
    mintAmount = parseUnits("200", 6);
    borrowAmount = parseUnits("50", 6);
    repayAmount = parseUnits("25", 6);
    redeemAmount = parseUnits("50", 6);
    await underlying.connect(user).allocateTo(user.address, mintAmount.add(repayAmount));
  }
  await underlying.connect(user).approve(marketAddress, mintAmount.add(repayAmount));

  await vToken.connect(user).mint(mintAmount);
  await vToken.connect(user).borrow(borrowAmount);
  await vToken.connect(user).repayBorrow(repayAmount);
  await vToken.connect(user).redeemUnderlying(redeemAmount);
};
