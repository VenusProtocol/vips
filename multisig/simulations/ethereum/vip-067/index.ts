import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip067, {
  EIGEN,
  vEIGEN,
  CORE_COMPTROLLER,
  USDT_PRIME_CONVERTER,
  BaseAssets,
  BORROW_CAP, SUPPLY_CAP
} from "../../../proposals/ethereum/vip-067";
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
  let vEIGENContract: Contract;
  let comptroller: Contract;
  let eigenContract: Contract;
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
      vEIGENContract = await ethers.getContractAt(VTOKEN_ABI, vEIGEN);
      comptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_COMPTROLLER);
      eigenContract = await ethers.getContractAt(ERC20_ABI, EIGEN, await ethers.getSigner(ethereum.NORMAL_TIMELOCK));
      usdtPrimeConverter = await ethers.getContractAt(PRIME_CONVERTER_ABI, USDT_PRIME_CONVERTER);
      usdt = await ethers.getContractAt(ERC20_ABI, BaseAssets[0], await ethers.provider.getSigner(USDT_USER));
      
      await pretendExecutingVip(await vip067());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(EIGEN)).to.be.equal(parseUnits("3.0196419", 18));
      expect(await resilientOracle.getUnderlyingPrice(vEIGEN)).to.be.equal(parseUnits("3.0196419", 18));
    });

    it("should have 12 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(12);
    });

    it("should add vEIGEN to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(comptroller.address, EIGEN);
      expect(registeredVToken).to.equal(vEIGEN);
    });

    it("check ownership", async () => {
      expect(await vEIGENContract.owner()).to.equal(ethereum.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("0", 18);
      expect(await vEIGENContract.balanceOf(ethereum.VTREASURY)).to.equal(expectedSupply);
    });

    it("check borrow and supply caps", async () => {
      expect(await comptroller.borrowCaps(vEIGEN)).equals(BORROW_CAP);
      expect(await comptroller.supplyCaps(vEIGEN)).equals(SUPPLY_CAP);
    });

    it("should set vEIGEN collateral factor to 50% and Liquidation threshold to 60%", async () => {
      const market = await comptroller.markets(vEIGEN);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.5", 18));
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.6", 18));
    });

    it("check protocol share reserve", async () => {
      expect(await vEIGENContract.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
    });

    it("check reserve factor", async () => {
      expect(await vEIGENContract.reserveFactorMantissa()).equals(parseUnits("0.25", 18));
    });

    it("check protocol seize share", async () => {
      expect(await vEIGENContract.protocolSeizeShareMantissa()).equals(parseUnits("0.01", 18));
    });

    it("check vToken", async () => {
      checkVToken(vEIGEN, {
        name: "Venus EIGEN",
        symbol: "vEIGEN",
        decimals: 8,
        underlying: EIGEN,
        exchangeRate: parseUnits("10000000000", 18),
        comptroller: CORE_COMPTROLLER,
      });
    });

    it("check IR", async () => {
      const IR = await vEIGENContract.interestRateModel();
      checkInterestRate(
        IR,
        "vEIGENContract_Core",
        { base: "0.02", multiplier: "0.15", jump: "3", kink: "0.45" },
        BigNumber.from(2252571),
      );
    });

    it("check Pool", async () => {
      await eigenContract.faucet(parseUnits("100", 18));
      await checkIsolatedPoolsComptrollers({
        [CORE_COMPTROLLER]: ethereum.NORMAL_TIMELOCK,
      });
    });

    it("EIGEN conversion", async () => {
      const usdtAmount = parseUnits("10", 6);
      await usdt.connect(await ethers.getSigner(ethereum.NORMAL_TIMELOCK)).faucet(usdtAmount);
      await usdt
        .connect(await ethers.getSigner(ethereum.NORMAL_TIMELOCK))
        .approve(usdtPrimeConverter.address, usdtAmount);

      const eigenAmount = parseUnits("2", 18);
      await eigenContract.connect(await ethers.getSigner(usdtPrimeConverter.address)).faucet(eigenAmount);

      const usdtBalanceBefore = await usdt.balanceOf(ethereum.NORMAL_TIMELOCK);
      const eigenBalanceBefore = await eigenContract.balanceOf(ethereum.NORMAL_TIMELOCK);

      await usdtPrimeConverter
        .connect(await ethers.getSigner(ethereum.NORMAL_TIMELOCK))
        .convertForExactTokens(usdtAmount, eigenAmount, usdt.address, eigenContract.address, ethereum.NORMAL_TIMELOCK);

      const usdtBalanceAfter = await usdt.balanceOf(ethereum.NORMAL_TIMELOCK);
      const eigenBalanceAfter = await eigenContract.balanceOf(ethereum.NORMAL_TIMELOCK);

      expect(usdtBalanceBefore.sub(usdtBalanceAfter)).to.be.equal(parseUnits("6.999301", 6));
      expect(eigenBalanceAfter.sub(eigenBalanceBefore)).to.be.equal(eigenAmount);
    });
  });
});
