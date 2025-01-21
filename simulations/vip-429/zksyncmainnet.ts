import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import ERC20_ABI from "src/vip-framework/abi/erc20.json";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip429, { COMPTROLLER, WUSDM_ERC4626_ORACLE, newMarket, tokens } from "../../vips/vip-429/bscmainnet";
import ERC4626_ORACLE_ABI from "./abi/ERC4626Oracle.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const BLOCKS_PER_YEAR = BigNumber.from("31536000");
const ONE_YEAR = 3600 * 24 * 365;
const WUSDM_HOLDER = "0x57a23d382cD9Ae7408A63ead305e09c23d6a36Be";

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE } = NETWORK_ADDRESSES["zksyncmainnet"];

forking(54123200, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("vTokens deployment", () => {
    checkVToken(newMarket.vToken.address, newMarket.vToken);
  });

  testForkedNetworkVipCommands("zksync-wUSDM", await vip429({ chainlinkStalePeriod: ONE_YEAR }));

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it("has the correct USDM price", async () => {
        const price = await oracle.getPrice(tokens["USDM"].address);
        expect(price).to.be.eq(parseUnits("1.00003056", 18));
      });

      it("has the correct wUSDM oracle configuration", async () => {
        const erc4626Oracle = new ethers.Contract(WUSDM_ERC4626_ORACLE, ERC4626_ORACLE_ABI, provider);
        expect(await erc4626Oracle.CORRELATED_TOKEN()).to.equal(tokens["wUSDM"].address);
        expect(await erc4626Oracle.UNDERLYING_TOKEN()).to.equal(tokens["USDM"].address);
        expect(await erc4626Oracle.RESILIENT_ORACLE()).to.equal(RESILIENT_ORACLE);
      });

      it("has the correct wUSDM price", async () => {
        const price = await oracle.getPrice(tokens["wUSDM"].address);
        expect(price).to.be.eq(parseUnits("1.064366386871659138", 18));
      });
    });

    describe("PoolRegistry state", () => {
      it(`should add ${newMarket.vToken.symbol} to the Comptroller`, async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.contain(newMarket.vToken.address);
      });

      it(`should register ${newMarket.vToken.symbol} in PoolRegistry`, async () => {
        const registeredVToken = await poolRegistry.getVTokenForAsset(COMPTROLLER, newMarket.vToken.underlying.address);
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

    checkIsolatedPoolsComptrollers({ [COMPTROLLER]: WUSDM_HOLDER });
  });
});
