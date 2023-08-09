import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import {
  BASE_RATE_MANTISSA,
  GUARDIAN_WALLET,
  USDT_FUNDING_AMOUNT,
  VAI_MINT_CAP,
  FEE_IN,
  FEE_OUT,
  vip156,
} from "../../../vips/vip-156/vip-156";
import { swapStableForVAIAndValidate, swapVAIForStableAndValidate } from "../utils";
import ACM_ABI from "./abi/IAccessControlManager_ABI.json";
import PSM_ABI from "./abi/PSM_ABI.json";
import ResilientOracle_ABI from "./abi/ResilientOracle_ABI.json";
import USDT_ABI from "./abi/USDT_ABI.json";
import VAI_CONTROLLER_ABI from "./abi/VAIController_ABI.json";
import VAI_ABI from "./abi/VAI_ABI.json";
import VTreasury_ABI from "./abi/VTreasury_ABI.json";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const PSM_USDT = "0xC138aa4E424D1A8539e8F38Af5a754a2B7c3Cc36";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDT_PRICE_FEED = "0xb97ad0e74fa7d920791e90258a6e2085088b4320"; // Chainlink Oracle
const STABLE_TOKEN_HOLDER = "0x6a0b3611214d5001fa5efae91b7222a316c12b52";
const VAI_HOLDER = "0x29aa70f8f3f2aa241b0ba9eaa744c97808d032c9";
const BASE_RATE_BEFORE_VIP = parseUnits("0.01", 18);

forking(30501836, () => {
  const provider = ethers.provider;
  let vai: ethers.Contract;
  let vaiControllerProxy: ethers.Contract;
  let accessControlManager: ethers.Contract;
  let resilientOracle: ethers.Contract;
  let usdt: ethers.Contract;
  let psm: ethers.Contract;
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

    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, USDT, USDT_PRICE_FEED, NORMAL_TIMELOCK);
  });

  describe("Pre-VIP behavior", () => {
    it("Verify VAI base rate is 1%", async () => {
      const currentBaseRate = await vaiControllerProxy.baseRateMantissa();
      expect(currentBaseRate).equals(BASE_RATE_BEFORE_VIP);
    });
  });

  testVip("VIP-130 Add Peg Stability (USDT)", vip156(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [PSM_ABI, VAI_CONTROLLER_ABI, ACM_ABI, VTreasury_ABI],
        [
          "OwnershipTransferred",
          "RoleGranted",
          "FeeInChanged",
          "FeeOutChanged",
          "VAIMintCapChanged",
          "NewVAIBaseRate",
          "WithdrawTreasuryBEP20",
        ],
        [2, 19, 1, 1, 1, 1, 1],
      );
    },
    proposer: "0xc444949e0054a23c44fc45789738bdf64aed2391",
    supporter: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
  });
  describe("Post-VIP behavior", async () => {
    it("Verify PSM_USDT is admin of VAI contract", async () => {
      const check = await vai.wards(PSM_USDT);
      expect(check).equals(1);
    });

    it("Verify access control setup", async () => {
      // PAUSE & RESUME
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

      expect(await accessControlManager.connect(psmSigner).isAllowedToCall(GUARDIAN_WALLET, "pause()")).equals(true);
      expect(await accessControlManager.connect(psmSigner).isAllowedToCall(GUARDIAN_WALLET, "resume()")).equals(true);

      // FEE IN
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setFeeIn(uint256)"),
      ).equals(true);
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(FAST_TRACK_TIMELOCK, "setFeeIn(uint256)"),
      ).equals(true);
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(CRITICAL_TIMELOCK, "setFeeIn(uint256)"),
      ).equals(true);

      // FEE OUT
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setFeeOut(uint256)"),
      ).equals(true);
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(FAST_TRACK_TIMELOCK, "setFeeOut(uint256)"),
      ).equals(true);
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(CRITICAL_TIMELOCK, "setFeeOut(uint256)"),
      ).equals(true);

      // VAI MINT CAP
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setVAIMintCap(uint256)"),
      ).equals(true);
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(FAST_TRACK_TIMELOCK, "setVAIMintCap(uint256)"),
      ).equals(true);
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(CRITICAL_TIMELOCK, "setVAIMintCap(uint256)"),
      ).equals(true);

      // ORACLE
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setOracle(address)"),
      ).equals(true);

      // VENUS TREASURY
      expect(
        await accessControlManager.connect(psmSigner).isAllowedToCall(NORMAL_TIMELOCK, "setVenusTreasury(address)"),
      ).equals(true);
    });

    it("Verify new VAI base rate is 4.00%", async () => {
      const currentBaseRate = await vaiControllerProxy.baseRateMantissa();
      expect(currentBaseRate).equals(BASE_RATE_MANTISSA);
    });
    it("Verify VAI mint cap in PSM is 5,000,000", async () => {
      const currentMintCap = await psm.vaiMintCap();
      expect(currentMintCap).equals(VAI_MINT_CAP);
    });
    it("Verify PSM USDT balance is 219,000 USDT", async () => {
      const psmUSDTBalance = await usdt.balanceOf(PSM_USDT);
      expect(psmUSDTBalance).equals(USDT_FUNDING_AMOUNT);
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
