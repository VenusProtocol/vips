import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriod } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip401, {
  USDT_PRIME_CONVERTER,
  eBTC,
} from "../../vips/vip-401/bscmainnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import ERC20_ABI from "./abi/erc20.json";

const { ethereum } = NETWORK_ADDRESSES;
const USDT_USER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const eBTC_USER = "0x7aCDF2012aAC69D70B86677FE91eb66e08961880";
const ONE_YEAR = 365 * 24 * 3600;

forking(21130278, async () => {
  let resilientOracle: Contract;
  let veBTCContract: Contract;
  let eBTCContract: Contract;
  let usdtPrimeConverter: Contract;
  let usdt: Contract;
  let wbtc: Contract;
/*
  before(async () => {
    await impersonateAccount(ethereum.NORMAL_TIMELOCK);
    await setBalance(ethereum.NORMAL_TIMELOCK, parseUnits("1000", 18));
    await impersonateAccount(USDT_USER);
    await setBalance(USDT_USER, parseUnits("1000", 18));
    await impersonateAccount(eBTC_USER);
    await setBalance(eBTC_USER, parseUnits("1000", 18));
    await impersonateAccount(USDT_PRIME_CONVERTER);
    await setBalance(USDT_PRIME_CONVERTER, parseUnits("1000", 18));

    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, ethereum.RESILIENT_ORACLE);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_COMPTROLLER);
    eBTCContract = await ethers.getContractAt(ERC20_ABI, eBTC, await ethers.getSigner(ethereum.NORMAL_TIMELOCK));
    usdtPrimeConverter = await ethers.getContractAt(PRIME_CONVERTER_ABI, USDT_PRIME_CONVERTER);
    usdt = await ethers.getContractAt(ERC20_ABI, BaseAssets[0], await ethers.provider.getSigner(USDT_USER));
    wbtc = await ethers.getContractAt(
      ERC20_ABI,
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      await ethers.getSigner(ethereum.NORMAL_TIMELOCK),
    );

    await setMaxStalePeriod(resilientOracle, wbtc, ONE_YEAR);
    await setMaxStalePeriod(resilientOracle, usdt, ONE_YEAR);
  });
*/
  testForkedNetworkVipCommands("vip401", await vip401());
/*
  describe("Post-VIP behavior", async () => {
    it("eBTC conversion", async () => {
      const usdtAmount = parseUnits("10000", 6);
      await usdt.connect(await ethers.getSigner(USDT_USER)).approve(usdtPrimeConverter.address, usdtAmount);

      const eBTCAmount = parseUnits("0.1", 8);
      await eBTCContract.connect(await ethers.getSigner(eBTC_USER)).transfer(usdtPrimeConverter.address, eBTCAmount);

      const usdtBalanceBefore = await usdt.balanceOf(USDT_USER);
      const eigenBalanceBefore = await eBTCContract.balanceOf(USDT_USER);

      await usdtPrimeConverter
        .connect(await ethers.getSigner(USDT_USER))
        .convertForExactTokens(usdtAmount, eBTCAmount, usdt.address, eBTCContract.address, USDT_USER);

      const usdtBalanceAfter = await usdt.balanceOf(USDT_USER);
      const eigenBalanceAfter = await eBTCContract.balanceOf(USDT_USER);

      expect(usdtBalanceBefore.sub(usdtBalanceAfter)).to.be.equal(parseUnits("7458.923455", 6));
      expect(eigenBalanceAfter.sub(eigenBalanceBefore)).to.be.equal(eBTCAmount);
    });
  });
  */
});
