import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
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

import vip454, {
  COMPTROLLER_CORE_BASE,
  baseMarket,
  convertAmountToVTokens,
  token_BASE,
} from "../../vips/vip-454/bscmainnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const BLOCKS_PER_YEAR = BigNumber.from("31536000");

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE } = NETWORK_ADDRESSES["basemainnet"];
const WETH = "0x4200000000000000000000000000000000000006";
const USER = "0x87c9B02A10eC2CB4dcB3b2e573e26169CF3cd9Bf";
const ONE_YEAR = 3600 * 24 * 365;

forking(26583875, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER_CORE_BASE, COMPTROLLER_ABI, provider);
  const vTokenContract = new ethers.Contract(baseMarket.vToken.address, VTOKEN_ABI, provider);

  describe("vTokens deployment", () => {
    before(async () => {
      await impersonateAccount(USER);
      const signer = await ethers.getSigner(USER);
      await setMaxStalePeriod(oracle, await ethers.getContractAt(ERC20_ABI, WETH, signer));
    });

    it(`should deploy baseMarket`, async () => {
      await checkVToken(baseMarket.vToken.address, baseMarket.vToken);
    });

    it(`should check balance for normal timelock for VToken`, async () => {
      expect(await vTokenContract.balanceOf(NORMAL_TIMELOCK)).to.equal("0");
    });
  });

  testForkedNetworkVipCommands("wstEth_Core - BASE", await vip454({ chainlinkStalePeriod: ONE_YEAR }));

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it(`has the correct WETH price`, async () => {
        const price = await oracle.getPrice(WETH);
        expect(price).to.be.eq(parseUnits("2716.92", 18));
      });
      it(`has the correct ${token_BASE.symbol} price`, async () => {
        const price = await oracle.getPrice(token_BASE.address);
        expect(price).to.be.eq(parseUnits("3244.832924959994639937", 18));
      });
    });

    describe("PoolRegistry state", () => {
      it(`should add ${baseMarket.vToken.symbol} to the Comptroller`, async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.contain(baseMarket.vToken.address);
      });

      it(`should register ${baseMarket.vToken.symbol} in PoolRegistry`, async () => {
        const registeredVToken = await poolRegistry.getVTokenForAsset(
          COMPTROLLER_CORE_BASE,
          baseMarket.vToken.underlying.address,
        );
        expect(registeredVToken).to.equal(baseMarket.vToken.address);
      });
    });

    describe("Risk parameters", () => {
      checkRiskParameters(baseMarket.vToken.address, baseMarket.vToken, baseMarket.riskParameters);

      it("should pause borrowing on wsuperOETHb", async () => {
        expect(await comptroller.actionPaused(baseMarket.vToken.address, 2)).to.equal(false);
      });

      it(`should have a protocol seize share ${baseMarket.riskParameters.protocolSeizeShare}`, async () => {
        expect(await vTokenContract.protocolSeizeShareMantissa()).to.equal(
          baseMarket.riskParameters.protocolSeizeShare,
        );
      });
    });

    describe("Ownership and initial supply", () => {
      const { vToken: vTokenSpec, initialSupply } = baseMarket;
      const underlyingSymbol = token_BASE.symbol;

      describe(`${vTokenSpec.symbol}`, () => {
        it(`should have owner = normal timelock`, async () => {
          expect(await vTokenContract.owner()).to.equal(NORMAL_TIMELOCK);
        });

        // Initial exchange rate should account for decimal transformations such that
        // the string representation is the same (i.e. 1 vToken == 1 underlying)
        const underlyingSupplyString = formatUnits(initialSupply.amount, vTokenSpec.underlying.decimals);

        it(`Verify minted tokens after transfering some amount of vToken to zero address`, async () => {
          const vTokensMinted = convertAmountToVTokens(baseMarket.initialSupply.amount, baseMarket.vToken.exchangeRate);
          expect(await vTokenContract.balanceOf(NORMAL_TIMELOCK)).to.equal(0);
          expect(await vTokenContract.balanceOf(baseMarket.initialSupply.vTokenReceiver)).to.equal(
            vTokensMinted.sub(initialSupply.vTokensToBurn),
          );
        });

        it(`should have balance of underlying = ${underlyingSupplyString} ${underlyingSymbol}`, async () => {
          const underlying = new ethers.Contract(vTokenSpec.underlying.address, ERC20_ABI, provider);
          expect(await underlying.balanceOf(vTokenSpec.address)).to.equal(initialSupply.amount);
        });
      });
    });

    describe("Interest rates", () => {
      checkInterestRate(
        baseMarket.interestRateModel.address,
        baseMarket.vToken.symbol,
        baseMarket.interestRateModel,
        BLOCKS_PER_YEAR,
      );
    });

    checkIsolatedPoolsComptrollers();
  });
});
