import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip068, {
  eBTC,
  veBTC,
  CORE_COMPTROLLER,
  USDT_PRIME_CONVERTER,
  BaseAssets,
  BORROW_CAP, SUPPLY_CAP
} from "../../../proposals/ethereum/vip-068";
import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import PRIME_CONVERTER_ABI from "./abi/PrimeConverter.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
const { ethereum } = NETWORK_ADDRESSES;
const PROTOCOL_SHARE_RESERVE = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
const USDT_USER = "0x02EB950C215D12d723b44a18CfF098C6E166C531";

forking(21079955, async () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let veBTCContract: Contract;
  let comptroller: Contract;
  let eBTCContract: Contract;
  let usdtPrimeConverter: Contract;
  let usdt: Contract;

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await impersonateAccount(ethereum.NORMAL_TIMELOCK);
      await setBalance(ethereum.NORMAL_TIMELOCK, parseUnits("1000", 18));
      await impersonateAccount(USDT_USER);
      await setBalance(USDT_USER, parseUnits("1000", 18));
      await impersonateAccount(USDT_PRIME_CONVERTER);
      await setBalance(USDT_PRIME_CONVERTER, parseUnits("1000", 18));

      resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, ethereum.RESILIENT_ORACLE);
      poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, ethereum.POOL_REGISTRY);
      veBTCContract = await ethers.getContractAt(VTOKEN_ABI, veBTC);
      comptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_COMPTROLLER);
      eBTCContract = await ethers.getContractAt(ERC20_ABI, eBTC, await ethers.getSigner(ethereum.NORMAL_TIMELOCK));
      usdtPrimeConverter = await ethers.getContractAt(PRIME_CONVERTER_ABI, USDT_PRIME_CONVERTER);
      usdt = await ethers.getContractAt(ERC20_ABI, BaseAssets[0], await ethers.provider.getSigner(USDT_USER));

      await pretendExecutingVip(await vip068());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(eBTC)).to.be.equal(parseUnits("71835.7052865100", 28));
      expect(await resilientOracle.getUnderlyingPrice(veBTC)).to.be.equal(parseUnits("71835.7052865100", 28));
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

    // it("check Pool", async () => {
    //   await eBTCContract.faucet(parseUnits("100", 18));
    //   await checkIsolatedPoolsComptrollers({
    //     [CORE_COMPTROLLER]: ethereum.NORMAL_TIMELOCK,
    //   });
    // });

    // it("eBTC conversion", async () => {
    //   const usdtAmount = parseUnits("10", 6);
    //   await usdt.connect(await ethers.getSigner(ethereum.NORMAL_TIMELOCK)).faucet(usdtAmount);
    //   await usdt
    //     .connect(await ethers.getSigner(ethereum.NORMAL_TIMELOCK))
    //     .approve(usdtPrimeConverter.address, usdtAmount);

    //   const eBTCAmount = parseUnits("2", 18);
    //   await eBTCContract.connect(await ethers.getSigner(usdtPrimeConverter.address)).faucet(eBTCAmount);

    //   const usdtBalanceBefore = await usdt.balanceOf(ethereum.NORMAL_TIMELOCK);
    //   const eBTCBalanceBefore = await eBTCContract.balanceOf(ethereum.NORMAL_TIMELOCK);

    //   await usdtPrimeConverter
    //     .connect(await ethers.getSigner(ethereum.NORMAL_TIMELOCK))
    //     .convertForExactTokens(usdtAmount, eBTCAmount, usdt.address, eBTCContract.address, ethereum.NORMAL_TIMELOCK);

    //   const usdtBalanceAfter = await usdt.balanceOf(ethereum.NORMAL_TIMELOCK);
    //   const eBTCBalanceAfter = await eBTCContract.balanceOf(ethereum.NORMAL_TIMELOCK);

    //   expect(usdtBalanceBefore.sub(usdtBalanceAfter)).to.be.equal(parseUnits("6.999301", 6));
    //   expect(eBTCBalanceAfter.sub(eBTCBalanceBefore)).to.be.equal(eBTCAmount);
    // });
  });
});