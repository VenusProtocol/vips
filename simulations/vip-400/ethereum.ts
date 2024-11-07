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

import vip100 from "../../multisig/proposals/ethereum/vip-100";
import vip400, {
  CONVERSION_INCENTIVE,
  PUFETH_REDSTONE_FEED,
  converterBaseAssets,
  marketSpec,
} from "../../vips/vip-400/bscmainnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { ethereum } = NETWORK_ADDRESSES;
const PROTOCOL_SHARE_RESERVE = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
const BLOCKS_PER_YEAR = BigNumber.from(2628000);
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const WETH_CHAINLINK_FEED = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
const PUFETH_HOLDER = "0xDdA0483184E75a5579ef9635ED14BacCf9d50283";

const { POOL_REGISTRY, RESILIENT_ORACLE, REDSTONE_ORACLE, GUARDIAN, VTREASURY, CHAINLINK_ORACLE } = ethereum;

forking(21130180, async () => {
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, ethers.provider);
  const vToken = new ethers.Contract(marketSpec.vToken.address, VTOKEN_ABI, ethers.provider);
  const comptroller = new ethers.Contract(marketSpec.vToken.comptroller, COMPTROLLER_ABI, ethers.provider);

  before(async () => {
    const FTT = "0x8764F50616B62a99A997876C2DEAaa04554C5B2E";
    await setRedstonePrice(REDSTONE_ORACLE, marketSpec.vToken.underlying.address, PUFETH_REDSTONE_FEED, FTT);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, WETH, WETH_CHAINLINK_FEED, GUARDIAN);

    await pretendExecutingVip(await vip100());
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(marketSpec.vToken.underlying.address)).to.be.reverted;
    });

    it("should have 8 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(8);
    });
  });

  testForkedNetworkVipCommands("vip400", await vip400());

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip400());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(marketSpec.vToken.underlying.address)).to.be.closeTo(
        parseUnits("2716.519108022670820400", 18),
        parseUnits("1", 18),
      );
      expect(await resilientOracle.getUnderlyingPrice(marketSpec.vToken.address)).to.be.closeTo(
        parseUnits("2716.519108022670820400", 18),
        parseUnits("1", 18),
      );
    });

    it("should have 9 markets in liquid staked pool", async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(9);
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
      const expectedSupply = parseUnits("5", 8);
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
      checkIsolatedPoolsComptrollers({
        [marketSpec.vToken.comptroller]: PUFETH_HOLDER,
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
