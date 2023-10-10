import { expect } from "chai";

import { forking, testVip } from "../../../src/vip-framework";
import { vip155Testnet } from "../../../vips/vip-155-testnet";
import vBNB_ABI from "./abi/vBNB.json";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const vBNB_ADDRESS = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";

forking(34084829, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
  });

  testVip("VIP-154", vip155Testnet());

  describe("Post-VIP behavior", async () => {
    let vBNB: ethers.Contract;
    before(async () => {
      impersonateAccount(NORMAL_TIMELOCK);
      vBNB = new ethers.Contract(vBNB_ADDRESS, vBNB_ABI, provider);
    });
    
    it("validate admin", async () => {
      expect(await vBNB.admin()).to.be.equal(NORMAL_TIMELOCK);
    });
  });
});
