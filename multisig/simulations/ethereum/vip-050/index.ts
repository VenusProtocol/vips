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
  SUPPLY_CAP,
  USDT_PRIME_CONVERTER,
  VTOKEN_RECEIVER,
  ezETH,
  vezETH,
  vip050,
} from "../../../proposals/ethereum/vip-050";
import ERC20_ABI from "./abi/ERC20.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import PRIME_CONVERTER_ABI from "./abi/PrimeConverter.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { ethereum } = NETWORK_ADDRESSES;
const LIQUID_STAKED_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
const PROTOCOL_SHARE_RESERVE = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
const USDT_USER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const ezETH_USER = "0xC8140dA31E6bCa19b287cC35531c2212763C2059";

forking(20390350, async () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vezETHContract: Contract;
  let comptroller: Contract;
  let usdt: Contract;
  let usdtPrimeConverter: Contract;
  let ezETHContract: Contract;

  before(async () => {
    await impersonateAccount(USDT_USER);
    await impersonateAccount(ezETH_USER);
    await impersonateAccount(ethereum.GUARDIAN);
    await setBalance(USDT_USER, parseUnits("1000", 18));
    await setBalance(ezETH_USER, parseUnits("1000", 18));

    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, ethereum.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, ethereum.POOL_REGISTRY);
    vezETHContract = await ethers.getContractAt(VTOKEN_ABI, vezETH);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LIQUID_STAKED_COMPTROLLER);
    usdt = await ethers.getContractAt(ERC20_ABI, BaseAssets[0], await ethers.provider.getSigner(USDT_USER));
    usdtPrimeConverter = await ethers.getContractAt(PRIME_CONVERTER_ABI, USDT_PRIME_CONVERTER);
    ezETHContract = await ethers.getContractAt(ERC20_ABI, ezETH, await ethers.provider.getSigner(ezETH_USER));
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(ezETH)).to.be.reverted;
    });
    it("should have 6 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(6);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip050());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(ezETH)).to.be.closeTo(parseUnits("3286", 18), parseUnits("1", 18));
      expect(await resilientOracle.getUnderlyingPrice(vezETH)).to.be.closeTo(
        parseUnits("3286", 18),
        parseUnits("1", 18),
      );
    });

    it("should have 7 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(7);
    });

    it("should add vezETH to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, ezETH);
      expect(registeredVToken).to.equal(vezETH);
    });

    it("check ownership", async () => {
      expect(await vezETHContract.owner()).to.equal(ethereum.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("1.41", 8);
      expect(await vezETHContract.balanceOf(VTOKEN_RECEIVER)).to.equal(expectedSupply);
    });
    it("check borrow and supply caps", async () => {
      expect(await comptroller.borrowCaps(vezETH)).equals(BORROW_CAP);
      expect(await comptroller.supplyCaps(vezETH)).equals(SUPPLY_CAP);
    });
    it("should set vezETH collateral factor to 80% and Liquidation threshold to 85%", async () => {
      const market = await comptroller.markets(vezETH);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.80", 18));
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.85", 18));
    });

    it("check protocol share reserve", async () => {
      expect(await vezETHContract.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
    });
    it("check reserve factor", async () => {
      expect(await vezETHContract.reserveFactorMantissa()).equals(parseUnits("0.2", 18));
    });
    it("check protocol seize share", async () => {
      expect(await vezETHContract.protocolSeizeShareMantissa()).equals(parseUnits("0.01", 18));
    });

    it("check vToken", async () => {
      checkVToken(vezETH, {
        name: "Venus ezETH (Liquid Staked ETH)",
        symbol: "vezETH_LiquidStakedETH",
        decimals: 8,
        underlying: ezETH,
        exchangeRate: parseUnits("1", 28),
        comptroller: LIQUID_STAKED_COMPTROLLER,
      });
    });
    it("check IR", async () => {
      const IR = await vezETHContract.interestRateModel();
      checkInterestRate(
        IR,
        "vezETHContract_Core",
        { base: "0", multiplier: "0.09", jump: "0.75", kink: "0.45" },
        BigNumber.from(2628000),
      );
    });
    it("check Pool", async () => {
      checkIsolatedPoolsComptrollers();
    });

    it("ezETH conversion", async () => {
      const usdtAmount = parseUnits("10", 6);
      await usdt.transfer(ethereum.GUARDIAN, usdtAmount);
      await usdt.connect(await ethers.getSigner(ethereum.GUARDIAN)).approve(usdtPrimeConverter.address, usdtAmount);

      const ezETHAmount = parseUnits("0.001", 18);
      await ezETHContract.transfer(usdtPrimeConverter.address, ezETHAmount);

      const usdtBalanceBefore = await usdt.balanceOf(ethereum.GUARDIAN);
      const ezETHBalanceBefore = await ezETHContract.balanceOf(ethereum.GUARDIAN);

      await usdtPrimeConverter
        .connect(await ethers.getSigner(ethereum.GUARDIAN))
        .convertForExactTokens(usdtAmount, ezETHAmount, usdt.address, ezETHContract.address, ethereum.GUARDIAN);

      const usdtBalanceAfter = await usdt.balanceOf(ethereum.GUARDIAN);
      const ezETHBalanceAfter = await ezETHContract.balanceOf(ethereum.GUARDIAN);

      expect(usdtBalanceBefore.sub(usdtBalanceAfter)).to.be.equal(parseUnits("3.287820", 6));
      expect(ezETHBalanceAfter.sub(ezETHBalanceBefore)).to.be.equal(ezETHAmount);
    });
  });
});
