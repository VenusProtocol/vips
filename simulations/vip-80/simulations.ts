import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, BigNumberish, Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";

import { initMainnetUser } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip80 } from "../../vips/vip-80";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import GOVERNOR_V3_ABI from "./abi/governorV3Abi.json";
import VAI_CONTROLLER_ABI from "./abi/vaiControllerAbi.json";
import VAI_TOKEN_ABI from "./abi/vaiTokenAbi.json";

const ACCESS_CONTROL = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const COMPTROLLER_PROXY = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const COMPTROLLER_IMPL = "0xf2721703d5429BeC86bD0eD86519E0859Dd88209";
const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const VAI_CONTROLLER_IMPL = "0x8A1e5Db8f622B97f4bCceC4684697199C1B1D11b";
const COMPTROLLER_LENS = "0x50F618A2EAb0fB55e87682BbFd89e38acb2735cD";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const LIQUIDATOR_PROXY = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
const LIQUIDATOR_PROXY_ADMIN = "0x2b40b43ac5f7949905b0d2ed9d6154a8ce06084a";
const LIQUIDATOR_IMPL = "0x0BE68b10dFB2e303D3D0a51Cd8368Fb439E46409";
const BASE_RATE_MANTISSA = parseUnits("0.01", 18);

forking(24265539, () => {
  testVip("VIP-80 Stability fee", vip80(), { governorAbi: GOVERNOR_V3_ABI });

  describe("VIP-80 Post-upgrade behavior", async () => {
    const BLOCKS_PER_YEAR = 10512000n;
    const interestPerBlock = parseUnits("0.01", 18).div(BLOCKS_PER_YEAR);
    let comptroller: Contract;
    let vaiController: Contract;
    let vaiUser: SignerWithAddress;

    // Computes simple interest taking rounding into account
    const simpleInterest = (amount: BigNumber, blocks: BigNumberish): BigNumber => {
      return amount.mul(interestPerBlock).mul(blocks).div(parseUnits("1", 18));
    };

    const postUpgradeFixture = async () => {
      const provider = ethers.provider;
      const signer = provider.getSigner();
      comptroller = new ethers.Contract(COMPTROLLER_PROXY, COMPTROLLER_ABI, provider);
      vaiController = new ethers.Contract(VAI_CONTROLLER_PROXY, VAI_CONTROLLER_ABI, signer);
      const someVaiUserAddress = "0x5c062b3b0486f61789d680cae37909b92c0dacc5";
      vaiUser = await initMainnetUser(someVaiUserAddress, parseEther("1.0"));
    };

    beforeEach(async () => {
      await loadFixture(postUpgradeFixture);
    });

    it("sets Comptroller implementation and storage vars", async () => {
      expect(await comptroller.comptrollerImplementation()).to.equal(COMPTROLLER_IMPL);
      expect(await comptroller.comptrollerLens()).to.equal(COMPTROLLER_LENS);
    });

    it("migrates venusSpeeds to venusSupplySpeeds and venusBorrowSpeeds", async () => {
      const vCakeAddress = "0x86ac3974e2bd0d60825230fa6f355ff11409df5c";
      const speed = "434027777777778";
      expect(await comptroller.venusSpeeds(vCakeAddress)).to.equal(0);
      expect(await comptroller.venusSupplySpeeds(vCakeAddress)).to.equal(speed);
      expect(await comptroller.venusBorrowSpeeds(vCakeAddress)).to.equal(speed);
    });

    it("sets new VAIController implementation and storage vars", async () => {
      expect(await vaiController.vaiControllerImplementation()).to.equal(VAI_CONTROLLER_IMPL);
      expect(await vaiController.accessControl()).to.equal(ACCESS_CONTROL);
      expect(await vaiController.baseRateMantissa()).to.equal(BASE_RATE_MANTISSA);
      expect(await vaiController.receiver()).to.equal(TREASURY);
    });

    it("sets new Liquidator implementation", async () => {
      const ProxyAdminInterface = [`function getProxyImplementation(address) view returns (address)`];
      const proxyAdmin = await ethers.getContractAt(ProxyAdminInterface, LIQUIDATOR_PROXY_ADMIN);
      const result = await proxyAdmin.getProxyImplementation(LIQUIDATOR_PROXY);
      expect(result).to.equal(LIQUIDATOR_IMPL);
    });

    it("still does not allow to mint VAI", async () => {
      const REJECTION = 2;
      expect(await vaiController.connect(vaiUser).callStatic.mintVAI(parseUnits("1", 18))).to.equal(REJECTION);
    });

    it("should accrue zero interest immediately after the VIP is executed", async () => {
      const mintedVAIs = await comptroller.mintedVAIs(vaiUser.address);
      expect(await vaiController.getVAIRepayAmount(vaiUser.address)).to.equal(mintedVAIs);
    });

    it("should accrue 1% after a year", async () => {
      await network.provider.send("evm_setAutomine", [false]);
      const mintedVAIs = await comptroller.mintedVAIs(vaiUser.address);
      // We need to account for rounding errors since contracts work with rate per block
      const amountToRepayWithInterest = mintedVAIs.add(simpleInterest(mintedVAIs, BLOCKS_PER_YEAR));
      await mine(BLOCKS_PER_YEAR - 1n); // Accruing interest in the next block
      await vaiController.accrueVAIInterest();
      await mine();
      expect(await vaiController.getVAIRepayAmount(vaiUser.address)).to.equal(amountToRepayWithInterest);
    });

    it("should accrue 1% before new minting, and 1% of the new amount after the minting", async () => {
      await network.provider.send("evm_setAutomine", [false]);
      const receivedVaiT0 = await comptroller.mintedVAIs(vaiUser.address);
      const admin = await initMainnetUser(await comptroller.admin(), parseEther("1"));
      const receivedVaiT1 = parseUnits("50", 18);

      await mine(BLOCKS_PER_YEAR - 1n);
      await comptroller.connect(admin)._setVAIMintRate(parseUnits("1", 18));
      await vaiController.connect(vaiUser).mintVAI(receivedVaiT1);
      await mine();

      const interestT1 = simpleInterest(receivedVaiT0, BLOCKS_PER_YEAR);
      const interestT2 = simpleInterest(receivedVaiT0.add(receivedVaiT1), BLOCKS_PER_YEAR);

      await mine(BLOCKS_PER_YEAR - 1n);
      await vaiController.accrueVAIInterest();
      await mine();
      const amountToRepayWithInterest = receivedVaiT0.add(receivedVaiT1).add(interestT1).add(interestT2);
      expect(await vaiController.getVAIRepayAmount(vaiUser.address)).to.equal(amountToRepayWithInterest);
    });

    it("should accrue 1% before repayment, and 1% of the new amount after repayment", async () => {
      await network.provider.send("evm_setAutomine", [false]);
      const provider = ethers.provider;

      const repaidVaiT1 = parseUnits("50", 18);
      const vai = new ethers.Contract(await vaiController.getVAIAddress(), VAI_TOKEN_ABI, provider);
      const impersonatedController = await initMainnetUser(vaiController.address, parseEther("1"));
      await vai.connect(impersonatedController).mint(vaiUser.address, repaidVaiT1);
      await vai.connect(vaiUser).approve(vaiController.address, repaidVaiT1);

      await mine(BLOCKS_PER_YEAR - 1n);
      await vaiController.connect(vaiUser).repayVAI(repaidVaiT1);
      await mine();

      const remainingPrincipalT1 = parseUnits("380.495049504686207630", 18);
      expect(await comptroller.mintedVAIs(vaiUser.address)).to.equal(remainingPrincipalT1);

      await mine(BLOCKS_PER_YEAR - 1n);
      await vaiController.accrueVAIInterest();
      await mine();
      const interestT2 = simpleInterest(remainingPrincipalT1, BLOCKS_PER_YEAR * 2n);
      const amountToRepayWithInterest = remainingPrincipalT1.add(interestT2);
      expect(await vaiController.getVAIRepayAmount(vaiUser.address)).to.equal(amountToRepayWithInterest);
    });
  });
});
