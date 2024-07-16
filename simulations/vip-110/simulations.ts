import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import { vip110 } from "../../vips/vip-110";
import VAI_CONTROLLER_PROXY_ABI from "./abi/VAIControllerProxy_ABI.json";
import VAI_ABI from "./abi/VAI_ABI.json";

const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const VAI_CONTROLLER_IMPL = "0x8A1e5Db8f622B97f4bCceC4684697199C1B1D11b";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const VENUS_DEPLOYER = "0x1ca3Ac3686071be692be7f1FBeCd668641476D7e";

forking(27430345, async () => {
  const provider = ethers.provider;
  let vai: Contract;
  let vaiControllerProxy: Contract;

  before(async () => {
    vai = new ethers.Contract(VAI, VAI_ABI, provider);
    vaiControllerProxy = new ethers.Contract(VAI_CONTROLLER_PROXY, VAI_CONTROLLER_PROXY_ABI, provider);
  });

  testVip("VIP-110 Change Admin in VAI", await vip110());
  describe("Post-VIP behavior", async () => {
    it("Check admin of vai contract", async () => {
      const check = await vai.wards(NORMAL_TIMELOCK);
      expect(check).equals(1);
    });

    it("Remove legacy deployer as a admin of vai contract", async () => {
      const check = await vai.wards(VENUS_DEPLOYER);
      expect(check).equals(0);
    });

    it("Restore orignal impl of vaiController", async () => {
      const impl = await vaiControllerProxy.vaiControllerImplementation();
      expect(impl).equals(VAI_CONTROLLER_IMPL);
    });
  });
});
