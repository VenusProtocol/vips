import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, pinResilientOraclePriceViaRedstone } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664, {
  BSC_COMPTROLLER,
  BSC_EBRAKE,
  BSC_GOVERNANCE_TIMELOCKS,
  BSC_GUARDIAN,
  BSC_SENTINEL_ORACLE,
  LISTA_LISUSD_USDT_POOL,
  LISUSD_COLLATERAL_FACTOR,
  LISUSD_LIQUIDATION_THRESHOLD,
  LISUSD_NEW_SUPPLY_CAP,
  PCS_STABLE_ORACLE,
  SET_POOL_CONFIG_SIGNATURE,
  USDT,
  lisUSD,
  vlisUSD,
} from "../../vips/vip-664/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import ERC20_ABI from "./abi/ERC20.json";
import PCS_STABLE_ORACLE_ARTIFACT from "./abi/PCSStableOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SENTINEL_ORACLE_ABI from "./abi/SentinelOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// Recent block, after the PCSStableOracle was deployed on BNB Chain (block 111796601) — lisUSD CF
// is 0, its supply cap is 5M, the EBrake CF snapshot holds the pre-incident [0.5, 0.55] pair, and
// the Deviation Sentinel still routes lisUSD to the PancakeSwap V3 oracle.
const FORK_BLOCK = 111798000;

// Deviation Sentinel oracle lisUSD is currently routed to (VIP-613) — the PancakeSwap V3 adapter.
const BSC_PANCAKESWAP_ORACLE = "0x44B72078240A3509979faF450085Fa818401D32E";
// Core pool id used for EBrake CF-snapshot reads.
const CORE_POOL_ID = 0;
// vUSDT market — borrow target for the behavioral proof (borrow not paused, verified on-chain).
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
// The ListaDAO pool holds ~9.5M lisUSD; impersonated as the lisUSD source for the behavioral proof.
const LISUSD_WHALE = LISTA_LISUSD_USDT_POOL;

