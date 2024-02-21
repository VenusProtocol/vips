import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip260 } from "../../vips/vip-260/bscmainnet";
import LIQUIDATOR_ABI from "./abi/liquidatorAbi.json";
import PROXY_ADMIN_ABI from "./abi/proxyAdmin.json";

const LIQUIDATOR = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const PROXY_ADMIN = "0x2b40B43AC5F7949905b0d2Ed9D6154a8ce06084a";

forking(36324143, () => {
  let liquidator: ethers.Contract;
  let proxyAdmin: ethers.Contract;
  const provider = ethers.provider;
  let prevImplLiquidator: string;

  function createInitializeData() {
    const iface = new ethers.utils.Interface(LIQUIDATOR_ABI);
    return iface.encodeFunctionData("transferOwnershipToTimelock", [NORMAL_TIMELOCK]);
  }

  before(async () => {
    liquidator = new ethers.Contract(LIQUIDATOR, LIQUIDATOR_ABI, provider);
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, provider);
    prevImplLiquidator = await proxyAdmin.getProxyImplementation(LIQUIDATOR);
  });

  testVip("VIP-Liquidator Owner Update", vip260(createInitializeData()), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [LIQUIDATOR_ABI], ["OwnershipTransferStarted", "OwnershipTransferred"], [1, 1]);
    },
  });

  describe("Checks", async () => {
    it("Liquidator Owner should equal to Normal Timelock", async () => {
      const currOwner = await liquidator.owner();
      expect(currOwner).equals(NORMAL_TIMELOCK);
    });

    it("Liquidator Implementation should restore", async () => {
      const currImpl = await proxyAdmin.getProxyImplementation(LIQUIDATOR);
      expect(currImpl).equals(prevImplLiquidator);
    });

    it("Liquidator pending owner should equal to zero address", async () => {
      const currPendingOwner = await liquidator.pendingOwner();
      expect(currPendingOwner).equals(ethers.constants.AddressZero);
    });

    it("ProxyAdmin owner should equal to Normal Timelock", async () => {
      const currOwner = await proxyAdmin.owner();
      expect(currOwner).equals(NORMAL_TIMELOCK);
    });
  });
});
