import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriod } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import ERC20_ABI from "src/vip-framework/abi/erc20.json";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip439 from "../../vips/vip-439/bscmainnet";
import vip442, { COMPTROLLER_CORE, markets, tokens } from "../../vips/vip-442/bscmainnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const HOLDERS = {
  [markets[0].vToken.underlying.address]: "0xC113c4D519Af3E9EFB1adb80Dbd9e0f20591F48d",
  [markets[1].vToken.underlying.address]: "0xA55713A301F23B02DCBE36321164a78614e368dF",
  [markets[2].vToken.underlying.address]: "0x602DA189F5aDa033E9aC7096Fc39C7F44a77e942",
};
const BLOCKS_PER_YEAR = BigNumber.from("2628000");
const ONE_YEAR = 365 * 24 * 3600;

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE } = NETWORK_ADDRESSES["ethereum"];

forking(21779026, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);

  before(async () => {
    const usdc = new ethers.Contract(USDC, ERC20_ABI, provider);
    const usdt = new ethers.Contract(USDT, ERC20_ABI, provider);
    await setMaxStalePeriod(oracle, usdt);
    await setMaxStalePeriod(oracle, usdc);

    for (const market of markets) {
      await impersonateAccount(HOLDERS[market.vToken.underlying.address]);
      await setBalance(HOLDERS[market.vToken.underlying.address], parseUnits("1000000", 18));
      const underlying = new ethers.Contract(market.vToken.underlying.address, ERC20_ABI, provider);
      await underlying
        .connect(await ethers.getSigner(HOLDERS[market.vToken.underlying.address]))
        .transfer(NORMAL_TIMELOCK, market.initialSupply.amount);
    }
  });

  describe("vTokens deployment", () => {
    for (const market of markets) {
      it(`should deploy market ${market.vToken.symbol}`, async () => {
        await checkVToken(market.vToken.address, market.vToken);
      });
    }
  });

  testForkedNetworkVipCommands("vip439", await vip439(ONE_YEAR));
  testForkedNetworkVipCommands("vip442", await vip442());

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      for (const token of tokens) {
        it(`should have oracle price for ${token.symbol}`, async () => {
          const price = await oracle.getPrice(token.address);
          expect(price).to.be.eq(token.price);
        });
      }
    });

    describe("PoolRegistry state", () => {
      for (const market of markets) {
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
      }
    });

    describe("Risk parameters", () => {
      for (const market of markets) {
        checkRiskParameters(market.vToken.address, market.vToken, market.riskParameters);
      }
    });

    describe("Ownership and initial supply", () => {
      for (const market of markets) {
        const { vToken: vTokenSpec, initialSupply } = market;
        const vTokenContract = new ethers.Contract(vTokenSpec.address, VTOKEN_ABI, provider);

        describe(`${vTokenSpec.symbol}`, () => {
          it(`should have owner = normal timelock`, async () => {
            expect(await vTokenContract.owner()).to.equal(NORMAL_TIMELOCK);
          });

          let multiplier;
          let vTokenSupply;

          // Initial exchange rate should account for decimal transformations such that
          // the string representation is the same (i.e. 1 vToken == 1 underlying)
          if (vTokenSpec.underlying.decimals > vTokenSpec.decimals) {
            multiplier = 10 ** (vTokenSpec.underlying.decimals - vTokenSpec.decimals);
            vTokenSupply = initialSupply.amount.div(multiplier);
          } else {
            multiplier = 10 ** (vTokenSpec.decimals - vTokenSpec.underlying.decimals);
            vTokenSupply = initialSupply.amount.mul(multiplier);
          }
          
          const underlyingSupplyString = formatUnits(initialSupply.amount, vTokenSpec.underlying.decimals);
          const vTokenSupplyString = formatUnits(vTokenSupply, vTokenSpec.decimals);

          it(`should have initial supply = ${vTokenSupplyString} ${vTokenSpec.symbol}`, async () => {
            expect(await vTokenContract.balanceOf(initialSupply.vTokenReceiver)).to.equal(vTokenSupply);
          });

          it(`should have balance of underlying = ${underlyingSupplyString} ${market.vToken.underlying.symbol}`, async () => {
            const underlying = new ethers.Contract(vTokenSpec.underlying.address, ERC20_ABI, provider);
            expect(await underlying.balanceOf(vTokenSpec.address)).to.equal(initialSupply.amount);
          });
        });
      }
    });

    describe("Interest rates", () => {
      for (const market of markets) {
        checkInterestRate(
          market.interestRateModel.address,
          market.vToken.symbol,
          market.interestRateModel,
          BLOCKS_PER_YEAR,
        );
      }
    });

    checkIsolatedPoolsComptrollers();
  });
});
