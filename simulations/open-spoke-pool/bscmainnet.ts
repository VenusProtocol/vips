import { time } from "@nomicfoundation/hardhat-network-helpers";
import oracleBscmainnetContracts from "@venusprotocol/oracle/deployments/bscmainnet_addresses.json";
import protocolReserveBscmainnetContracts from "@venusprotocol/protocol-reserve/deployments/bscmainnet_addresses.json";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { FunctionFragment, Result, defaultAbiCoder, getAddress, hexConcat, id, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { Proposal, ProposalType } from "src/types";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import ERC20_ABI from "src/vip-framework/abi/erc20.json";
import GOVERNOR_ABI from "src/vip-framework/abi/governorBravoDelegateAbi.json";
import { bypassStalePrices, pinOracleFeedPrice } from "src/vip-framework/oracleStaleness";

import AGGREGATOR_ABI from "./abi/AggregatorV3.json";
import BOND_ACCOUNT_ABI from "./abi/BondAccount.json";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import HUB_ABI from "./abi/Hub.json";
import IRM_ABI from "./abi/JumpRateModelV2.json";
import REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import RISK_ORACLE_ABI from "./abi/RiskOracle.json";
import BOND_MANAGER_ABI from "./abi/SpokeBondManager.json";
import COMPTROLLER_ABI from "./abi/SpokeComptroller.json";
import MANAGER_ABI from "./abi/SpokePoolManager.json";
import POLICY_REGISTRY_ABI from "./abi/SpokePoolPolicyRegistry.json";
import BUILDER_ABI from "./abi/SpokePoolProposalBuilder.json";
import VTOKEN_ABI from "./abi/VToken.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

// Simulates the VIP SpokePoolManager built for an Open Spoke Pool request: a new pool, new markets in a live pool, or
// a tier upgrade. Run it after the build and before the proposer sends the stored payload to GovernorBravo. Set the
// request id and the block of its build below. Forking at the build reads the prices the build set the loan market
// caps at.

const { bscmainnet } = NETWORK_ADDRESSES;

// Placeholders until the Open Spoke Pool contracts are deployed
const SPOKE_POOL_MANAGER = "0x1111111111111111111111111111111111111111";
// Holds the manager's Venus team roles: building, rejecting and closing
const SPOKE_POOL_OPERATOR = "0x2222222222222222222222222222222222222222";
// Holds the Hubs' `reallocate` role
const HUB_OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";

const FORK_BLOCK = 116_847_000;
const REQUEST_ID = 1;

const title = `Open Spoke Pool request ${REQUEST_ID}`;

// Returns the VIP a stored GovernorBravo `propose` payload holds, as the Proposal testVip takes
const getProposal = (payload: string): Proposal => {
  const decoded = new ethers.utils.Interface(GOVERNOR_ABI).decodeFunctionData("propose", payload);
  return {
    targets: decoded.targets,
    values: decoded[1], // `values` is also the name of a Result's own method
    signatures: decoded.signatures,
    params: decoded.signatures.map((signature: string, i: number) =>
      defaultAbiCoder.decode(FunctionFragment.from(signature).inputs, decoded.calldatas[i]),
    ),
    meta: {
      version: "v2",
      title,
      description: decoded.description,
      forDescription: "I agree that Venus Protocol should proceed with this proposal",
      againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
      abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
    },
    type: decoded.proposalType,
  };
};

forking(FORK_BLOCK, async () => {
  const { provider } = ethers;
  const [stranger, borrower] = await ethers.getSigners();

  // ── Contracts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  const manager = new ethers.Contract(SPOKE_POOL_MANAGER, MANAGER_ABI, provider);
  const governor = new ethers.Contract(bscmainnet.GOVERNOR_PROXY, GOVERNOR_ABI, provider);
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const builder = new ethers.Contract(await manager.proposalBuilder(), BUILDER_ABI, provider);
  const policyRegistry = new ethers.Contract(await manager.POLICY_REGISTRY(), POLICY_REGISTRY_ABI, provider);
  const bondManager = new ethers.Contract(await manager.bondManager(), BOND_MANAGER_ABI, provider);
  const registry = new ethers.Contract(await builder.POOL_REGISTRY(), REGISTRY_ABI, provider);

  // ── The request ────────────────────────────────────────────────────────────────────────────────────────────────────

  const request = await manager.getRequest(REQUEST_ID);
  const requestCount = (await manager.requestCount()).toNumber();
  const newPool = request.requestType === 0; // Pool
  const tierRequest = request.requestType === 2; // TierUpgrade

  // A new pool's comptroller is deployed at the build
  const comptroller = new ethers.Contract(request.comptroller, COMPTROLLER_ABI, provider);
  const poolMarkets: string[] = await comptroller.getAllMarkets();
  // The listed markets the Hub supplies, which a tier VIP caps
  const poolLoanMarkets: string[] = [];
  for (const vToken of poolMarkets) {
    if ((await comptroller.isMarketListed(vToken)) && (await comptroller.isSupplyAllowlistEnabled(vToken))) {
      poolLoanMarkets.push(vToken);
    }
  }
  const poolName = newPool
    ? `Spoke Pool ${REQUEST_ID}`
    : (await registry.getPoolByComptroller(comptroller.address)).name;
  const poolParams = await policyRegistry.poolParams();
  const marketParams = await policyRegistry.marketParams();

  // The new markets, collateral first, as the build deployed and the VIP lists them
  const collateralCount = request.collateralMarkets.length;
  const markets: Result[] = [...request.collateralMarkets, ...request.loanMarkets];
  const seeds: BigNumber[] = await Promise.all(markets.map(market => manager.requestSeeds(REQUEST_ID, market.asset)));
  // The build lists an asset under its registry symbol, else its own
  const symbols: string[] = await Promise.all(
    markets.map(
      async market =>
        (await policyRegistry.assetSymbols(market.asset)) ||
        new ethers.Contract(market.asset, ERC20_ABI, provider).symbol(),
    ),
  );
  const newlyPriced: Result[] = [];
  for (const market of request.collateralMarkets) {
    if ((await resilientOracle.getTokenConfig(market.asset)).asset === ethers.constants.AddressZero) {
      newlyPriced.push(market);
    }
  }
  // Each newly priced asset's feed answer at the build, scaled as its oracle scales it: to 18 decimals, then to 36 less
  // the asset's
  const feedPrices: BigNumber[] = await Promise.all(
    newlyPriced.map(async ({ asset, oracleConfig }) => {
      const feed = new ethers.Contract(oracleConfig.feed, AGGREGATOR_ABI, provider);
      const { answer } = await feed.latestRoundData();
      const decimals = (await feed.decimals()) + (await new ethers.Contract(asset, ERC20_ABI, provider).decimals());
      return answer.mul(BigNumber.from(10).pow(36 - decimals));
    }),
  );
  // The manager escrows a pool request's bond until the VIP settles the request
  const escrowBefore: BigNumber = newPool
    ? await new ethers.Contract(request.bondAsset, ERC20_ABI, provider).balanceOf(manager.address)
    : BigNumber.from(0);

  // ── The stored VIP ─────────────────────────────────────────────────────────────────────────────────────────────────

  // A GovernorBravo `propose` call, which the proposer sends as is
  const payload: string = await manager.requestProposals(REQUEST_ID);
  const actionsOf = (proposeCall: string) => {
    const { targets, signatures, calldatas } = governor.interface.decodeFunctionData("propose", proposeCall);
    return (signatures as string[]).map((signature, i) => ({
      target: targets[i] as string,
      signature,
      data: hexConcat([id(signature).slice(0, 10), calldatas[i]]),
    }));
  };
  const actions = actionsOf(payload);
  // The vToken each `addMarket` lists, which the build deployed
  const vTokens = actions
    .filter(({ signature }) => signature.startsWith("addMarket("))
    .map(({ data }) => registry.interface.decodeFunctionData("addMarket", data)[0].vToken)
    .map(vToken => new ethers.Contract(vToken, VTOKEN_ABI, provider));
  // testVip proposes it, runs each action as the Normal Timelock, then votes, queues and executes it
  const proposal = getProposal(payload);

  // ── Helpers ────────────────────────────────────────────────────────────────────────────────────────────────────────

  // Runs a payload's actions as the Normal Timelock, as its VIP would, naming the action that fails
  const runAsTimelock = async (proposeCall: string) => {
    const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("1"));
    for (const [i, { target, signature, data }] of actionsOf(proposeCall).entries()) {
      await timelock.sendTransaction({ to: target, data }).catch(error => {
        throw new Error(`Action ${i}, ${signature} on ${target}, reverts: ${error.message}`);
      });
    }
  };

  const bondAccount = async () =>
    new ethers.Contract(await bondManager.bondAccounts(comptroller.address), BOND_ACCOUNT_ABI, provider);

  // A loan market's supply, borrow and Hub caps all equal the tier's USD cap in its asset, at the fork's (the build's)
  // price
  const expectLoanCaps = async (vToken: string) => {
    const asset = await new ethers.Contract(vToken, VTOKEN_ABI, provider).underlying();
    const usdCap = await policyRegistry.getLoanSupplyCapUsd(request.tierId, asset);
    const cap = usdCap.mul(parseUnits("1", 18)).div(await resilientOracle.getPrice(asset));
    expect(await comptroller.supplyCaps(vToken)).to.equal(cap);
    expect(await comptroller.borrowCaps(vToken)).to.equal(cap);
    const { yieldGroup } = await policyRegistry.getLoanAssetConfig(asset);
    expect(await new ethers.Contract(yieldGroup, YIELD_GROUP_ABI, provider).resourceCap(vToken)).to.equal(cap);
  };

  before(async () => {
    // The VIP executes after the vote's time warp and prices the new collateral at its reviewed feed
    for (const { asset, oracleConfig } of newlyPriced) {
      await pinOracleFeedPrice(oracleConfig.oracle, {
        asset,
        feed: oracleConfig.feed,
        maxStalePeriod: oracleConfig.maxStalePeriod.toNumber(),
      });
    }
    const pricedAssets = markets.map(market => market.asset).filter(asset => !newlyPriced.some(m => m.asset === asset));
    const poolAssets = await Promise.all(
      poolMarkets.map(vToken => new ethers.Contract(vToken, VTOKEN_ABI, provider).underlying()),
    );
    // The deployer's supply cap update checks the bond's value
    const bondAsset = newPool ? request.bondAsset : await (await bondAccount()).asset();
    await bypassStalePrices([...pricedAssets, ...poolAssets, bondAsset]);
  });

  // ── Pre-VIP behavior ───────────────────────────────────────────────────────────────────────────────────────────────

  describe("Pre-VIP behavior", () => {
    describe("Request", () => {
      it("is built, with a stored proposal", async () => {
        expect(request.status).to.equal(2); // Built
        expect(actions.length).to.be.gt(0);
      });

      if (!newPool) {
        it("targets a live pool whose deployer isn't paused", async () => {
          const pool = await manager.getPool(comptroller.address);
          expect(pool.status).to.equal(1); // Live
          expect(pool.deployerPaused).to.equal(false);
        });
      }
    });

    describe("Policy", () => {
      it("sets pool and tier limits the comptroller accepts", async () => {
        expect(poolParams.closeFactor).to.be.within(parseUnits("0.05", 18), parseUnits("0.9", 18));
        expect(poolParams.liquidationIncentive).to.be.gte(parseUnits("1.05", 18));
        const { limits } = await policyRegistry.getTier(request.tierId);
        expect(limits.maxCollateralFactor).to.be.lte(parseUnits("0.95", 18));
        // Else the comptroller rejects a deployer's update to the tier's maximum threshold
        const incentive = newPool ? poolParams.liquidationIncentive : await comptroller.liquidationIncentiveMantissa();
        expect(limits.maxLiquidationThreshold.mul(incentive)).to.be.lt(parseUnits("1", 36));
      });
    });

    describe("Other proposals", () => {
      it("none has priced the new collateral assets yet", async () => {
        // The build added a config for each new collateral asset without one; this VIP would overwrite a config another
        // VIP set since
        for (const { target, data } of actions) {
          if (target !== resilientOracle.address) continue;
          const [configs] = resilientOracle.interface.decodeFunctionData("setTokenConfigs", data);
          for (const { asset } of configs) {
            expect((await resilientOracle.getTokenConfig(asset)).asset).to.equal(ethers.constants.AddressZero);
          }
        }
      });

      it("none touches the same assets, pool or markets", async () => {
        // Another VIP on these would overwrite this one's oracle config, wind the pool down without the new markets,
        // or move a Hub cap the tier VIP raises or lowers
        const watched = [...newlyPriced.map(market => market.asset), comptroller.address, ...poolMarkets].map(address =>
          address.slice(2).toLowerCase(),
        );
        // Each live proposal's and other built request's targets and calldata, lowercased
        const otherVipCalldata = new Map<string, string>();
        const proposalCount = (await governor.proposalCount()).toNumber();
        for (let id = proposalCount; id > proposalCount - 10; id--) {
          if (![0, 1, 4, 5].includes(await governor.state(id))) continue; // Pending, Active, Succeeded, Queued
          const [targets, , , calldatas] = await governor.getActions(id);
          otherVipCalldata.set(`proposal ${id}`, [...targets, ...calldatas].join("").toLowerCase());
        }
        for (let requestId = 1; requestId <= requestCount; requestId++) {
          if (requestId === REQUEST_ID || (await manager.getRequest(requestId)).status !== 2) continue; // Built
          const { targets, calldatas } = governor.interface.decodeFunctionData(
            "propose",
            await manager.requestProposals(requestId),
          );
          otherVipCalldata.set(`request ${requestId}`, [...targets, ...calldatas].join("").toLowerCase());
        }
        const conflicts = [...otherVipCalldata]
          .filter(([, data]) => watched.some(address => data.includes(address)))
          .map(([name]) => name);
        expect(conflicts).to.deep.equal([]);
      });
    });
  });

  // ── Proposal ───────────────────────────────────────────────────────────────────────────────────────────────────────

  describe("Proposal", () => {
    it("is a Normal proposal that sends no BNB", async () => {
      expect(proposal.type).to.equal(ProposalType.REGULAR);
      expect(proposal.values.every(value => BigNumber.from(value).isZero())).to.equal(true);
    });

    if (tierRequest) {
      it("contains exactly the tier upgrade actions, in order", async () => {
        const expected = [[manager.address, "settleRequest(uint256)"]];
        for (const vToken of poolLoanMarkets) {
          const asset = await new ethers.Contract(vToken, VTOKEN_ABI, provider).underlying();
          const usdCap = await policyRegistry.getLoanSupplyCapUsd(request.tierId, asset);
          const cap = usdCap.mul(parseUnits("1", 18)).div(await resilientOracle.getPrice(asset));
          const { yieldGroup } = await policyRegistry.getLoanAssetConfig(asset);
          const resourceCap = await new ethers.Contract(yieldGroup, YIELD_GROUP_ABI, provider).resourceCap(vToken);
          // Zero leaves a resource uncapped, and an unchanged cap is skipped
          if (resourceCap.isZero() || cap.lt(resourceCap)) {
            expected.push([yieldGroup, "lowerResourceCap(address,uint256)"]);
          } else if (cap.gt(resourceCap)) {
            expected.push([yieldGroup, "raiseResourceCap(address,uint256)"]);
          }
        }
        if (poolLoanMarkets.length) {
          expected.push(
            [comptroller.address, "setMarketSupplyCaps(address[],uint256[])"],
            [comptroller.address, "setMarketBorrowCaps(address[],uint256[])"],
          );
        }
        expect(actions.map(({ target, signature }) => [target, signature])).to.deep.equal(
          expected.map(([target, signature]) => [getAddress(target), signature]),
        );
      });
    } else {
      it("contains exactly the listing actions, in order", async () => {
        const expected = newPool
          ? [
              [comptroller.address, "acceptOwnership()"],
              [registry.address, "addPool(string,address,uint256,uint256,uint256)"],
            ]
          : [];
        expected.push([manager.address, "settleRequest(uint256)"]);
        for (const oracle of await policyRegistry.getSupportedOracles()) {
          if (newlyPriced.some(market => market.oracleConfig.oracle === oracle)) {
            expected.push([oracle, "setTokenConfigs((address,address,uint256)[])"]);
          }
        }
        if (newlyPriced.length) {
          expected.push([resilientOracle.address, "setTokenConfigs((address,address[3],bool[3],bool)[])"]);
        }
        for (const [i, market] of markets.entries()) {
          expected.push(
            [market.asset, "approve(address,uint256)"],
            [registry.address, "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))"],
            [vTokens[i].address, "transfer(address,uint256)"], // burns the seed's vTokens
            [vTokens[i].address, "setReduceReservesBlockDelta(uint256)"],
          );
          if (i >= collateralCount) {
            const { yieldGroup } = await policyRegistry.getLoanAssetConfig(market.asset);
            expected.push(
              [comptroller.address, "setSupplyAllowlistEnabled(address,bool)"],
              [comptroller.address, "setAllowedSupplier(address,address,bool)"],
              [yieldGroup, "addResource(address,address)"],
              [yieldGroup, "lowerResourceCap(address,uint256)"],
            );
          }
        }
        expect(actions.map(({ target, signature }) => [target, signature])).to.deep.equal(
          expected.map(([target, signature]) => [getAddress(target), signature]),
        );
      });
    }
  });

  // ── Propose, vote, queue and execute ───────────────────────────────────────────────────────────────────────────────

  testVip(title, proposal, {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [MANAGER_ABI, REGISTRY_ABI],
        ["RequestSettled", "PoolActivated", "PoolTierUpgraded", "PoolRegistered", "MarketAdded"],
        [1, newPool ? 1 : 0, tierRequest ? 1 : 0, newPool ? 1 : 0, markets.length],
      );
    },
  });

  // ── Post-VIP behavior ──────────────────────────────────────────────────────────────────────────────────────────────

  describe("Post-VIP behavior", () => {
    describe("Request", () => {
      it("is settled, with no seeds left in escrow", async () => {
        expect((await manager.getRequest(REQUEST_ID)).status).to.equal(4); // Settled
        for (const { asset } of markets) expect(await manager.requestSeeds(REQUEST_ID, asset)).to.equal(0);
      });
    });

    describe("Pool", () => {
      if (newPool) {
        it("is live on the requested tier, run by the deployer", async () => {
          const pool = await manager.getPool(comptroller.address);
          expect(pool.deployer).to.equal(request.deployer);
          expect(pool.status).to.equal(1); // Live
          expect(pool.tierId).to.equal(request.tierId);
          expect(await manager.activePools(request.deployer)).to.equal(comptroller.address);
        });

        it("is registered and owned by the Normal Timelock", async () => {
          const registered = await registry.getPoolByComptroller(comptroller.address);
          expect(registered.name).to.equal(poolName);
          expect(registered.creator).to.equal(bscmainnet.NORMAL_TIMELOCK);
          expect(await comptroller.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
          expect(await comptroller.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
          expect(await comptroller.poolRegistry()).to.equal(registry.address);
        });

        it("uses the protocol's oracles and the policy's pool parameters", async () => {
          expect(await comptroller.oracle()).to.equal(bscmainnet.RESILIENT_ORACLE);
          expect(await comptroller.deviationBoundedOracle()).to.equal(
            oracleBscmainnetContracts.addresses.DeviationBoundedOracle,
          );
          expect(await comptroller.closeFactorMantissa()).to.equal(poolParams.closeFactor);
          expect(await comptroller.liquidationIncentiveMantissa()).to.equal(poolParams.liquidationIncentive);
          expect(await comptroller.minLiquidatableCollateral()).to.equal(poolParams.minLiquidatableCollateral);
        });
      }

      if (tierRequest) {
        it("moves to the new tier, with its loan market caps updated", async () => {
          expect((await manager.getPool(comptroller.address)).tierId).to.equal(request.tierId);
          for (const vToken of poolLoanMarkets) await expectLoanCaps(vToken);
        });
      }

      it("gains exactly the new markets, within the market limit", async () => {
        const allMarkets: string[] = await comptroller.getAllMarkets();
        expect(allMarkets).to.deep.equal([...poolMarkets, ...vTokens.map(vToken => vToken.address)]);
        const listed = await Promise.all(allMarkets.map(vToken => comptroller.isMarketListed(vToken)));
        expect(listed.filter(Boolean).length).to.be.lte(await builder.MAX_POOL_MARKETS());
      });
    });

    describe("Bond", () => {
      it("belongs to the deployer and covers the tier's required bond", async () => {
        const bond = await bondAccount();
        expect(await bondManager.isBondAccount(bond.address)).to.equal(true);
        expect(await bond.BOND_MANAGER()).to.equal(bondManager.address);
        expect(await bond.bondHolder()).to.equal(request.deployer);
        expect(await bond.released()).to.equal(false);
        // Else the deployer can request neither new markets nor a tier
        expect(await manager.getBondValue(comptroller.address)).to.be.gte(
          await policyRegistry.getRequiredBondUsd(request.tierId, await bond.asset()),
        );
      });

      if (newPool) {
        it("holds the deployer's escrowed bond in the configured source", async () => {
          const bond = await bondAccount();
          const { source } = await bondManager.assetConfigs(request.bondAsset);
          expect(await bond.asset()).to.equal(request.bondAsset);
          expect(await bond.source()).to.equal(source);
          // A Hub bond's share rounding takes at most a wei while its Hub charges no exit fee
          expect(request.bondAmount.sub(await bond.currentBondAmount())).to.be.within(0, 1);
          // The settlement pays the escrowed bond to the account, and a seed in the same asset to the Normal Timelock
          const seedInBondAsset = seeds[markets.findIndex(market => market.asset === request.bondAsset)] ?? 0;
          const asset = new ethers.Contract(request.bondAsset, ERC20_ABI, provider);
          expect(escrowBefore.sub(await asset.balanceOf(manager.address))).to.equal(
            request.bondAmount.add(seedInBondAsset),
          );
        });
      }
    });

    markets.forEach((market, i) => {
      const isLoanMarket = i >= collateralCount;

      describe(`${symbols[i]} market`, () => {
        it("is listed in the pool for its asset, with no action paused", async () => {
          const vToken = vTokens[i];
          expect(await registry.getVTokenForAsset(comptroller.address, market.asset)).to.equal(vToken.address);
          expect((await comptroller.markets(vToken.address)).isListed).to.equal(true);
          expect(await vToken.underlying()).to.equal(market.asset);
          expect(await vToken.comptroller()).to.equal(comptroller.address);
          expect(await vToken.name()).to.equal(`Venus ${symbols[i]} (${poolName})`);
          expect(await vToken.symbol()).to.equal(`v${symbols[i]}_${poolName.replace(/ /g, "")}`);
          expect(await vToken.decimals()).to.equal(8);
          // MINT through EXIT_MARKET
          for (let action = 0; action <= 8; action++) {
            expect(await comptroller.actionPaused(vToken.address, action)).to.equal(false);
          }
        });

        it("has the requested risk parameters and interest rate model", async () => {
          const vToken = vTokens[i];
          const listing = await comptroller.markets(vToken.address);
          expect(listing.collateralFactorMantissa).to.equal(isLoanMarket ? 0 : market.collateralFactor);
          expect(listing.liquidationThresholdMantissa).to.equal(isLoanMarket ? 0 : market.liquidationThreshold);
          const interestRateModel = isLoanMarket ? market.interestRateModel : marketParams.collateralInterestRateModel;
          expect(await vToken.interestRateModel()).to.equal(interestRateModel);
          // A model built for another block time would mis-price interest
          expect(await new ethers.Contract(interestRateModel, IRM_ABI, provider).blocksOrSecondsPerYear()).to.equal(
            await vToken.blocksOrSecondsPerYear(),
          );
          expect(await vToken.reserveFactorMantissa()).to.equal(marketParams.reserveFactor);
          expect(await vToken.reduceReservesBlockDelta()).to.equal(marketParams.reduceReservesBlockDelta);
          // Liquidators keep the incentive less the protocol's seize share, so it must leave them something
          const incentive = await comptroller.liquidationIncentiveMantissa();
          expect(incentive.sub(parseUnits("1", 18))).to.be.gt(await vToken.protocolSeizeShareMantissa());
        });

        it("is owned by the Normal Timelock and uses the protocol's ACM, Shortfall and PSR", async () => {
          const vToken = vTokens[i];
          expect(await vToken.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
          expect(await vToken.pendingOwner()).to.equal(ethers.constants.AddressZero);
          expect(await vToken.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
          expect(await vToken.shortfall()).to.equal(await builder.SHORTFALL());
          expect(await vToken.protocolShareReserve()).to.equal(
            protocolReserveBscmainnetContracts.addresses.ProtocolShareReserve,
          );
        });

        it("holds the seed, with the seed's vTokens burned", async () => {
          const vToken = vTokens[i];
          const asset = new ethers.Contract(market.asset, ERC20_ABI, provider);
          // The seed mints at the initial exchange rate: one 8-decimal vToken per whole token of the asset
          const initialExchangeRate = BigNumber.from(10).pow(18 + (await asset.decimals()) - 8);
          const minted = seeds[i].mul(parseUnits("1", 18)).div(initialExchangeRate);
          expect(await vToken.getCash()).to.equal(seeds[i]);
          expect(await vToken.totalSupply()).to.equal(minted);
          expect(await vToken.balanceOf(ethers.constants.AddressZero)).to.equal(minted);
          expect(await vToken.balanceOf(bscmainnet.NORMAL_TIMELOCK)).to.equal(0);
          expect(await asset.allowance(bscmainnet.NORMAL_TIMELOCK, registry.address)).to.equal(0);
        });

        if (newlyPriced.includes(market)) {
          it("is priced by the reviewed feed, at the feed's price", async () => {
            const { oracleConfig } = market;
            const config = await resilientOracle.getTokenConfig(market.asset);
            expect([...config.oracles]).to.deep.equal([
              oracleConfig.oracle,
              ethers.constants.AddressZero,
              ethers.constants.AddressZero,
            ]);
            expect([...config.enableFlagsForOracles]).to.deep.equal([true, false, false]);
            expect(config.cachingEnabled).to.equal(false);
            const feed = await new ethers.Contract(oracleConfig.oracle, CHAINLINK_ORACLE_ABI, provider).tokenConfigs(
              market.asset,
            );
            expect(feed.feed).to.equal(oracleConfig.feed);
            expect(feed.maxStalePeriod).to.equal(oracleConfig.maxStalePeriod);

            // Give or take 1%, for a feed whose answer moves with time across the vote
            const feedPrice = feedPrices[newlyPriced.indexOf(market)];
            expect(await resilientOracle.getPrice(market.asset)).to.be.closeTo(feedPrice, feedPrice.div(100));
          });
        }

        if (isLoanMarket) {
          it("can be supplied only by its Hub, with caps from the tier", async () => {
            const vToken = vTokens[i];
            const { yieldGroup } = await policyRegistry.getLoanAssetConfig(market.asset);
            expect(await comptroller.isSupplyAllowlistEnabled(vToken.address)).to.equal(true);
            expect(await comptroller.isAllowedSupplier(vToken.address, yieldGroup)).to.equal(true);
            const resource = await new ethers.Contract(yieldGroup, YIELD_GROUP_ABI, provider).resourceConfig(
              vToken.address,
            );
            expect(resource.registered).to.equal(true);
            expect(resource.paused).to.equal(false);
            expect(resource.adapter).to.equal(await builder.SPOKE_ADAPTER());
            await expectLoanCaps(vToken.address);
            await expect(vToken.connect(stranger).mint(1))
              .to.be.revertedWithCustomError(comptroller, "SupplyNotAllowed")
              .withArgs(vToken.address, stranger.address);
          });
        } else {
          it("has the requested supply cap and can't be borrowed", async () => {
            const vToken = vTokens[i];
            expect(await comptroller.supplyCaps(vToken.address)).to.equal(market.supplyCap);
            expect(await comptroller.borrowCaps(vToken.address)).to.equal(0);
            await expect(vToken.connect(stranger).borrow(1))
              .to.be.revertedWithCustomError(comptroller, "BorrowCapExceeded")
              .withArgs(vToken.address, 0);
          });
        }
      });
    });
  });

  // ── Post-VIP functional ────────────────────────────────────────────────────────────────────────────────────────────

  describe("Post-VIP functional", () => {
    // The borrower's position, which the exit liquidates: a new collateral market with a collateral factor, and the
    // first loan market of the pool
    const i = request.collateralMarkets.findIndex((market: Result) => market.collateralFactor.gt(0));
    let collateral: Contract;
    let collateralAsset: Contract;
    let loan: Contract;
    let loanAsset: Contract;
    let borrowed: BigNumber;
    // The debt left after the repayment, and the borrow index it was left at
    let debt: BigNumber;
    let borrowIndex: BigNumber;

    if (collateralCount) {
      describe("Deployer", () => {
        it("can publish a collateral supply cap, and a stranger can't", async () => {
          const deployer = await initMainnetUser(request.deployer, parseUnits("1"));
          const riskOracle = new ethers.Contract(await manager.RISK_ORACLE(), RISK_ORACLE_ABI, provider);
          for (const [i, market] of request.collateralMarkets.entries()) {
            const args = [comptroller.address, vTokens[i].address, market.supplyCap.div(2)];
            await expect(manager.connect(stranger).setCollateralSupplyCap(...args))
              .to.be.revertedWithCustomError(manager, "NotDeployer")
              .withArgs(stranger.address);
            await manager.connect(deployer).setCollateralSupplyCap(...args);
            const update = await riskOracle.getUpdateById(
              await riskOracle.getLatestUpdateIdByTypeAndMarket("supplyCap", vTokens[i].address),
            );
            expect(update.publisher).to.equal(getAddress(manager.address));
            expect(update.newValue).to.equal(
              ethers.utils.defaultAbiCoder.encode(["uint256"], [market.supplyCap.div(2)]),
            );
          }
        });
      });
    }

    if (request.loanMarkets.length) {
      describe("Hub", () => {
        request.loanMarkets.forEach((market: Result, j: number) => {
          const i = collateralCount + j;

          it(`moves liquidity into the ${symbols[i]} market`, async () => {
            const vToken = vTokens[i];
            const { yieldGroup } = await policyRegistry.getLoanAssetConfig(market.asset);
            const hub = new ethers.Contract(
              await new ethers.Contract(yieldGroup, YIELD_GROUP_ABI, provider).hub(),
              HUB_ABI,
              await initMainnetUser(HUB_OPERATOR, parseUnits("1")),
            );
            const amount = seeds[i].mul(10);
            const deposit = [{ yieldGroup, resource: vToken.address, amount }];
            // The first other YieldGroup able to pay the amount out
            let funder: string | undefined;
            for (const group of await hub.outerDepositQueue()) {
              const withdrawal = [{ yieldGroup: group, resource: ethers.constants.AddressZero, amount }];
              if (
                group !== yieldGroup &&
                (await hub.callStatic.reallocate(withdrawal, deposit).then(
                  () => true,
                  () => false,
                ))
              ) {
                funder = group;
                break;
              }
            }
            expect(funder).to.not.equal(undefined);

            const exchangeRate = await vToken.exchangeRateStored();
            await hub.reallocate([{ yieldGroup: funder, resource: ethers.constants.AddressZero, amount }], deposit);
            expect(await vToken.getCash()).to.equal(seeds[i].add(amount));
            expect(await vToken.balanceOf(yieldGroup)).to.equal(amount.mul(parseUnits("1", 18)).div(exchangeRate));
          });
        });
      });
    }

    describe("Borrower", () => {
      before(async function () {
        for (const vToken of [...vTokens.map(v => v.address), ...poolMarkets]) {
          if (await comptroller.isSupplyAllowlistEnabled(vToken)) {
            loan = new ethers.Contract(vToken, VTOKEN_ABI, borrower);
            break;
          }
        }
        if (i < 0 || !loan) this.skip();

        // The deployer, the one likely holder of a new collateral asset, funds the borrower with the seed amount; it
        // needs that much left and room for it under the market's supply cap
        const deployer = await initMainnetUser(request.deployer, parseUnits("1"));
        collateralAsset = new ethers.Contract(markets[i].asset, ERC20_ABI, borrower);
        if (
          (await collateralAsset.balanceOf(deployer.address)).lt(seeds[i]) ||
          markets[i].supplyCap.lt(seeds[i].mul(2))
        ) {
          this.skip();
        }
        await collateralAsset.connect(deployer).transfer(borrower.address, seeds[i]);
        collateral = vTokens[i].connect(borrower);
        loanAsset = new ethers.Contract(await loan.underlying(), ERC20_ABI, borrower);
      });

      it("supplies the new collateral and gets borrowing power at its collateral factor", async () => {
        await collateralAsset.approve(collateral.address, seeds[i]);
        const exchangeRate = await collateral.exchangeRateStored();
        await collateral.mint(seeds[i]);
        const minted = seeds[i].mul(parseUnits("1", 18)).div(exchangeRate);
        expect(await collateralAsset.balanceOf(borrower.address)).to.equal(0);
        expect(await collateral.balanceOf(borrower.address)).to.equal(minted);
        await comptroller.connect(borrower).enterMarkets([collateral.address]);
        expect(await comptroller.checkMembership(borrower.address, collateral.address)).to.equal(true);

        // The deviation-bounded oracle prices an asset it has no config for at spot
        const vTokenPrice = (await collateral.exchangeRateStored())
          .mul(await resilientOracle.getUnderlyingPrice(collateral.address))
          .div(parseUnits("1", 18));
        const [, borrowingPower] = await comptroller.getBorrowingPower(borrower.address);
        expect(borrowingPower).to.equal(
          markets[i].collateralFactor.mul(vTokenPrice).div(parseUnits("1", 18)).mul(minted).div(parseUnits("1", 18)),
        );
      });

      it("borrows half its borrowing power", async () => {
        const [, borrowingPower] = await comptroller.getBorrowingPower(borrower.address);
        borrowed = borrowingPower
          .div(2)
          .mul(parseUnits("1", 18))
          .div(await resilientOracle.getUnderlyingPrice(loan.address));
        await loan.borrow(borrowed);
        borrowIndex = await loan.borrowIndex();
        expect(await loanAsset.balanceOf(borrower.address)).to.equal(borrowed);
        expect(await loan.borrowBalanceStored(borrower.address)).to.equal(borrowed);
      });

      it("repays half the loan, owing the rest plus interest", async () => {
        const repaid = borrowed.div(2);
        await loanAsset.approve(loan.address, repaid);
        await loan.repayBorrow(repaid);
        expect(await loanAsset.balanceOf(borrower.address)).to.equal(borrowed.sub(repaid));
        debt = await loan.borrowBalanceStored(borrower.address);
        expect(debt).to.equal(
          borrowed
            .mul(await loan.borrowIndex())
            .div(borrowIndex)
            .sub(repaid),
        );
        borrowIndex = await loan.borrowIndex();
      });

      it("redeems half its collateral at the exchange rate", async () => {
        const redeemTokens = (await collateral.balanceOf(borrower.address)).div(2);
        const exchangeRate = await collateral.exchangeRateStored();
        await collateral.redeem(redeemTokens);
        expect(await collateralAsset.balanceOf(borrower.address)).to.equal(
          redeemTokens.mul(exchangeRate).div(parseUnits("1", 18)),
        );
      });
    });

    describe("Exit", () => {
      const listed: string[] = [];
      let thresholds: BigNumber[];
      let bond: Contract;
      let exitBlock: number;

      before(async () => {
        bond = await bondAccount();
        exitBlock = await provider.getBlockNumber();
        for (const vToken of await comptroller.getAllMarkets()) {
          if (await comptroller.isMarketListed(vToken)) listed.push(vToken);
        }
        // Each market keeps its threshold for the wind-down
        thresholds = await Promise.all(
          listed.map(async vToken => (await comptroller.markets(vToken)).liquidationThresholdMantissa),
        );
      });

      it("winds the pool down on the deployer's exit request", async () => {
        const deployer = await initMainnetUser(request.deployer, parseUnits("1"));
        const operator = await initMainnetUser(SPOKE_POOL_OPERATOR, parseUnits("1"));
        await manager.connect(deployer).requestExit(comptroller.address);
        await manager.connect(operator).buildExitProposal(comptroller.address, thresholds, `${title} exit`);
        await runAsTimelock(await manager.exitProposals(comptroller.address));

        expect((await manager.getPool(comptroller.address)).status).to.equal(4); // WindingDown
        for (const [i, vToken] of listed.entries()) {
          // MINT, BORROW, ENTER_MARKET
          for (const action of [0, 2, 7]) expect(await comptroller.actionPaused(vToken, action)).to.equal(true);
          expect(await comptroller.supplyCaps(vToken)).to.equal(0);
          expect(await comptroller.borrowCaps(vToken)).to.equal(0);
          if (!(await comptroller.isSupplyAllowlistEnabled(vToken))) {
            const listing = await comptroller.markets(vToken);
            expect(listing.collateralFactorMantissa).to.equal(0);
            expect(listing.liquidationThresholdMantissa).to.equal(thresholds[i]);
          }
        }
      });

      it("force-closes the pool after the wind-down: collateral stops counting, owed loans open to liquidation", async () => {
        const operator = await initMainnetUser(SPOKE_POOL_OPERATOR, parseUnits("1"));
        await time.increase(await manager.windDownPeriod());
        await manager.connect(operator).buildForceCloseProposal(comptroller.address, `${title} force close`);
        await runAsTimelock(await manager.exitProposals(comptroller.address));

        // Collateral stops counting, and a loan market still owed is open to liquidation in full
        for (const vToken of listed) {
          if (await comptroller.isSupplyAllowlistEnabled(vToken)) {
            if ((await new ethers.Contract(vToken, VTOKEN_ABI, provider).totalBorrows()).gt(0)) {
              expect(await comptroller.isForcedLiquidationEnabled(vToken)).to.equal(true);
            }
          } else {
            const listing = await comptroller.markets(vToken);
            expect(listing.collateralFactorMantissa).to.equal(0);
            expect(listing.liquidationThresholdMantissa).to.equal(0);
          }
        }
      });

      it("lets a liquidator repay nearly all the remaining debt at once (forced liquidation)", async function () {
        if (!debt || (await comptroller.isLiquidationAllowlistEnabled())) this.skip();
        // The borrower's half of its loan, about all it owes: more than the close factor lets a regular liquidation
        // repay
        const repayAmount = await loanAsset.balanceOf(borrower.address);
        await loanAsset.transfer(stranger.address, repayAmount);
        // Spot prices and the collateral market's own incentive
        const seizeTokens = repayAmount
          .mul(await comptroller.effectiveLiquidationIncentive(collateral.address))
          .mul(await resilientOracle.getUnderlyingPrice(loan.address))
          .div(
            (await resilientOracle.getUnderlyingPrice(collateral.address)).mul(await collateral.exchangeRateStored()),
          );
        const [, quoted] = await comptroller.liquidateCalculateSeizeTokens(
          loan.address,
          collateral.address,
          repayAmount,
        );
        expect(quoted).to.equal(seizeTokens);

        const collateralBefore = await collateral.balanceOf(borrower.address);
        await loanAsset.connect(stranger).approve(loan.address, repayAmount);
        await loan.connect(stranger).liquidateBorrow(borrower.address, repayAmount, collateral.address);
        expect(await collateral.balanceOf(borrower.address)).to.equal(collateralBefore.sub(seizeTokens));
        expect(await loan.borrowBalanceStored(borrower.address)).to.equal(
          debt
            .mul(await loan.borrowIndex())
            .div(borrowIndex)
            .sub(repayAmount),
        );
      });

      it("keeps the bond in place, with nothing paid out of it", async () => {
        // Only governance releases the bond, once the pool is closed or handed over
        expect(await bondManager.bondAccounts(comptroller.address)).to.equal(bond.address);
        expect(await bond.released()).to.equal(false);
        expect(await bond.queryFilter(bond.filters.Paid(), exitBlock)).to.deep.equal([]);
      });
    });
  });
});
