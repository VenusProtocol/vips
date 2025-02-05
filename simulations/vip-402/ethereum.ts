import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriodInChainlinkOracle, setRedstonePrice } from "src/utils";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework/index";

import vip071 from "../../multisig/proposals/ethereum/vip-071";
import vip402, {
  CONVERSION_INCENTIVE,
  LBTC_REDSTONE_FEED,
  converterBaseAssets,
  marketSpec,
} from "../../vips/vip-402/bscmainnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { ethereum } = NETWORK_ADDRESSES;
const PROTOCOL_SHARE_RESERVE = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
const BLOCKS_PER_YEAR = BigNumber.from(2628000);
const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const WBTC_CHAINLINK_FEED = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c";
const LBTC_HOLDER = "0x468c34703F6c648CCf39DBaB11305D17C70ba011";

const { POOL_REGISTRY, RESILIENT_ORACLE, REDSTONE_ORACLE, NORMAL_TIMELOCK, GUARDIAN, CHAINLINK_ORACLE, VTREASURY } =
  ethereum;

forking(21285800, async () => {
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const rsOracle = new ethers.Contract(REDSTONE_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, ethers.provider);
  const vToken = new ethers.Contract(marketSpec.vToken.address, VTOKEN_ABI, ethers.provider);
  const comptroller = new ethers.Contract(marketSpec.vToken.comptroller, COMPTROLLER_ABI, ethers.provider);

  before(async () => {
    const ONE_YEAR = 31536000;
    await setRedstonePrice(
      REDSTONE_ORACLE,
      marketSpec.vToken.underlying.address,
      LBTC_REDSTONE_FEED,
      NORMAL_TIMELOCK,
      ONE_YEAR,
      { tokenDecimals: marketSpec.vToken.underlying.decimals },
    );
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, WBTC, WBTC_CHAINLINK_FEED, GUARDIAN);

    await pretendExecutingVip(await vip071());
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(marketSpec.vToken.underlying.address)).to.be.reverted;
    });

    it("should have 11 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(11);
    });
  });

  testForkedNetworkVipCommands("LBTC", await vip402());

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip402());
    });

    it("check price", async () => {
      console.log("correlated price", await rsOracle.getPrice(marketSpec.vToken.underlying.address));
      console.log("base price", await resilientOracle.getPrice(WBTC));
      expect(await resilientOracle.getPrice(marketSpec.vToken.underlying.address)).to.be.closeTo(
        parseUnits("94993.81299751", 28),
        parseUnits("1", 18),
      );
      expect(await resilientOracle.getUnderlyingPrice(marketSpec.vToken.address)).to.be.closeTo(
        parseUnits("94993.81299751", 28),
        parseUnits("1", 18),
      );
    });

    it("should have 12 markets in core pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(12);
    });

    it(`should add ${marketSpec.vToken.symbol} to the pool`, async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(
        comptroller.address,
        marketSpec.vToken.underlying.address,
      );
      expect(registeredVToken).to.equal(marketSpec.vToken.address);
    });

    it("has correct owner", async () => {
      expect(await vToken.owner()).to.equal(GUARDIAN);
    });

    it("should send 0.006 vLBTC_Core to treasury", async () => {
      const treasuryShare = parseUnits("0.006", 8);
      expect(await vToken.balanceOf(VTREASURY)).to.equal(treasuryShare);
    });

    it("should send 0.1 vLBTC_Core to receiver", async () => {
      const projectShare = parseUnits("0.1", 8);
      expect(await vToken.balanceOf(marketSpec.initialSupply.vTokenReceiver)).to.equal(projectShare);
    });

    it("should not keep any vTokens in the timelock", async () => {
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

    it("check Pool", async () => {
      checkIsolatedPoolsComptrollers({
        [marketSpec.vToken.comptroller]: LBTC_HOLDER,
      });
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
