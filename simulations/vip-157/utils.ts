import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";

const MANTISSA_ONE = parseUnits("1", 18);
const BASIS_POINT_DIVISOR = BigNumber.from(10000);
export async function swapStableForVAIAndValidate(
  psm: Contract,
  stableToken: Contract,
  stableTokenPrice: BigNumber,
  tokenSigner: Signer,
  tokenHolder: string,
  VAI: Contract,
  feeIn: BigNumber,
  tokenDecimals: number,
  oneDollar: BigNumber,
) {
  const stableTokenAmount = parseUnits("1000", tokenDecimals);
  // calculate price of stableToken in USD, applying MIN(1$, oracle_price) thus capping stableToken maximum price to 1$
  const feeInTokenPrice = stableTokenPrice.gt(oneDollar) ? oneDollar : stableTokenPrice;
  const stableTokenAmountUSD = stableTokenAmount.mul(feeInTokenPrice).div(MANTISSA_ONE);
  const fee = stableTokenAmountUSD.mul(feeIn).div(BASIS_POINT_DIVISOR);
  const vaiToMint = stableTokenAmountUSD.sub(fee);
  await stableToken.connect(tokenSigner).approve(psm.address, stableTokenAmount);
  const vaiBalanceBefore = await VAI.balanceOf(tokenHolder);
  const tx = await psm.connect(tokenSigner).swapStableForVAI(tokenHolder, stableTokenAmount);
  const vaiBalanceAfter = await VAI.balanceOf(tokenHolder);
  const vaiBalance = vaiBalanceAfter.sub(vaiBalanceBefore);
  expect(vaiBalance).to.equal(vaiToMint);
  await expect(tx).to.emit(psm, "StableForVAISwapped").withArgs(stableTokenAmount, vaiToMint, fee);
}

export async function swapVAIForStableAndValidate(
  psm: Contract,
  stableTokenPrice: BigNumber,
  VAI: Contract,
  vaiSigner: Signer,
  feeOut: BigNumber,
  stableToken: Contract,
  tokenDecimals: number,
  oneDollar: BigNumber,
) {
  const tokenAmount = parseUnits("100", tokenDecimals); // token amount to receive
  // calculate price of stableToken in USD, applying MAX(1$, oracle_price) thus making stableToken minimum price to 1$
  const feeOutTokenPrice = stableTokenPrice.gt(oneDollar) ? stableTokenPrice : oneDollar;
  const tokenAmountUsd: BigNumber = tokenAmount.mul(feeOutTokenPrice).div(MANTISSA_ONE); // vai to burn
  const fee = tokenAmountUsd.mul(feeOut).div(BASIS_POINT_DIVISOR);
  await VAI.connect(vaiSigner).approve(psm.address, tokenAmountUsd.add(fee));
  const vaiSignerAddress = await vaiSigner.getAddress();
  const tokenBalanceBefore = await stableToken.balanceOf(vaiSignerAddress);
  const tx = await psm.connect(vaiSigner).swapVAIForStable(await vaiSigner.getAddress(), tokenAmount);
  const tokenBalanceAfter = await stableToken.balanceOf(vaiSignerAddress);
  const tokenBalance = tokenBalanceAfter.sub(tokenBalanceBefore);
  expect(tokenBalance).to.equal(tokenAmount);
  await expect(tx).to.emit(psm, "VAIForStableSwapped").withArgs(tokenAmountUsd, tokenAmount, fee);
}
