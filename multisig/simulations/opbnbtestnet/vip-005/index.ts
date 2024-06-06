import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip005, {
  ACM,
  MARKETS,
  OPBNBTESTNET_MULTISIG,
  POOL_REGISTRY,
  PROTOCOL_SHARE_RESERVE,
  VTREASURY,
} from "../../../proposals/opbnbtestnet/vip-005";
import ACM_ABI from "./abi/accessControlManager.json";
import PSR_ABI from "./abi/protocolShareReserve.json";
import VTOKEN_ABI from "./abi/vToken.json";

forking(18439107, async () => {
  let protocolShareReserve: Contract;
  let accessControlManager: Contract;
  let psrSigner: SignerWithAddress;

  before(async () => {
    protocolShareReserve = await ethers.getContractAt(PSR_ABI, PROTOCOL_SHARE_RESERVE);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);

    psrSigner = await initMainnetUser(PROTOCOL_SHARE_RESERVE, ethers.utils.parseEther("1"));
    await pretendExecutingVip(await vip005());
  });

  describe("Post tx checks", () => {
    it("PSR owner should be multisig", async () => {
      const owner = await protocolShareReserve.owner();
      expect(owner).equals(OPBNBTESTNET_MULTISIG);
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
          .isAllowedToCall(OPBNBTESTNET_MULTISIG, "addOrUpdateDistributionConfigs(DistributionConfig[])"),
      ).to.be.true;

      expect(
        await accessControlManager
          .connect(psrSigner)
          .isAllowedToCall(OPBNBTESTNET_MULTISIG, "removeDistributionConfig(Schema,address)"),
      ).to.be.true;
    });
    it("Validate PSR distribution config", async () => {
      expect(await protocolShareReserve.totalDistributions()).to.equal(2);
      expect(await protocolShareReserve.getPercentageDistribution(VTREASURY, 0)).to.equal(10000);
      expect(await protocolShareReserve.getPercentageDistribution(VTREASURY, 1)).to.equal(10000);
    });

    MARKETS.forEach(market => {
      describe(`${market.name}`, () => {
        let vToken: Contract;

        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, market.address);
        });

        it(`Validate PSR reference in ${market.name} market `, async () => {
          expect(await vToken.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
        });
      });
    });
  });
});
