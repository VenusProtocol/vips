import BEACON_PROXY from "@openzeppelin/contracts/build/contracts/BeaconProxy.json";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip, seedProposalBatchesOnFork, testVip } from "src/vip-framework";
import { bypassStalePrices } from "src/vip-framework/oracleStaleness";

import { REGISTRY_GRANTS } from "../../vips/vip-668/permissions-bscmainnet";
import vip673 from "../../vips/vip-673/bscmainnet";
import { APRO_ORACLE, ATLAS_ORACLE, MAINSTREAM_COMPTROLLER } from "../../vips/vip-675/addresses/bscmainnet";
import vip675, { PART_1 } from "../../vips/vip-675/bscmainnet";
import {
  ACM,
  ADAPTER_SPOKE_V1,
  BPNC_FIRST_MINT,
  BPNC_PRICE,
  BPNC_ROLES,
  BPN_CLOSE_FACTOR,
  BPN_INPUTS,
  BPN_LIQUIDATORS,
  BPN_MIN_LIQUIDATABLE_COLLATERAL,
  BPN_POOL_LIQUIDATION_INCENTIVE,
  BPN_POOL_NAME,
  BpnInputs,
  CHAINLINK_ORACLE,
  COLLATERAL_GATEWAY,
  CRITICAL_GUARDIAN,
  FLAT_6_IRM,
  IRM_LIQUIDITY,
  InnerQueues,
  MAX_LOOPS_LIMIT,
  NORMAL_TIMELOCK,
  OPERATOR,
  PAUSE_GUARDIAN,
  PROTOCOL_SHARE_RESERVE,
  QUEUES_AFTER_VIP_675,
  REDUCE_RESERVES_BLOCK_DELTA,
  RESILIENT_ORACLE,
  SEED_RECEIVER,
  SPOKE_COMPTROLLER_BEACON,
  SPOKE_POOL_REGISTRY,
  SPOKE_VTOKEN_BEACON,
  U,
  USDC,
  USDT,
  VENUS_CUSTODY_SAFE,
  VTREASURY,
  collateralMarket,
  liquidityMarkets,
} from "../../vips/vip-678/addresses/bscmainnet";
import vip678, { pendingInputs } from "../../vips/vip-678/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import GATEWAY_ABI from "./abi/CollateralGateway.json";
import BPNC_ABI from "./abi/CustodyReceiptToken.json";
import ERC20_ABI from "./abi/ERC20.json";
import HUB_ABI from "./abi/Hub.json";
import IRM_ABI from "./abi/JumpRateModelV2.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/SpokeComptroller.json";
import REGISTRY_ABI from "./abi/SpokePoolRegistry.json";
import VTOKEN_ABI from "./abi/VToken.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

// ===================================================================================================
// VIP-678 on a bscmainnet fork. Nothing VIP-678 lists is deployed yet, so the simulation deploys stand-ins the way
// isolated-pools `025` and `028` will: BPNC as a copy of vceBTC, the comptroller and the four markets as beacon
// proxies over the live
// beacons, and the flat 6% rate model as a copy of the live JumpRateModelV2 set to FLAT_6_IRM. It applies VIP-673,
// queued at FORK_BLOCK, and part 1 of VIP-675, which grants the spoke comptroller wildcards and leaves the Spoke source
// queues VIP-678 extends.
// ===================================================================================================

const FORK_BLOCK = 130482000;

const ONE = parseUnits("1", 18);
/// `Action.BORROW` in isolated-pools `ComptrollerInterface.sol`.
const ACTION_BORROW = 2;
/// 1 underlying = 1e10 vTokens of 8 decimals, the 18-decimal default of isolated-pools `028`.
const INITIAL_EXCHANGE_RATE = parseUnits("1", 28);
/// JumpRateModelV2 keeps its AccessControlManager in this slot, after TimeManagerV8's 48-slot gap.
const IRM_ACM_SLOT = 48;

