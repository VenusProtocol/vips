import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip005, { ACM, NATIVE_TOKEN_GATEWAY_CORE_POOL, PSR } from "../../../proposals/unichainmainnet/vip-005";
import GATEWAY_ABI from "./abi/NativeTokenGateway.json";
import ACM_ABI from "./abi/accessControlManager.json";
import PSR_ABI from "./abi/protocolShareReserve.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

const VWETH = "0xc219BC179C7cDb37eACB03f993f9fDc2495e3374";
const WETH = "0x4200000000000000000000000000000000000006";

forking(8548228, async () => {
  let protocolShareReserve: Contract;
  let accessControlManager: Contract;
  let psrSigner: SignerWithAddress;

  before(async () => {
    protocolShareReserve = await ethers.getContractAt(PSR_ABI, PSR);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);

    psrSigner = await initMainnetUser(PSR, ethers.utils.parseEther("1"));
    nativeTokenGateway = await ethers.getContractAt(GATEWAY_ABI, NATIVE_TOKEN_GATEWAY_CORE_POOL);
    await pretendExecutingVip(await vip005());
  });

  describe("Post tx checks", () => {
    it("PSR owner should be multisig", async () => {
      const owner = await protocolShareReserve.owner();
      expect(owner).equals(unichainmainnet.GUARDIAN);
    });

    it("PSR should have correct ACM reference", async () => {
      const acm = await protocolShareReserve.accessControlManager();
      expect(acm).equals(ACM);
    });

    it("PSR should have correct PoolRegistry reference", async () => {
      expect(await protocolShareReserve.poolRegistry()).to.equal(unichainmainnet.POOL_REGISTRY);
    });

    it("Verify Multisig permissions for PSR", async () => {
      expect(
        await accessControlManager
          .connect(psrSigner)
          .isAllowedToCall(unichainmainnet.GUARDIAN, "addOrUpdateDistributionConfigs(DistributionConfig[])"),
      ).to.be.true;

      expect(
        await accessControlManager
          .connect(psrSigner)
          .isAllowedToCall(unichainmainnet.GUARDIAN, "removeDistributionConfig(Schema,address)"),
      ).to.be.true;
    });

    it("Validate PSR distribution config", async () => {
      expect(await protocolShareReserve.totalDistributions()).to.equal(2);
      expect(await protocolShareReserve.getPercentageDistribution(unichainmainnet.VTREASURY, 0)).to.equal(10000);
      expect(await protocolShareReserve.getPercentageDistribution(unichainmainnet.VTREASURY, 1)).to.equal(10000);
    });
  });

  let nativeTokenGateway: Contract;

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      expect(await nativeTokenGateway.owner()).equals(unichainmainnet.GUARDIAN);
    });

    it("Should have correct owner vWETH and wETH addresses", async () => {
      expect(await nativeTokenGateway.vWNativeToken()).to.be.equal(VWETH);
      expect(await nativeTokenGateway.wNativeToken()).to.be.equal(WETH);
    });
  });
});
