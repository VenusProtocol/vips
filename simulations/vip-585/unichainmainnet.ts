import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { unichainmainnet } = NETWORK_ADDRESSES;
const VTREASURY = unichainmainnet.VTREASURY;
const UNICHAIN_PSR = "0x0A93fBcd7B53CE6D335cAB6784927082AD75B242";

// Unichain mainnet PSR is already configured with 100% Treasury allocation
// This VIP does not modify Unichain - this test verifies the existing config is compatible
const expectedPercentage = [
  [VTREASURY, 10000], // 100% to Treasury
];

forking(38224528, async () => {
  let psr: Contract;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, UNICHAIN_PSR);
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
