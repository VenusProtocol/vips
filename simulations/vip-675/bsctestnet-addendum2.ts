import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { PRIME_V2 } from "../../vips/vip-675/bsctestnet";
import vip675Addendum2, {
  NEW_CYCLE_GRANT_ACCOUNTS,
  NEW_CYCLE_SIG,
  NEW_PRIME_V2_IMPL,
  PROXY_ADMIN,
} from "../../vips/vip-675/bsctestnet-addendum2";
import ACM_ABI from "./abi/AccessControlManager.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const { bsctestnet } = NETWORK_ADDRESSES;
const { ACCESS_CONTROL_MANAGER } = bsctestnet;

// Current bsctestnet impl behind the PrimeV2 proxy (pre-upgrade snapshot).
const OLD_PRIME_V2_IMPL = "0xf33Ab2625B94c73B1041c03ded18bDD0F8C681A7";

// Selector for the new ACM-gated function added by the upgrade. Used to assert
// the new selector is callable post-upgrade.
const RECORD_CYCLE_SELECTOR = ethers.utils.id(NEW_CYCLE_SIG).slice(0, 10);

const FORK_BLOCK = 111408294;

const roleFor = (target: string, signature: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [target, signature]);

forking(FORK_BLOCK, async () => {
  let acm: Contract;
  let proxyAdmin: Contract;

  before(async () => {
    acm = new ethers.Contract(ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
  });

  describe("Pre-VIP state", () => {
    it("PrimeV2 proxy still points at the old implementation", async () => {
      expect((await proxyAdmin.getProxyImplementation(PRIME_V2)).toLowerCase()).to.equal(
        OLD_PRIME_V2_IMPL.toLowerCase(),
      );
    });

    it("ProxyAdmin is owned by NormalTimelock", async () => {
      expect((await proxyAdmin.owner()).toLowerCase()).to.equal(bsctestnet.NORMAL_TIMELOCK.toLowerCase());
    });

    it("recordCycleSnapshot selector is not present on the old impl", async () => {
      const code = await ethers.provider.getCode(OLD_PRIME_V2_IMPL);
      expect(code.includes(RECORD_CYCLE_SELECTOR.slice(2)), "selector unexpectedly present").to.equal(false);
    });

    it("NormalTimelock + Guardian do not yet hold recordCycleSnapshot permission", async () => {
      for (const account of NEW_CYCLE_GRANT_ACCOUNTS) {
        expect(await acm.hasRole(roleFor(PRIME_V2, NEW_CYCLE_SIG), account)).to.equal(false);
      }
    });
  });

  testVip("VIP-675 addendum 2 [Testnet]", await vip675Addendum2(), {
    callbackAfterExecution: async txResponse => {
      // 2 PermissionGranted events from ACM (NormalTimelock + Guardian).
      // Proxy Upgraded event isn't in ProxyAdmin's ABI; impl change is asserted
      // via getProxyImplementation in the Post-VIP section instead.
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [2]);
    },
  });

  describe("Post-VIP state", () => {
    it("PrimeV2 proxy now points at the new implementation", async () => {
      expect((await proxyAdmin.getProxyImplementation(PRIME_V2)).toLowerCase()).to.equal(
        NEW_PRIME_V2_IMPL.toLowerCase(),
      );
    });

    it("recordCycleSnapshot selector is present on the new impl", async () => {
      const code = await ethers.provider.getCode(NEW_PRIME_V2_IMPL);
      expect(code.includes(RECORD_CYCLE_SELECTOR.slice(2)), "selector missing on new impl").to.equal(true);
    });

    it("NormalTimelock + Guardian hold recordCycleSnapshot permission", async () => {
      for (const account of NEW_CYCLE_GRANT_ACCOUNTS) {
        expect(await acm.hasRole(roleFor(PRIME_V2, NEW_CYCLE_SIG), account)).to.equal(true);
      }
    });
  });
});
