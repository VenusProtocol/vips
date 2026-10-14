import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { COLLATERALFACTORS_STEWARD, IRM_STEWARD, MARKETCAP_STEWARD } from "../../vips/vip-592/bscmainnet";
import { ACM } from "../../vips/vip-671/addresses/bscmainnet";
import vip672Bscmainnet, { RISK_STEWARD_RECEIVER, STEWARD_GRANTS } from "../../vips/vip-672/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import RECEIVER_ABI from "./abi/RiskStewardReceiver.json";

// Only the ACM grants are simulated here. The full Risk Oracle round trip (checkRiskStewardFlow) runs on
// testnet; it is added here once the spoke contracts are finalised and markets exist to update.

const FORK_BLOCK = 127582696;

/// Holds no role anywhere.
const UNPRIVILEGED = "0x0000000000000000000000000000000000000100";
/// No grant names this contract, so a role that works from here is a wildcard.
const UNRELATED_CONTRACT = "0x0000000000000000000000000000000000000200";

/// `isAllowedToCall` keys the role on `msg.sender`, so the question is asked from the contract's own address.
const acm = new ethers.Contract(ACM, ACM_ABI, ethers.provider);
const mayCall = (contract: string, account: string, signature: string): Promise<boolean> =>
  acm.callStatic.isAllowedToCall(account, signature, { from: contract });

forking(FORK_BLOCK, async () => {
  const receiver = new ethers.Contract(RISK_STEWARD_RECEIVER, RECEIVER_ABI, ethers.provider);

  // The steward side is live today, so these run on every fork block.
  describe("Pre-VIP: the Risk Steward side, on the live chain", () => {
    it("routes the four update types to the three stewards this proposal grants", async () => {
      const expected = {
        supplyCap: MARKETCAP_STEWARD,
        borrowCap: MARKETCAP_STEWARD,
        collateralFactors: COLLATERALFACTORS_STEWARD,
        interestRateModel: IRM_STEWARD,
      };
      for (const [updateType, steward] of Object.entries(expected)) {
        const config = await receiver.getRiskParameterConfig(updateType);
        expect(config.active, updateType).to.be.true;
        expect(config.riskSteward, updateType).to.equal(steward);
      }
    });

    it("holds none of the roles as a wildcard, so each grant is a real change", async () => {
      for (const { role, account } of STEWARD_GRANTS) {
        expect(await mayCall(UNRELATED_CONTRACT, account, role), `${account} holds ${role} as a wildcard`).to.be.false;
      }
    });
  });

  testVip("VIP-672 [bscmainnet] Risk Stewards on the spoke pool", await vip672Bscmainnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [STEWARD_GRANTS.length]);
    },
  });

  describe("Post-VIP state", () => {
    it("grants every role as a wildcard, and to nobody else", async () => {
      for (const { role, account } of STEWARD_GRANTS) {
        expect(await mayCall(UNRELATED_CONTRACT, account, role), `${account} ${role}`).to.be.true;
        expect(await mayCall(UNRELATED_CONTRACT, UNPRIVILEGED, role), `${role} is open`).to.be.false;
      }
    });
  });
});
