import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import { Actions, vip98 } from "../../vips/vip-98";
import TRX_ABI from "./abi/IERC20UpgradableAbi.json";
import VTRX_ABI from "./abi/VBep20Abi.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20DelegatorAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PRICE_ORACLE_ABI from "./abi/priceOracleAbi.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_VTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
const OLD_VTRX = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
const VTOKEN_IMPLEMENTATION = "0x13f816511384D3534783241ddb5751c4b7a7e148"; // Original implementation
const NEW_TRX = "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3";
const TRX_HOLDER = "0x2C7A1398368A38489bB6Dc53B79B3e416B531636";
const TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const { bscmainnet } = NETWORK_ADDRESSES;

forking(25892445, async () => {
  testVip("VIP-98 TRON Contract Migration", await vip98());
});

forking(25892445, async () => {
  let comptroller: Contract;
  let trx: Contract;
  let vTrxOld: Contract;
  let vTrx: Contract;
  let oracle: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    const oracleAddress = await comptroller.oracle();
    oracle = new ethers.Contract(oracleAddress, PRICE_ORACLE_ABI, provider);
    trx = new ethers.Contract(NEW_TRX, TRX_ABI, provider);
    vTrxOld = new ethers.Contract(OLD_VTRX, VTRX_ABI, provider);
    vTrx = new ethers.Contract(NEW_VTRX, VTRX_ABI, provider);

    await pretendExecutingVip(await vip98(), bscmainnet.NORMAL_TIMELOCK);
  });

  describe("Post-VIP behavior", async () => {
    it('sets TRXOLD name to "Venus TRXOLD"', async () => {
      expect(await vTrxOld.name()).to.equal("Venus TRXOLD");
    });

    it('sets TRXOLD symbol to "vTRXOLD"', async () => {
      expect(await vTrxOld.symbol()).to.equal("vTRXOLD");
    });

    it("restores TRXOLD implementation to the original one", async () => {
      const vTrxOldDelegator = new ethers.Contract(OLD_VTRX, VBEP20_DELEGATOR_ABI, provider);
      const impl = await vTrxOldDelegator.implementation();
      expect(impl).to.equal(VTOKEN_IMPLEMENTATION);
    });

    it("pauses TRXOLD minting", async () => {
      const mintingPaused = await comptroller.actionPaused(OLD_VTRX, Actions.MINT);
      expect(mintingPaused).to.equal(true);
    });

    it("pauses TRXOLD borrowing", async () => {
      const mintingPaused = await comptroller.actionPaused(OLD_VTRX, Actions.BORROW);
      expect(mintingPaused).to.equal(true);
    });

    it("pauses entering TRXOLD market", async () => {
      const mintingPaused = await comptroller.actionPaused(OLD_VTRX, Actions.ENTER_MARKETS);
      expect(mintingPaused).to.equal(true);
    });

    it("sets TRXOLD reserve factor to 100%", async () => {
      const newReserveFactor = await vTrxOld.reserveFactorMantissa();
      expect(newReserveFactor).to.equal(parseUnits("1.0", 18));
    });

    it("adds a new TRX market", async () => {
      const market = await comptroller.markets(NEW_VTRX);
      expect(market.isListed).to.equal(true);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("sets the supply cap to 180,000 TRX", async () => {
      const newCap = await comptroller.supplyCaps(NEW_VTRX);
      expect(newCap).to.equal(parseUnits("180000", 6));
    });

    it("sets the borrow cap to 100,000 TRX", async () => {
      const newCap = await comptroller.borrowCaps(NEW_VTRX);
      expect(newCap).to.equal(parseUnits("100000", 6));
    });

    it("does not leave TRX on the balance of the governance", async () => {
      const timelockBalance = await trx.balanceOf(TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });

    it("does not leave vTRX on the balance of the governance", async () => {
      const timelockBalance = await vTrx.balanceOf(TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });

    it("moves 24,750 vTRX to the community wallet", async () => {
      const communityBalance = await vTrx.balanceOf(TRX_HOLDER);
      expect(communityBalance).to.equal(parseUnits("24750", 8));
    });

    it("has the correct oracle price", async () => {
      const price = await oracle.getUnderlyingPrice(NEW_VTRX);
      expect(price).to.equal(parseUnits("0.0687784", 30));
    });

    it("sets the admin to governance", async () => {
      expect(await vTrx.admin()).to.equal(TIMELOCK);
    });
  });
});
