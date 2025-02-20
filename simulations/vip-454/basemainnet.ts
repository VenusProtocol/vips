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

import vip453, { COMPTROLLER_CORE, market, token } from "../../vips/vip-454/bscmainnetBase";
import RESILIENT_ORACLE_ABI from "../vip-454/abi/ResilientOracle.json";
import COMPTROLLER_ABI from "../vip-454/abi/comptroller.json";
import POOL_REGISTRY_ABI from "../vip-454/abi/poolRegistry.json";
import VTOKEN_ABI from "../vip-454/abi/vToken.json";

const BLOCKS_PER_YEAR = BigNumber.from("31536000");

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE } = NETWORK_ADDRESSES["basemainnet"];
const WETH = "0x4200000000000000000000000000000000000006";
const USER = "0x87c9B02A10eC2CB4dcB3b2e573e26169CF3cd9Bf";

forking(26583875, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
  const vTokenContract = new ethers.Contract(market.vToken.address, VTOKEN_ABI, provider);

  describe("vTokens deployment", () => {
    before(async () => {
      const { initialSupply } = market;
      await impersonateAccount(USER);
      await impersonateAccount(initialSupply.vTokenReceiver);
      await setBalance(initialSupply.vTokenReceiver, parseUnits("1000", 18));
      const signer = await ethers.getSigner(USER);
      const vReceiver = await ethers.getSigner(initialSupply.vTokenReceiver);

      await setMaxStalePeriod(oracle, await ethers.getContractAt(ERC20_ABI, WETH, signer));
      await vTokenContract.connect(vReceiver).approve(NORMAL_TIMELOCK, initialSupply.vTokensToBurn);
    });

    it(`should deploy market`, async () => {
      await checkVToken(market.vToken.address, market.vToken);
    });

    it(`should check balance for normal timelock for VToken`, async () => {
      expect(await vTokenContract.balanceOf(NORMAL_TIMELOCK)).to.equal("0");
    });
  });

  testForkedNetworkVipCommands("vip453", await vip453());

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it(`has the correct WETH price`, async () => {
        const price = await oracle.getPrice(WETH);
        expect(price).to.be.eq(parseUnits("2716.92", 18));
      });
      it(`has the correct ${token.symbol} price`, async () => {
        const price = await oracle.getPrice(token.address);
        expect(price).to.be.eq(parseUnits("3244.832924959994639937", 18));
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

      it("should pause borrowing on wsuperOETHb", async () => {
        expect(await comptroller.actionPaused(market.vToken.address, 2)).to.equal(false);
      });

      it(`should have a protocol seize share ${market.riskParameters.protocolSeizeShare}`, async () => {
        expect(await vTokenContract.protocolSeizeShareMantissa()).to.equal(market.riskParameters.protocolSeizeShare);
      });
    });

    describe("Ownership and initial supply", () => {
      const { vToken: vTokenSpec, initialSupply } = market;
      const underlyingSymbol = token.symbol;

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
          const vTokensRemaining = vTokenSupply.sub(market.initialSupply.vTokensToBurn);
          expect(await vTokenContract.balanceOf(initialSupply.vTokenReceiver)).to.equal(vTokensRemaining);
        });

        it(`should check balance for normal timelock for VToken after vip`, async () => {
          expect(await vTokenContract.balanceOf(NORMAL_TIMELOCK)).to.equal("0");
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

    checkIsolatedPoolsComptrollers();
  });
});
