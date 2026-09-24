import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import CHAINLINK_ORACLE_ABI from "src/vip-framework/abi/chainlinkOracle.json";
import ERC20_ABI from "src/vip-framework/abi/erc20.json";
import VTOKEN_ABI from "src/vip-framework/abi/vToken.json";

import vip665Addendum, {
  INSTITUTIONAL_VAULT_CONTROLLER,
  NEW_CONTROLLER_IMPLEMENTATION,
  OLD_CONTROLLER_IMPLEMENTATION,
  VAULT_PROXY_ADMIN,
} from "../../vips/vip-640/bsctestnet-addendum";
import {
  BSTOCK_MARKETS,
  EXECUTOR,
  PROXY_ADMIN as EXECUTOR_PROXY_ADMIN,
  FACETS,
  NEW_COMPTROLLER_LENS,
  NEW_DIAMOND,
  NEW_EXECUTOR_IMPL,
  NEW_VTOKEN_DELEGATE,
  UNITROLLER,
  VTOKENS_TO_UPGRADE,
} from "../../vips/vip-640/utils/data.bsctestnet-addendum";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import INSTITUTIONAL_VAULT_CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import LIQUIDATOR_ABI from "./abi/Liquidator.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import TRANSPARENT_PROXY_ABI from "./abi/TransparentUpgradeableProxy.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";

const { GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;

// Higher of the two source addenda fork blocks (vault addendum 116948919 > reaudit addendum 114890000): both
// normal testnet VIPs are executed, both re-upgrade implementations are deployed, and neither addendum has run.
const FORK_BLOCK = 116948919;

const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c"; // 6 decimals on testnet
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";

// ── Vault block config ───────────────────────────────────────────────────────
const ONE_DAY = 24 * 60 * 60;
const TEST_INSTITUTION = "0x000000000000000000000000000000000000D00d";
const TEMP_OVERRIDE = "Temp Override";

const vaultConfig = {
  supplyAsset: USDT,
  fixedAPY: 500,
  reserveFactor: parseEther("0.1"),
  minBorrowCap: parseEther("1000"),
  maxBorrowCap: parseEther("10000000"),
  minSupplierDeposit: parseEther("100"),
  openDuration: 7 * ONE_DAY,
  lockDuration: 30 * ONE_DAY,
  settlementWindow: ONE_DAY,
};
const instConfig = {
  collateralAsset: USDC,
  idealCollateralAmount: parseEther("100000"),
  marginRate: parseEther("0.8"),
  institutionOperator: TEST_INSTITUTION,
  positionTokenId: 0,
};
const riskConfig = {
  liquidationThreshold: parseEther("0.85"),
  liquidationIncentive: parseEther("1.08"),
  latePenaltyRate: parseEther("1.15"),
};

// ── Reaudit block constants ──────────────────────────────────────────────────
const XVS_VTOKEN = "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E"; // vXVS (testnet)
const NEW_CLAIM_AS_COLLATERAL_SELECTOR = "0xc2dbfc50"; // claimVenusAsCollateral(address,address[])
const NEW_SEIZE_SELECTOR = "0xf74c8f31"; // seizeVenus(address[],address,address[])
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const LIQUIDATOR = "0x55AEABa76ecf144031Ef64E222166eb28Cb4865F";
const DEPLOYER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";

const normalizeSelectors = (arr: string[]): string[] => [...arr].map(s => s.toLowerCase()).sort();

const facetOf = async (comptroller: Contract, selector: string): Promise<string> => {
  return (await comptroller.facetAddress(selector)).facetAddress;
};

const facetSelectorsOf = async (comptroller: Contract, facet: string): Promise<string[]> => {
  return normalizeSelectors(await comptroller.facetFunctionSelectors(facet));
};

// Diamond-storage globals that the re-recut must leave untouched.
const readStorageSnapshot = async (c: Contract) => ({
  closeFactor: (await c.closeFactorMantissa()).toString(),
  vaiController: await c.vaiController(),
  xvsAddress: await c.getXVSAddress(),
  xvsVToken: await c.getXVSVTokenAddress(),
  allMarkets: (await c.getAllMarkets()).join(","),
});

const markets = [...Object.values(VTOKENS_TO_UPGRADE), ...Object.values(BSTOCK_MARKETS)];

forking(FORK_BLOCK, async () => {
  // Vault block
  let controller: Contract;
  let proxyAdmin: Contract;
  let guardian: Signer;
  let overrideVault: string;

  // Reaudit block
  let comptroller: Contract;
  let executorProxyAdmin: Contract;
  let storageBefore: any;

  before(async () => {
    // Vault side
    controller = new ethers.Contract(
      INSTITUTIONAL_VAULT_CONTROLLER,
      INSTITUTIONAL_VAULT_CONTROLLER_ABI,
      ethers.provider,
    );
    proxyAdmin = new ethers.Contract(VAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
    guardian = await initMainnetUser(GUARDIAN, parseEther("1"));

    // Reaudit side
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    executorProxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, EXECUTOR_PROXY_ADMIN);
    storageBefore = await readStorageSnapshot(comptroller);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PRE-VIP — Block 1: Vault controller (override cannot be cleared)
  // ══════════════════════════════════════════════════════════════════════════
  describe("Pre-VIP: Vault — controller on the VIP-665 implementation (override cannot be cleared)", () => {
    it("proxy should still point to the VIP-665 implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(INSTITUTIONAL_VAULT_CONTROLLER)).to.equal(
        OLD_CONTROLLER_IMPLEMENTATION,
      );
    });

    it("the new implementation should be deployed", async () => {
      expect(await ethers.provider.getCode(NEW_CONTROLLER_IMPLEMENTATION)).to.not.equal("0x");
    });

    it("Guardian creates a vault and sets an institutionNameOverride on it", async () => {
      overrideVault = await controller
        .connect(guardian)
        .callStatic.createVault(vaultConfig, instConfig, riskConfig, "Override Vault Share", "ovUSDT", "Acme");
      await (
        await controller
          .connect(guardian)
          .createVault(vaultConfig, instConfig, riskConfig, "Override Vault Share", "ovUSDT", "Acme")
      ).wait();

      await controller.connect(guardian).setInstitutionNameOverride(overrideVault, TEMP_OVERRIDE);
      expect(await controller.institutionNameOverride(overrideVault)).to.equal(TEMP_OVERRIDE);
    });

    it("clearing the override with an empty string REVERTS on the old implementation", async () => {
      await expect(controller.connect(guardian).setInstitutionNameOverride(overrideVault, "")).to.be.reverted;
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PRE-VIP — Block 2: Core reaudit (recompiled impls not wired in yet)
  // ══════════════════════════════════════════════════════════════════════════
  describe("Pre-VIP: Core reaudit — the freshly recompiled implementations are not wired in yet", () => {
    it("the Diamond implementation is not yet the freshly deployed one", async () => {
      expect(await comptroller.comptrollerImplementation()).to.not.equal(NEW_DIAMOND);
    });

    // (1) None of the selectors point at the freshly recompiled facets yet.
    for (const { name, newFacet, selectors } of FACETS) {
      it(`${name}: its selectors are not bound to the new facet yet`, async () => {
        for (const selector of selectors) {
          expect(await facetOf(comptroller, selector)).to.not.equal(newFacet);
        }
      });
    }

    // (2) Each selector is bound to the expected old facet (the one the original proposal installed),
    // whose on-chain selector set deep-equals our data array exactly. The RewardFacet already owns the two
    // market-filtered overloads, since the original proposal added them.
    for (const { name, oldFacet, selectors } of FACETS) {
      it(`${name}: the existing (old) facet matches our selector data exactly`, async () => {
        for (const selector of selectors) {
          expect(await facetOf(comptroller, selector)).to.equal(oldFacet);
        }
        expect(await facetSelectorsOf(comptroller, oldFacet)).to.deep.equal(normalizeSelectors(selectors));
      });
    }

    it("ComptrollerLens and Executor are not yet upgraded", async () => {
      expect(await comptroller.comptrollerLens()).to.not.equal(NEW_COMPTROLLER_LENS);
      expect(await executorProxyAdmin.getProxyImplementation(EXECUTOR)).to.not.equal(NEW_EXECUTOR_IMPL);
    });

    it("Core Pool markets are not yet on the freshly deployed VBep20Delegate", async () => {
      for (const market of markets) {
        const vToken = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, market);
        expect(await vToken.implementation()).to.not.equal(NEW_VTOKEN_DELEGATE);
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // EXECUTE — merged addendum (vault block + reaudit block)
  // ══════════════════════════════════════════════════════════════════════════
  testVip(
    "VIP-665 Addendum [BNB Chain Testnet] Vault controller re-upgrade + Certik VPD-1241 reaudit re-apply",
    await vip665Addendum(),
    {
      callbackAfterExecution: async txResponse => {
        // Reaudit block events
        await expectEvents(txResponse, [COMPTROLLER_ABI], ["DiamondCut", "NewComptrollerLens"], [1, 1]);
        // Executor proxy upgrade (reaudit) + vault controller proxy upgrade (vault block).
        await expectEvents(txResponse, [TRANSPARENT_PROXY_ABI], ["Upgraded"], [2]);
        // One NewImplementation per repointed market plus one for the Diamond implementation swap.
        await expectEvents(txResponse, [UNITROLLER_ABI], ["NewImplementation"], [markets.length + 1]);
      },
    },
  );

  // ══════════════════════════════════════════════════════════════════════════
  // POST-VIP — Block 1: Vault controller upgraded, override now clearable
  // ══════════════════════════════════════════════════════════════════════════
  describe("Post-VIP: Vault", () => {
    describe("controller upgraded to the new implementation", () => {
      it("proxy should point to the new implementation", async () => {
        expect(await proxyAdmin.getProxyImplementation(INSTITUTIONAL_VAULT_CONTROLLER)).to.equal(
          NEW_CONTROLLER_IMPLEMENTATION,
        );
      });

      it("controller ownership is preserved (owner = Normal timelock)", async () => {
        expect(await controller.owner()).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("a mistaken institutionNameOverride can now be cleared", () => {
      it("clearing the override with an empty string now SUCCEEDS and falls back to the on-chain name", async () => {
        await controller.connect(guardian).setInstitutionNameOverride(overrideVault, "");
        expect(await controller.institutionNameOverride(overrideVault)).to.equal("");
      });

      it("clearing an already-empty override reverts (InstitutionNameUnchanged)", async () => {
        await expect(controller.connect(guardian).setInstitutionNameOverride(overrideVault, "")).to.be.reverted;
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // POST-VIP — Block 2: Core reaudit re-applied
  // ══════════════════════════════════════════════════════════════════════════
  describe("Post-VIP: Core reaudit", () => {
    describe("everything moved to the freshly recompiled build", () => {
      for (const { name, oldFacet, newFacet, selectors, newSelectors } of FACETS) {
        it(`every ${name} selector now resolves to the recompiled ${name}, no longer the old facet`, async () => {
          for (const selector of selectors) {
            const fa = await facetOf(comptroller, selector);
            expect(fa).to.equal(newFacet);
            expect(fa).to.not.equal(oldFacet);
          }
          expect(await facetSelectorsOf(comptroller, newFacet)).to.deep.equal(
            normalizeSelectors([...selectors, ...newSelectors]),
          );
        });
      }

      it("the two market-filtered RewardFacet overloads resolve to the recompiled RewardFacet", async () => {
        const rewardFacet = FACETS.find(f => f.name === "RewardFacet")!.newFacet;
        expect(await facetOf(comptroller, NEW_CLAIM_AS_COLLATERAL_SELECTOR)).to.equal(rewardFacet);
        expect(await facetOf(comptroller, NEW_SEIZE_SELECTOR)).to.equal(rewardFacet);
      });

      it("the Diamond implementation is swapped", async () => {
        expect(await comptroller.comptrollerImplementation()).to.equal(NEW_DIAMOND);
      });

      it("Core Pool storage is preserved across the re-recut (slots read identically)", async () => {
        expect(await readStorageSnapshot(comptroller)).to.deep.equal(storageBefore);
      });

      it("ComptrollerLens is updated", async () => {
        expect(await comptroller.comptrollerLens()).to.equal(NEW_COMPTROLLER_LENS);
      });

      it("the Executor is upgraded", async () => {
        expect(await executorProxyAdmin.getProxyImplementation(EXECUTOR)).to.equal(NEW_EXECUTOR_IMPL);
      });

      it("every Core Pool market points at the freshly deployed VBep20Delegate", async () => {
        for (const market of markets) {
          const vToken = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, market);
          expect(await vToken.implementation()).to.equal(NEW_VTOKEN_DELEGATE);
        }
      });

      it("the recut diamond still serves RewardFacet selectors", async () => {
        expect(await comptroller.getXVSVTokenAddress()).to.equal(XVS_VTOKEN);
      });

      it("BStock markets have internalCash re-synced to their underlying balance", async () => {
        const vTokenAbi = [
          "function internalCash() view returns (uint256)",
          "function underlying() view returns (address)",
        ];
        const erc20Abi = ["function balanceOf(address) view returns (uint256)"];
        for (const market of Object.values(BSTOCK_MARKETS)) {
          const vToken = await ethers.getContractAt(vTokenAbi, market);
          const underlying = await ethers.getContractAt(erc20Abi, await vToken.underlying());
          const held = await underlying.balanceOf(market);
          expect(held).to.be.gt(0);
          expect(await vToken.internalCash()).to.equal(held);
        }
      });
    });

    // Full Core Pool lifecycle on the re-recut diamond + new VBep20Delegate:
    // supply → borrow → liquidate → repay → redeem. BTCB collateral, USDT borrow.
    describe("e2e: Core Pool supply → borrow → liquidate → repay → redeem", () => {
      const VBTC = VTOKENS_TO_UPGRADE.vBTC;
      const VUSDT = VTOKENS_TO_UPGRADE.vUSDT;
      let BORROWER!: string;
      let LIQ!: string;

      let chainlink: Contract;
      let resilient: Contract;
      let vBtc: Contract;
      let vUsdt: Contract;
      let btcb: Contract;
      let usdtToken: Contract;
      let liquidatorContract: Contract;
      let admin: Signer; // deployer — funding + oracle
      let borrower: Signer;
      let liquidatorUser: Signer;
      let snapshotId: string;
      let originalBtcSpot: BigNumber;
      let borrowAmount: BigNumber;

      before(async () => {
        snapshotId = await ethers.provider.send("evm_snapshot", []);

        chainlink = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, CHAINLINK_ORACLE);
        resilient = await ethers.getContractAt(RESILIENT_ORACLE_ABI, RESILIENT_ORACLE);
        vBtc = await ethers.getContractAt(VTOKEN_ABI, VBTC);
        vUsdt = await ethers.getContractAt(VTOKEN_ABI, VUSDT);
        btcb = await ethers.getContractAt(ERC20_ABI, BTCB);
        usdtToken = await ethers.getContractAt(ERC20_ABI, USDT);
        liquidatorContract = await ethers.getContractAt(LIQUIDATOR_ABI, LIQUIDATOR);

        admin = await initMainnetUser(DEPLOYER, parseEther("1"));
        // Fresh actors: Hardhat's pre-funded local signers (no impersonation needed).
        [, , borrower, liquidatorUser] = await ethers.getSigners();
        BORROWER = await borrower.getAddress();
        LIQ = await liquidatorUser.getAddress();

        originalBtcSpot = await resilient.getPrice(BTCB);

        // Fund the fresh accounts from the deployer (holds BTCB + USDT).
        await btcb.connect(admin).transfer(BORROWER, ethers.utils.parseUnits("1", 18));
        await usdtToken.connect(admin).transfer(LIQ, ethers.utils.parseUnits("5000", 6));
      });

      after(async () => {
        await ethers.provider.send("evm_revert", [snapshotId]);
      });

      it("supply: borrower mints vBTC on the new delegate and enters the market", async () => {
        const amount = ethers.utils.parseUnits("1", 18);
        await btcb.connect(borrower).approve(VBTC, amount);
        await vBtc.connect(borrower).mint(amount);
        await comptroller.connect(borrower).enterMarkets([VBTC]);

        expect(await vBtc.balanceOf(BORROWER)).to.be.gt(0);
        expect(await comptroller.checkMembership(BORROWER, VBTC)).to.equal(true);
      });

      it("borrow: borrower draws USDT (~70% of capacity) against the BTC collateral", async () => {
        const [err, liquidity] = await comptroller.getAccountLiquidity(BORROWER);
        expect(err).to.equal(0);
        expect(liquidity).to.be.gt(0);

        const usdtPrice = await resilient.getUnderlyingPrice(VUSDT);
        borrowAmount = liquidity.mul(70).div(100).mul(ethers.constants.WeiPerEther).div(usdtPrice);

        const before = await usdtToken.balanceOf(BORROWER);
        await vUsdt.connect(borrower).borrow(borrowAmount);
        expect((await usdtToken.balanceOf(BORROWER)).sub(before)).to.equal(borrowAmount);
        expect(await vUsdt.callStatic.borrowBalanceCurrent(BORROWER)).to.be.closeTo(
          borrowAmount,
          borrowAmount.div(1000),
        );
      });

      it("liquidate: a 50% BTC crash flips the borrower into shortfall and a liquidator seizes vBTC", async () => {
        await chainlink.connect(admin).setDirectPrice(BTCB, originalBtcSpot.div(2));
        expect(await resilient.getPrice(BTCB)).to.equal(originalBtcSpot.div(2));

        const [, , shortfall] = await comptroller.getAccountLiquidity(BORROWER);
        expect(shortfall).to.be.gt(0);

        const repayAmount = ethers.utils.parseUnits("100", 6); // well under closeFactor (50%) of the debt
        await usdtToken.connect(liquidatorUser).approve(LIQUIDATOR, repayAmount);

        const liqVBtcBefore = await vBtc.balanceOf(LIQ);
        const debtBefore = await vUsdt.callStatic.borrowBalanceCurrent(BORROWER);
        await expect(
          liquidatorContract.connect(liquidatorUser).liquidateBorrow(VUSDT, BORROWER, repayAmount, VBTC),
        ).to.emit(vUsdt, "LiquidateBorrow");

        expect(await vBtc.balanceOf(LIQ)).to.be.gt(liqVBtcBefore); // seized vBTC collateral
        expect(await vUsdt.callStatic.borrowBalanceCurrent(BORROWER)).to.be.lt(debtBefore); // debt reduced
      });

      it("repay: borrower fully repays the remaining USDT debt", async () => {
        await usdtToken.connect(admin).transfer(BORROWER, ethers.utils.parseUnits("500000", 6));
        await usdtToken.connect(borrower).approve(VUSDT, ethers.constants.MaxUint256);
        await vUsdt.connect(borrower).repayBorrow(ethers.constants.MaxUint256);
        expect(await vUsdt.callStatic.borrowBalanceCurrent(BORROWER)).to.equal(0);
      });

      it("redeem: borrower redeems the remaining vBTC back to BTCB on the new delegate", async () => {
        await chainlink.connect(admin).setDirectPrice(BTCB, originalBtcSpot); // restore price
        const vBtcBalance = await vBtc.balanceOf(BORROWER);
        expect(vBtcBalance).to.be.gt(0);

        const btcBefore = await btcb.balanceOf(BORROWER);
        await vBtc.connect(borrower).redeem(vBtcBalance);
        expect(await vBtc.balanceOf(BORROWER)).to.equal(0);
        expect(await btcb.balanceOf(BORROWER)).to.be.gt(btcBefore);
      });
    });
  });
});
