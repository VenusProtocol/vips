import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { RESILIENT_ORACLE, VAI, vip260 } from "../../vips/vip-260/bsctestnet";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import VAI_CONTROLLER_ABI from "./abi/vaiController.json";

const VAI_CONTROLLER = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
const SIGNER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

forking(37964187, () => {
  let resilientOracle: ethers.Contract;
  let vaiController: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    impersonateAccount(SIGNER);
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    vaiController = new ethers.Contract(VAI_CONTROLLER, VAI_CONTROLLER_ABI, await ethers.getSigner(SIGNER));
  });

  describe("Pre-VIP behavior", async () => {
    it("Check VAI Price", async () => {
      await expect(resilientOracle.getUnderlyingPrice(VAI)).to.be.revertedWith("invalid resilient oracle price");
    });

    it("accrue interest", async () => {
      await expect(vaiController.accrueVAIInterest()).to.be.revertedWith("invalid resilient oracle price");
    });
  });

  testVip("VIP-260 Add VAI Price Config", vip260(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["PricePosted"], [1]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Check VAI Price", async () => {
      const price = await resilientOracle.getUnderlyingPrice(VAI);
      expect(price).to.equal(parseUnits("1", 18));
    });

    it("accrue interest", async () => {
      await vaiController.accrueVAIInterest();
    });
  });
});
