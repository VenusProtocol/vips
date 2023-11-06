import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser, setMaxStalePeriodInBinanceOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { checkVToken } from "../../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../../src/vip-framework/checks/interestRateModel";
import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "../../../src/vip-framework/checks/rewardsDistributor";
import { vip198 } from "../../../vips/vip-198/vip-198";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const USDD = "0xd17479997F34dd9156Deef8F95A52D81D265be9c";
const vUSDD_DeFi = "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0";
const PLANET = "0xCa6d678e74f553f0E59cccC03ae644a3c2c5EE7d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const VTOKEN_RECEIVER = "0x0554d6079eBc222AD12405E52b264Bdb5B65D1cf";
const VPLANET_DEFI = "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be";
const REWARD_DISTRIBUTOR = "0xD86FCff6CCF5C4E277E49e1dC01Ed4bcAb8260ba";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const PLANET_RATE_MODEL = "0x53DbE3c0d1Bd439E4F600ad36791C41d02906E6b";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";

forking(33253419, () => {
  let poolRegistry: Contract;
  let comptroller: Contract;
  let vPLANET_DeFi: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    vPLANET_DeFi = await ethers.getContractAt(VTOKEN_ABI, VPLANET_DEFI);
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "USDD");
  });

  describe("Contracts setup", () => {
    checkVToken(VPLANET_DEFI, {
      name: "Venus PLANET (DeFi)",
      symbol: "vPLANET_DeFi",
      decimals: 8,
      underlying: PLANET,
      exchangeRate: parseUnits("1", 28),
    });
  });

  testVip("VIP-198 Add PLANET Market to DeFi Pool", vip198(3 * 24 * 60 * 60));

  describe("Post-VIP state", () => {
    describe("PoolRegistry state", () => {
      it("should register pool's vTokens in Comptroller", async () => {
        const vTokens = await comptroller.getAllMarkets();
        expect(vTokens).to.have.lengthOf(8);
        expect(vTokens).to.include(VPLANET_DEFI);
      });

      it("should register vPLANET_DeFi in PoolRegistry", async () => {
        const vToken = await poolRegistry.getVTokenForAsset(COMPTROLLER, PLANET);
        expect(vToken).to.equal(VPLANET_DEFI);
      });
    });

    describe("Ownership", () => {
      it("should transfer ownership of vPLANET_DeFi to Timelock", async () => {
        expect(await vPLANET_DeFi.owner()).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("Initial supply", () => {
      it(`should mint 17,498,300,000,000,000 vPLANET_DeFi to ${VTOKEN_RECEIVER}`, async () => {
        expect(await vPLANET_DeFi.balanceOf(VTOKEN_RECEIVER)).to.equal(parseUnits("174983000", 8));
      });
    });

    describe("Reserves Parameters", () => {
      it("should set vPLANET_DeFi Protocol Share Reserve address correctly", async () => {
        expect(await vPLANET_DeFi.protocolShareReserve()).equals(PSR);
      });

      it("should set vPLANET_DeFi reduce reserves block delta correctly", async () => {
        expect(await vPLANET_DeFi.reduceReservesBlockDelta()).equals(28800);
      });
    });

    describe("Market, Risk Parameters and Rewards", () => {
      describe("Interest rate models", () => {
        checkInterestRate(PLANET_RATE_MODEL, "vPLANET_DeFi", {
          base: "0.02",
          multiplier: "0.2",
          jump: "3",
          kink: "0.45",
        });

        describe("RF, CF, LT, Protocol seize share", () => {
          it("should set vPLANET_DeFi reserve factor to 0.25", async () => {
            expect(await vPLANET_DeFi.reserveFactorMantissa()).to.equal(parseUnits("0.25", 18));
          });

          it("should set vPLANET_DeFi collateral factor to 20%", async () => {
            const market = await comptroller.markets(VPLANET_DEFI);
            expect(market.collateralFactorMantissa).to.equal(parseUnits("0.2", 18));
          });

          it("should set vPLANET_DeFi liquidation threshold to 30%", async () => {
            const market = await comptroller.markets(VPLANET_DEFI);
            expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.3", 18));
          });

          it("should set vPLANET_DeFi protocolSeizeShareMantissa to 5%", async () => {
            const protocolSeizeShare = await vPLANET_DeFi.protocolSeizeShareMantissa();
            expect(protocolSeizeShare).to.equal(parseUnits("0.05", 18));
          });
        });

        describe("Caps", () => {
          it("should set vPLANET_DeFi supply cap to 1,000,000,000", async () => {
            expect(await comptroller.supplyCaps(VPLANET_DEFI)).to.equal(parseUnits("1000000000", 18));
          });

          it("should set vPLANET_DeFi borrow cap to 500,000,000", async () => {
            expect(await comptroller.borrowCaps(VPLANET_DEFI)).to.equal(parseUnits("500000000", 18));
          });
        });

        describe("Reward Distributor", () => {
          const planetRewardsDistributorConfig: RewardsDistributorConfig = {
            pool: COMPTROLLER,
            address: REWARD_DISTRIBUTOR,
            token: USDT,
            vToken: VPLANET_DEFI,
            borrowSpeed: parseUnits("1500", 18).div(806400),
            supplySpeed: parseUnits("1500", 18).div(806400),
            totalRewardsToDistribute: parseUnits("3000", 18),
          };
          checkRewardsDistributor("RewardsDistributor_PLANET_DeFi", planetRewardsDistributorConfig);
          checkRewardsDistributorPool(COMPTROLLER, 3);
        });
      });
    });

    describe("Basic supply/borrow/repay/redeem scenario", () => {
      let planet: Contract;
      let usdd: Contract;
      let vUSDD: Contract;
      let user: SignerWithAddress;

      before(async () => {
        [user] = await ethers.getSigners();
        planet = await ethers.getContractAt(ERC20_ABI, PLANET);
        const USDD_HOLDER = "0xf8ba3ec49212ca45325a2335a8ab1279770df6c0";
        const PLANET_HOLDER = "0x0D0707963952f2fBA59dD06f2b425ace40b492Fe";
        usdd = await ethers.getContractAt(ERC20_ABI, USDD);
        vUSDD = await ethers.getContractAt(VTOKEN_ABI, vUSDD_DeFi);
        const usddHolder = await initMainnetUser(USDD_HOLDER, parseUnits("1", 18));
        const planetHolderSigner = await initMainnetUser(PLANET_HOLDER, parseUnits("1", 18));
        await usdd.connect(usddHolder).transfer(user.address, parseUnits("1000", 18));
        await planet.connect(planetHolderSigner).transfer(user.address, parseUnits("100", 18));
        const impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
        await vUSDD.connect(impersonatedTimelock).setReduceReservesBlockDelta(100);
        await vUSDD.connect(impersonatedTimelock).setProtocolShareReserve(PSR);
      });

      it("should be possible to supply PLANET", async () => {
        await planet.connect(user).approve(vPLANET_DeFi.address, parseUnits("100", 18));
        await vPLANET_DeFi.connect(user).mint(parseUnits("100", 18));
        expect(await vPLANET_DeFi.balanceOf(user.address)).to.equal(parseUnits("100", 8));
      });

      it("should be possible to enable PLANET as collateral", async () => {
        await comptroller.connect(user).enterMarkets([VPLANET_DEFI]);
        expect(await comptroller.getAssetsIn(user.address)).to.deep.equal([VPLANET_DEFI]);
      });

      it("should be possible to borrow PLANET", async () => {
        await usdd.connect(user).approve(vUSDD.address, parseUnits("100", 18));
        await vUSDD.connect(user).mint(parseUnits("100", 18));
        await comptroller.connect(user).enterMarkets([vUSDD.address]);
        await vPLANET_DeFi.connect(user).borrow(1000);
        expect(await vPLANET_DeFi.borrowBalanceStored(user.address)).to.equal(1000);
        expect(await planet.balanceOf(user.address)).to.equal(1000);
      });

      it("should be possible to repay PLANET", async () => {
        await planet.approve(vPLANET_DeFi.address, 1000000);
        await vPLANET_DeFi.repayBorrow(1000000);
        expect(await vPLANET_DeFi.borrowBalanceStored(user.address)).to.be.lessThan(parseUnits("0.01", 18));
        expect(await planet.balanceOf(user.address)).to.equal(0);
      });

      it("should be possible to redeem a part of PLANET", async () => {
        await vPLANET_DeFi.redeemUnderlying(parseUnits("30", 18));
        expect(await planet.balanceOf(user.address)).to.equal(parseUnits("30", 18));
        expect(await vPLANET_DeFi.balanceOf(user.address)).to.equal(parseUnits("70", 8));
      });
    });
  });
});
