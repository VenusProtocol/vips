import { expect } from "chai";
import { Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip130 } from "../../../vips/vip-131/vip-130";
import ACM_ABI from "./abi/IAccessControlManager_ABI.json";
import VAI_CONTROLLER_ABI from "./abi/VAIController_ABI.json";
import VAI_ABI from "./abi/VAI_ABI.json";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
//TODO: insert mainnet address when PSM_USDT is deployed on mainnet
const PSM_USDT = "";
const BASE_RATE_MANTISSA = parseUnits("2.72", 18);

//TODO: insert block number after deployment of PSM_USDT
forking(30853771, () => {
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

      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setFeeIn(uint256)"),
      ).equals(true);
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setFeeOut(uint256)"),
      ).equals(true);
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setVaiMintCap(uint256)"),
      ).equals(true);
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setComptroller(address)"),
      ).equals(true);
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setVenusTreasury(address)"),
      ).equals(true);
    });

    it("Verify new VAI base rate is 2.72%", async () => {
      const currentBaseRate = await vaiControllerProxy.baseRateMantissa();
      expect(currentBaseRate).equals(BASE_RATE_MANTISSA);
    });
  });
});
