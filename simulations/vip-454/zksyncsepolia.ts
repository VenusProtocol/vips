import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip454, { COMPTROLLER_CORE, newMarket, wstETH_ONE_JUMP_ORACLE } from "../../vips/vip-454/bsctestnet";
import JUMPRATEMODEL_ABI from "./abi/JumpRateModel.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE, CHAINLINK_ORACLE } = NETWORK_ADDRESSES["zksyncsepolia"];

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is time based deployment

forking(4761402, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
  const ETH_USD_FEED = "0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF";

  describe("vTokens deployment", () => {
    before(async () => {
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE,
        newMarket.vToken.underlying.address,
        ETH_USD_FEED,
        NORMAL_TIMELOCK,
      );
    });

    it(`should deploy market`, async () => {
      await checkVToken(newMarket.vToken.address, newMarket.vToken);
    });
  });

  testForkedNetworkVipCommands("wstEth_Core", await vip454());

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it("has the correct wstETH price", async () => {
        const price = await oracle.getPrice(newMarket.vToken.underlying.address);
        expect(price).to.be.eq(parseUnits("2950.704790000000000000", 18));
      });
      it(`Oracle underlying Price`, async () => {
        const price = await oracle.getUnderlyingPrice(newMarket.vToken.address);
        console.log(price.toString());
      });
    });

    it("has the correct wstETH oracle configuration", async () => {
      const JUMP_RATE_ORACLE = new ethers.Contract(wstETH_ONE_JUMP_ORACLE, JUMPRATEMODEL_ABI, provider);
      expect(await JUMP_RATE_ORACLE.CORRELATED_TOKEN()).to.equal(newMarket.vToken.underlying.address);
      expect(await JUMP_RATE_ORACLE.RESILIENT_ORACLE()).to.equal(RESILIENT_ORACLE);
    });
  });

  describe("PoolRegistry state", () => {
    it(`should add ${newMarket.vToken.symbol} to the Comptroller`, async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.contain(newMarket.vToken.address);
    });

    it(`should register ${newMarket.vToken.symbol} in PoolRegistry`, async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(
        COMPTROLLER_CORE,
        newMarket.vToken.underlying.address,
      );

      expect(registeredVToken).to.equal(newMarket.vToken.address);
    });
  });

  describe("Risk parameters", () => {
    checkRiskParameters(newMarket.vToken.address, newMarket.vToken, newMarket.riskParameters);
  });

  describe("Ownership and initial supply", () => {
    const { vToken: vTokenSpec, initialSupply } = newMarket;
    const vTokenContract = new ethers.Contract(vTokenSpec.address, VTOKEN_ABI, provider);
    const underlyingSymbol = vTokenSpec.underlying.symbol;

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
      newMarket.interestRateModel.address,
      newMarket.vToken.symbol,
      newMarket.interestRateModel,
      BLOCKS_PER_YEAR,
    );
  });

  checkIsolatedPoolsComptrollers();
});
