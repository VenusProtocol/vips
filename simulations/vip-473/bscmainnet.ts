import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriodInBinanceOracle } from "src/utils";
import { checkCorePoolComptroller } from "src/vip-framework/checks/checkCorePoolComptroller";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
import { forking, testVip } from "src/vip-framework/index";

import vip473, { BURN_AMOUNT, PROTOCOL_SHARE_RESERVE, marketSpec } from "../../vips/vip-473/bscmainnet";
import COMPTROLLER_ABI from "./abi/LegacyPoolComptroller.json";
import VTOKEN_ABI from "./abi/LegacyPoolVToken.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const BLOCKS_PER_YEAR = BigNumber.from(10512000);

const { RESILIENT_ORACLE, ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, BINANCE_ORACLE } = NETWORK_ADDRESSES.bscmainnet;

forking(47809465, async () => {
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const vToken = new ethers.Contract(marketSpec.vToken.address, VTOKEN_ABI, ethers.provider);
  const comptroller = new ethers.Contract(marketSpec.vToken.comptroller, COMPTROLLER_ABI, ethers.provider);

  before(async () => {
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "lisUSD");
  });

  describe("Pre-VIP behavior", () => {
    it("has the correct price", async () => {
      expect(await resilientOracle.getPrice(marketSpec.vToken.underlying.address)).to.equal(
        parseUnits("0.99854774", 18),
      );
      expect(await resilientOracle.getUnderlyingPrice(marketSpec.vToken.address)).to.equal(
        parseUnits("0.99854774", 18),
      );
    });
    it("should have 35 markets in the core pool", async () => {
      const markets = await comptroller.getAllMarkets();
      expect(markets).to.have.lengthOf(35);
    });
  });

  testVip("lisUSD market VIP", await vip473(), {});

  describe("Post-VIP behavior", async () => {
    it("should have 36 markets in the core pool", async () => {
      const markets = await comptroller.getAllMarkets();
      expect(markets).to.have.lengthOf(36);
    });

    it("has correct owner", async () => {
      expect(await vToken.admin()).to.equal(NORMAL_TIMELOCK);
    });

    it("has correct ACM", async () => {
      expect(await vToken.accessControlManager()).to.equal(ACCESS_CONTROL_MANAGER);
    });

    it("has correct initial supply", async () => {
      const expectedSupply = parseUnits("1000000", 8).sub(BURN_AMOUNT);
      expect(await vToken.balanceOf(marketSpec.initialSupply.vTokenReceiver)).to.equal(expectedSupply);
      expect(await vToken.balanceOf(NORMAL_TIMELOCK)).to.equal(0);
    });

    it("has correct protocol share reserve", async () => {
      expect(await vToken.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
    });

    it("checks risk parameters", async () => {
      await checkRiskParameters(marketSpec.vToken.address, marketSpec.vToken, marketSpec.riskParameters);
    });

    it("checks vToken", async () => {
      await checkVToken(marketSpec.vToken.address, marketSpec.vToken);
    });

    it("checks interest rate", async () => {
      await checkInterestRate(
        marketSpec.interestRateModel.address,
        marketSpec.vToken.symbol,
        marketSpec.interestRateModel,
        BLOCKS_PER_YEAR,
      );
    });

    it("checks core pool comptroller", async () => {
      await checkCorePoolComptroller();
    });
  });
});
