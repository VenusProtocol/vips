import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
import { forking, testVip } from "src/vip-framework/index";

import vip480, {
  CONVERSION_INCENTIVE,
  PROTOCOL_SHARE_RESERVE,
  convertAmountToVTokens,
  converterBaseAssets,
  marketSpecs,
  tokens,
} from "../../vips/vip-480/bsctestnet";
import ERC20_ABI from "./abi/ERC20.json";
import COMPTROLLER_ABI from "./abi/LegacyPoolComptroller.json";
import VTOKEN_ABI from "./abi/LegacyPoolVToken.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";

const BLOCKS_PER_YEAR = BigNumber.from(10512000);

const { RESILIENT_ORACLE, ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, UNITROLLER } = NETWORK_ADDRESSES.bsctestnet;

const format = (amount: BigNumber, spec: { decimals: number; symbol: string }) =>
  `${formatUnits(amount, spec.decimals)} ${spec.symbol}`;

forking(50047057, async () => {
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP behavior", () => {
    Object.values(tokens).forEach(({ address, symbol }) => {
      it(`check price ${symbol}`, async () => {
        await expect(resilientOracle.getPrice(address)).to.be.reverted;
      });
    });

    it("should have 29 markets in the core pool", async () => {
      const markets = await comptroller.getAllMarkets();
      expect(markets).to.have.lengthOf(29);
    });
  });

  testVip("VIP-480", await vip480(), {});

  describe("Post-VIP behavior", async () => {
    it("check price USDe", async () => {
      expect(await resilientOracle.getPrice(tokens.USDe.address)).to.equal(parseUnits("1", 18));
      expect(await resilientOracle.getUnderlyingPrice(marketSpecs.USDe.vToken.address)).to.equal(parseUnits("1", 18));
    });

    it("check price sUSDe", async () => {
      expect(await resilientOracle.getPrice(tokens.sUSDe.address)).to.equal(parseUnits("1.1", 18));
      expect(await resilientOracle.getUnderlyingPrice(marketSpecs.sUSDe.vToken.address)).to.equal(
        parseUnits("1.1", 18),
      );
    });

    it("check price PT-sUSDe-26JUN2025", async () => {
      expect(await resilientOracle.getPrice(tokens["PT-sUSDE-26JUN2025"].address)).to.equal(parseUnits("0.935", 18)); // 0.85 * 1.1
      expect(await resilientOracle.getUnderlyingPrice(marketSpecs["PT-sUSDE-26JUN2025"].vToken.address)).to.equal(
        parseUnits("0.935", 18),
      );
    });

    it("should have 32 markets in the core pool", async () => {
      const markets = await comptroller.getAllMarkets();
      expect(markets).to.have.lengthOf(32);
      Object.values(marketSpecs).forEach(({ vToken }) => {
        expect(markets).to.contain(vToken.address);
      });
    });

    Object.values(marketSpecs).forEach(({ vToken, interestRateModel, initialSupply, riskParameters }) => {
      const vTokenContract = new ethers.Contract(vToken.address, VTOKEN_ABI, ethers.provider);
      const vTokenSupply = convertAmountToVTokens(initialSupply.amount, vToken.exchangeRate);
      const vTokenSupplyForReceiver = vTokenSupply.sub(initialSupply.vTokensToBurn);

      describe(`Checks for ${vToken.symbol}`, () => {
        it("has correct owner", async () => {
          expect(await vTokenContract.admin()).to.equal(NORMAL_TIMELOCK);
        });

        it("has correct ACM", async () => {
          expect(await vTokenContract.accessControlManager()).to.equal(ACCESS_CONTROL_MANAGER);
        });

        it("has correct protocol share reserve", async () => {
          expect(await vTokenContract.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
        });

        describe("Balances", () => {
          it(`should have balance of underlying = ${format(initialSupply.amount, vToken.underlying)}`, async () => {
            const underlying = new ethers.Contract(vToken.underlying.address, ERC20_ABI, ethers.provider);
            expect(await underlying.balanceOf(vToken.address)).to.equal(initialSupply.amount);
          });

          it(`should have total supply of ${format(vTokenSupply, vToken)}`, async () => {
            expect(await vTokenContract.totalSupply()).to.equal(vTokenSupply);
          });

          it(`should send ${format(vTokenSupplyForReceiver, vToken)} to receiver`, async () => {
            const receiverBalance = await vTokenContract.balanceOf(initialSupply.vTokenReceiver);
            expect(receiverBalance).to.equal(vTokenSupplyForReceiver);
          });

          it(`should burn ${format(initialSupply.vTokensToBurn, vToken)}`, async () => {
            const burnt = await vTokenContract.balanceOf(ethers.constants.AddressZero);
            expect(burnt).to.equal(initialSupply.vTokensToBurn);
          });

          it(`should leave no ${vToken.symbol} in the timelock`, async () => {
            const timelockBalance = await vTokenContract.balanceOf(NORMAL_TIMELOCK);
            expect(timelockBalance).to.equal(0);
          });
        });

        checkRiskParameters(vToken.address, vToken, riskParameters);
        checkVToken(vToken.address, vToken);
        checkInterestRate(interestRateModel.address, vToken.symbol, interestRateModel, BLOCKS_PER_YEAR);
      });
    });

    describe("Paused markets", () => {
      it("should pause borrowing on sUSDe", async () => {
        expect(await comptroller.actionPaused(marketSpecs.sUSDe.vToken.address, 2)).to.equal(true);
      });
      it("should pause borrowing on PT-sUSDE-26JUN2025", async () => {
        expect(await comptroller.actionPaused(marketSpecs["PT-sUSDE-26JUN2025"].vToken.address, 2)).to.equal(true);
      });
    });

    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);
        Object.values(tokens).forEach(({ symbol, address }) => {
          it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset ${symbol}`, async () => {
            const result = await converterContract.conversionConfigurations(baseAsset, address);
            expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
          });
        });
      }
    });
  });
});
