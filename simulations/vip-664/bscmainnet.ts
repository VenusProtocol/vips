import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664 from "../../vips/vip-664/bscmainnet";
import * as data from "../../vips/vip-664/data/bscmainnet";
import BSC_COMPTROLLER_ABI from "./abi/BscComptroller.json";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;
// Fork shortly before proposals 650/651 were created (startBlocks 113894628 / 113894992):
// both high-power delegates are mid-vote at HEAD, so no big proposer is free there. At this
// block 0xe5e6… (~1.09M votes, proposal 649 already Queued) can still propose, so we name it
// explicitly rather than let the framework fall back to the busy 0x3422… Safe.
const FORK_BLOCK = 113850000;

// Governance voters (named explicitly; see FORK_BLOCK note). 0xe5e6… clears the 1M XVS proposal
// threshold; 0x3422… (~1.13M) as supporter clears the 1.5M XVS quorum with headroom.
const PROPOSER = "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced";
const SUPPORTERS = ["0x34221485302f6F2029660a000908B5FCABB9BC6e", "0x5176671de05380379399b669ed276feec99d59cb"];

// XVS market + whale for the behavioral proof (XVS CF 0% -> 50%). Borrow a small
// amount of USDT against supplied XVS — impossible while XVS CF was 0%.
const vXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const XVS_WHALE = "0x051100480289e704d20e9DB4804837068f3f9204"; // XVSVault holds ~9M XVS
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const E2E_USER = "0x0000000000000000000000000000000000000664";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

// Pin the given vTokens' underlyings to $1 via the Chainlink oracle so the mined
// governance window (setCollateralFactor reads the price) and the behavioral
// borrow don't revert on oracle staleness. Mirrors
// simulations/vip-622/utils/chainRiskParamSuite.ts::pinOraclePrices.
const pinOraclePrices = async (vTokens: string[]): Promise<void> => {
  const resilient = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const chainlink = new ethers.Contract(bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const admin = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));

  const underlyings = new Set<string>();
  for (const vToken of vTokens) {
    const v = new ethers.Contract(vToken, VTOKEN_ABI, ethers.provider);
    underlyings.add(ethers.utils.getAddress(await v.underlying()));
  }

  for (const underlying of underlyings) {
    await chainlink.connect(admin).setDirectPrice(underlying, parseUnits("1", 18));
    await resilient.connect(admin).setTokenConfig({
      asset: underlying,
      oracles: [bscmainnet.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
      enableFlagsForOracles: [true, false, false],
      cachingEnabled: false,
    });
  }
};

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(data.COMPTROLLER, BSC_COMPTROLLER_ABI, ethers.provider);

  before(async () => {
    await pinOraclePrices([...data.cfChanges.map(c => c.vToken), ...data.liChanges.map(l => l.vToken), vUSDT]);
  });

  describe("Pre-VIP state (bscmainnet)", () => {
    it("matches current core-pool collateral factors and liquidation thresholds", async () => {
      for (const c of data.cfChanges) {
        const md = await comptroller.markets(c.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal(c.old.toString(), `${c.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(
          c.liquidationThreshold.toString(),
          `${c.symbol} LT`,
        );
      }
    });

    it("matches current E-Mode pool liquidation incentives and labels", async () => {
      for (const l of data.liChanges) {
        const pool = await comptroller.pools(l.poolId);
        expect(pool.label).to.equal(l.poolLabel, `pool ${l.poolId} label`);
        const md = await comptroller.poolMarkets(l.poolId, l.vToken);
        expect(md.liquidationIncentiveMantissa.toString()).to.equal(
          l.old.toString(),
          `${l.symbol} pool ${l.poolId} LI`,
        );
      }
    });
  });

  testVip("VIP-664 BNB Chain Risk Parameter Update", await vip664(), {
    proposer: PROPOSER,
    supporters: SUPPORTERS,
    callbackAfterExecution: async tx =>
      expectEvents(
        tx,
        [BSC_COMPTROLLER_ABI],
        ["NewCollateralFactor", "NewLiquidationIncentive"],
        [data.cfChanges.length, data.liChanges.length],
      ),
  });

  describe("Post-VIP state (bscmainnet)", () => {
    it("applies new core-pool collateral factors (LT preserved)", async () => {
      for (const c of data.cfChanges) {
        const md = await comptroller.markets(c.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal(c.new.toString(), `${c.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(
          c.liquidationThreshold.toString(),
          `${c.symbol} LT`,
        );
      }
    });

    it("applies new E-Mode pool liquidation incentives (label preserved)", async () => {
      for (const l of data.liChanges) {
        const pool = await comptroller.pools(l.poolId);
        expect(pool.label).to.equal(l.poolLabel, `pool ${l.poolId} label`);
        const md = await comptroller.poolMarkets(l.poolId, l.vToken);
        expect(md.liquidationIncentiveMantissa.toString()).to.equal(
          l.new.toString(),
          `${l.symbol} pool ${l.poolId} LI`,
        );
      }
    });
  });

  describe("Post-VIP behaviour (bscmainnet)", () => {
    let user: Awaited<ReturnType<typeof initMainnetUser>>;
    const supplyAmount = parseUnits("1000", 18); // 1000 XVS (18 decimals) at pinned $1
    const borrowAmount = parseUnits("100", 18); // 100 USDT << 50% of $1000 borrow power

    before(async () => {
      const whale = await initMainnetUser(XVS_WHALE, ethers.utils.parseEther("1"));
      user = await initMainnetUser(E2E_USER, ethers.utils.parseEther("1"));

      const xvs = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);
      await xvs.connect(whale).transfer(E2E_USER, supplyAmount);

      const vXVSContract = new ethers.Contract(vXVS, VTOKEN_ABI, ethers.provider);
      await xvs.connect(user).approve(vXVS, supplyAmount);
      await vXVSContract.connect(user).mint(supplyAmount);
      await comptroller.connect(user).enterMarkets([vXVS]);
    });

    it("XVS supplied as collateral now yields non-zero account liquidity (CF 0% -> 50%)", async () => {
      const [err, liquidity, shortfall] = await comptroller.getAccountLiquidity(E2E_USER);
      expect(err.toString()).to.equal("0");
      expect(shortfall.toString()).to.equal("0");
      // ~50% of $1000 collateral => ~$500 borrow power; impossible while CF was 0.
      expect(liquidity.gt(parseUnits("400", 18))).to.equal(true, "expected non-zero XVS borrow power");
    });

    it("allows borrowing USDT against XVS collateral", async () => {
      const usdt = new ethers.Contract(vUSDT, VTOKEN_ABI, ethers.provider);
      const underlying = new ethers.Contract(await usdt.underlying(), ERC20_ABI, ethers.provider);
      const before = await underlying.balanceOf(E2E_USER);
      await usdt.connect(user).borrow(borrowAmount);
      const after = await underlying.balanceOf(E2E_USER);
      expect(after.sub(before).toString()).to.equal(borrowAmount.toString());
    });
  });
});