/// vceBTC, the CustodyReceiptToken VIP-656 took over. BPNC is the same contract, and its `decimals` (18) is an
/// immutable in the code.
const VCEBTC = "0xAB7D138c6e6fF1bfD3ac871d0dB08f9442Ce927F";
/// CustodyReceiptToken's storage after OpenZeppelin's ERC20 (balances, allowances, total supply, name, symbol) and
/// Ownable2Step (owner, pending owner), read from vceBTC.
const TOKEN_SLOTS = { name: 3, symbol: 4, owner: 5, pendingOwner: 6, accessControlManager: 7 };

const GOVERNOR_ABI = ["function state(uint256) view returns (uint8)"];
const VIP_673 = 673;
/// `ProposalState.Executed` in GovernorBravo.
const EXECUTED_STATE = 7;

/// VIP-673 is queued at FORK_BLOCK and executes before VIP-678 on mainnet, so until the fork moves past it, apply its
/// commands as the Normal Timelock.
const applyVip673 = async () => {
  const governor = new ethers.Contract(NETWORK_ADDRESSES.bscmainnet.GOVERNOR_PROXY, GOVERNOR_ABI, ethers.provider);
  const state: number = await governor.state(VIP_673);
  if (state === EXECUTED_STATE) return;
  await pretendExecutingVip(await vip673(), NORMAL_TIMELOCK);
  console.warn(`[vip-678] VIP-673 (state ${state}) applied on the fork`);
};

/// bStocks keep balances in OpenZeppelin v5's ERC-7201 `ERC20` namespace, so the fork sets them directly.
const OZ5_ERC20_STORAGE = "0x52c63247e1f47db19d5ce0460030c497f067ca4cebf71ba98eeadabe20bace00";

const FEED_IFACE = new ethers.utils.Interface([
  "function decimals() view returns (uint8)",
  "function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)",
]);

/// A feed's answer in 18 decimals, read with `from` set to the oracle so the feed's caller gate lets it through.
const readFeed = async (oracle: string, feed: string): Promise<BigNumber> => {
  const call = async (fn: string) =>
    FEED_IFACE.decodeFunctionResult(
      fn,
      await ethers.provider.call({ to: feed, from: oracle, data: FEED_IFACE.encodeFunctionData(fn) }),
    );
  const [decimals] = await call("decimals");
  const [, answer] = await call("latestRoundData");
  return BigNumber.from(answer).mul(BigNumber.from(10).pow(18 - decimals));
};

/// VIP-678 relies on VIP-675 part 1's spoke comptroller wildcards and Spoke source queues. Until the fork moves past its
/// execution, apply it as the Normal Timelock, topping the VTreasury up with any bStock seed it lacks and pinning each
/// bStock feed's answer as a direct price, as VIP-675's simulation does, so a stale feed cannot revert it.
const applyVip675 = async () => {
  const mainstream = new ethers.Contract(MAINSTREAM_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  if ((await mainstream.owner()) === NORMAL_TIMELOCK) return;
  for (const { underlying, initialSupply } of [...PART_1.liquidity, ...PART_1.collateral]) {
    const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
    const balance: BigNumber = await token.balanceOf(VTREASURY);
    if (!initialSupply || balance.gte(initialSupply)) continue;
    // ponytail: OZ v5 slot only, so a short USDT, USDC or U seed would need a holder transfer instead
    const slot = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["address", "bytes32"], [VTREASURY, OZ5_ERC20_STORAGE]),
    );
    await setSlot(underlying, slot, ethers.utils.hexZeroPad(initialSupply.toHexString(), 32));
  }
  const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
  const atlas = new ethers.Contract(ATLAS_ORACLE, CHAINLINK_ORACLE_ABI, timelock);
  const apro = new ethers.Contract(APRO_ORACLE, CHAINLINK_ORACLE_ABI, timelock);
  for (const { underlying, atlasFeed, aproFeed } of PART_1.collateral) {
    await atlas.setDirectPrice(underlying, await readFeed(ATLAS_ORACLE, atlasFeed));
    if (aproFeed !== null) await apro.setDirectPrice(underlying, await readFeed(APRO_ORACLE, aproFeed));
  }
  const proposal = await vip675(PART_1);
  await seedProposalBatchesOnFork(proposal);
  await pretendExecutingVip(proposal, NORMAL_TIMELOCK);
  console.warn("[vip-678] VIP-675 part 1 applied on the fork");
};

