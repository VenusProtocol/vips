import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES, ORACLE_BNB } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriod } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip663, {
  ATLAS_ORACLE,
  Actions,
  CHAINLINK_ORACLE,
  COMPTROLLER,
  DEPLOYER,
  DEPRECATION_IRM,
  GUARDED_IMPLEMENTATION,
  PENDLE_PT_VAULT_ADAPTER,
  PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN,
  REDSTONE_ORACLE,
  RESILIENT_ORACLE,
  RF_FULL,
  THE,
  THE_REDSTONE_FEED,
  UNGUARDED_IMPLEMENTATION,
  vTRX,
  vlisUSD,
} from "../../vips/vip-663/bscmainnet";
import VTOKEN_ABI from "../vip-567/abi/VToken.json";
import COMPTROLLER_ABI from "../vip-662/abi/Comptroller.json";
import RESILIENT_ORACLE_ABI from "../vip-662/abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// Fork after the deployer's two handover transactions, both mined 2026-09-21:
//   adapter.transferOwnership(NORMAL_TIMELOCK)    block 123125269
//   proxyAdmin.transferOwnership(NORMAL_TIMELOCK) block 123125372
// and after the VPD-2089 parameter snapshot (2026-09-22). Block 123494000 is 2026-09-23 11:35 UTC+8.
const FORK_BLOCK = 123494000;

const ADAPTER_ABI = [
  "error Unauthorized(address sender, address calledContract, string methodSignature)",
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function paused() view returns (bool)",
  "function accessControlManager() view returns (address)",
  "function pause()",
  "function unpause()",
  "function addMarket(address pendleMarket, address vToken)",
  "function getAllMarkets() view returns (address[])",
  "function markets(address) view returns (address pt, address sy, address yt, address vToken, uint256 maturity)",
  "function PENDLE_ROUTER() view returns (address)",
  "function COMPTROLLER() view returns (address)",
];

const PROXY_ADMIN_ABI = [
  "function owner() view returns (address)",
  "function getProxyImplementation(address proxy) view returns (address)",
];

const ACM_ABI = ["function isAllowedToCall(address account, string functionSig) view returns (bool)"];
const MARKET = "0x3C1a3D6B69A866444Fe506F7D38a00a1C2D859C5";
const FUNCTION_SIGNATURES = ["pause()", "unpause()", "addMarket(address,address)"];
const CHAINLINK_ORACLE_ABI = [
  "function getPrice(address asset) view returns (uint256)",
  "function tokenConfigs(address asset) view returns (address asset, address feed, uint256 maxStalePeriod)",
];
const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

const TRX = "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3";
const LISUSD = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";

// Accounts with open positions at FORK_BLOCK.
const TRX_SUPPLIER = "0x4EFBc2b895BF83246D059F853D37613081e680Ee"; // ~262k TRX supplied, no TRX borrow
const TRX_BORROWER = "0x3178490d60B5cceaA5a79FD4D9050C7405Bab80c"; // ~26k TRX borrowed
const LISUSD_BORROWER = "0x396cd107B33Ef31B77fA740CF94Ab3dc8959FB04"; // ~43.8k lisUSD borrowed
// Underlying holders used only to fund the repayments below.
const TRX_HOLDER = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3";
const LISUSD_HOLDER = "0x8df7891fb2Cb3e98C7AB3cfB4d9A59FbCC63c956"; // Lista lisUSD/USDT StableSwap pool

const TRX_E_MODE_POOL_ID = 13;
const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";

interface MarketState {
  symbol: string;
  vToken: string;
  supplyCap: BigNumber;
  borrowCap: BigNumber;
  collateralFactor: BigNumber;
  liquidationThreshold: BigNumber;
  reserveFactor: BigNumber;
  irm: string;
  paused: number[];
}

const ALL_ACTIONS = [...Array(9).keys()]; // MINT .. EXIT_MARKET

const PRE_VIP_MARKETS: MarketState[] = [
  {
    symbol: "vTRX",
    vToken: vTRX,
    supplyCap: parseUnits("3000000", 6),
    borrowCap: parseUnits("1000000", 6),
    collateralFactor: BigNumber.from(0),
    liquidationThreshold: parseUnits("0.525", 18),
    reserveFactor: parseUnits("0.25", 18),
    irm: "0x6125BC439EE2caa2Fd737b14d0f68B364099a19E",
    paused: [Actions.MINT],
  },
  {
    symbol: "vlisUSD",
    vToken: vlisUSD,
    supplyCap: parseUnits("2100000", 18),
    borrowCap: parseUnits("4000000", 18),
    collateralFactor: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.55", 18),
    reserveFactor: parseUnits("0.1", 18),
    irm: "0x8AFaE0979c793411648e476388C83E190285c9b1",
    paused: [Actions.BORROW],
  },
];

