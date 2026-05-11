import { expect } from "chai";
import { Contract } from "ethers";
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

const BORROW_ACTION = 2;

export interface ChainData {
  COMPTROLLER: string;
  cfChanges: CFEntry[];
  supplyCapChanges: CapEntry[];
  borrowCapChanges: CapEntry[];
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
    ...data.supplyCapChanges.map(c => c.vToken),
    ...data.borrowCapChanges.map(c => c.vToken),
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

    it("on-chain CF & LT match recorded `before`", async () => {
      for (const c of data.cfChanges) {
        const md = await comptroller.markets(c.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal(c.before, `${c.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(c.liquidationThreshold, `${c.symbol} LT`);
      }
    });

    it("on-chain supplyCap matches recorded `before`", async () => {
      for (const c of data.supplyCapChanges) {
        expect((await comptroller.supplyCaps(c.vToken)).toString()).to.equal(c.before, `${c.symbol} supplyCap`);
      }
    });

    it("on-chain borrowCap matches recorded `before`", async () => {
      for (const c of data.borrowCapChanges) {
        expect((await comptroller.borrowCaps(c.vToken)).toString()).to.equal(c.before, `${c.symbol} borrowCap`);
      }
    });

    it("on-chain borrow pause matches recorded `before`", async () => {
      for (const c of data.borrowPauseChanges) {
        expect(await comptroller.actionPaused(c.vToken, BORROW_ACTION)).to.equal(c.before, `${c.symbol} pause`);
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
          data.supplyCapChanges.length,
          data.borrowCapChanges.length,
          data.borrowPauseChanges.length,
        ],
      ),
  });

  describe(`Post-VIP state (${chainKey})`, () => {
    let comptroller: Contract;
    before(async () => {
      comptroller = new ethers.Contract(data.COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
    });

    it("CF moves to recorded `after`; LT unchanged", async () => {
      for (const c of data.cfChanges) {
        const md = await comptroller.markets(c.vToken);
        expect(md.collateralFactorMantissa.toString()).to.equal(c.after, `${c.symbol} CF`);
        expect(md.liquidationThresholdMantissa.toString()).to.equal(c.liquidationThreshold, `${c.symbol} LT`);
      }
    });

    it("supplyCap matches recorded `after`", async () => {
      for (const c of data.supplyCapChanges) {
        expect((await comptroller.supplyCaps(c.vToken)).toString()).to.equal(c.after, `${c.symbol} supplyCap`);
      }
    });

    it("borrowCap matches recorded `after`", async () => {
      for (const c of data.borrowCapChanges) {
        expect((await comptroller.borrowCaps(c.vToken)).toString()).to.equal(c.after, `${c.symbol} borrowCap`);
      }
    });

    it("borrow pause matches recorded `after`", async () => {
      for (const c of data.borrowPauseChanges) {
        expect(await comptroller.actionPaused(c.vToken, BORROW_ACTION)).to.equal(c.after, `${c.symbol} pause`);
      }
    });
  });

  describe(`E2E behaviour (${chainKey})`, () => {
    let comptroller: Contract;
    let signer: string;
    before(async () => {
      comptroller = new ethers.Contract(data.COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
      signer = (await ethers.getSigners())[0].address;
    });

    it("preBorrowHook reverts for every market freshly paused", async () => {
      for (const c of data.borrowPauseChanges) {
        if (!c.after) continue;
        await expect(comptroller.callStatic.preBorrowHook(c.vToken, signer, 1)).to.be.reverted;
      }
    });
  });
};