/// A copy of the live JumpRateModelV2, which shares the block rate the new one is deployed with, set to FLAT_6_IRM.
const deployFlatRateModel = async (): Promise<string> => {
  const address = ethers.utils.getAddress(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("vip-678 flat 6%")).slice(0, 42),
  );
  await ethers.provider.send("hardhat_setCode", [address, await ethers.provider.getCode(IRM_LIQUIDITY)]);
  await ethers.provider.send("hardhat_setStorageAt", [
    address,
    ethers.utils.hexValue(IRM_ACM_SLOT),
    ethers.utils.hexZeroPad(ACM, 32),
  ]);
  const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
  const { baseRatePerYear, multiplierPerYear, jumpMultiplierPerYear, kink } = FLAT_6_IRM;
  await new ethers.Contract(address, IRM_ABI, timelock).updateJumpRateModel(
    baseRatePerYear,
    multiplierPerYear,
    jumpMultiplierPerYear,
    kink,
  );
  return address;
};

const setSlot = (address: string, slot: number | string, value: string) =>
  ethers.provider.send("hardhat_setStorageAt", [address, ethers.utils.hexValue(slot), value]);

/// A string under 32 bytes, as Solidity stores it: left-aligned, with twice its length in the last byte.
const shortString = (value: string) => {
  const bytes = ethers.utils.toUtf8Bytes(value);
  const word = new Uint8Array(32);
  word.set(bytes);
  word[31] = bytes.length * 2;
  return ethers.utils.hexlify(word);
};

/// A copy of vceBTC as BPNC, as its deployment leaves it: owned by the deployer, the Normal Timelock
/// nominated, no supply and no ACM permission.
const deployBpnc = async (deployer: string): Promise<string> => {
  const address = ethers.utils.getAddress(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("vip-678 BPNC")).slice(0, 42),
  );
  await ethers.provider.send("hardhat_setCode", [address, await ethers.provider.getCode(VCEBTC)]);
  await setSlot(address, TOKEN_SLOTS.name, shortString("BPN Credit Token"));
  await setSlot(address, TOKEN_SLOTS.symbol, shortString("BPNC"));
  await setSlot(address, TOKEN_SLOTS.owner, ethers.utils.hexZeroPad(deployer, 32));
  await setSlot(address, TOKEN_SLOTS.pendingOwner, ethers.utils.hexZeroPad(NORMAL_TIMELOCK, 32));
  await setSlot(address, TOKEN_SLOTS.accessControlManager, ethers.utils.hexZeroPad(ACM, 32));
  return address;
};

const readQueues = async (spokeSource: string): Promise<InnerQueues> => {
  const source = new ethers.Contract(spokeSource, YIELD_GROUP_ABI, ethers.provider);
  return { deposit: await source.innerDepositQueue(), withdraw: await source.innerWithdrawQueue() };
};

