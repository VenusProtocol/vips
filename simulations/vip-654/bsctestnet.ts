import { expect } from "chai";
import { constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip654, {
  APRO_ORACLE,
  ATLAS_ORACLE,
  GUARDIAN,
  HBNB,
  HBNB_PRICE,
  NORMAL_TIMELOCK,
  ORACLE_PERMISSIONS,
} from "../../vips/vip-654/bsctestnet";
import ACM_ABI from "./abi/accessControlManagerTestnet.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 124639200; // APRO oracle was deployed at block 124639174

const EXPECTED_PERMISSIONS = ORACLE_PERMISSIONS.length * 2; // Guardian (wildcard) + Normal Timelock (APRO)

forking(FORK_BLOCK, async () => {
  const acm = new ethers.Contract(bsctestnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
  const aproOracle = new ethers.Contract(APRO_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const atlasOracle = new ethers.Contract(ATLAS_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

  describe("Pre-VIP behavior", () => {
    it("has not accepted ownership of the APRO oracle", async () => {
      expect(await aproOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await aproOracle.owner()).to.not.equal(NORMAL_TIMELOCK);
    });

    it("does not grant the Guardian the oracle permissions", async () => {
      for (const signature of ORACLE_PERMISSIONS) {
        expect(await acm.hasPermission(GUARDIAN, constants.AddressZero, signature)).to.equal(false);
      }
    });

    it("does not price hBNB", async () => {
      await expect(resilientOracle.getPrice(HBNB)).to.be.reverted;
    });
  });

  testVip("VIP-654 Testnet", await vip654(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [EXPECTED_PERMISSIONS]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("transfers ownership of the APRO oracle to the Normal Timelock", async () => {
      expect(await aproOracle.owner()).to.equal(NORMAL_TIMELOCK);
    });

    for (const signature of ORACLE_PERMISSIONS) {
      it(`grants the Guardian "${signature}" on every oracle`, async () => {
        expect(await acm.hasPermission(GUARDIAN, constants.AddressZero, signature)).to.equal(true);
      });
    }

    for (const signature of ORACLE_PERMISSIONS) {
      it(`grants the Normal Timelock "${signature}" on the APRO oracle`, async () => {
        expect(await acm.hasPermission(NORMAL_TIMELOCK, APRO_ORACLE, signature)).to.equal(true);
      });
    }

    it("lets the Guardian set a direct price on the APRO oracle through the wildcard", async () => {
      const guardian = await initMainnetUser(GUARDIAN, parseUnits("1", 18));
      await aproOracle.connect(guardian).setDirectPrice(HBNB, HBNB_PRICE);
      expect(await aproOracle.prices(HBNB)).to.equal(HBNB_PRICE);
    });

    it("sets the hBNB direct price on the Atlas oracle", async () => {
      expect(await atlasOracle.prices(HBNB)).to.equal(HBNB_PRICE);
    });

    it("prices hBNB through the ResilientOracle", async () => {
      const config = await resilientOracle.getTokenConfig(HBNB);
      expect(config.oracles[0]).to.equal(ATLAS_ORACLE);
      expect(config.enableFlagsForOracles[0]).to.equal(true);
      expect(await resilientOracle.getPrice(HBNB)).to.equal(HBNB_PRICE);
    });
  });
});
