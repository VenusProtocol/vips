import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip011 } from "../../../proposals/vip-011/vip-011-sepolia";
import BEACON_ABI from "./abis/beacon.json";
import RESILIENT_ORACLE_ABI from "./abis/resilientOracle.json";
import VTOKEN_ABI from "./abis/vToken.json";

const { sepolia } = NETWORK_ADDRESSES;

const VTOKEN_BEACON = "0x0463a7E5221EAE1990cEddB51A5821a68cdA6008";
const VTOKEN_IMPL = "0xa4Fd54cACdA379FB7CaA783B83Cc846f8ac0Faa6";

const VWETH_CURRENT_UNDERLYING = "0x700868CAbb60e90d77B6588ce072d9859ec8E281";
const VWETH_NEW_UNDERLYING = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";

forking(5333300, () => {
  let vTokenBeacon: Contract;
  let vWETH: Contract;
  let resilientOracle: Contract;
  describe("Pre-VIP behavior", () => {
    before(async () => {
      vTokenBeacon = await ethers.getContractAt(BEACON_ABI, VTOKEN_BEACON);
      vWETH = await ethers.getContractAt(VTOKEN_ABI, sepolia.VWETH_CORE);
      resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
    });

    it("vtoken impl address", async () => {
      expect(await vTokenBeacon.implementation()).to.equal(VTOKEN_IMPL);
    });

    it("vWETH current underlying address", async () => {
      expect(await vWETH.underlying()).to.equal(VWETH_CURRENT_UNDERLYING);
    });

    it("should revert for unconfigured asset price request", async () => {
      await expect(resilientOracle.getPrice(VWETH_NEW_UNDERLYING)).to.be.revertedWith("invalid resilient oracle price");
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip011());
    });

    it("vtoken impl address", async () => {
      expect(await vTokenBeacon.implementation()).to.equal(VTOKEN_IMPL);
    });

    it("vWETH new underlying address", async () => {
      expect(await vWETH.underlying()).to.equal(VWETH_NEW_UNDERLYING);
    });

    it("should not for configured asset price request", async () => {
      await expect(resilientOracle.getPrice(VWETH_NEW_UNDERLYING)).not.to.be.revertedWith(
        "invalid resilient oracle price",
      );
    });
  });
});
