import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip005, { ACM, NORMAL_TIMELOCK, POOL_REGISTRY, PSR, VTREASURY } from "../../../proposals/arbitrumone/vip-005";
import ACM_ABI from "./abi/accessControlManager.json";
import PSR_ABI from "./abi/protocolShareReserve.json";

forking(216258056, async () => {
  let protocolShareReserve: Contract;
  let accessControlManager: Contract;
  let psrSigner: SignerWithAddress;

  before(async () => {
    protocolShareReserve = await ethers.getContractAt(PSR_ABI, PSR);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);

    psrSigner = await initMainnetUser(PSR, ethers.utils.parseEther("1"));
    await pretendExecutingVip(await vip005());
  });

  describe("Post tx checks", () => {
    it("PSR owner should be multisig", async () => {
      const owner = await protocolShareReserve.owner();
      expect(owner).equals(NORMAL_TIMELOCK);
    });

    it("PSR should have correct ACM reference", async () => {
      const acm = await protocolShareReserve.accessControlManager();
      expect(acm).equals(ACM);
    });

    it("PSR should have correct PoolRegistry reference", async () => {
      expect(await protocolShareReserve.poolRegistry()).to.equal(POOL_REGISTRY);
    });

    it("Verify Multisig permissions for PSR", async () => {
      expect(
        await accessControlManager
          .connect(psrSigner)
          .isAllowedToCall(NORMAL_TIMELOCK, "addOrUpdateDistributionConfigs(DistributionConfig[])"),
      ).to.be.true;

      expect(
        await accessControlManager
          .connect(psrSigner)
          .isAllowedToCall(NORMAL_TIMELOCK, "removeDistributionConfig(Schema,address)"),
      ).to.be.true;
    });

    it("Validate PSR distribution config", async () => {
      expect(await protocolShareReserve.totalDistributions()).to.equal(2);
      expect(await protocolShareReserve.getPercentageDistribution(VTREASURY, 0)).to.equal(10000);
      expect(await protocolShareReserve.getPercentageDistribution(VTREASURY, 1)).to.equal(10000);
    });
  });
});
