import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip391, {
  BORROW_CAP,
  BaseAssets,
  CORE_COMPTROLLER,
  SUPPLY_CAP,
  USDT_PRIME_CONVERTER,
  eBTC,
  veBTC,
} from "../../vips/vip-391/bscmainnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import PRIME_CONVERTER_ABI from "./abi/PrimeConverter.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";
import { setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;
const PROTOCOL_SHARE_RESERVE = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
const USDT_USER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const eBTC_USER = "0x7aCDF2012aAC69D70B86677FE91eb66e08961880";

forking(21130278, async () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let veBTCContract: Contract;
  let comptroller: Contract;
  let eBTCContract: Contract;
  let usdtPrimeConverter: Contract;
  let usdt: Contract;
  let wbtc: Contract;

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
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, ethereum.POOL_REGISTRY);
    veBTCContract = await ethers.getContractAt(VTOKEN_ABI, veBTC);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_COMPTROLLER);
    eBTCContract = await ethers.getContractAt(ERC20_ABI, eBTC, await ethers.getSigner(ethereum.NORMAL_TIMELOCK));
    usdtPrimeConverter = await ethers.getContractAt(PRIME_CONVERTER_ABI, USDT_PRIME_CONVERTER);
    usdt = await ethers.getContractAt(ERC20_ABI, BaseAssets[0], await ethers.provider.getSigner(USDT_USER));
    wbtc = await ethers.getContractAt(ERC20_ABI, "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", await ethers.getSigner(ethereum.NORMAL_TIMELOCK));

    await setMaxStalePeriod(resilientOracle, wbtc, 10000000000);
  });

  testForkedNetworkVipCommands("vip391", await vip391());

  describe("Post-VIP behavior", async () => {
    it("check price", async () => {
      expect(await resilientOracle.getPrice(eBTC)).to.be.equal(parseUnits("74599", 28));
      expect(await resilientOracle.getUnderlyingPrice(veBTC)).to.be.equal(parseUnits("74599", 28));
    });

    it("should have 10 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(10);
    });

    it("should add veBTC to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, eBTC);
      expect(registeredVToken).to.equal(veBTC);
    });

    it("check ownership", async () => {
      expect(await veBTCContract.owner()).to.equal(ethereum.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("0.14471345", 8);
      expect(await veBTCContract.balanceOf(ethereum.VTREASURY)).to.equal(expectedSupply);
    });

    it("check borrow and supply caps", async () => {
      expect(await comptroller.borrowCaps(veBTC)).equals(BORROW_CAP);
      expect(await comptroller.supplyCaps(veBTC)).equals(SUPPLY_CAP);
    });

    it("should set veBTC collateral factor to 68% and Liquidation threshold to 72%", async () => {
      const market = await comptroller.markets(veBTC);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.68", 18));
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.72", 18));
    });

    it("check protocol share reserve", async () => {
      expect(await veBTCContract.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
    });

    it("check reserve factor", async () => {
      expect(await veBTCContract.reserveFactorMantissa()).equals(parseUnits("0.2", 18));
    });

    it("check protocol seize share", async () => {
      expect(await veBTCContract.protocolSeizeShareMantissa()).equals(parseUnits("0.01", 18));
    });

    it("check vToken", async () => {
      checkVToken(veBTC, {
        name: "Venus eBTC",
        symbol: "veBTC",
        decimals: 8,
        underlying: eBTC,
        exchangeRate: parseUnits("10000000000", 8),
        comptroller: CORE_COMPTROLLER,
      });
    });

    it("check IR", async () => {
      const IR = await veBTCContract.interestRateModel();
      checkInterestRate(
        IR,
        "veBTCContract_Core",
        { base: "0", multiplier: "0.09", jump: "2", kink: "0.45" },
        BigNumber.from(2628000),
      );
    });

    it("check Pool", async () => {
      await checkIsolatedPoolsComptrollers();
    });

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

      expect(usdtBalanceBefore.sub(usdtBalanceAfter)).to.be.equal(parseUnits("7186.148530", 6));
      expect(eigenBalanceAfter.sub(eigenBalanceBefore)).to.be.equal(eBTCAmount);
    });
  });
});
