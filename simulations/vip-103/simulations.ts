import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import { vip103 } from "../../vips/vip-103";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_VTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
const OLD_VTRX = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

forking(26544741, async () => {
  testVip("VIP-103 Gauntlet Rrecommendations", await vip103());
});

forking(26544741, async () => {
  let comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await pretendExecutingVip(await vip103(), bscmainnet.NORMAL_TIMELOCK);
  });

  describe("Post-VIP behavior", async () => {
    it("Decrease TRX_OLD collateral factor to 30%", async () => {
      const market = await comptroller.markets(OLD_VTRX);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.3", 18));
    });

    it("Increase NEW_VTRX collateral factor to 40%", async () => {
      const market = await comptroller.markets(NEW_VTRX);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.4", 18));
    });

    it("Decrease SXP collateral factor to 25%", async () => {
      const market = await comptroller.markets(VSXP);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.25", 18));
    });

    it("sets the borrow cap to 4,000,000 NEW_TRX", async () => {
      const newCap = await comptroller.borrowCaps(NEW_VTRX);
      expect(newCap).to.equal(parseUnits("4000000", 6));
    });

    it("sets the borrow cap to 124,700,000 USDC", async () => {
      const newCap = await comptroller.borrowCaps(VUSDC);
      expect(newCap).to.equal(parseUnits("124700000", 18));
    });

    it("sets the borrow cap to 245,500,000 USDT", async () => {
      const newCap = await comptroller.borrowCaps(VUSDT);
      expect(newCap).to.equal(parseUnits("245500000", 18));
    });

    it("sets the supply cap to 5,000,000 NEW_TRX", async () => {
      const newCap = await comptroller.supplyCaps(NEW_VTRX);
      expect(newCap).to.equal(parseUnits("5000000", 6));
    });
  });
});