/// Deploys every `PENDING` input of BPN_INPUTS. BPN's supplier is a fresh account.
const deployStandIns = async (): Promise<BpnInputs> => {
  const [deployer, bpnSupplier] = await ethers.getSigners();
  const bpnc = await deployBpnc(deployer.address);
  const irmFlat6 = await deployFlatRateModel();

  const proxies = new ethers.ContractFactory(BEACON_PROXY.abi, BEACON_PROXY.bytecode, deployer);
  const comptrollerInit = new ethers.utils.Interface(COMPTROLLER_ABI).encodeFunctionData("initialize", [
    MAX_LOOPS_LIMIT,
    ACM,
  ]);
  const comptrollerProxy = await proxies.deploy(SPOKE_COMPTROLLER_BEACON, comptrollerInit);
  await new ethers.Contract(comptrollerProxy.address, COMPTROLLER_ABI, deployer).transferOwnership(NORMAL_TIMELOCK);

  const vTokenInterface = new ethers.utils.Interface(VTOKEN_ABI);
  const deployMarket = async (underlying: string, rateModel: string, asset: string) => {
    const init = vTokenInterface.encodeFunctionData("initialize", [
      underlying,
      comptrollerProxy.address,
      rateModel,
      INITIAL_EXCHANGE_RATE,
      `Venus ${asset} (${BPN_POOL_NAME})`,
      `v${asset}_BPNLoan`,
      8,
      NORMAL_TIMELOCK,
      ACM,
      [NORMAL_TIMELOCK, PROTOCOL_SHARE_RESERVE],
      parseUnits("0.1", 18),
    ]);
    return (await proxies.deploy(SPOKE_VTOKEN_BEACON, init)).address;
  };

  const inputs: BpnInputs = {
    ...BPN_INPUTS,
    bpnc,
    comptroller: comptrollerProxy.address,
    vBPNC: await deployMarket(bpnc, collateralMarket(BPN_INPUTS).interestRateModel, "BPNC"),
    vUSDT: await deployMarket(USDT, irmFlat6, "USDT"),
    vUSDC: await deployMarket(USDC, irmFlat6, "USDC"),
    vU: await deployMarket(U, irmFlat6, "U"),
    irmFlat6,
    bpnSupplier: bpnSupplier.address,
  };

  // VIP-678 extends the queues VIP-675 leaves. Until the fork moves past VIP-675, it extends today's.
  const queuesBefore: Record<string, InnerQueues> = {};
  for (const spokeSource of Object.keys(QUEUES_AFTER_VIP_675)) {
    queuesBefore[spokeSource] = await readQueues(spokeSource);
  }
  if (JSON.stringify(queuesBefore) !== JSON.stringify(QUEUES_AFTER_VIP_675)) {
    console.warn("[vip-678] VIP-675 has not run at FORK_BLOCK: the Spoke source queues are today's");
  }
  return { ...inputs, queuesBefore };
};

const normalize = (addresses: string[]) => addresses.map(a => a.toLowerCase());

