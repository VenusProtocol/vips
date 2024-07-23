import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import {  ezETH, vip043, vezETH, SUPPLY_CAP, BORROW_CAP } from "../../../proposals/sepolia/vip-043";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";
import ERC20_ABI from "./abi/erc20.json";
import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";

const { sepolia } = NETWORK_ADDRESSES;
const LIQUID_STAKED_COMPTROLLER = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
const PROTOCOL_SHARE_RESERVE = "0xbea70755cc3555708ca11219adB0db4C80F6721B";

forking(6361533, async () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vezETHContract: Contract;
  let comptroller: Contract;
  let ezETHContract: Contract;

  before(async () => {
    await impersonateAccount(sepolia.NORMAL_TIMELOCK);
    await setBalance(sepolia.NORMAL_TIMELOCK, parseUnits("1000", 18));

    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, sepolia.POOL_REGISTRY);
    vezETHContract = await ethers.getContractAt(VTOKEN_ABI, vezETH);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LIQUID_STAKED_COMPTROLLER);
    ezETHContract = await ethers.getContractAt(ERC20_ABI, ezETH, await ethers.getSigner(sepolia.NORMAL_TIMELOCK));
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
      await pretendExecutingVip(await vip043());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(ezETH)).to.be.closeTo(parseUnits("3527", 18), parseUnits("1", 18));
      expect(await resilientOracle.getUnderlyingPrice(vezETH)).to.be.closeTo(
        parseUnits("3527", 18),
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
      expect(await vezETHContract.owner()).to.equal(sepolia.GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("2", 8);
      expect(await vezETHContract.balanceOf(sepolia.VTREASURY)).to.equal(expectedSupply);
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
      expect(await vezETHContract.protocolSeizeShareMantissa()).equals(parseUnits("0.05", 18));
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
      await ezETHContract.faucet(parseUnits("100", 18));
      await checkIsolatedPoolsComptrollers({
        [LIQUID_STAKED_COMPTROLLER]: sepolia.NORMAL_TIMELOCK,
      });
    });
  });
});
