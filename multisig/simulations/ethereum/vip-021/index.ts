import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { initMainnetUser } from "../../../../src/utils";
import { checkIsolatedPoolsComptrollers } from "../../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "../../../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip021 from "../../../proposals/ethereum/vip-021";
import { BORROW_CAP, INITIAL_SUPPLY, SUPPLY_CAP, TUSD, vTUSD } from "../../../proposals/ethereum/vip-021";
import COMPTROLLER_ABI from "./abi/ComptrollerAbi.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistryAbi.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracleAbi.json";
import VTOKEN_ABI from "./abi/VTokenAbi.json";
import ERC20_ABI from "./abi/erc20Abi.json";

const { ethereum } = NETWORK_ADDRESSES;
const COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";

forking(19708766, () => {
  let resilientOracle: Contract;
  let poolRegistry: Contract;
  let vtusd: Contract;
  let tusd: Contract;

  let comptroller: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, ethereum.RESILIENT_ORACLE);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, ethereum.POOL_REGISTRY);
    vtusd = await ethers.getContractAt(VTOKEN_ABI, vTUSD);
    tusd = await ethers.getContractAt(ERC20_ABI, TUSD);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(vTUSD)).to.be.reverted;
    });
    it("should have 5 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(5);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      // This trasaction will be removed once Vtreasury on ethereum has enough funds
      const impersonatedTUSDHolder = await initMainnetUser(
        "0x9FCc67D7DB763787BB1c7f3bC7f34d3C548c19Fe",
        parseUnits("1", 18),
      );
      await tusd.connect(impersonatedTUSDHolder).transfer(ethereum.VTREASURY, INITIAL_SUPPLY);
      await pretendExecutingVip(vip021());
    });
    it("check price", async () => {
      expect(await resilientOracle.getPrice(TUSD)).to.equals("1000178060000000000");
    });
    it("should have 6 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(6);
    });
    it("should add vTUSD to the pool", async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(COMPTROLLER, TUSD);
      expect(registeredVToken).to.equal(vTUSD);
    });
    it("check ownership", async () => {
      expect(await vtusd.owner()).to.equal(ethereum.GUARDIAN);
    });
    it("check supply of Vtreasury", async () => {
      expect(await vtusd.balanceOf(ethereum.VTREASURY)).to.equal(parseUnits("1000000", 8));
    });
    it("should return supply and borrow caps", async () => {
      expect(await comptroller.borrowCaps(vTUSD)).equals(BORROW_CAP);
      expect(await comptroller.supplyCaps(vTUSD)).equals(SUPPLY_CAP);
    });
    it("should set vTUSD collateral factor to 75% and Liquidation threshold to 77%", async () => {
      const market = await comptroller.markets(vTUSD);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.75", 18));
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.77", 18));
    });

    it("check vToken", async () => {
      await checkVToken(vTUSD, {
        name: "Venus TUSD (Core)",
        symbol: "vTUSD_Core",
        decimals: 8,
        underlying: TUSD,
        exchangeRate: parseUnits("1", 28),
        comptroller: COMPTROLLER,
      });
    });
    it("check IR", async () => {
      const IR = await vtusd.interestRateModel();
      checkInterestRate(
        IR,
        "vTUSD_Core",
        { base: "0", multiplier: "0.15", jump: "2.5", kink: "0.8" },
        BigNumber.from(2628000),
      );
    });
    it("check Pool", async () => {
      checkIsolatedPoolsComptrollers({ comptroller: COMPTROLLER });
    });
  });
});
