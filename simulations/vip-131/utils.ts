import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";


const BASIS_POINT_DIVISOR = BigNumber.from(10000);
const MANTISSA_ONE = parseUnits("1", 18);


export async function swapStableForVAIAndValidate(
	psm: ethers.Contract,
	stableToken: ethers.Contract,
	stableTokenPrice: BigNumber,
	tokenSigner: Signer,
	tokenHolder: string,
	VAI: ethers.Contract,
	feeIn: BigNumber
  ) {
	const stableTokenAmount = parseUnits("1000", 18);
	// calculate price of stableToken in USD, applying MIN(1$, oracle_price) thus capping stableToken maximum price to 1$
	const feeInTokenPrice = stableTokenPrice.gt(MANTISSA_ONE) ? MANTISSA_ONE : stableTokenPrice;
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
	psm: ethers.Contract,
	stableTokenName: string,
	stableTokenPrice: BigNumber,
	VAI: ethers.Contract,
	vaiSigner: Signer,
	feeIn: BigNumber,
	stableToken: ethers.Contract,
  ) {
	const tokenAmount = parseUnits("100", 18); // token amount to receive
	// calculate price of stableToken in USD, applying MAX(1$, oracle_price) thus making stableToken minimum price to 1$
	const feeOutTokenPrice = stableTokenPrice.gt(MANTISSA_ONE) ? stableTokenPrice : MANTISSA_ONE;
	const tokenAmountUsd: BigNumber = tokenAmount.mul(feeOutTokenPrice).div(MANTISSA_ONE); // vai to burn
	const fee = tokenAmountUsd.mul(feeIn).div(BASIS_POINT_DIVISOR);
	formatConsoleLog(`${stableTokenName} Price: ` + stableTokenPrice.toString());
	await VAI.connect(vaiSigner).approve(psm.address, tokenAmountUsd);
	const vaiSignerAddress = await vaiSigner.getAddress();
	const tokenBalanceBefore = await stableToken.balanceOf(vaiSignerAddress);
	const tx = await psm.connect(vaiSigner).swapVAIForStable(await vaiSigner.getAddress(), tokenAmount);
	const tokenBalanceAfter = await stableToken.balanceOf(vaiSignerAddress);
	const tokenBalance = tokenBalanceAfter.sub(tokenBalanceBefore);
	expect(tokenBalance).to.equal(tokenAmount);
	await expect(tx).to.emit(psm, "VAIForStableSwapped").withArgs(tokenAmountUsd, tokenAmount, fee);
  }

// ****************************
// ***** Helper Functions *****
// ****************************

function formatConsoleLog(message: string) {
	const indentation = " ".repeat(10); // Adjust the number of spaces for indentation
	// Format the message using ANSI escape codes
	const formattedMessage = `\x1b[90m${message}\x1b[0m`; // Set gray color (90) and reset color (0)
	console.log(`${indentation}${formattedMessage}`);
}
  