import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip012 from "../../../proposals/opbnbtestnet/vip-012";
import BEACON_ABI from "./abi/beacon.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;

const VTOKEN_BEACON = "0xcc633492097078Ae590C0d11924e82A23f3Ab3E2";
const VTOKEN_IMPL = "0xd1fC255c701a42b8eDe64eE92049444FF23626A0";

const VWBNB_CURRENT_UNDERLYING = "0xF9ce72611a1BE9797FdD2c995dB6fB61FD20E4eB";
const VWBNB_NEW_UNDERLYING = "0x4200000000000000000000000000000000000006";

forking(22766514, () => {
  let vTokenBeacon: Contract;
  let vWBNB: Contract;
  let resilientOracle: Contract;
  describe("Pre-VIP behavior", () => {
    before(async () => {
      vTokenBeacon = await ethers.getContractAt(BEACON_ABI, VTOKEN_BEACON);
      vWBNB = await ethers.getContractAt(VTOKEN_ABI, opbnbtestnet.vWBNB_CORE);
      resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, opbnbtestnet.RESILIENT_ORACLE);
    });

    it("vtoken impl address", async () => {
      expect(await vTokenBeacon.implementation()).to.equal(VTOKEN_IMPL);
    });

    it("vWBNB current underlying address", async () => {
      expect(await vWBNB.underlying()).to.equal(VWBNB_CURRENT_UNDERLYING);
    });

    it("should revert for non configured asset price request", async () => {
      await expect(resilientOracle.getPrice(VWBNB_NEW_UNDERLYING)).to.be.revertedWith("invalid resilient oracle price");
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip012());
    });

    it("vtoken impl address", async () => {
      expect(await vTokenBeacon.implementation()).to.equal(VTOKEN_IMPL);
    });

    it("vWBNB new underlying address", async () => {
      expect(await vWBNB.underlying()).to.equal(VWBNB_NEW_UNDERLYING);
    });

    it("should not for configured asset price request", async () => {
      await expect(resilientOracle.getPrice(VWBNB_NEW_UNDERLYING)).not.to.be.revertedWith(
        "invalid resilient oracle price",
      );
    });
  });
});
