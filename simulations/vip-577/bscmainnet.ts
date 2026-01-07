import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip577, { ADDRESS_DATA, Actions } from "../../vips/vip-577/bscmainnet";
import VTOKEN_ABI from "./abi/vtoken.json";
import ERC20_ABI from "./abi/ERC20.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const provider = ethers.provider;

forking(71819752, async () => {
  const bscPools = ADDRESS_DATA.bscmainnet.pools;

  describe("Pre-VIP behavior", async () => {
    for (const pool of bscPools) {
      describe(`${pool.name} Pool`, () => {
        let comptroller: Contract;

        before(async () => {
          comptroller = new ethers.Contract(pool.comptroller, COMPTROLLER_ABI, provider);
        });

        it("Check MINT pause state matches data", async () => {
          for (const market of pool.markets) {
            const isPaused = await comptroller.actionPaused(market.address, Actions.MINT);
            expect(isPaused).to.be.equal(market.isMintActionPaused);
          }
        });

        it("Check BORROW pause state matches data", async () => {
          for (const market of pool.markets) {
            const isPaused = await comptroller.actionPaused(market.address, Actions.BORROW);
            expect(isPaused).to.be.equal(market.isBorrowActionPaused);
          }
        });

        it("Check collateral factors match data", async () => {
          for (const market of pool.markets) {
            const marketData = await comptroller.markets(market.address);
            expect(marketData.collateralFactorMantissa.toString()).to.be.equal(market.collateralFactor);
          }
        });

        it("Check supply caps match data", async () => {
          for (const market of pool.markets) {
            const supplyCap = await comptroller.supplyCaps(market.address);
            expect(supplyCap.toString()).to.be.equal(market.supplyCap);
          }
        });

        it("Check borrow caps match data", async () => {
          for (const market of pool.markets) {
            const borrowCap = await comptroller.borrowCaps(market.address);
            expect(borrowCap.toString()).to.be.equal(market.borrowCap);
          }
        });
      });
    }
  });

  testVip("VIP-577 BNB Chain", await vip577(), {
    callbackAfterExecution: async txResponse => {
      const totals = ADDRESS_DATA.bscmainnet.totals!;
      const totalActionPausedEvents = totals.totalMintPaused + totals.totalBorrowPaused;

      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, REWARDS_DISTRIBUTOR_ABI],
        [
          "NewSupplyCap",
          "NewBorrowCap",
          "ActionPausedMarket",
          "NewCollateralFactor",
          "RewardTokenSupplySpeedUpdated",
          "RewardTokenBorrowSpeedUpdated",
        ],
        [
          totals.totalSupplyCap,
          totals.totalBorrowCap,
          totalActionPausedEvents,
          totals.totalCollateralFactor,
          totals.totalSupplySpeed,
          totals.totalBorrowSpeed,
        ],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const pool of bscPools) {
      describe(`${pool.name} Pool`, () => {
        let comptroller: Contract;

        before(async () => {
          comptroller = new ethers.Contract(pool.comptroller, COMPTROLLER_ABI, provider);
        });

        it("Check all markets have CF set to zero, LT preserved", async () => {
          for (const market of pool.markets) {
            const marketData = await comptroller.markets(market.address);
            expect(marketData.collateralFactorMantissa.toString()).to.be.equal("0");
            expect(marketData.liquidationThresholdMantissa.toString()).to.be.equal(market.liquidationThreshold);
          }
        });

        it("Check MINT is paused for markets", async () => {
          for (const market of pool.markets) {
            const mintPaused = await comptroller.actionPaused(market.address, Actions.MINT);
            expect(mintPaused).to.be.true;
          }
        });

        it("Check BORROW is paused for markets", async () => {
          for (const market of pool.markets) {
            const borrowPaused = await comptroller.actionPaused(market.address, Actions.BORROW);
            expect(borrowPaused).to.be.true;
          }
        });

        it("Check supply caps are zero for markets", async () => {
          for (const market of pool.markets) {
            const supplyCap = await comptroller.supplyCaps(market.address);
            expect(supplyCap).to.be.equal(0);
          }
        });

        it("Check borrow caps are zero for markets", async () => {
          for (const market of pool.markets) {
            const borrowCap = await comptroller.borrowCaps(market.address);
            expect(borrowCap).to.be.equal(0);
          }
        });
      });
    }

    it("Check reward speeds are set to zero for all markets", async () => {
      for (const pool of bscPools) {
        for (const rd of pool.rewardDistributor) {
          const rewardsDistributor = new ethers.Contract(rd.address, REWARDS_DISTRIBUTOR_ABI, provider);

          for (const market of pool.markets) {
            const supplySpeed = await rewardsDistributor.rewardTokenSupplySpeeds(market.address);
            const borrowSpeed = await rewardsDistributor.rewardTokenBorrowSpeeds(market.address);

            expect(supplySpeed).to.equal(0);
            expect(borrowSpeed).to.equal(0);
          }
        }
      }
    });
  });

  describe("Critical Operations After Market Pause", async () => {
    const USDT_MARKET = "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854"; // vUSDT_DeFi
    const USDT_TOKEN = "0x55d398326f99059fF775485246999027B3197955";

    let vToken: Contract;
    let usdtToken: Contract;

    before(async () => {
      vToken = new ethers.Contract(USDT_MARKET, VTOKEN_ABI, provider);
      usdtToken = new ethers.Contract(USDT_TOKEN, ERC20_ABI, provider);
    });

    it("Users can withdraw their supplied assets", async () => {
      // Find a user with vToken balance
      const filter = vToken.filters.Transfer(null, null);
      const events = await vToken.queryFilter(filter, -500, "latest");

      let supplier = null;
      for (const event of events.reverse()) {
        if (event.args?.to && event.args.to !== ethers.constants.AddressZero) {
          const balance = await vToken.balanceOf(event.args.to);
          if (balance.gt(0)) {
            await ethers.provider.send("hardhat_impersonateAccount", [event.args.to]);
            await ethers.provider.send("hardhat_setBalance", [event.args.to, "0x1000000000000000000"]);
            supplier = ethers.provider.getSigner(event.args.to);
            break;
          }
        }
      }

      if (supplier) {
        const initialBalance = await vToken.balanceOf(await supplier.getAddress());
        const redeemAmount = initialBalance.div(10);

        await vToken.connect(supplier).redeem(redeemAmount);

        const finalBalance = await vToken.balanceOf(await supplier.getAddress());
        expect(finalBalance).to.be.lt(initialBalance);
      }
    });

    it("Users can repay their borrows", async () => {
      // Find a user with borrow balance
      const filter = vToken.filters.Borrow();
      const events = await vToken.queryFilter(filter, -500, "latest");

      let borrower = null;
      for (const event of events.reverse()) {
        if (event.args?.borrower) {
          const borrowBalance = await vToken.borrowBalanceStored(event.args.borrower);
          if (borrowBalance.gt(0)) {
            await ethers.provider.send("hardhat_impersonateAccount", [event.args.borrower]);
            await ethers.provider.send("hardhat_setBalance", [event.args.borrower, "0x1000000000000000000"]);
            borrower = ethers.provider.getSigner(event.args.borrower);

            // Fund with USDT from a whale
            const usdtFilter = usdtToken.filters.Transfer();
            const usdtEvents = await usdtToken.queryFilter(usdtFilter, -200, "latest");
            for (const usdtEvent of usdtEvents.reverse()) {
              if (usdtEvent.args?.to) {
                const balance = await usdtToken.balanceOf(usdtEvent.args.to);
                if (balance.gt(ethers.utils.parseUnits("1000", 18))) {
                  await ethers.provider.send("hardhat_impersonateAccount", [usdtEvent.args.to]);
                  const whale = ethers.provider.getSigner(usdtEvent.args.to);
                  await usdtToken.connect(whale).transfer(event.args.borrower, ethers.utils.parseUnits("100", 18));
                  break;
                }
              }
            }
            break;
          }
        }
      }

      if (borrower) {
        const initialBorrow = await vToken.borrowBalanceStored(await borrower.getAddress());
        const repayAmount = ethers.utils.parseUnits("1", 18);

        await usdtToken.connect(borrower).approve(USDT_MARKET, repayAmount);
        await vToken.connect(borrower).repayBorrow(repayAmount);

        const finalBorrow = await vToken.borrowBalanceStored(await borrower.getAddress());
        expect(finalBorrow).to.be.lt(initialBorrow);
      }
    });
  });
});
