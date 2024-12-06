import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework/index";

import vip070 from "../../multisig/proposals/ethereum/vip-070";
import vip402, { CONVERSION_INCENTIVE, converterBaseAssets, marketSpec } from "../../vips/vip-402/bsctestnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { sepolia } = NETWORK_ADDRESSES;
const PROTOCOL_SHARE_RESERVE = "0xbea70755cc3555708ca11219adB0db4C80F6721B";
const BLOCKS_PER_YEAR = BigNumber.from(2628000);
const WBTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const WBTC_CHAINLINK_FEED = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43";

const { POOL_REGISTRY, RESILIENT_ORACLE, GUARDIAN, CHAINLINK_ORACLE, VTREASURY } = sepolia;

forking(7169000, async () => {
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, ethers.provider);
  const vToken = new ethers.Contract(marketSpec.vToken.address, VTOKEN_ABI, ethers.provider);
  const comptroller = new ethers.Contract(marketSpec.vToken.comptroller, COMPTROLLER_ABI, ethers.provider);

  before(async () => {
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, WBTC, WBTC_CHAINLINK_FEED, GUARDIAN);

    await pretendExecutingVip(await vip070());
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(marketSpec.vToken.underlying.address)).to.be.reverted;
    });

    it("should have 13 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(13);
    });
  });

  testForkedNetworkVipCommands("LBTC", await vip402());

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip402());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(marketSpec.vToken.underlying.address)).to.be.closeTo(
        parseUnits("104913.6", 28),
        parseUnits("1", 18),
      );
      expect(await resilientOracle.getUnderlyingPrice(marketSpec.vToken.address)).to.be.closeTo(
        parseUnits("104913.6", 28),
        parseUnits("1", 18),
      );
    });

    it("should have 14 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(14);
    });

    it(`should add ${marketSpec.vToken.symbol} to the pool`, async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(
        comptroller.address,
        marketSpec.vToken.underlying.address,
      );
      expect(registeredVToken).to.equal(marketSpec.vToken.address);
    });

    it("check ownership", async () => {
      expect(await vToken.owner()).to.equal(GUARDIAN);
    });

    it("check supply", async () => {
      const expectedSupply = parseUnits("0.106", 8);
      expect(await vToken.balanceOf(VTREASURY)).to.equal(expectedSupply);
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

    it("check Pool", async () => {
      checkIsolatedPoolsComptrollers();
    });

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