const PERMISSION_ACCOUNTS = [BSC_GUARDIAN, ...BSC_GOVERNANCE_TIMELOCKS];

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(BSC_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  const ebrake = new ethers.Contract(BSC_EBRAKE, EBRAKE_ABI, ethers.provider);
  const sentinelOracle = new ethers.Contract(BSC_SENTINEL_ORACLE, SENTINEL_ORACLE_ABI, ethers.provider);
  const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);

  // ── Use the PCSStableOracle adapter deployed on BNB Chain ──
  // The adapter is already deployed at PCS_STABLE_ORACLE (block 111796601). Its ownership handoff to
  // the Normal Timelock is a two-step transfer performed by the deployer before the VIP is proposed
  // on-chain; at this fork block that handoff has not happened yet (owner = deployer, no pending
  // owner). Replicate it here by impersonating the current owner and transferring ownership to the
  // Normal Timelock (leaving it as pendingOwner) so the VIP's acceptOwnership() in command 1
  // succeeds — the faithful pre-proposal state.
  const pcsStableOracle = new ethers.Contract(PCS_STABLE_ORACLE, PCS_STABLE_ORACLE_ARTIFACT.abi, ethers.provider);
  if ((await pcsStableOracle.pendingOwner()) !== bscmainnet.NORMAL_TIMELOCK) {
    const currentOwner = await initMainnetUser(await pcsStableOracle.owner(), parseUnits("1"));
    await pcsStableOracle.connect(currentOwner).transferOwnership(bscmainnet.NORMAL_TIMELOCK);
  }

  // ── Pin oracle prices for lisUSD + USDT so the governance-lifecycle time warp doesn't stale them. ──
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  // Both lisUSD and USDT would revert with "invalid resilient oracle price" on this time-warped
  // fork: lisUSD's main ResilientOracle feed is a non-Binance/Chainlink/Redstone oracle that
  // setMaxStalePeriod cannot widen, and USDT's price aggregation validates its (fresh) Chainlink
  // main against enabled pivot/fallback feeds that themselves go stale under the warp. Pin both
  // pre-warp prices via the Redstone escape hatch (reconfigures each to a Redstone-only main with a
  // direct price, disabling the reverting pivot/fallback). lisUSD's price is read by the CF command
  // (a wiring sanity check) and the behavioral supply/borrow proof; USDT's is read by the borrow
  // and by PCSStableOracle.getPrice (USDT is the reference token).
  await pinResilientOraclePriceViaRedstone(resilientOracle, lisUSD);
  await pinResilientOraclePriceViaRedstone(resilientOracle, USDT);

  describe("Pre-VIP state", () => {
    it("lisUSD collateral factor is 0", async () => {
      const market = await comptroller.markets(vlisUSD);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("lisUSD supply cap is 5,000,000", async () => {
      expect(await comptroller.supplyCaps(vlisUSD)).to.equal(parseUnits("5000000", 18));
    });

    it("EBrake holds the pre-incident CF snapshot [0.5, 0.55] for vlisUSD", async () => {
      const [cf, lt] = await ebrake.getMarketCFSnapshot(vlisUSD, CORE_POOL_ID);
      expect(cf).to.equal(LISUSD_COLLATERAL_FACTOR);
      expect(lt).to.equal(LISUSD_LIQUIDATION_THRESHOLD);
    });

    it("Deviation Sentinel routes lisUSD to the PancakeSwap V3 oracle", async () => {
      expect(await sentinelOracle.tokenConfigs(lisUSD)).to.equal(BSC_PANCAKESWAP_ORACLE);
    });

    it("PCSStableOracle is not yet owned by the Normal Timelock but has it pending", async () => {
      expect(await pcsStableOracle.owner()).to.not.equal(bscmainnet.NORMAL_TIMELOCK);
      expect(await pcsStableOracle.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PCSStableOracle is not yet configured for lisUSD", async () => {
      const cfg = await pcsStableOracle.poolConfigs(lisUSD);
      expect(cfg.pool).to.equal(ethers.constants.AddressZero);
    });

    it("no account may call setPoolConfig on the new PCSStableOracle yet", async () => {
      const impersonatedOracle = await initMainnetUser(pcsStableOracle.address, parseUnits("1"));
      for (const account of PERMISSION_ACCOUNTS) {
        expect(await acm.connect(impersonatedOracle).isAllowedToCall(account, SET_POOL_CONFIG_SIGNATURE)).to.equal(
          false,
        );
      }
    });
  });

  // Name the governance voters explicitly. At this fork block the sole delegate above the 1M XVS
  // proposal threshold is 0x3422… (~1.13M votes), but on its own it falls short of the 1.5M XVS
  // quorum, so add supporters (0x5176… ~0.47M plus the two default supporters) to clear quorum with
  // headroom.
  testVip("VIP-664 eBTC Delisting & lisUSD Resumption", await vip664(), {
    proposer: "0x34221485302f6F2029660a000908B5FCABB9BC6e",
    supporters: [
      "0x5176671de05380379399b669ed276feec99d59cb",
      "0xc444949e0054a23c44fc45789738bdf64aed2391",
      "0xeBA4b3c462B9C16f7CCaF4BE6f4D3c17c377411E",
    ],
    callbackAfterExecution: async txResponse => {
      // lisUSD CF restored + supply cap reduced.
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewCollateralFactor", "NewSupplyCap"], [1, 1]);
      // EBrake CF snapshot reset for vlisUSD.
      await expectEvents(txResponse, [EBRAKE_ABI], ["CFSnapshotReset"], [1]);
      // PCSStableOracle: ownership accepted + pool configured.
      await expectEvents(
        txResponse,
        [PCS_STABLE_ORACLE_ARTIFACT.abi],
        ["OwnershipTransferred", "PoolConfigUpdated"],
        [1, 1],
      );
      // SentinelOracle re-routed to the new adapter.
      await expectEvents(txResponse, [SENTINEL_ORACLE_ABI], ["TokenOracleConfigUpdated"], [1]);
    },
  });

  describe("Post-VIP state", () => {
    it("lisUSD collateral factor is 50% and liquidation threshold 55%", async () => {
      const market = await comptroller.markets(vlisUSD);
      expect(market.collateralFactorMantissa).to.equal(LISUSD_COLLATERAL_FACTOR);
      expect(market.liquidationThresholdMantissa).to.equal(LISUSD_LIQUIDATION_THRESHOLD);
    });

    it("lisUSD supply cap is 2,100,000", async () => {
      expect(await comptroller.supplyCaps(vlisUSD)).to.equal(LISUSD_NEW_SUPPLY_CAP);
    });

    it("EBrake CF snapshot for vlisUSD is cleared", async () => {
      const [cf, lt] = await ebrake.getMarketCFSnapshot(vlisUSD, CORE_POOL_ID);
      expect(cf).to.equal(0);
      expect(lt).to.equal(0);
    });

    it("PCSStableOracle is owned by the Normal Timelock and configured for lisUSD", async () => {
      expect(await pcsStableOracle.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      expect(await pcsStableOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      const cfg = await pcsStableOracle.poolConfigs(lisUSD);
      expect(cfg.pool).to.equal(LISTA_LISUSD_USDT_POOL);
      expect(cfg.coinIndex).to.equal(0);
      expect(cfg.refCoinIndex).to.equal(1);
      expect(cfg.referenceToken).to.equal(USDT);
      expect(cfg.assetDecimals).to.equal(18);
    });

    it("Deviation Sentinel now routes lisUSD to the PCSStableOracle", async () => {
      expect(await sentinelOracle.tokenConfigs(lisUSD)).to.equal(pcsStableOracle.address);
    });

    it("PCSStableOracle returns a sane lisUSD price (within 2% of the ResilientOracle)", async () => {
      const price = await pcsStableOracle.getPrice(lisUSD);
      const resilientPrice = await resilientOracle.getPrice(lisUSD);
      expect(price).to.be.gt(0);
      const diff = price.sub(resilientPrice).abs();
      expect(diff).to.be.lte(resilientPrice.mul(2).div(100));
    });

    it("Guardian and governance timelocks may now call setPoolConfig on the PCSStableOracle", async () => {
      const impersonatedOracle = await initMainnetUser(pcsStableOracle.address, parseUnits("1"));
      for (const account of PERMISSION_ACCOUNTS) {
        expect(await acm.connect(impersonatedOracle).isAllowedToCall(account, SET_POOL_CONFIG_SIGNATURE)).to.equal(
          true,
        );
      }
    });
  });

  describe("Post-VIP behavioral proof: lisUSD is collateral again", () => {
    it("a user can supply lisUSD and borrow against the restored collateral factor", async () => {
      const lisUsd = new ethers.Contract(lisUSD, ERC20_ABI, ethers.provider);
      const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
      const vLisUsd = new ethers.Contract(vlisUSD, VTOKEN_ABI, ethers.provider);
      const vUsdt = new ethers.Contract(vUSDT, VTOKEN_ABI, ethers.provider);

      const user = await initMainnetUser("0x000000000000000000000000000000000000dEaD", parseUnits("10"));
      const whale = await initMainnetUser(LISUSD_WHALE, parseUnits("10"));

      // Supply lisUSD as collateral (well under the 2.1M cap).
      const supplyAmount = parseUnits("50000", 18);
      await lisUsd.connect(whale).transfer(user.address, supplyAmount);
      await lisUsd.connect(user).approve(vlisUSD, supplyAmount);
      await vLisUsd.connect(user).mint(supplyAmount);
      await comptroller.connect(user).enterMarkets([vlisUSD]);

      // With CF restored to 50%, the account now has borrowing power.
      const [, liquidity, shortfall] = await comptroller.getAccountLiquidity(user.address);
      expect(shortfall).to.equal(0);
      expect(liquidity).to.be.gt(0);

      // Borrow a small amount of USDT against the lisUSD collateral.
      const borrowAmount = parseUnits("100", 18);
      const usdtBefore = await usdt.balanceOf(user.address);
      await expect(vUsdt.connect(user).borrow(borrowAmount)).to.not.be.reverted;
      expect(await usdt.balanceOf(user.address)).to.equal(usdtBefore.add(borrowAmount));
      expect(await vUsdt.callStatic.borrowBalanceCurrent(user.address)).to.be.gte(borrowAmount);
    });
  });
});
