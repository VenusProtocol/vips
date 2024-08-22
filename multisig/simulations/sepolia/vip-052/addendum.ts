import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import { BaseAssets, USDT_PRIME_CONVERTER, vip052, weETHs } from "../../../proposals/sepolia/vip-052/addendum";
import PRIME_CONVERTER_ABI from "./abi/PrimeConverter.json";
import ERC20_ABI from "./abi/erc20.json";

const { sepolia } = NETWORK_ADDRESSES;
const USDT_USER = "0x02EB950C215D12d723b44a18CfF098C6E166C531";
const weETHs_USER = "0xB3A201887396F57bad3fF50DFd02022fE1Fd1774";

forking(6549281, async () => {
  let weETHsContract: Contract;
  let usdtPrimeConverter: Contract;
  let usdt: Contract;

  before(async () => {
    await impersonateAccount(sepolia.NORMAL_TIMELOCK);
    await setBalance(sepolia.NORMAL_TIMELOCK, parseUnits("1000", 18));

    await impersonateAccount(USDT_USER);
    await impersonateAccount(weETHs_USER);
    await impersonateAccount(sepolia.GUARDIAN);
    await impersonateAccount(USDT_PRIME_CONVERTER);
    await setBalance(USDT_USER, parseUnits("1000", 18));
    await setBalance(weETHs_USER, parseUnits("1000", 18));
    await setBalance(USDT_PRIME_CONVERTER, parseUnits("1000", 18));

    weETHsContract = await ethers.getContractAt(ERC20_ABI, weETHs, await ethers.getSigner(sepolia.NORMAL_TIMELOCK));
    usdtPrimeConverter = await ethers.getContractAt(PRIME_CONVERTER_ABI, USDT_PRIME_CONVERTER);
    usdt = await ethers.getContractAt(ERC20_ABI, BaseAssets[0], await ethers.provider.getSigner(USDT_USER));
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip052());
    });

    it("weETHs conversion", async () => {
      const usdtAmount = parseUnits("10", 6);
      await usdt.connect(await ethers.getSigner(sepolia.GUARDIAN)).faucet(usdtAmount);
      await usdt.connect(await ethers.getSigner(sepolia.GUARDIAN)).approve(usdtPrimeConverter.address, usdtAmount);

      const weETHsAmount = parseUnits("0.001", 18);
      await weETHsContract.connect(await ethers.getSigner(usdtPrimeConverter.address)).faucet(weETHsAmount);

      const usdtBalanceBefore = await usdt.balanceOf(sepolia.GUARDIAN);
      const weETHsBalanceBefore = await weETHsContract.balanceOf(sepolia.GUARDIAN);

      await usdtPrimeConverter
        .connect(await ethers.getSigner(sepolia.GUARDIAN))
        .convertForExactTokens(usdtAmount, weETHsAmount, usdt.address, weETHsContract.address, sepolia.GUARDIAN);

      const usdtBalanceAfter = await usdt.balanceOf(sepolia.GUARDIAN);
      const weETHsBalanceAfter = await weETHsContract.balanceOf(sepolia.GUARDIAN);

      expect(usdtBalanceBefore.sub(usdtBalanceAfter)).to.be.equal(parseUnits("2.647829", 6));
      expect(weETHsBalanceAfter.sub(weETHsBalanceBefore)).to.be.equal(weETHsAmount);
    });
  });
});
