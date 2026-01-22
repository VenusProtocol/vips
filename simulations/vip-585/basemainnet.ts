import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { basemainnet } = NETWORK_ADDRESSES;
const VTREASURY = basemainnet.VTREASURY;
const BASE_PSR = "0x3565001d57c91062367C3792B74458e3c6eD910a";

// Base mainnet PSR is already configured with 100% Treasury allocation
// This VIP does not modify Base - this test verifies the existing config is compatible
const expectedPercentage = [
  [VTREASURY, 10000], // 100% to Treasury
];

forking(41091771, async () => {
  let psr: Contract;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, BASE_PSR);
  });

  describe("Pre-VIP behaviour", async () => {
    it("check ProtocolShareReserve distribution configs - already 100% Treasury", async () => {
      for (const [target, percent] of expectedPercentage) {
        expect(await psr.getPercentageDistribution(target, 0)).to.equal(percent);
        expect(await psr.getPercentageDistribution(target, 1)).to.equal(percent);
      }
    });
  });
});
