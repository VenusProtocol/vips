import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import Decimal from "decimal.js";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NORMAL_TIMELOCK, forking, testVip } from "../../src/vip-framework";
import { MAX_TICK_CENTER, MIN_TICK_CENTER, TICK_SPREAD, vip285 } from "../../vips/vip-285/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import V3_POSITION_MANAGER_ABI from "./abi/NonfungiblePositionManager.json";

const USDT = "0x55d398326f99059ff775485246999027b3197955";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const V2_LP = "0xD94FeFc80a7d10d4708b140c7210569061a7eddb";
const V3_POSITION_MANAGER = "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364";
const LIQUIDITY_MOVER = "0xcE18DA58f469A2dA9decDf1B168494240430D1D4";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

// Actual refunds will depend on the amounts of USDT and VAI
// received from v2 LP, the additional VAI deposited from timelock,
// and the current state of the PCS v3 pool.
// The numbers are calculated based on the fork block.
const EXPECTED_USDT_REFUND = parseUnits("0", 18);
const EXPECTED_VAI_REFUND = parseUnits("2668.754702575565935377", 18);

export const tickToPrice = (tick: number): BigNumber => {
  const E18 = new Decimal(10).pow(18);
  return BigNumber.from(new Decimal("1.0001").pow(tick).mul(E18).toFixed(0));
};

const formatPrice = (tick: number) => {
  return formatUnits(tickToPrice(tick), 18);
};

const formatPriceRange = (tickCenter: number, tickSpread: number) => {
  const tickLower = tickCenter - tickSpread;
  const tickUpper = tickCenter + tickSpread + 1; // +1 because the upper bound is exclusive
  return `${formatPrice(tickLower)} - ${formatPrice(tickUpper)}`;
};

console.log(`
The VIP withdraws an USDT and VAI from PCS v2 pool, proportional to
the current price, and then resupplies USDT and VAI to the neighborhood
of the **current** PCS v3 price.

Under the hood, the prices and the neighborhood are expressed in ticks.

The following tick values are used in this VIP:
  * neighborhood: ${TICK_SPREAD} ticks, which, if VAI costs exactly 1 USDT, corresponds to ${formatPriceRange(
  0,
  TICK_SPREAD,
)} USDT/VAI.
  * min tick center: ${MIN_TICK_CENTER}, which corresponds to the spot price of ${formatPrice(
  MIN_TICK_CENTER,
)} USDT/VAI.
    - this means that the minimum possible price range would be ${formatPriceRange(
      MIN_TICK_CENTER,
      TICK_SPREAD,
    )} USDT/VAI.
  * max tick center: ${MAX_TICK_CENTER}, which corresponds to the spot price of ${formatPrice(
  MAX_TICK_CENTER,
)} USDT/VAI.
    - this means that the maximum possible price range would be ${formatPriceRange(
      MAX_TICK_CENTER,
      TICK_SPREAD,
    )} USDT/VAI.
`);

forking(37624600, async () => {
  const usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
  const vai = new ethers.Contract(VAI, IERC20_ABI, ethers.provider);
  const v2lp = new ethers.Contract(V2_LP, IERC20_ABI, ethers.provider);
  const v3pm = new ethers.Contract(V3_POSITION_MANAGER, V3_POSITION_MANAGER_ABI, ethers.provider);

  let treasuryUsdtBalanceBefore: BigNumber;
  let treasuryVaiBalanceBefore: BigNumber;
  let executionTx: TransactionResponse;
  let executionTxReceipt: TransactionReceipt;

  before(async () => {
    treasuryUsdtBalanceBefore = await usdt.balanceOf(TREASURY);
    treasuryVaiBalanceBefore = await vai.balanceOf(TREASURY);
  });

  testVip("VIP-285", await vip285(), {
    callbackAfterExecution: async tx => {
      executionTx = tx;
      executionTxReceipt = await tx.wait();
    },
  });

  describe("Post-VIP state", () => {
    const positionId = (() => {
      let _positionId: BigNumber | undefined;
      return () => {
        if (_positionId !== undefined) {
          return _positionId;
        }
        const increaseLiquidityEvent = executionTxReceipt.logs
          .filter(({ address }) => address === V3_POSITION_MANAGER)
          .map(logEntry => v3pm.interface.parseLog(logEntry))
          .find(({ name }) => name === "IncreaseLiquidity");
        _positionId = increaseLiquidityEvent?.args.tokenId;
        if (_positionId === undefined) {
          throw new Error("IncreaseLiquidity event not found");
        }
        return _positionId;
      };
    })();

    it("should emit IncreaseLiquidity event", async () => {
      await expect(executionTx).to.emit(v3pm, "IncreaseLiquidity");
    });

    it("should increase liquidity in PCS v3", async () => {
      const position = await v3pm.positions(positionId());
      expect(position.liquidity).to.not.equal(0);
    });

    it("should transfer all V2 LP tokens from treasury", async () => {
      expect(await v2lp.balanceOf(TREASURY)).to.equal(0);
    });

    it("should leave no V2 LP tokens in liquidity mover", async () => {
      expect(await v2lp.balanceOf(LIQUIDITY_MOVER)).to.equal(0);
    });

    it("should leave no USDT in liquidity mover", async () => {
      expect(await usdt.balanceOf(LIQUIDITY_MOVER)).to.equal(0);
    });

    it("should leave no VAI in liquidity mover", async () => {
      expect(await vai.balanceOf(LIQUIDITY_MOVER)).to.equal(0);
    });

    it(`should increase USDT balance in treasury by ${formatUnits(EXPECTED_USDT_REFUND, 18)}`, async () => {
      const treasuryUsdtBalanceAfter = await usdt.balanceOf(TREASURY);
      const delta = treasuryUsdtBalanceAfter.sub(treasuryUsdtBalanceBefore);
      expect(delta).to.equal(EXPECTED_USDT_REFUND);
    });

    it(`should increase VAI balance in treasury by ${formatUnits(EXPECTED_VAI_REFUND, 18)}`, async () => {
      const treasuryVaiBalanceAfter = await vai.balanceOf(TREASURY);
      const delta = treasuryVaiBalanceAfter.sub(treasuryVaiBalanceBefore);
      expect(delta).to.equal(EXPECTED_VAI_REFUND);
    });

    it(`should send the NFT to the timelock`, async () => {
      expect(await v3pm.ownerOf(positionId())).to.equal(NORMAL_TIMELOCK);
    });
  });
});
