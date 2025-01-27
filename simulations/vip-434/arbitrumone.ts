import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import ERC20_ABI from "src/vip-framework/abi/erc20.json";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip434, {
  COMPTROLLER_CORE,
  REFUND_ADDRESS,
  REFUND_AMOUNT,
  REFUND_TOKEN,
  market,
  token,
} from "../../vips/vip-434/bscmainnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const BLOCKS_PER_YEAR = BigNumber.from("31536000");
const ONE_YEAR = 3600 * 24 * 365;

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE, CHAINLINK_ORACLE } = NETWORK_ADDRESSES["arbitrumone"];

forking(299538054, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
  const refundToken = new ethers.Contract(REFUND_TOKEN, ERC20_ABI, provider);
  const balanceBefore = await refundToken.balanceOf(REFUND_ADDRESS);

  describe("vTokens deployment", () => {
    it(`should deploy market`, async () => {
      await checkVToken(market.vToken.address, market.vToken);
    });
  });

  testForkedNetworkVipCommands("vip434", await vip434({ chainlinkStalePeriod: ONE_YEAR }));

  describe("Post-VIP state", () => {
    before(async () => {
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE,
        "0x5979D7b546E38E414F7E9822514be443A4800529",
        "0xb523AE262D20A936BC152e6023996e46FDC2A95D",
        NORMAL_TIMELOCK,
      );
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE,
        "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
        "0xE141425bc1594b8039De6390db1cDaf4397EA22b",
        NORMAL_TIMELOCK,
      );
    });

    describe("Oracle configuration", async () => {
      it("has the correct gmWETH price", async () => {
        const price = await oracle.getPrice(token.address);
        expect(price).to.be.eq(parseUnits("1.75254694", 18));
      });
    });

    describe("PoolRegistry state", () => {
      it(`should add ${market.vToken.symbol} to the Comptroller`, async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.contain(market.vToken.address);
      });

      it(`should register ${market.vToken.symbol} in PoolRegistry`, async () => {
        const registeredVToken = await poolRegistry.getVTokenForAsset(
          COMPTROLLER_CORE,
          market.vToken.underlying.address,
        );
        expect(registeredVToken).to.equal(market.vToken.address);
      });
    });

    describe("Risk parameters", () => {
      checkRiskParameters(market.vToken.address, market.vToken, market.riskParameters);
    });

    describe("Ownership and initial supply", () => {
      const { vToken: vTokenSpec, initialSupply } = market;
      const vTokenContract = new ethers.Contract(vTokenSpec.address, VTOKEN_ABI, provider);
      const underlyingSymbol = "GM";

      describe(`${vTokenSpec.symbol}`, () => {
        it(`should have owner = normal timelock`, async () => {
          expect(await vTokenContract.owner()).to.equal(NORMAL_TIMELOCK);
        });

        // Initial exchange rate should account for decimal transformations such that
        // the string representation is the same (i.e. 1 vToken == 1 underlying)
        const multiplier = 10 ** (vTokenSpec.underlying.decimals - vTokenSpec.decimals);
        const vTokenSupply = initialSupply.amount.div(multiplier);
        const underlyingSupplyString = formatUnits(initialSupply.amount, vTokenSpec.underlying.decimals);
        const vTokenSupplyString = formatUnits(vTokenSupply, vTokenSpec.decimals);

        it(`should have initial supply = ${vTokenSupplyString} ${vTokenSpec.symbol}`, async () => {
          expect(await vTokenContract.balanceOf(initialSupply.vTokenReceiver)).to.equal(vTokenSupply);
        });

        it(`should have balance of underlying = ${underlyingSupplyString} ${underlyingSymbol}`, async () => {
          const underlying = new ethers.Contract(vTokenSpec.underlying.address, ERC20_ABI, provider);
          expect(await underlying.balanceOf(vTokenSpec.address)).to.equal(initialSupply.amount);
        });
      });
    });

    describe("Interest rates", () => {
      checkInterestRate(
        market.interestRateModel.address,
        market.vToken.symbol,
        market.interestRateModel,
        BLOCKS_PER_YEAR,
      );
    });

    it(`should refund ${REFUND_AMOUNT} GM to the refund address`, async () => {
      const balanceAfter = await refundToken.balanceOf(REFUND_ADDRESS);
      expect(balanceAfter.sub(balanceBefore)).to.eq(REFUND_AMOUNT);
    });

    checkIsolatedPoolsComptrollers();
  });
});
