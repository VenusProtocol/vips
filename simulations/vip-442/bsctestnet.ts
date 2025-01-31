import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
import { forking, testVip } from "src/vip-framework/index";

import vip442, {
  CONVERSION_INCENTIVE,
  PROTOCOL_SHARE_RESERVE,
  converterBaseAssets,
  marketSpec,
} from "../../vips/vip-442/bsctestnet";
import COMPTROLLER_ABI from "./abi/LegacyPoolComptroller.json";
import VTOKEN_ABI from "./abi/LegacyPoolVToken.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";

const BLOCKS_PER_YEAR = BigNumber.from(10512000);

const { RESILIENT_ORACLE, ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;

forking(47870864, async () => {
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const vToken = new ethers.Contract(marketSpec.vToken.address, VTOKEN_ABI, ethers.provider);
  const comptroller = new ethers.Contract(marketSpec.vToken.comptroller, COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(marketSpec.vToken.underlying.address)).to.be.reverted;
    });
    it("should have 27 markets in the core pool", async () => {
      const markets = await comptroller.getAllMarkets();
      expect(markets).to.have.lengthOf(27);
    });
  });

  testVip("SOL market VIP", await vip442(), {});

  describe("Post-VIP behavior", async () => {
    it("has the correct price", async () => {
      expect(await resilientOracle.getPrice(marketSpec.vToken.underlying.address)).to.equal(parseUnits("236.12", 18));
      expect(await resilientOracle.getUnderlyingPrice(marketSpec.vToken.address)).to.equal(parseUnits("236.12", 18));
    });
    it("should have 28 markets in the core pool", async () => {
      const markets = await comptroller.getAllMarkets();
      expect(markets).to.have.lengthOf(28);
    });

    it("has correct owner", async () => {
      expect(await vToken.admin()).to.equal(NORMAL_TIMELOCK);
    });

    it("has correct ACM", async () => {
      expect(await vToken.accessControlManager()).to.equal(ACCESS_CONTROL_MANAGER);
    });

    it("has correct initial supply", async () => {
      const expectedSupply = parseUnits("20", 8);
      expect(await vToken.balanceOf(marketSpec.initialSupply.vTokenReceiver)).to.equal(expectedSupply);
      expect(await vToken.totalSupply()).to.equal(expectedSupply);
      expect(await vToken.balanceOf(NORMAL_TIMELOCK)).to.equal(0);
    });

    it("has correct protocol share reserve", async () => {
      expect(await vToken.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
    });

    checkRiskParameters(marketSpec.vToken.address, marketSpec.vToken, marketSpec.riskParameters);
    checkVToken(marketSpec.vToken.address, marketSpec.vToken);
    checkInterestRate(
      marketSpec.interestRateModel.address,
      marketSpec.vToken.symbol,
      marketSpec.interestRateModel,
      BLOCKS_PER_YEAR,
    );

    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);
        const asset = marketSpec.vToken.underlying.address;
        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset ${asset}`, async () => {
          const result = await converterContract.conversionConfigurations(baseAsset, asset);
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });
      }
    });
  });
});
