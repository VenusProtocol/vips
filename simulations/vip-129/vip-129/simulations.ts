import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip129 } from "../../../vips/vip-129/vip-129";
import WBETH_ABI from "./abi/IERC20UpgradableAbi.json";
import VWBETH_ABI from "./abi/VBep20Abi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const WBETH = "0xa2e3356610840701bdf5611a53974510ae27e2e1";
const VWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
const INITIAL_VTOKENS = parseUnits("5.499943", 8);
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VTOKEN_RECEIVER = "0x7d3217feb6f310f7e7b7c8ee130db59dcad1dd45";

forking(29121099, () => {
  let comptroller: ethers.Contract;
  let wbeth: ethers.Contract;
  let vWbeth: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    wbeth = new ethers.Contract(WBETH, WBETH_ABI, provider);
    vWbeth = new ethers.Contract(VWBETH, VWBETH_ABI, provider);
  });

  testVip("VIP-129 Add WBETH Market", vip129());

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

    it("moves INITIAL_VTOKENS vWBETH to VTOKEN_RECEIVER", async () => {
      const vTokenReceiverBalance = await vWbeth.balanceOf(VTOKEN_RECEIVER);
      expect(vTokenReceiverBalance).to.equal(INITIAL_VTOKENS);
    });

    it("sets the admin to governance", async () => {
      expect(await vWbeth.admin()).to.equal(NORMAL_TIMELOCK);
    });
  });
});
