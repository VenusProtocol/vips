import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { opmainnet } = NETWORK_ADDRESSES;
const VTREASURY = opmainnet.VTREASURY;
const OP_PSR = "0x735ed037cB0dAcf90B133370C33C08764f88140a";

// Optimism mainnet PSR is already configured with 100% Treasury allocation
// This VIP does not modify Optimism - this test verifies the existing config is compatible
const expectedPercentage = [
  [VTREASURY, 10000], // 100% to Treasury
];

forking(146687056, async () => {
  let psr: Contract;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, OP_PSR);
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
