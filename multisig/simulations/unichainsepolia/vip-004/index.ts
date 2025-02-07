import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip004, { ACM, NATIVE_TOKEN_GATEWAY_CORE_POOL, PSR } from "../../../proposals/unichainsepolia/vip-004";
import ACM_ABI from "./abi/AccessControlManager.json";
import GATEWAY_ABI from "./abi/NativeTokenGateway.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { unichainsepolia } = NETWORK_ADDRESSES;

const VWETH = "0x3dEAcBe87e4B6333140a46aBFD12215f4130B132";
const WETH = "0x4200000000000000000000000000000000000006";

forking(4724011, async () => {
  let nativeTokenGateway: Contract;
  let protocolShareReserve: Contract;
  let accessControlManager: Contract;
  let psrSigner: SignerWithAddress;

  before(async () => {
    nativeTokenGateway = await ethers.getContractAt(GATEWAY_ABI, NATIVE_TOKEN_GATEWAY_CORE_POOL);
    protocolShareReserve = await ethers.getContractAt(PSR_ABI, PSR);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);

    psrSigner = await initMainnetUser(PSR, ethers.utils.parseEther("1"));
    await pretendExecutingVip(await vip004());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      expect(await nativeTokenGateway.owner()).equals(NETWORK_ADDRESSES.unichainsepolia.GUARDIAN);
    });

    it("Should have correct vWETH and wETH addresses", async () => {
      expect(await nativeTokenGateway.vWNativeToken()).to.be.equal(VWETH);
      expect(await nativeTokenGateway.wNativeToken()).to.be.equal(WETH);
    });
    describe("PSR configuration", () => {
      it("PSR owner should be multisig", async () => {
        const owner = await protocolShareReserve.owner();
        expect(owner).equals(unichainsepolia.GUARDIAN);
      });

      it("PSR should have correct ACM reference", async () => {
        const acm = await protocolShareReserve.accessControlManager();
        expect(acm).equals(ACM);
      });

      it("PSR should have correct PoolRegistry reference", async () => {
        expect(await protocolShareReserve.poolRegistry()).to.equal(unichainsepolia.POOL_REGISTRY);
      });

      it("Verify Multisig permissions for PSR", async () => {
        expect(
          await accessControlManager
            .connect(psrSigner)
            .isAllowedToCall(unichainsepolia.GUARDIAN, "addOrUpdateDistributionConfigs(DistributionConfig[])"),
        ).to.be.true;

        expect(
          await accessControlManager
            .connect(psrSigner)
            .isAllowedToCall(unichainsepolia.GUARDIAN, "removeDistributionConfig(Schema,address)"),
        ).to.be.true;
      });

      it("Validate PSR distribution config", async () => {
        expect(await protocolShareReserve.totalDistributions()).to.equal(2);
        expect(await protocolShareReserve.getPercentageDistribution(unichainsepolia.VTREASURY, 0)).to.equal(10000);
        expect(await protocolShareReserve.getPercentageDistribution(unichainsepolia.VTREASURY, 1)).to.equal(10000);
      });
    });
  });
});
