import oracleBscmainnetContracts from "@venusprotocol/oracle/deployments/bscmainnet_addresses.json";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { Result, parseUnits, toUtf8Bytes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { estimateProposeViaMultisig, forking, isSafe, reportTxGas, testVipById } from "src/vip-framework";
import ERC20_ABI from "src/vip-framework/abi/erc20.json";
import GOVERNOR_ABI from "src/vip-framework/abi/governorBravoDelegateAbi.json";
import RESILIENT_ORACLE_ABI from "src/vip-framework/abi/resilientOracle.json";
import { bypassStalePrices } from "src/vip-framework/oracleStaleness";

import HUB_ABI from "./abi/Hub.json";
import IRM_ABI from "./abi/JumpRateModelV2.json";
import REGISTRY_ABI from "./abi/PoolRegistry.json";
import RISK_ORACLE_ABI from "./abi/RiskOracle.json";
import COMPTROLLER_ABI from "./abi/SpokeComptroller.json";
import MANAGER_ABI from "./abi/SpokePoolManager.json";
import PROPOSER_ABI from "./abi/SpokePoolProposer.json";
import VTOKEN_ABI from "./abi/VToken.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

// Simulates the proposal SpokePoolManager submits for an Open Spoke Pool request, a new pool or new markets in a live
// pool: set the fork block and the request id, and run it before the team proposes the request.

const { bscmainnet } = NETWORK_ADDRESSES;

// Placeholders until the Open Spoke Pool contracts are deployed
const SPOKE_POOL_MANAGER = "0x1111111111111111111111111111111111111111";
// Holds the manager's `proposeRequest(uint256,string)` role
const VENUS_TEAM = "0x2222222222222222222222222222222222222222";
// Holds the Hubs' `reallocate` role
const HUB_OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";

const FORK_BLOCK = 116_847_000;
const REQUEST_ID = 1;

const title = `Open Spoke Pool request ${REQUEST_ID}`;

forking(FORK_BLOCK, async () => {
  const manager = new ethers.Contract(SPOKE_POOL_MANAGER, MANAGER_ABI, ethers.provider);
  const governor = new ethers.Contract(bscmainnet.GOVERNOR_PROXY, GOVERNOR_ABI, ethers.provider);
  const registry = new ethers.Contract(await manager.POOL_REGISTRY(), REGISTRY_ABI, ethers.provider);
  const oracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const request = await manager.getRequest(REQUEST_ID);
  const newPool = request.requestType === 0;
  // Nothing else proposes on the fork, so the manager's proposal takes the next id
  const proposalId = (await governor.proposalCount()).add(1);
  // A new pool's comptroller is deployed when proposed
  let comptroller = new ethers.Contract(request.comptroller, COMPTROLLER_ABI, ethers.provider);
  const poolMarkets: string[] = newPool ? [] : await comptroller.getAllMarkets();
  // The pool's liquidation incentive, which each new market has
  const liquidationIncentive = newPool
    ? request.pool.params.liquidationIncentive
    : await comptroller.liquidationIncentiveMantissa();
  // Set when the request is proposed
  let vTokens: Contract[];

  // The proposal executes after the vote's time warp and prices the request's assets and the pool's
  await bypassStalePrices([
    ...request.markets.map((market: Result) => market.asset),
    ...(await Promise.all(
      poolMarkets.map(vToken => new ethers.Contract(vToken, VTOKEN_ABI, ethers.provider).underlying()),
    )),
  ]);

  describe("Pre-proposal", () => {
    it("is a pool or markets request, pending and approved by its deployer", async () => {
      expect([0, 1]).to.include(request.requestType); // Pool, Markets
      expect(request.status).to.equal(1); // Pending
      expect(request.approved).to.equal(true);
    });

    if (newPool) {
      it("has a pool name and parameters the registry and comptroller accept", async () => {
        expect(toUtf8Bytes(request.pool.name).length).to.be.within(1, 100);
        expect(request.pool.params.closeFactor).to.be.within(parseUnits("0.05", 18), parseUnits("0.9", 18));
        expect(request.pool.params.liquidationIncentive).to.be.gte(parseUnits("1.05", 18));
      });
    }

    request.markets.forEach((market: Result) => {
      describe(market.symbol, () => {
        const asset = new ethers.Contract(market.asset, ERC20_ABI, ethers.provider);

        it("is priced, with one vToken per unit of the asset", async () => {
          expect(await oracle.getPrice(market.asset)).to.be.gt(0);
          expect(market.decimals).to.equal(8);
          expect(market.initialExchangeRate).to.equal(BigNumber.from(10).pow(18 + (await asset.decimals()) - 8));
        });

        it("has its seed held by the manager", async () => {
          // At least: the manager holds every open request's seeds
          expect(await asset.balanceOf(manager.address)).to.be.gte(market.seed);
        });

        if (market.isLoanMarket) {
          it("is funded by a Hub source of the asset that its Hub has registered and not paused", async () => {
            const source = new ethers.Contract(
              await manager.spokeSources(market.asset),
              YIELD_GROUP_ABI,
              ethers.provider,
            );
            const hub = new ethers.Contract(await source.hub(), HUB_ABI, ethers.provider);
            expect(await source.asset()).to.equal(market.asset);
            const config = await hub.yieldGroupConfig(source.address);
            expect(config.registered).to.equal(true);
            expect(config.paused).to.equal(false);
          });
        } else {
          it("has a collateral factor and liquidation threshold the comptroller accepts", async () => {
            expect(market.collateralFactor).to.be.lte(parseUnits("0.95", 18));
            expect(market.liquidationThreshold.mul(liquidationIncentive)).to.be.lt(parseUnits("1", 36));
          });
        }
      });
    });
  });

  describe("Proposal", () => {
    it("is submitted by the manager", async () => {
      const team = await initMainnetUser(VENUS_TEAM, parseUnits("1"));
      const gas = (await isSafe(VENUS_TEAM))
        ? await estimateProposeViaMultisig(
            manager.interface.encodeFunctionData("proposeRequest", [REQUEST_ID, title]),
            VENUS_TEAM,
            manager.address,
          )
        : await manager.connect(team).estimateGas.proposeRequest(REQUEST_ID, title);
      await reportTxGas(title, "proposeRequest", gas, { enforce: true, metric: "requiredGasLimit" });
      const { blockNumber } = await (await manager.connect(team).proposeRequest(REQUEST_ID, title)).wait();

      const proposed = await manager.getRequest(REQUEST_ID);
      expect(proposed.status).to.equal(2); // Proposed
      expect(proposed.proposalId).to.equal(proposalId);
      expect((await governor.proposals(proposalId)).proposer).to.equal(manager.address);

      const [{ args }] = await manager.queryFilter(manager.filters.RequestProposed(REQUEST_ID), blockNumber);
      comptroller = comptroller.attach(proposed.comptroller);
      vTokens = args?.vTokens.map((vToken: string) => new ethers.Contract(vToken, VTOKEN_ABI, ethers.provider));
    });

    it("settles the request and lists its markets, and nothing else", async () => {
      const expected = newPool
        ? [
            [comptroller.address, "acceptOwnership()"],
            [registry.address, "addPool(string,address,uint256,uint256,uint256)"],
          ]
        : [];
      expected.push([manager.address, "settleRequest(uint256)"]);
      for (const [i, market] of request.markets.entries()) {
        expected.push(
          [market.asset, "approve(address,uint256)"],
          [registry.address, "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))"],
          [vTokens[i].address, "transfer(address,uint256)"], // the burned share
          [vTokens[i].address, "transfer(address,uint256)"], // the treasury's share
          [vTokens[i].address, "setReduceReservesBlockDelta(uint256)"],
        );
        if (market.isLoanMarket) {
          expected.push(
            [comptroller.address, "setSupplyAllowlistEnabled(address,bool)"],
            [comptroller.address, "setAllowedSupplier(address,address,bool)"],
            [await manager.spokeSources(market.asset), "addResource(address,address)"],
          );
        }
      }
      const [targets, , signatures] = await governor.getActions(proposalId);
      expect(targets.map((target: string, i: number) => [target, signatures[i]])).to.deep.equal(expected);
    });
  });

  testVipById(title, proposalId, {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [MANAGER_ABI, REGISTRY_ABI],
        ["RequestSettled", "PoolActivated", "PoolRegistered", "MarketAdded"],
        [1, newPool ? 1 : 0, newPool ? 1 : 0, request.markets.length],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("settles the request", async () => {
      expect((await manager.getRequest(REQUEST_ID)).status).to.equal(4); // Settled
    });

    if (newPool) {
      it("makes the deployer's pool live in its tier, holding the tier's stake", async () => {
        const pool = await manager.getPool(comptroller.address);
        expect(pool.deployer).to.equal(request.deployer);
        expect(pool.status).to.equal(1); // Live
        expect(pool.tierId).to.equal(request.pool.tierId);
        expect(pool.lockedStake).to.equal(request.pool.stake);
      });

      it("registers the pool, owned by the Normal Timelock, with the requested parameters", async () => {
        const registered = await registry.getPoolByComptroller(comptroller.address);
        expect(registered.name).to.equal(request.pool.name);
        expect(registered.creator).to.equal(bscmainnet.NORMAL_TIMELOCK);
        expect(await comptroller.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
        expect(await comptroller.oracle()).to.equal(bscmainnet.RESILIENT_ORACLE);
        expect(await comptroller.deviationBoundedOracle()).to.equal(
          oracleBscmainnetContracts.addresses.DeviationBoundedOracle,
        );
        expect(await comptroller.closeFactorMantissa()).to.equal(request.pool.params.closeFactor);
        expect(await comptroller.liquidationIncentiveMantissa()).to.equal(request.pool.params.liquidationIncentive);
        expect(await comptroller.minLiquidatableCollateral()).to.equal(request.pool.params.minLiquidatableCollateral);
      });
    }

    request.markets.forEach((market: Result, i: number) => {
      describe(market.symbol, () => {
        it("is listed with the requested parameters, owned by the Normal Timelock", async () => {
          const vToken = vTokens[i];
          expect(await registry.getVTokenForAsset(comptroller.address, market.asset)).to.equal(vToken.address);
          const listing = await comptroller.markets(vToken.address);
          expect(listing.isListed).to.equal(true);
          expect(listing.collateralFactorMantissa).to.equal(market.collateralFactor);
          expect(listing.liquidationThresholdMantissa).to.equal(market.liquidationThreshold);
          expect(await comptroller.supplyCaps(vToken.address)).to.equal(market.supplyCap);
          expect(await comptroller.borrowCaps(vToken.address)).to.equal(market.borrowCap);
          expect(await vToken.name()).to.equal(market.name);
          expect(await vToken.symbol()).to.equal(market.symbol);
          expect(await vToken.decimals()).to.equal(market.decimals);
          expect(await vToken.interestRateModel()).to.equal(market.interestRateModel);
          // A model built for another block time would mis-price interest
          const interestRateModel = new ethers.Contract(market.interestRateModel, IRM_ABI, ethers.provider);
          expect(await interestRateModel.blocksOrSecondsPerYear()).to.equal(await vToken.blocksOrSecondsPerYear());
          expect(await vToken.reserveFactorMantissa()).to.equal(market.reserveFactor);
          expect(await vToken.reduceReservesBlockDelta()).to.equal(market.reduceReservesBlockDelta);
          // Liquidators keep the incentive less the protocol's seize share, so it must leave them something
          expect(liquidationIncentive.sub(parseUnits("1", 18))).to.be.gt(await vToken.protocolSeizeShareMantissa());
          expect(await vToken.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
        });

        it("holds the seed, with the seed burn percent of its vTokens burned and the rest at the treasury", async () => {
          const vToken = vTokens[i];
          const minted = market.seed.mul(parseUnits("1", 18)).div(market.initialExchangeRate);
          const burned = minted.mul(market.seedBurnPercent).div(parseUnits("1", 18));
          expect(await vToken.getCash()).to.equal(market.seed);
          expect(await vToken.totalSupply()).to.equal(minted);
          expect(await vToken.balanceOf(ethers.constants.AddressZero)).to.equal(burned);
          expect(await vToken.balanceOf(bscmainnet.VTREASURY)).to.equal(minted.sub(burned));
        });

        if (market.isLoanMarket) {
          it("lets only the asset's Hub source supply, and is a resource of the source", async () => {
            const vToken = vTokens[i];
            const source = new ethers.Contract(
              await manager.spokeSources(market.asset),
              YIELD_GROUP_ABI,
              ethers.provider,
            );
            expect(await comptroller.isSupplyAllowlistEnabled(vToken.address)).to.equal(true);
            expect(await comptroller.isAllowedSupplier(vToken.address, source.address)).to.equal(true);
            const resource = await source.resourceConfig(vToken.address);
            expect(resource.registered).to.equal(true);
            expect(resource.paused).to.equal(false);
            expect(resource.adapter).to.equal(
              await new ethers.Contract(await manager.proposer(), PROPOSER_ABI, ethers.provider).SPOKE_ADAPTER(),
            );
            const stranger = await initMainnetUser(ethers.Wallet.createRandom().address, parseUnits("1"));
            await expect(vToken.connect(stranger).mint(1))
              .to.be.revertedWithCustomError(comptroller, "SupplyNotAllowed")
              .withArgs(vToken.address, stranger.address);
          });
        } else {
          it("cannot be borrowed", async () => {
            const stranger = await initMainnetUser(ethers.Wallet.createRandom().address, parseUnits("1"));
            await expect(vTokens[i].connect(stranger).borrow(1))
              .to.be.revertedWithCustomError(comptroller, "BorrowCapExceeded")
              .withArgs(vTokens[i].address, 0);
          });
        }
      });
    });
  });

  describe("Post-VIP functional", () => {
    it("lets the deployer publish supply caps for the markets, and nobody else", async () => {
      const deployer = await initMainnetUser(request.deployer, parseUnits("1"));
      const stranger = await initMainnetUser(ethers.Wallet.createRandom().address, parseUnits("1"));
      const riskOracle = new ethers.Contract(await manager.RISK_ORACLE(), RISK_ORACLE_ABI, ethers.provider);
      for (const [i, market] of request.markets.entries()) {
        const args = [comptroller.address, vTokens[i].address, market.supplyCap];
        await expect(manager.connect(stranger).updateSupplyCap(...args))
          .to.be.revertedWithCustomError(manager, "NotDeployer")
          .withArgs(stranger.address);
        await manager.connect(deployer).updateSupplyCap(...args);
        const update = await riskOracle.getUpdateById(
          await riskOracle.getLatestUpdateIdByTypeAndMarket("supplyCap", vTokens[i].address),
        );
        expect(update.publisher).to.equal(manager.address);
        expect(update.newValue).to.equal(ethers.utils.defaultAbiCoder.encode(["uint256"], [market.supplyCap]));
      }
    });

    request.markets.forEach((market: Result, i: number) => {
      if (market.isLoanMarket) {
        it(`lets the Hub operator fund ${market.symbol} from another source`, async () => {
          const vToken = vTokens[i];
          const source = await manager.spokeSources(market.asset);
          const hub = new ethers.Contract(
            await new ethers.Contract(source, YIELD_GROUP_ABI, ethers.provider).hub(),
            HUB_ABI,
            await initMainnetUser(HUB_OPERATOR, parseUnits("1")),
          );
          const funder = (await hub.outerDepositQueue()).find((group: string) => group !== source);
          const amount = market.seed.mul(10);
          const cash = await vToken.getCash();
          await hub.reallocate(
            [{ yieldGroup: funder, resource: ethers.constants.AddressZero, amount }],
            [{ yieldGroup: source, resource: vToken.address, amount }],
          );
          expect(await vToken.getCash()).to.equal(cash.add(amount));
          expect(await vToken.balanceOf(source)).to.equal(
            amount.mul(parseUnits("1", 18)).div(market.initialExchangeRate),
          );
        });
      }
    });

    it("lets a new account supply collateral, borrow a loan market's liquidity and repay", async function () {
      const collateral = vTokens[request.markets.findIndex((m: Result) => !m.isLoanMarket && m.collateralFactor.gt(0))];
      let loan: Contract | undefined;
      for (const vToken of [...vTokens.map(v => v.address), ...poolMarkets]) {
        if (!loan && (await manager.isLoanMarket(vToken)))
          loan = new ethers.Contract(vToken, VTOKEN_ABI, ethers.provider);
      }
      if (!collateral || !loan) this.skip();

      // The account takes the collateral asset from the treasury's seed vTokens, then supplies it
      const account = await initMainnetUser(ethers.Wallet.createRandom().address, parseUnits("1"));
      const treasury = await initMainnetUser(bscmainnet.VTREASURY, parseUnits("1"));
      const seedVTokens = await collateral.balanceOf(treasury.address);
      await collateral.connect(treasury).transfer(account.address, seedVTokens);
      const supplied = seedVTokens.mul(await collateral.exchangeRateStored()).div(parseUnits("1", 18));
      await collateral.connect(account).redeem(seedVTokens);
      const collateralAsset = new ethers.Contract(await collateral.underlying(), ERC20_ABI, account);
      expect(await collateralAsset.balanceOf(account.address)).to.equal(supplied);
      const minted = supplied.mul(parseUnits("1", 18)).div(await collateral.exchangeRateStored());
      await collateralAsset.approve(collateral.address, supplied);
      await collateral.connect(account).mint(supplied);
      expect(await collateralAsset.balanceOf(account.address)).to.equal(0);
      expect(await collateral.balanceOf(account.address)).to.equal(minted);
      await comptroller.connect(account).enterMarkets([collateral.address]);

      // Half of its borrowing power, in the loan asset
      const [, liquidity] = await comptroller.getAccountLiquidity(account.address);
      const borrowed = liquidity
        .div(2)
        .mul(parseUnits("1", 18))
        .div(await oracle.getUnderlyingPrice(loan.address));
      const loanAsset = new ethers.Contract(await loan.underlying(), ERC20_ABI, account);
      await loan.connect(account).borrow(borrowed);
      expect(await loanAsset.balanceOf(account.address)).to.equal(borrowed);
      expect(await loan.borrowBalanceStored(account.address)).to.equal(borrowed);

      await loanAsset.approve(loan.address, borrowed);
      await loan.connect(account).repayBorrow(borrowed);
      expect(await loanAsset.balanceOf(account.address)).to.equal(0);
    });
  });
});
