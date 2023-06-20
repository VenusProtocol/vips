import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip130 } from "../../../vips/vip-130-testnet";
import ACM_ABI from "./abi/IAccessControlManager_ABI.json";
import VAI_CONTROLLER_ABI from "./abi/VAIController_ABI.json";
import VAI_ABI from "./abi/VAI_ABI.json";
import { Signer } from "ethers";

const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const VAI_CONTROLLER_PROXY = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
const VAI = "0x5fFbE5302BadED40941A403228E6AD03f93752d9";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const PSM_USDT = "0x6A79A72d78004dABbBa870Dd2Da6C142c78a3d06";
const BASE_RATE_MANTISSA = parseUnits("2.72", 18);

forking(30860798, () => {
  const provider = ethers.provider;
  let vai: ethers.Contract;
  let vaiControllerProxy: ethers.Contract;
  let accessControlManager: ethers.Contract;
  let psmSigner: Signer;

  before(async () => {
    vai = new ethers.Contract(VAI, VAI_ABI, provider);
    vaiControllerProxy = new ethers.Contract(VAI_CONTROLLER_PROXY, VAI_CONTROLLER_ABI, provider);
    accessControlManager = new ethers.Contract(ACM, ACM_ABI, provider);
    psmSigner = await initMainnetUser(PSM_USDT, ethers.utils.parseEther("1"));
  });

  testVip("VIP-130 Add Peg Stability (USDT)", vip130());
  describe("Post-VIP behavior", async () => {
    it("Verify PSM_USDT is admin of VAI contract", async () => {
      const check = await vai.wards(PSM_USDT);
      expect(check).equals(1);
    });

    it("Verify access control setup", async () => {
      expect(await accessControlManager.connect(psmSigner).isAllowedToCall(CRITICAL_TIMELOCK, "pause()")).equals(true);
      expect(await accessControlManager.connect(psmSigner).isAllowedToCall(CRITICAL_TIMELOCK, "resume()")).equals(true);

      expect(await accessControlManager.connect(psmSigner).isAllowedToCall(FAST_TRACK_TIMELOCK, "pause()")).equals(
        true,
      );
      expect(await accessControlManager.connect(psmSigner).isAllowedToCall(FAST_TRACK_TIMELOCK, "resume()")).equals(
        true,
      );

      expect(await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setFeeIn(uint256)")).equals(true);
      expect(await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setFeeOut(uint256)")).equals(true);
      expect(await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setVaiMintCap(uint256)")).equals(true);
      expect(await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setComptroller(address)")).equals(true);
      expect(await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setVenusTreasury(address)")).equals(true);

    });

    it("Verify new VAI base rate is 2.72%", async () => {
      const currentBaseRate = await vaiControllerProxy.baseRateMantissa();
      expect(currentBaseRate).equals(BASE_RATE_MANTISSA);
    });
  });
});
