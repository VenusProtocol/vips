import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip006, { ACM, POOL_REGISTRY, PSR, VTREASURY } from "../../../proposals/zksyncsepolia/vip-006";
import ACM_ABI from "./abi/accessControlManager.json";
import PSR_ABI from "./abi/protocolShareReserve.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

forking(3615677, async () => {
  let protocolShareReserve: Contract;
  let accessControlManager: Contract;
  let psrSigner: SignerWithAddress;

  before(async () => {
    protocolShareReserve = await ethers.getContractAt(PSR_ABI, PSR);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);

    psrSigner = await initMainnetUser(PSR, ethers.utils.parseEther("1"));
    await pretendExecutingVip(await vip006());
  });

  describe("Post tx checks", () => {
    it("PSR owner should be multisig", async () => {
      const owner = await protocolShareReserve.owner();
      expect(owner).equals(zksyncsepolia.GUARDIAN);
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
          .isAllowedToCall(zksyncsepolia.GUARDIAN, "addOrUpdateDistributionConfigs(DistributionConfig[])"),
      ).to.be.true;

      expect(
        await accessControlManager
          .connect(psrSigner)
          .isAllowedToCall(zksyncsepolia.GUARDIAN, "removeDistributionConfig(Schema,address)"),
      ).to.be.true;
    });

    it("Validate PSR distribution config", async () => {
      expect(await protocolShareReserve.totalDistributions()).to.equal(2);
      expect(await protocolShareReserve.getPercentageDistribution(VTREASURY, 0)).to.equal(10000);
      expect(await protocolShareReserve.getPercentageDistribution(VTREASURY, 1)).to.equal(10000);
    });
  });
});
