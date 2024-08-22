import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import {
  BORROW_CAP,
  BaseAssets,
  LIQUID_STAKED_COMPTROLLER,
  SUPPLY_CAP,
  USDT_PRIME_CONVERTER,
  VTOKEN_RECEIVER,
  vip055,
  vweETHs,
  weETHs,
} from "../../../proposals/ethereum/vip-055";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import PRIME_CONVERTER_ABI from "./abi/PrimeConverter.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { ethereum } = NETWORK_ADDRESSES;
const PROTOCOL_SHARE_RESERVE = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
const USDT_USER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const weETHs_USER = "0x9e8f10574ACc2c62C6e5d19500CEd39163Da37A9";

forking(20583543, async () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vweETHsContract: Contract;
  let comptroller: Contract;
  let usdt: Contract;
  let usdtPrimeConverter: Contract;
  let weETHsContract: Contract;

  before(async () => {
    await impersonateAccount(USDT_USER);
    await impersonateAccount(weETHs_USER);
    await impersonateAccount(ethereum.GUARDIAN);
    await setBalance(USDT_USER, parseUnits("1000", 18));
    await setBalance(weETHs_USER, parseUnits("1000", 18));

    await impersonateAccount(ethereum.NORMAL_TIMELOCK);
    await setBalance(ethereum.NORMAL_TIMELOCK, parseUnits("1000", 18));

    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, ethereum.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, ethereum.POOL_REGISTRY);
    vweETHsContract = await ethers.getContractAt(VTOKEN_ABI, vweETHs);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LIQUID_STAKED_COMPTROLLER);
    usdt = await ethers.getContractAt(ERC20_ABI, BaseAssets[0], await ethers.provider.getSigner(USDT_USER));
    usdtPrimeConverter = await ethers.getContractAt(PRIME_CONVERTER_ABI, USDT_PRIME_CONVERTER);
    weETHsContract = await ethers.getContractAt(ERC20_ABI, weETHs, await ethers.provider.getSigner(weETHs_USER));
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(weETHs)).to.be.reverted;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip055());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(weETHs)).to.be.closeTo(parseUnits("2638", 18), parseUnits("1", 18));
      expect(await resilientOracle.getUnderlyingPrice(vweETHs)).to.be.closeTo(
        parseUnits("2638", 18),
        parseUnits("1", 18),
      );
    });

    it("should have 8 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(8);
    });

    it("should add vweETHs to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, weETHs);
      expect(registeredVToken).to.equal(vweETHs);
    });

    it("check ownership", async () => {
      expect(await vweETHsContract.owner()).to.equal(ethereum.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("10.00920147", 8);
      expect(await vweETHsContract.balanceOf(VTOKEN_RECEIVER)).to.equal(expectedSupply);
    });

    it("check borrow and supply caps", async () => {
      expect(await comptroller.borrowCaps(vweETHs)).equals(BORROW_CAP);
      expect(await comptroller.supplyCaps(vweETHs)).equals(SUPPLY_CAP);
    });

    it("should set vweETHs collateral factor to 80% and Liquidation threshold to 85%", async () => {
      const market = await comptroller.markets(vweETHs);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.80", 18));
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.85", 18));
    });

    it("check protocol share reserve", async () => {
      expect(await vweETHsContract.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
    });

    it("check reserve factor", async () => {
      expect(await vweETHsContract.reserveFactorMantissa()).equals(parseUnits("0.25", 18));
    });

    it("check protocol seize share", async () => {
      expect(await vweETHsContract.protocolSeizeShareMantissa()).equals(parseUnits("0.01", 18));
    });

    it("check vToken", async () => {
      checkVToken(vweETHs, {
        name: "Venus weETHs (Liquid Staked ETH)",
        symbol: "vweETHs_LiquidStakedETH",
        decimals: 8,
        underlying: weETHs,
        exchangeRate: parseUnits("1.0000000000951316136311121730", 28),
        comptroller: LIQUID_STAKED_COMPTROLLER,
      });
    });

    it("check IR", async () => {
      const IR = await vweETHsContract.interestRateModel();
      checkInterestRate(
        IR,
        "vweETHsContract_Core",
        { base: "0", multiplier: "0.09", jump: "0.75", kink: "0.45" },
        BigNumber.from(2628000),
      );
    });

    it("check Pool", async () => {
      await checkIsolatedPoolsComptrollers();
    });

    it("borrow paused", async () => {
      expect(await comptroller.actionPaused(vweETHs, 2)).to.be.true;
    });

    it("weETHs conversion", async () => {
      const usdtAmount = parseUnits("10", 6);
      await usdt.transfer(ethereum.GUARDIAN, usdtAmount);
      await usdt.connect(await ethers.getSigner(ethereum.GUARDIAN)).approve(usdtPrimeConverter.address, usdtAmount);

      const weETHsAmount = parseUnits("0.001", 18);
      await weETHsContract.transfer(usdtPrimeConverter.address, weETHsAmount);

      const usdtBalanceBefore = await usdt.balanceOf(ethereum.GUARDIAN);
      const weETHsBalanceBefore = await weETHsContract.balanceOf(ethereum.GUARDIAN);

      await usdtPrimeConverter
        .connect(await ethers.getSigner(ethereum.GUARDIAN))
        .convertForExactTokens(usdtAmount, weETHsAmount, usdt.address, weETHsContract.address, ethereum.GUARDIAN);

      const usdtBalanceAfter = await usdt.balanceOf(ethereum.GUARDIAN);
      const weETHsBalanceAfter = await weETHsContract.balanceOf(ethereum.GUARDIAN);

      expect(usdtBalanceBefore.sub(usdtBalanceAfter)).to.be.equal(parseUnits("2.638021", 6));
      expect(weETHsBalanceAfter.sub(weETHsBalanceBefore)).to.be.equal(weETHsAmount);
    });
  });
});
