import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;
const VTREASURY = zksyncmainnet.VTREASURY;
const ZKSYNC_PSR = "0xA1193e941BDf34E858f7F276221B4886EfdD040b";

// zkSync mainnet PSR is already configured with 100% Treasury allocation
// This VIP does not modify zkSync - this test verifies the existing config is compatible
const expectedPercentage = [
  [VTREASURY, 10000], // 100% to Treasury
];

forking(67964778, async () => {
  let psr: Contract;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, ZKSYNC_PSR);
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
