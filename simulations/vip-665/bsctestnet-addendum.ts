import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip665Addendum, {
  INSTITUTIONAL_VAULT_CONTROLLER,
  NEW_CONTROLLER_IMPLEMENTATION,
  OLD_CONTROLLER_IMPLEMENTATION,
  PROXY_ADMIN,
} from "../../vips/vip-665/bsctestnet-addendum";
import INSTITUTIONAL_VAULT_CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const { GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;

// VIP-665 already executed on BNB testnet (controller on OLD_CONTROLLER_IMPLEMENTATION, createVault /
// setInstitutionNameOverride permissions granted) and the new implementation (clearable overrides) is deployed.
const FORK_BLOCK = 116948919;

const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const ONE_DAY = 24 * 60 * 60;
const TEST_INSTITUTION = "0x000000000000000000000000000000000000D00d";
const TEMP_OVERRIDE = "Temp Override";

const vaultConfig = {
  supplyAsset: USDT,
  fixedAPY: 500,
  reserveFactor: parseEther("0.1"),
  minBorrowCap: parseEther("1000"),
  maxBorrowCap: parseEther("10000000"),
  minSupplierDeposit: parseEther("100"),
  openDuration: 7 * ONE_DAY,
  lockDuration: 30 * ONE_DAY,
  settlementWindow: ONE_DAY,
};
const instConfig = {
  collateralAsset: USDC,
  idealCollateralAmount: parseEther("100000"),
  marginRate: parseEther("0.8"),
  institutionOperator: TEST_INSTITUTION,
  positionTokenId: 0,
};
const riskConfig = {
  liquidationThreshold: parseEther("0.85"),
  liquidationIncentive: parseEther("1.08"),
  latePenaltyRate: parseEther("1.15"),
};

forking(FORK_BLOCK, async () => {
  let controller: Contract;
  let proxyAdmin: Contract;
  let guardian: Signer;

  let overrideVault: string;

  before(async () => {
    controller = new ethers.Contract(
      INSTITUTIONAL_VAULT_CONTROLLER,
      INSTITUTIONAL_VAULT_CONTROLLER_ABI,
      ethers.provider,
    );
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
    guardian = await initMainnetUser(GUARDIAN, parseEther("1"));
  });

  describe("Pre-VIP: controller on the VIP-665 implementation (override cannot be cleared)", () => {
    it("proxy should still point to the VIP-665 implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(INSTITUTIONAL_VAULT_CONTROLLER)).to.equal(
        OLD_CONTROLLER_IMPLEMENTATION,
      );
    });

    it("the new implementation should be deployed", async () => {
      expect(await ethers.provider.getCode(NEW_CONTROLLER_IMPLEMENTATION)).to.not.equal("0x");
    });

    it("Guardian creates a vault and sets an institutionNameOverride on it", async () => {
      overrideVault = await controller
        .connect(guardian)
        .callStatic.createVault(vaultConfig, instConfig, riskConfig, "Override Vault Share", "ovUSDT", "Acme");
      await (
        await controller
          .connect(guardian)
          .createVault(vaultConfig, instConfig, riskConfig, "Override Vault Share", "ovUSDT", "Acme")
      ).wait();

      await controller.connect(guardian).setInstitutionNameOverride(overrideVault, TEMP_OVERRIDE);
      expect(await controller.institutionNameOverride(overrideVault)).to.equal(TEMP_OVERRIDE);
    });

    it("clearing the override with an empty string REVERTS on the old implementation", async () => {
      await expect(controller.connect(guardian).setInstitutionNameOverride(overrideVault, "")).to.be.reverted;
    });
  });

  testVip(
    "VIP-665 Addendum [BNB Chain Testnet] Institutional Fixed Rate Vault controller re-upgrade",
    await vip665Addendum(),
    {},
  );

  describe("Post-VIP: controller upgraded to the new implementation", () => {
    it("proxy should point to the new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(INSTITUTIONAL_VAULT_CONTROLLER)).to.equal(
        NEW_CONTROLLER_IMPLEMENTATION,
      );
    });

    it("controller ownership is preserved (owner = Normal timelock)", async () => {
      expect(await controller.owner()).to.equal(NORMAL_TIMELOCK);
    });
  });

  describe("Post-VIP: a mistaken institutionNameOverride can now be cleared", () => {
    it("clearing the override with an empty string now SUCCEEDS and falls back to the on-chain name", async () => {
      await controller.connect(guardian).setInstitutionNameOverride(overrideVault, "");
      expect(await controller.institutionNameOverride(overrideVault)).to.equal("");
    });

    it("clearing an already-empty override reverts (InstitutionNameUnchanged)", async () => {
      await expect(controller.connect(guardian).setInstitutionNameOverride(overrideVault, "")).to.be.reverted;
    });
  });
});