const POST_VIP_MARKETS: MarketState[] = PRE_VIP_MARKETS.map(m => ({
  ...m,
  supplyCap: BigNumber.from(0),
  borrowCap: BigNumber.from(0),
  collateralFactor: BigNumber.from(0),
  reserveFactor: RF_FULL,
  irm: DEPRECATION_IRM,
  paused: [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
}));

const GOVERNANCE_ACCOUNTS = [
  bscmainnet.NORMAL_TIMELOCK,
  bscmainnet.FAST_TRACK_TIMELOCK,
  bscmainnet.CRITICAL_TIMELOCK,
  bscmainnet.GUARDIAN,
  bscmainnet.CRITICAL_GUARDIAN,
  "0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF", // Oracle Guardian
];

forking(FORK_BLOCK, async () => {
  let adapter: Contract;
  let proxyAdmin: Contract;
  let acm: Contract;
  let rando: SignerWithAddress;
  let initialMarket: unknown;
  let initialRouter: string;
  let initialComptroller: string;

  // Use the adapter as ACM caller to cover both contract-scoped and wildcard roles.
  const isAllowed = (account: string, signature: string) =>
    acm.connect(ethers.provider).callStatic.isAllowedToCall(account, signature, { from: PENDLE_PT_VAULT_ADAPTER });

  before(async () => {
    adapter = await ethers.getContractAt(ADAPTER_ABI, PENDLE_PT_VAULT_ADAPTER);
    proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN);
    acm = await ethers.getContractAt(ACM_ABI, bscmainnet.ACCESS_CONTROL_MANAGER);

    rando = await initMainnetUser("0x00000000000000000000000000000000DeaDBeef", ethers.utils.parseEther("1"));
    initialMarket = await adapter.markets(MARKET);
    initialRouter = await adapter.PENDLE_ROUTER();
    initialComptroller = await adapter.COMPTROLLER();
  });

  let comptroller: Contract;
  let resilientOracle: Contract;
  let chainlinkOracle: Contract;

  const checkMarket = (m: MarketState) => {
    describe(m.symbol, () => {
      let vToken: Contract;

      before(async () => {
        vToken = await ethers.getContractAt(VTOKEN_ABI, m.vToken);
      });

      it(`supply cap ${m.supplyCap}, borrow cap ${m.borrowCap}`, async () => {
        expect(await comptroller.supplyCaps(m.vToken)).to.equal(m.supplyCap);
        expect(await comptroller.borrowCaps(m.vToken)).to.equal(m.borrowCap);
      });

      it(`collateral factor ${m.collateralFactor}, liquidation threshold ${m.liquidationThreshold}`, async () => {
        const market = await comptroller.markets(m.vToken);
        expect(market.collateralFactorMantissa).to.equal(m.collateralFactor);
        expect(market.liquidationThresholdMantissa).to.equal(m.liquidationThreshold);
      });

      it(`reserve factor ${m.reserveFactor}`, async () => {
        expect(await vToken.reserveFactorMantissa()).to.equal(m.reserveFactor);
      });

      it(`interest rate model ${m.irm}`, async () => {
        expect(await vToken.interestRateModel()).to.equal(m.irm);
      });

      it(`paused actions are exactly [${m.paused}]`, async () => {
        for (const action of ALL_ACTIONS) {
          expect(await comptroller.actionPaused(m.vToken, action), `action ${action}`).to.equal(
            m.paused.includes(action),
          );
        }
      });
    });
  };

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, RESILIENT_ORACLE);
    chainlinkOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, CHAINLINK_ORACLE);
  });

  describe("Pre-VIP state", async () => {
    it("THE uses [Chainlink, Atlas, RedStone], all enabled, caching disabled", async () => {
      const config = await resilientOracle.getTokenConfig(THE);
      expect(config.oracles).to.deep.equal([CHAINLINK_ORACLE, ATLAS_ORACLE, REDSTONE_ORACLE]);
      expect(config.enableFlagsForOracles).to.deep.equal([true, true, true]);
      expect(config.cachingEnabled).to.equal(false);
    });

    it("THE's RedStone fallback reads the feed RedStone is discontinuing", async () => {
      const redstoneOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, REDSTONE_ORACLE);
      expect((await redstoneOracle.tokenConfigs(THE)).feed).to.equal(THE_REDSTONE_FEED);
    });

    describe("TRX & lisUSD", () => {
      PRE_VIP_MARKETS.forEach(checkMarket);

      it("vTRX collateral factor is already 0 in the TRX e-mode pool", async () => {
        const market = await comptroller.poolMarkets(TRX_E_MODE_POOL_ID, vTRX);
        expect(market.isListed).to.equal(true);
        expect(market.collateralFactorMantissa).to.equal(0);
      });
    });

    it("the deployer's handover transactions have landed", async () => {
      // Ownable2Step: the adapter records the Normal Timelock as pending owner only.
      expect(await adapter.owner()).to.equal(DEPLOYER);
      expect(await adapter.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      // Single-step Ownable: the ProxyAdmin is already under governance.
      expect(await proxyAdmin.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("proxy runs the implementation that is missing the access-control checks", async () => {
      expect(await proxyAdmin.getProxyImplementation(PENDLE_PT_VAULT_ADAPTER)).to.equal(UNGUARDED_IMPLEMENTATION);
    });

    it("pause() and unpause() are callable by any address", async () => {
      expect(await adapter.paused()).to.equal(false);
      await adapter.connect(rando).pause();
      expect(await adapter.paused()).to.equal(true);
      await adapter.connect(rando).unpause();
      expect(await adapter.paused()).to.equal(false);
    });

    it("governance, deployer and outsider hold no effective ACM permissions on this adapter", async () => {
      for (const account of [...GOVERNANCE_ACCOUNTS, DEPLOYER, rando.address]) {
        for (const sig of FUNCTION_SIGNATURES) {
          expect(await isAllowed(account, sig)).to.equal(false);
        }
      }
    });
  });

  testVip(
    "VIP-663 Pendle PT Adapter Governance Handover, THE Oracle Update and TRX & lisUSD Deprecation",
    await vip663(),
    {
      callbackAfterExecution: async txResponse => {
        await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
        await expectEvents(
          txResponse,
          [COMPTROLLER_ABI],
          ["ActionPausedMarket", "NewSupplyCap", "NewBorrowCap", "NewCollateralFactor", "Failure"],
          [4, 2, 2, 1, 0],
        );
        await expectEvents(txResponse, [VTOKEN_ABI], ["NewReserveFactor", "NewMarketInterestRateModel"], [2, 2]);
      },
    },
  );

  describe("Post-VIP state", async () => {
    describe("THE oracle", () => {
      it("THE uses [Chainlink, Atlas, none] with the fallback disabled, caching disabled", async () => {
        const config = await resilientOracle.getTokenConfig(THE);
        expect(config.oracles).to.deep.equal([CHAINLINK_ORACLE, ATLAS_ORACLE, ethers.constants.AddressZero]);
        expect(config.enableFlagsForOracles).to.deep.equal([true, true, false]);
        expect(config.cachingEnabled).to.equal(false);
      });

      it("THE returns the Chainlink price validated against Atlas, even with the RedStone feed gone", async () => {
        const the = new ethers.Contract(THE, ERC20_ABI, ethers.provider);
        await setMaxStalePeriod(resilientOracle, the);
        await ethers.provider.send("hardhat_setCode", [THE_REDSTONE_FEED, "0xfe"]);
        const price = await resilientOracle.getPrice(THE);
        expect(price).to.be.gt(0);
        expect(price).to.equal(await chainlinkOracle.getPrice(THE));
      });
    });

    describe("TRX & lisUSD", () => {
      POST_VIP_MARKETS.forEach(checkMarket);

      it("deprecation IRM is 300% base, 0% multiplier, 363.64% jump above a 45% kink", async () => {
        const irm = await ethers.getContractAt(
          [
            "function baseRatePerBlock() view returns (uint256)",
            "function multiplierPerBlock() view returns (uint256)",
            "function jumpMultiplierPerBlock() view returns (uint256)",
            "function kink() view returns (uint256)",
          ],
          DEPRECATION_IRM,
        );
        const blocksPerYear = 70080000;
        expect((await irm.baseRatePerBlock()).mul(blocksPerYear)).to.be.closeTo(parseUnits("3", 18), 1e11);
        expect(await irm.multiplierPerBlock()).to.equal(0);
        expect((await irm.jumpMultiplierPerBlock()).mul(blocksPerYear)).to.be.closeTo(parseUnits("3.6364", 18), 1e14);
        expect(await irm.kink()).to.equal(parseUnits("0.45", 18));
      });

      it("mint, borrow and enterMarkets revert on both markets", async () => {
        for (const vTokenAddress of [vTRX, vlisUSD]) {
          const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
          await expect(vToken.connect(rando).callStatic.mint(1)).to.be.revertedWith("action is paused");
          await expect(vToken.connect(rando).callStatic.borrow(1)).to.be.revertedWith("action is paused");
          await expect(comptroller.connect(rando).callStatic.enterMarkets([vTokenAddress])).to.be.revertedWith(
            "action is paused",
          );
        }
      });

      it("TRX supplier can still redeem", async () => {
        const vToken = await ethers.getContractAt(VTOKEN_ABI, vTRX);
        const trx = new ethers.Contract(TRX, ERC20_ABI, ethers.provider);
        const supplier = await initMainnetUser(TRX_SUPPLIER, parseUnits("1", 18));
        // Redeeming runs a liquidity check over every entered market, whose feeds testVip left stale.
        for (const market of await comptroller.getAssetsIn(TRX_SUPPLIER)) {
          const underlying =
            market === vBNB ? ORACLE_BNB : await (await ethers.getContractAt(VTOKEN_ABI, market)).underlying();
          await setMaxStalePeriod(resilientOracle, new ethers.Contract(underlying, ERC20_ABI, ethers.provider));
        }
        const redeemTokens = (await vToken.balanceOf(TRX_SUPPLIER)).div(10);
        const before = await trx.balanceOf(TRX_SUPPLIER);
        await vToken.connect(supplier).redeem(redeemTokens);
        expect(await trx.balanceOf(TRX_SUPPLIER)).to.be.gt(before);
      });

      for (const { symbol, vTokenAddress, underlying, borrower, holder } of [
        { symbol: "TRX", vTokenAddress: vTRX, underlying: TRX, borrower: TRX_BORROWER, holder: TRX_HOLDER },
        {
          symbol: "lisUSD",
          vTokenAddress: vlisUSD,
          underlying: LISUSD,
          borrower: LISUSD_BORROWER,
          holder: LISUSD_HOLDER,
        },
      ]) {
        it(`${symbol} borrower can still repay`, async () => {
          const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
          const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
          const account = await initMainnetUser(borrower, parseUnits("1", 18));
          const funder = await initMainnetUser(holder, parseUnits("1", 18));
          const debt = await vToken.callStatic.borrowBalanceCurrent(borrower);
          const repayAmount = debt.div(2);
          await token.connect(funder).transfer(borrower, repayAmount);
          await token.connect(account).approve(vTokenAddress, repayAmount);
          await vToken.connect(account).repayBorrow(repayAmount);
          expect(await vToken.callStatic.borrowBalanceCurrent(borrower)).to.be.lt(
            debt.sub(repayAmount).add(debt.div(100)),
          );
        });
      }
    });

    it("adapter is owned by the Normal Timelock with no pending owner left", async () => {
      expect(await adapter.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      expect(await adapter.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("proxy runs the guarded implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(PENDLE_PT_VAULT_ADAPTER)).to.equal(GUARDED_IMPLEMENTATION);
    });

    it("pause(), unpause() and addMarket() are no longer callable by an arbitrary address", async () => {
      await expect(adapter.connect(rando).callStatic.pause())
        .to.be.revertedWithCustomError(adapter, "Unauthorized")
        .withArgs(rando.address, PENDLE_PT_VAULT_ADAPTER, "pause()");
      await expect(adapter.connect(rando).callStatic.unpause())
        .to.be.revertedWithCustomError(adapter, "Unauthorized")
        .withArgs(rando.address, PENDLE_PT_VAULT_ADAPTER, "unpause()");
      await expect(
        adapter.connect(rando).callStatic.addMarket(ethers.constants.AddressZero, ethers.constants.AddressZero),
      )
        .to.be.revertedWithCustomError(adapter, "Unauthorized")
        .withArgs(rando.address, PENDLE_PT_VAULT_ADAPTER, "addMarket(address,address)");
    });

    it("leaves governance, deployer and outsider without effective ACM permissions", async () => {
      for (const account of [...GOVERNANCE_ACCOUNTS, DEPLOYER, rando.address]) {
        for (const sig of FUNCTION_SIGNATURES) {
          expect(await isAllowed(account, sig)).to.equal(false);
        }
      }
    });

    it("preserves the full market configuration, integrations and unpaused state", async () => {
      expect(await adapter.paused()).to.equal(false);
      expect(await adapter.getAllMarkets()).to.deep.equal([MARKET]);
      expect(await adapter.markets(MARKET)).to.deep.equal(initialMarket);
      expect(await adapter.PENDLE_ROUTER()).to.equal(initialRouter);
      expect(await adapter.COMPTROLLER()).to.equal(initialComptroller);
      expect(await adapter.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
    });
  });
});
