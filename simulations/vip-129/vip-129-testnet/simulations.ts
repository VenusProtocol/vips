import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip129Testnet } from "../../../vips/vip-129/vip-129-testnet";
import WBETH_ABI from "./abi/IERC20UpgradableAbi.json";
import VWBETH_ABI from "./abi/VBep20Abi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const WBETH = "0xccBB1b1Be3663D22530aAB798e90DE29e2cbC8EE";
const VWBETH = "0xb72e16Cd59bA09fC461f05A5C3bc7ba4798622cf";
const INITIAL_VTOKENS = parseUnits("5.499943", 8);
const TUSD_INITIAL_SUPPLIER = "0x6f057A858171e187124ddEDF034dAc63De5dE5dB";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

forking(30711400, () => {
  let comptroller: ethers.Contract;
  let wbeth: ethers.Contract;
  let vWbeth: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    wbeth = new ethers.Contract(WBETH, WBETH_ABI, provider);
    vWbeth = new ethers.Contract(VWBETH, VWBETH_ABI, provider);
  });

  testVip("VIP-129-testnet Add WBETH Market", vip129Testnet());

  describe("Post-VIP behavior", async () => {
    it("adds a new WBETH market", async () => {
      const market = await comptroller.markets(VWBETH);
      expect(market.isListed).to.equal(true);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("sets the supply cap to 300 WBETH", async () => {
      const newCap = await comptroller.supplyCaps(VWBETH);
      expect(newCap).to.equal(parseUnits("300", 18));
    });

    it("sets the borrow cap to 200 WBETH", async () => {
      const newCap = await comptroller.borrowCaps(VWBETH);
      expect(newCap).to.equal(parseUnits("200", 18));
    });

    it("sets the supply and borrow speeds to 596440972222220", async () => {
      const supplySpeed = await comptroller.venusSupplySpeeds(VWBETH);
      const borrowSpeed = await comptroller.venusBorrowSpeeds(VWBETH);
      expect(supplySpeed).to.equal("596440972222220");
      expect(borrowSpeed).to.equal("596440972222220");
    });

    it("does not leave WBETH on the balance of the governance", async () => {
      const timelockBalance = await wbeth.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });

    it("does not leave vWBETH on the balance of the governance", async () => {
      const timelockBalance = await vWbeth.balanceOf(NORMAL_TIMELOCK);
      expect(timelockBalance).to.equal(0);
    });

    it("moves INITIAL_VTOKENS vWBETH to TUSD_INITIAL_SUPPLIER", async () => {
      const tusdInitialSupplierBalance = await vWbeth.balanceOf(TUSD_INITIAL_SUPPLIER);
      expect(tusdInitialSupplierBalance).to.equal(INITIAL_VTOKENS);
    });

    it("sets the admin to governance", async () => {
      expect(await vWbeth.admin()).to.equal(NORMAL_TIMELOCK);
    });
  });
});
