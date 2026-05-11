import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { Proposal } from "src/types";
import { expectEvents, initMainnetUser } from "src/utils";
import { testForkedNetworkVipCommands } from "src/vip-framework";

import { CFEntry, CapEntry, PauseEntry } from "../../../vips/vip-999/bscmainnet";
import CHAINLINK_ORACLE_ABI from "../abi/ChainlinkOracle.json";
import COMPTROLLER_ABI from "../abi/Comptroller.json";
import RESILIENT_ORACLE_ABI from "../abi/ResilientOracle.json";
import VTOKEN_ABI from "../abi/VToken.json";

// Minimal WETH ABI — only the two functions needed to wrap ETH and approve a spender.
const WETH_ABI = ["function deposit() payable", "function approve(address spender, uint256 amount) returns (bool)"];

const BORROW_ACTION = 2;

export interface ChainData {
  COMPTROLLER: string;
  cfChanges: CFEntry[];
  capChanges: CapEntry[];
  borrowPauseChanges: PauseEntry[];
}

type ChainKey = "ethereum" | "arbitrumone" | "basemainnet" | "zksyncmainnet";

const pinOraclePrices = async (chainKey: ChainKey, data: ChainData): Promise<void> => {
  const addrs = NETWORK_ADDRESSES[chainKey];
  const resilient = new ethers.Contract(addrs.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const chainlink = new ethers.Contract(addrs.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const admin = await initMainnetUser(addrs.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));

  const vTokens = new Set<string>([
    ...data.cfChanges.map(c => c.vToken),
    ...data.capChanges.map(c => c.vToken),
    ...data.borrowPauseChanges.map(c => c.vToken),
  ]);

  const underlyings = new Set<string>();
  for (const vToken of vTokens) {
    const v = new ethers.Contract(vToken, VTOKEN_ABI, ethers.provider);
    underlyings.add(ethers.utils.getAddress(await v.underlying()));
  }

  for (const underlying of underlyings) {
    await chainlink.connect(admin).setDirectPrice(underlying, parseUnits("1", 18));
    await resilient.connect(admin).setTokenConfig({
      asset: underlying,
      oracles: [addrs.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
      enableFlagsForOracles: [true, false, false],
      cachingEnabled: false,
    });
  }
};

export const describeChainExecution = async (
  description: string,
  chainKey: ChainKey,
  data: ChainData,
  vip: Proposal,
) => {
  before(async () => {
    await pinOraclePrices(chainKey, data);
  });

  describe(`Pre-VIP state (${chainKey})`, () => {
    let comptroller: Contract;
    before(async () => {
      comptroller = new ethers.Contract(data.COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
    });

    it("matches current collateral factors and liquidation thresholds", async () => {
      for (const c of data.cfChanges) {
        const md = await comptroller.markets(c.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal(c.old, `${c.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(c.liquidationThreshold, `${c.symbol} LT`);
      }
    });

    it("matches current supply caps", async () => {
      for (const c of data.capChanges) {
        if (!c.supplyCap) continue;
        expect((await comptroller.supplyCaps(c.vToken)).toString()).to.equal(c.supplyCap.old, `${c.symbol} supplyCap`);
      }
    });

    it("matches current borrow caps", async () => {
      for (const c of data.capChanges) {
        if (!c.borrowCap) continue;
        expect((await comptroller.borrowCaps(c.vToken)).toString()).to.equal(c.borrowCap.old, `${c.symbol} borrowCap`);
      }
    });

    it("matches current borrow pause flags", async () => {
      for (const c of data.borrowPauseChanges) {
        expect(await comptroller.actionPaused(c.vToken, BORROW_ACTION)).to.equal(c.old, `${c.symbol} pause`);
      }
    });
  });

  testForkedNetworkVipCommands(description, vip, {
    callbackAfterExecution: async tx =>
      expectEvents(
        tx,
        [COMPTROLLER_ABI],
        ["NewCollateralFactor", "NewSupplyCap", "NewBorrowCap", "ActionPausedMarket"],
        [
          data.cfChanges.length,
          data.capChanges.filter(c => !BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new)).length,
          data.capChanges.filter(c => !BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new)).length,
          data.borrowPauseChanges.length,
        ],
      ),
  });

  describe(`Post-VIP state (${chainKey})`, () => {
    let comptroller: Contract;
    before(async () => {
      comptroller = new ethers.Contract(data.COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
    });

    it("applies new collateral factors (LT preserved)", async () => {
      for (const c of data.cfChanges) {
        const md = await comptroller.markets(c.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal(c.new, `${c.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(c.liquidationThreshold, `${c.symbol} LT`);
      }
    });

    it("applies new supply caps on changed entries", async () => {
      for (const c of data.capChanges) {
        if (BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new)) continue;
        expect((await comptroller.supplyCaps(c.vToken)).toString()).to.equal(c.supplyCap.new, `${c.symbol} supplyCap`);
      }
    });

    it("leaves no-op supply caps at their pre-VIP value", async () => {
      for (const c of data.capChanges) {
        if (!BigNumber.from(c.supplyCap.old).eq(c.supplyCap.new)) continue;
        expect((await comptroller.supplyCaps(c.vToken)).toString()).to.equal(
          c.supplyCap.old,
          `${c.symbol} supplyCap unchanged`,
        );
      }
    });

    it("applies new borrow caps on changed entries", async () => {
      for (const c of data.capChanges) {
        if (BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new)) continue;
        expect((await comptroller.borrowCaps(c.vToken)).toString()).to.equal(c.borrowCap.new, `${c.symbol} borrowCap`);
      }
    });

    it("leaves no-op borrow caps at their pre-VIP value", async () => {
      for (const c of data.capChanges) {
        if (!BigNumber.from(c.borrowCap.old).eq(c.borrowCap.new)) continue;
        expect((await comptroller.borrowCaps(c.vToken)).toString()).to.equal(
          c.borrowCap.old,
          `${c.symbol} borrowCap unchanged`,
        );
      }
    });

    it("applies new borrow pause flags", async () => {
      for (const c of data.borrowPauseChanges) {
        expect(await comptroller.actionPaused(c.vToken, BORROW_ACTION)).to.equal(c.new, `${c.symbol} pause`);
      }
    });
  });

  describe(`E2E behaviour (${chainKey})`, () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let borrower: any;

    before(async () => {
      const comptroller = new ethers.Contract(data.COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
      const addrs = NETWORK_ADDRESSES[chainKey];
      borrower = await initMainnetUser(addrs.NORMAL_TIMELOCK, ethers.utils.parseEther("10"));

      // Supply WETH (wrap ETH via deposit()) as collateral so the borrower has
      // enough liquidity to borrow 1 wei from each newly-unpaused market.
      const wethEntry = data.borrowPauseChanges.find(c => c.symbol === "WETH");
      if (wethEntry) {
        const vWETH = new ethers.Contract(wethEntry.vToken, VTOKEN_ABI, ethers.provider);
        const weth = new ethers.Contract(await vWETH.underlying(), WETH_ABI, ethers.provider);
        const deposit = ethers.utils.parseEther("5");
        await weth.connect(borrower).deposit({ value: deposit });
        await weth.connect(borrower).approve(wethEntry.vToken, deposit);
        await vWETH.connect(borrower).mint(deposit);
        await comptroller.connect(borrower).enterMarkets([wethEntry.vToken]);
      }
    });

    it("newly paused markets reject borrow attempts", async () => {
      for (const c of data.borrowPauseChanges) {
        if (!c.new) continue;
        const vToken = new ethers.Contract(c.vToken, VTOKEN_ABI, ethers.provider);
        await expect(vToken.connect(borrower).borrow(1)).to.be.reverted;
      }
    });

    it("newly unpaused markets accept borrows", async () => {
      for (const c of data.borrowPauseChanges) {
        if (c.new) continue;
        const vToken = new ethers.Contract(c.vToken, VTOKEN_ABI, ethers.provider);
        await expect(vToken.connect(borrower).borrow(1)).to.not.be.reverted;
      }
    });
  });
};
