import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip461, {
  COMPTROLLER_CORE_ZKSYNC,
  wstETH_ONE_JUMP_ORACLE_ZKSYNC,
  zksyncMarket,
} from "../../vips/vip-461/bsctestnet";
import JUMPRATEMODEL_ABI from "./abi/JumpRateModel.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE } = NETWORK_ADDRESSES["zksyncsepolia"];

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is time based deployment

forking(4761402, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER_CORE_ZKSYNC, COMPTROLLER_ABI, provider);

  describe("vTokens deployment", () => {
    it(`should deploy market`, async () => {
      await checkVToken(zksyncMarket.vToken.address, zksyncMarket.vToken);
    });
  });

  testForkedNetworkVipCommands("wstEth_Core - ZKSYNC", await vip461());

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it("has the correct wstETH price", async () => {
        const price = await oracle.getPrice(zksyncMarket.vToken.underlying.address);
        expect(price).to.be.eq(parseUnits("2950.704790000000000000", 18));
      });
    });

    it("has the correct wstETH oracle configuration", async () => {
      const JUMP_RATE_ORACLE = new ethers.Contract(wstETH_ONE_JUMP_ORACLE_ZKSYNC, JUMPRATEMODEL_ABI, provider);
      expect(await JUMP_RATE_ORACLE.CORRELATED_TOKEN()).to.equal(zksyncMarket.vToken.underlying.address);
      expect(await JUMP_RATE_ORACLE.RESILIENT_ORACLE()).to.equal(RESILIENT_ORACLE);
    });
  });

  describe("PoolRegistry state", () => {
    it(`should add ${zksyncMarket.vToken.symbol} to the Comptroller`, async () => {
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.contain(zksyncMarket.vToken.address);
    });

    it(`should register ${zksyncMarket.vToken.symbol} in PoolRegistry`, async () => {
      const registeredVToken = await poolRegistry.getVTokenForAsset(
        COMPTROLLER_CORE_ZKSYNC,
        zksyncMarket.vToken.underlying.address,
      );

      expect(registeredVToken).to.equal(zksyncMarket.vToken.address);
    });
  });

  describe("Risk parameters", () => {
    checkRiskParameters(zksyncMarket.vToken.address, zksyncMarket.vToken, zksyncMarket.riskParameters);
  });

  describe("Ownership and initial supply", () => {
    const { vToken: vTokenSpec, initialSupply } = zksyncMarket;
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
      zksyncMarket.interestRateModel.address,
      zksyncMarket.vToken.symbol,
      zksyncMarket.interestRateModel,
      BLOCKS_PER_YEAR,
    );
  });

  checkIsolatedPoolsComptrollers();
});