forking(FORK_BLOCK, async () => {
  await applyVip673();
  await applyVip675();

  const standIns = pendingInputs(BPN_INPUTS);
  const inputs = await deployStandIns();
  console.warn(`[vip-678] stood in on the fork for: ${standIns.join(", ")}`);

  const COLLATERAL = collateralMarket(inputs);
  const LIQUIDITY = liquidityMarkets(inputs);
  const MARKETS = [COLLATERAL, ...LIQUIDITY];
  const [USDT_MARKET] = LIQUIDITY;

  const comptroller = new ethers.Contract(inputs.comptroller, COMPTROLLER_ABI, ethers.provider);
  const registry = new ethers.Contract(SPOKE_POOL_REGISTRY, REGISTRY_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const acm = new ethers.Contract(ACM, ACM_ABI, ethers.provider);
  const gateway = new ethers.Contract(COLLATERAL_GATEWAY, GATEWAY_ABI, ethers.provider);
  const vTokenOf = (address: string) => new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
  const erc20Of = (address: string) => new ethers.Contract(address, ERC20_ABI, ethers.provider);
  const groupOf = (address: string) => new ethers.Contract(address, YIELD_GROUP_ABI, ethers.provider);

  const [, bpnSigner, outsider] = await ethers.getSigners();
  const bpnc = new ethers.Contract(inputs.bpnc, BPNC_ABI, ethers.provider);
  // The VTreasury pays the USDT, USDC and U seeds. VIP-678 mints BPNC's.
  const treasuryBefore: Record<string, BigNumber> = {};
  const timelockBefore: Record<string, BigNumber> = {};
  for (const m of LIQUIDITY) {
    treasuryBefore[m.underlying] = await erc20Of(m.underlying).balanceOf(VTREASURY);
    timelockBefore[m.underlying] = await erc20Of(m.underlying).balanceOf(NORMAL_TIMELOCK);
  }

  before(async () => {
    await bypassStalePrices([USDT, USDC, U]);
  });

  describe("Pre-VIP behavior", () => {
    it("has the comptroller deployed with the Normal Timelock nominated as owner, and nothing listed", async () => {
      expect(await comptroller.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await comptroller.getAllMarkets()).to.deep.equal([]);
      for (const m of MARKETS) {
        expect(await vTokenOf(m.vToken).owner(), m.symbol).to.equal(NORMAL_TIMELOCK);
        expect(await vTokenOf(m.vToken).comptroller(), m.symbol).to.equal(inputs.comptroller);
      }
    });

    it("does not price BPNC", async () => {
      await expect(resilientOracle.getPrice(inputs.bpnc)).to.be.reverted;
    });

    it("has BPNC deployed with no supply and the Normal Timelock nominated as owner", async () => {
      expect(await bpnc.name()).to.equal("BPN Credit Token");
      expect(await bpnc.symbol()).to.equal("BPNC");
      expect(await bpnc.decimals()).to.equal(18);
      expect(await bpnc.totalSupply()).to.equal(0);
      expect(await bpnc.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });

    it("has the VTreasury holding the USDT, USDC and U seeds", async () => {
      for (const m of LIQUIDITY) {
        expect(treasuryBefore[m.underlying], m.symbol).to.be.gte(m.initialSupply);
      }
    });
  });

  testVip("VIP-678 [bscmainnet] BPN Loan Hub-Funded Spoke pool", await vip678(inputs), {});

  describe("Post-VIP behavior", () => {
    it("registers the pool, owned by the Normal Timelock, with the listing doc's pool parameters", async () => {
      expect(await comptroller.owner()).to.equal(NORMAL_TIMELOCK);
      const pool = await registry.getPoolByComptroller(inputs.comptroller);
      expect(pool.name).to.equal(BPN_POOL_NAME);
      expect(await comptroller.closeFactorMantissa()).to.equal(BPN_CLOSE_FACTOR);
      expect(await comptroller.liquidationIncentiveMantissa()).to.equal(BPN_POOL_LIQUIDATION_INCENTIVE);
      expect(await comptroller.minLiquidatableCollateral()).to.equal(BPN_MIN_LIQUIDATABLE_COLLATERAL);
      expect(await comptroller.oracle()).to.equal(RESILIENT_ORACLE);
      expect(normalize(await comptroller.getAllMarkets())).to.deep.equal(normalize(MARKETS.map(m => m.vToken)));
    });

    it("prices BPNC at a fixed $1 through the ChainlinkOracle alone", async () => {
      const config = await resilientOracle.getTokenConfig(inputs.bpnc);
      expect(config.oracles).to.deep.equal([
        CHAINLINK_ORACLE,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
      ]);
      expect(config.enableFlagsForOracles).to.deep.equal([true, false, false]);
      expect(await chainlinkOracle.prices(inputs.bpnc)).to.equal(BPNC_PRICE);
      expect(await resilientOracle.getPrice(inputs.bpnc)).to.equal(ONE);
      expect(await resilientOracle.getUnderlyingPrice(COLLATERAL.vToken)).to.equal(ONE);
    });

    it("lists every market with the listing doc's risk values", async () => {
      for (const m of MARKETS) {
        const vToken = vTokenOf(m.vToken);
        const market = await comptroller.markets(m.vToken);
        expect(market.isListed, m.symbol).to.be.true;
        expect(market.collateralFactorMantissa, m.symbol).to.equal(m.collateralFactor);
        expect(market.liquidationThresholdMantissa, m.symbol).to.equal(m.liquidationThreshold);
        expect(await comptroller.supplyCaps(m.vToken), m.symbol).to.equal(m.supplyCap);
        expect(await comptroller.borrowCaps(m.vToken), m.symbol).to.equal(m.borrowCap);
        expect(await comptroller.effectiveLiquidationIncentive(m.vToken), m.symbol).to.equal(m.liquidationIncentive);
        expect(await vToken.protocolSeizeShareMantissa(), m.symbol).to.equal(m.protocolSeizeShare);
        expect(await vToken.reserveFactorMantissa(), m.symbol).to.equal(m.reserveFactor);
        expect(await vToken.reduceReservesBlockDelta(), m.symbol).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
        expect(await vToken.interestRateModel(), m.symbol).to.equal(m.interestRateModel);
        expect(await comptroller.actionPaused(m.vToken, ACTION_BORROW), m.symbol).to.equal(m === COLLATERAL);
      }
    });

    it("takes BPNC over and mints its first supply to the Operator, and the market's seed", async () => {
      expect(await bpnc.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await bpnc.balanceOf(OPERATOR)).to.equal(BPNC_FIRST_MINT);
      expect(await bpnc.balanceOf(COLLATERAL.vToken)).to.equal(COLLATERAL.initialSupply);
      expect(await bpnc.totalSupply()).to.equal(BPNC_FIRST_MINT.add(COLLATERAL.initialSupply));
      expect(await bpnc.balanceOf(NORMAL_TIMELOCK)).to.equal(0);
    });

    it("gives BPNC's mint and pause to the Operator and governance, and its burn and unpause to governance", async () => {
      const holders = [OPERATOR, NORMAL_TIMELOCK, CRITICAL_GUARDIAN];
      for (const { role, accounts } of BPNC_ROLES) {
        for (const account of holders) {
          expect(await acm.isAllowedToCall(account, role, { from: inputs.bpnc }), `${role} ${account}`).to.equal(
            accounts.includes(account),
          );
        }
      }
    });

    it("pays each seed and mints its vTokens to SEED_RECEIVER", async () => {
      for (const m of MARKETS) {
        expect(await vTokenOf(m.vToken).balanceOf(SEED_RECEIVER), m.symbol).to.equal(
          m.initialSupply.mul(ONE).div(INITIAL_EXCHANGE_RATE),
        );
      }
      for (const m of LIQUIDITY) {
        const spent = treasuryBefore[m.underlying].sub(await erc20Of(m.underlying).balanceOf(VTREASURY));
        expect(spent, m.symbol).to.equal(m.initialSupply);
        expect(await erc20Of(m.underlying).balanceOf(NORMAL_TIMELOCK), m.symbol).to.equal(timelockBefore[m.underlying]);
      }
    });

    it("restricts supply on every market to its allowlist", async () => {
      for (const m of MARKETS) {
        expect(await comptroller.isSupplyAllowlistEnabled(m.vToken), m.symbol).to.be.true;
        for (const supplier of m.allowedSuppliers) {
          expect(await comptroller.isAllowedSupplier(m.vToken, supplier), `${m.symbol} ${supplier}`).to.be.true;
        }
        expect(await comptroller.isAllowedSupplier(m.vToken, outsider.address), m.symbol).to.be.false;
      }
      expect(COLLATERAL.allowedSuppliers).to.deep.equal([VENUS_CUSTODY_SAFE, inputs.bpnSupplier]);
    });

    it("adds each liquidity market to its Spoke source, last to deposit and first to withdraw", async () => {
      for (const m of LIQUIDITY) {
        const source = groupOf(m.stack.spokeSource);
        const [registered, paused, adapter] = await source.resourceConfig(m.vToken);
        expect(registered, m.symbol).to.be.true;
        expect(paused, m.symbol).to.be.false;
        expect(adapter, m.symbol).to.equal(ADAPTER_SPOKE_V1);
        expect(normalize(await source.innerDepositQueue()), m.symbol).to.deep.equal(
          normalize([...m.queuesBefore.deposit, m.vToken]),
        );
        expect(normalize(await source.innerWithdrawQueue()), m.symbol).to.deep.equal(
          normalize([m.vToken, ...m.queuesBefore.withdraw]),
        );
      }
    });

    it("grants the pool's roles against this comptroller", async () => {
      const allowed = (account: string, role: string) =>
        acm.isAllowedToCall(account, role, { from: inputs.comptroller });
      for (const role of REGISTRY_GRANTS) {
        expect(await allowed(SPOKE_POOL_REGISTRY, role), role).to.be.true;
      }
      for (const role of ["setSupplyAllowlistEnabled(address,bool)", "setAllowedSupplier(address,address,bool)"]) {
        expect(await allowed(NORMAL_TIMELOCK, role), role).to.be.true;
        expect(await allowed(CRITICAL_GUARDIAN, role), role).to.be.false;
      }
      expect(await allowed(CRITICAL_GUARDIAN, "setMarketLiquidationIncentive(address,uint256)")).to.be.true;
      expect(await allowed(CRITICAL_GUARDIAN, "setCloseFactor(uint256)")).to.be.true;
      expect(await allowed(PAUSE_GUARDIAN, "setAllowedLiquidator(address,bool)")).to.be.true;
      expect(await allowed(COLLATERAL_GATEWAY, "enterMarketForAccount(address,address)")).to.be.true;
    });

    it("lets only the Operator liquidate", async () => {
      expect(await comptroller.isLiquidationAllowlistEnabled()).to.be.true;
      for (const liquidator of BPN_LIQUIDATORS) {
        expect(await comptroller.isAllowedLiquidator(liquidator), liquidator).to.be.true;
      }
      for (const account of [NORMAL_TIMELOCK, CRITICAL_GUARDIAN, inputs.bpnSupplier, outsider.address]) {
        expect(await comptroller.isAllowedLiquidator(account), account).to.be.false;
      }
    });

    it("charges a flat 6% borrow APY on USDT, USDC and U at any utilization", async () => {
      const irm = new ethers.Contract(inputs.irmFlat6, IRM_ABI, ethers.provider);
      const blocksPerYear: BigNumber = await irm.blocksOrSecondsPerYear();
      const cash = parseUnits("1000000", 18);
      for (const borrows of [0, 500000, 999999].map(n => parseUnits(n.toString(), 18))) {
        const ratePerBlock: BigNumber = await irm.getBorrowRate(cash.sub(borrows), borrows, 0, 0);
        expect(ratePerBlock).to.equal(FLAT_6_IRM.baseRatePerYear.div(blocksPerYear));
      }
      // Daily compounding of the per-year rate gives 6.00%.
      const perYear = Number(ethers.utils.formatUnits(FLAT_6_IRM.baseRatePerYear, 18));
      expect((1 + perYear / 365) ** 365 - 1).to.be.closeTo(0.06, 0.00001);
    });

    describe("a BPN loan", () => {
      const supply = parseUnits("1000000", 18);
      const funding = parseUnits("1000000", 18);

      before(async () => {
        const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
        await bpnc.connect(operator).mint(bpnSigner.address, supply);
        await bpnc.connect(operator).mint(outsider.address, supply);
      });

      it("lets the Operator pause BPNC transfers, and only governance resume them", async () => {
        const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
        const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
        await bpnc.connect(operator).pause();
        await expect(bpnc.connect(outsider).transfer(bpnSigner.address, 1)).to.be.revertedWithCustomError(
          bpnc,
          "ActionPaused",
        );
        await expect(bpnc.connect(operator).unpause()).to.be.revertedWithCustomError(bpnc, "Unauthorized");
        await expect(bpnc.connect(operator).burn(outsider.address, 1)).to.be.revertedWithCustomError(
          bpnc,
          "Unauthorized",
        );
        await bpnc.connect(timelock).unpause();
        expect(await bpnc.paused()).to.be.false;
      });

      it("refuses BPNC from an account that is not on the allowlist", async () => {
        await bpnc.connect(outsider).approve(COLLATERAL.vToken, supply);
        await expect(vTokenOf(COLLATERAL.vToken).connect(outsider).mint(supply)).to.be.revertedWithCustomError(
          comptroller,
          "SupplyNotAllowed",
        );
      });

      it("refuses USDT from anyone but the Hub's Spoke source", async () => {
        const whale = await initMainnetUser(NETWORK_ADDRESSES.bscmainnet.VTREASURY, ethers.utils.parseEther("1"));
        await erc20Of(USDT).connect(whale).approve(USDT_MARKET.vToken, ONE);
        await expect(vTokenOf(USDT_MARKET.vToken).connect(whale).mint(ONE)).to.be.revertedWithCustomError(
          comptroller,
          "SupplyNotAllowed",
        );
      });

      it("lets the Operator move Hub USDT into the BPN Loan market", async () => {
        const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
        const hub = new ethers.Contract(USDT_MARKET.stack.hub, HUB_ABI, operator);
        const into = { yieldGroup: USDT_MARKET.stack.spokeSource, resource: USDT_MARKET.vToken, amount: funding };
        let from: typeof into | undefined;
        for (const yieldGroup of USDT_MARKET.stack.depositQueue) {
          for (const resource of (await groupOf(yieldGroup).resources()) as string[]) {
            const leg = { yieldGroup, resource, amount: funding };
            if (
              !from &&
              (await hub.callStatic.reallocate([leg], [into]).then(
                () => true,
                () => false,
              ))
            ) {
              from = leg;
            }
          }
        }
        expect(from, "no group can fund the move").to.not.equal(undefined);
        await hub.reallocate([from], [into]);
        expect(await vTokenOf(USDT_MARKET.vToken).getCash()).to.equal(funding.add(USDT_MARKET.initialSupply));
      });

      it("takes BPNC through CollateralGateway and lends up to 90% of it in USDT", async () => {
        await bpnc.connect(bpnSigner).approve(COLLATERAL_GATEWAY, supply);
        await gateway.connect(bpnSigner).supplyAndEnterSpokeMarkets([COLLATERAL.vToken], [supply]);
        expect(await comptroller.checkMembership(bpnSigner.address, COLLATERAL.vToken)).to.be.true;

        // Borrow power is weighted by the collateral factor; `getAccountLiquidity` uses the liquidation threshold.
        const [, liquidity] = await comptroller.getBorrowingPower(bpnSigner.address);
        const usdtPrice: BigNumber = await resilientOracle.getPrice(USDT);
        expect(liquidity).to.be.closeTo(supply.mul(COLLATERAL.collateralFactor).div(ONE), ONE);

        // Leave room for the USDT price around $1.
        const borrow = liquidity.mul(ONE).div(usdtPrice).mul(99).div(100);
        await vTokenOf(USDT_MARKET.vToken).connect(bpnSigner).borrow(borrow);
        expect(await erc20Of(USDT).balanceOf(bpnSigner.address)).to.equal(borrow);
        await expect(
          vTokenOf(USDT_MARKET.vToken).connect(bpnSigner).borrow(liquidity.div(50)),
        ).to.be.revertedWithCustomError(comptroller, "InsufficientLiquidity");
        await expect(vTokenOf(COLLATERAL.vToken).connect(bpnSigner).borrow(1)).to.be.revertedWithCustomError(
          comptroller,
          "ActionPaused",
        );
      });

      it("seizes BPNC worth exactly the debt repaid, with no discount and no protocol share", async () => {
        const repay = parseUnits("1000", 18);
        const usdtPrice: BigNumber = await resilientOracle.getUnderlyingPrice(USDT_MARKET.vToken);
        const exchangeRate: BigNumber = await vTokenOf(COLLATERAL.vToken).exchangeRateStored();
        const [, seizeTokens] = await comptroller.liquidateCalculateSeizeTokens(
          USDT_MARKET.vToken,
          COLLATERAL.vToken,
          repay,
        );
        const expected = repay.mul(usdtPrice).div(ONE).mul(ONE).div(exchangeRate);
        expect(seizeTokens).to.be.closeTo(expected, 1);
      });

      it("lets only the Operator liquidate BPN once it is short", async () => {
        // A 10% lower BPNC price puts the loan, at 99% of the 90% CF, past the 95% LT.
        const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
        await chainlinkOracle.connect(timelock).setDirectPrice(inputs.bpnc, parseUnits("0.9", 18));
        const [, , shortfall] = await comptroller.getAccountLiquidity(bpnSigner.address);
        expect(shortfall).to.be.gt(0);

        const repay = parseUnits("1000", 18);
        const treasury = await initMainnetUser(VTREASURY, ethers.utils.parseEther("1"));
        const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
        for (const liquidator of [outsider, operator]) {
          await erc20Of(USDT).connect(treasury).transfer(liquidator.address, repay);
          await erc20Of(USDT).connect(liquidator).approve(USDT_MARKET.vToken, repay);
        }
        const vUSDT = vTokenOf(USDT_MARKET.vToken);
        await expect(
          vUSDT.connect(outsider).liquidateBorrow(bpnSigner.address, repay, COLLATERAL.vToken),
        ).to.be.revertedWithCustomError(comptroller, "LiquidationNotAllowed");
        await expect(comptroller.connect(outsider).healAccount(bpnSigner.address)).to.be.revertedWithCustomError(
          comptroller,
          "LiquidationNotAllowed",
        );

        const [, seizeTokens] = await comptroller.liquidateCalculateSeizeTokens(
          USDT_MARKET.vToken,
          COLLATERAL.vToken,
          repay,
        );
        await vUSDT.connect(operator).liquidateBorrow(bpnSigner.address, repay, COLLATERAL.vToken);
        expect(await vTokenOf(COLLATERAL.vToken).balanceOf(OPERATOR)).to.equal(seizeTokens);
      });
    });
  });
});
