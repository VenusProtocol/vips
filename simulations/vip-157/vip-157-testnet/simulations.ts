import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { FEE_IN, FEE_OUT, vip157Testnet } from "../../../vips/vip-157/vip-157-testnet";
import { swapStableForVAIAndValidate, swapVAIForStableAndValidate } from "../utils";
import ACM_ABI from "./abi/IAccessControlManager_ABI.json";
import PSM_ABI from "./abi/PSM_ABI.json";
import ResilientOracle_ABI from "./abi/ResilientOracle_ABI.json";
import USDT_ABI from "./abi/USDT_ABI.json";
import VAI_CONTROLLER_ABI from "./abi/VAIController_ABI.json";
import VAI_ABI from "./abi/VAI_ABI.json";

const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const VAI_CONTROLLER_PROXY = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
const VAI = "0x5fFbE5302BadED40941A403228E6AD03f93752d9";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const PSM_USDT = "0xB21E69eef4Bc1D64903fa28D9b32491B1c0786F1";
const BASE_RATE_MANTISSA = parseUnits("2.72", 18);
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const STABLE_TOKEN_HOLDER = "0xd9a851794184869fba26ae2417008cb09c9195f1";
const VAI_HOLDER = "0xd24d881ff77a47188f40b2a0c36ecb6973b5f2a4";

forking(32091802, async () => {
  const provider = ethers.provider;
  let vai: Contract;
  let vaiControllerProxy: Contract;
  let accessControlManager: Contract;
  let resilientOracle: Contract;
  let usdt: Contract;
  let psm: Contract;
  let psmSigner: Signer;
  let tokenHolder: Signer;
  let vaiHolder: Signer;

  before(async () => {
    vai = new ethers.Contract(VAI, VAI_ABI, provider);
    vaiControllerProxy = new ethers.Contract(VAI_CONTROLLER_PROXY, VAI_CONTROLLER_ABI, provider);
    accessControlManager = new ethers.Contract(ACM, ACM_ABI, provider);
    psm = new ethers.Contract(PSM_USDT, PSM_ABI, provider);
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, ResilientOracle_ABI, provider);
    usdt = new ethers.Contract(USDT, USDT_ABI, provider);

    psmSigner = await initMainnetUser(PSM_USDT, ethers.utils.parseEther("1"));
    tokenHolder = await initMainnetUser(STABLE_TOKEN_HOLDER, ethers.utils.parseEther("1"));
    vaiHolder = await initMainnetUser(VAI_HOLDER, ethers.utils.parseEther("1"));
  });

  testVip("VIP-157 Add Peg Stability (USDT)", await vip157Testnet());

  describe("Post-VIP behavior", async () => {
    it("Verify PSM_USDT is admin of VAI contract", async () => {
      const check = await vai.wards(PSM_USDT);
      expect(check).equals(1);
    });

    it("Verify access control setup", async () => {
      expect(await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "pause()")).equals(true);
      expect(await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "resume()")).equals(true);

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
        await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setOracle(address)"),
      ).equals(true);
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setVenusTreasury(address)"),
      ).equals(true);
    });

    it("Verify new VAI base rate is 2.72%", async () => {
      const currentBaseRate = await vaiControllerProxy.baseRateMantissa();
      expect(currentBaseRate).equals(BASE_RATE_MANTISSA);
    });
    it("Verify feeIn and feeOut", async () => {
      expect(await psm.feeIn()).to.equal(FEE_IN);
      expect(await psm.feeOut()).to.equal(FEE_OUT);
    });
    it("Verify ONE_DOLLAR value", async () => {
      const tokenDecimals = await usdt.decimals();
      const expectedValue = parseUnits("1", 36 - tokenDecimals);
      expect(await psm.ONE_DOLLAR()).to.equal(expectedValue);
    });
    describe("Swaps test: ", () => {
      let stableTokenPrice: BigNumber;
      let oneDollar: BigNumber;
      let tokenDecimals: number;
      before(async () => {
        stableTokenPrice = await resilientOracle.getPrice(USDT);
        tokenDecimals = await usdt.decimals();
        oneDollar = await psm.ONE_DOLLAR();
      });
      it("Verify swapStableForVAI works", async () => {
        await swapStableForVAIAndValidate(
          psm,
          usdt,
          stableTokenPrice,
          tokenHolder,
          STABLE_TOKEN_HOLDER,
          vai,
          BigNumber.from(FEE_IN),
          tokenDecimals,
          oneDollar,
        );
      });
      it("Verify swapVAIForStable works", async () => {
        await swapVAIForStableAndValidate(
          psm,
          stableTokenPrice,
          vai,
          vaiHolder,
          BigNumber.from(FEE_OUT),
          usdt,
          tokenDecimals,
          oneDollar,
        );
      });
    });
  });
});
