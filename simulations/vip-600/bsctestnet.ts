import { expect } from "chai";
import { Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip600, {
  COLLATERALFACTORS_STEWARD,
  CORE_COMPTROLLER,
  IRM_STEWARD,
  MARKETCAP_STEWARD,
  RISK_ORACLE,
  RISK_STEWARD_RECEIVER,
} from "../../vips/vip-600/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comproller.json";
import Owner_ABI from "./abi/OwnerMinimalAbi.json";
import RiskOracle_ABI from "./abi/RiskOracle.json";
import RSR_ABI from "./abi/RiskStewardReceiver.json";
import VToken_ABI from "./abi/VToken.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(83235428, async () => {
  const provider = ethers.provider;
  const acm = new ethers.Contract(bsctestnet.ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, provider);
  const comptroller = new ethers.Contract(CORE_COMPTROLLER, COMPTROLLER_ABI, provider);
  const vBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe";
  const vBtc = new ethers.Contract(vBTC, VToken_ABI, provider);

  // Risk Steward contracts
  const riskStewardReceiver = new ethers.Contract(RISK_STEWARD_RECEIVER, RSR_ABI, provider);
  const riskOracle = new ethers.Contract(RISK_ORACLE, RiskOracle_ABI, provider);
  const marketCapSteward = new ethers.Contract(MARKETCAP_STEWARD, Owner_ABI, provider);
  const collateralFactorSteward = new ethers.Contract(COLLATERALFACTORS_STEWARD, Owner_ABI, provider);
  const irmSteward = new ethers.Contract(IRM_STEWARD, Owner_ABI, provider);

  testVip("vip600 Configuring Risk Stewards", await vip600(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["PermissionGranted"],
        [34], // Expected number of PermissionGranted events (BSC only)
      );
    },
  });

  describe("Post-VIP behavior", () => {
    describe("RISK_ORACLE permissions", () => {
      it("should grant addAuthorizedSender permission to NORMAL_TIMELOCK and GUARDIAN", async () => {
        const addAuthorizedSenderRoleNormal = ethers.utils.solidityPack(
          ["address", "string"],
          [RISK_ORACLE, "addAuthorizedSender(address)"],
        );
        const addAuthorizedSenderRoleHashNormal = ethers.utils.keccak256(addAuthorizedSenderRoleNormal);
        expect(await acm.hasRole(addAuthorizedSenderRoleHashNormal, bsctestnet.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(addAuthorizedSenderRoleHashNormal, bsctestnet.GUARDIAN)).to.be.true;
      });

      it("should grant removeAuthorizedSender permission to all timelocks", async () => {
        const removeAuthorizedSenderRoleNormal = ethers.utils.solidityPack(
          ["address", "string"],
          [RISK_ORACLE, "removeAuthorizedSender(address)"],
        );
        const removeAuthorizedSenderRoleHashNormal = ethers.utils.keccak256(removeAuthorizedSenderRoleNormal);
        expect(await acm.hasRole(removeAuthorizedSenderRoleHashNormal, bsctestnet.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(removeAuthorizedSenderRoleHashNormal, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(removeAuthorizedSenderRoleHashNormal, bsctestnet.CRITICAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(removeAuthorizedSenderRoleHashNormal, bsctestnet.GUARDIAN)).to.be.true;
      });

      it("should grant addUpdateType permission to NORMAL_TIMELOCK and FAST_TRACK_TIMELOCK", async () => {
        const addUpdateTypeRoleNormal = ethers.utils.solidityPack(
          ["address", "string"],
          [RISK_ORACLE, "addUpdateType(string)"],
        );
        const addUpdateTypeRoleHashNormal = ethers.utils.keccak256(addUpdateTypeRoleNormal);
        expect(await acm.hasRole(addUpdateTypeRoleHashNormal, bsctestnet.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(addUpdateTypeRoleHashNormal, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.true;
      });

      it("should grant setUpdateTypeActive permission to all timelocks", async () => {
        const setUpdateTypeActiveRole = ethers.utils.solidityPack(
          ["address", "string"],
          [RISK_ORACLE, "setUpdateTypeActive(string,bool)"],
        );
        const setUpdateTypeActiveRoleHash = ethers.utils.keccak256(setUpdateTypeActiveRole);
        expect(await acm.hasRole(setUpdateTypeActiveRoleHash, bsctestnet.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setUpdateTypeActiveRoleHash, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setUpdateTypeActiveRoleHash, bsctestnet.CRITICAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setUpdateTypeActiveRoleHash, bsctestnet.GUARDIAN)).to.be.true;
      });
    });

    describe("RISK_STEWARD_RECEIVER permissions", () => {
      it("should grant setRiskParameterConfig permission to NORMAL_TIMELOCK and FAST_TRACK_TIMELOCK", async () => {
        const setRiskParamRole = ethers.utils.solidityPack(
          ["address", "string"],
          [RISK_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256,uint256)"],
        );
        const setRiskParamRoleHash = ethers.utils.keccak256(setRiskParamRole);
        expect(await acm.hasRole(setRiskParamRoleHash, bsctestnet.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRiskParamRoleHash, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.true;
      });

      it("should grant setConfigActive permission to all timelocks", async () => {
        const setConfigActiveRole = ethers.utils.solidityPack(
          ["address", "string"],
          [RISK_STEWARD_RECEIVER, "setConfigActive(string,bool)"],
        );
        const setConfigActiveRoleHash = ethers.utils.keccak256(setConfigActiveRole);
        expect(await acm.hasRole(setConfigActiveRoleHash, bsctestnet.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, bsctestnet.CRITICAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, bsctestnet.GUARDIAN)).to.be.true;
      });

      it("should grant setWhitelistedExecutor permission to all timelocks", async () => {
        const setWhitelistedExecutorRole = ethers.utils.solidityPack(
          ["address", "string"],
          [RISK_STEWARD_RECEIVER, "setWhitelistedExecutor(address,bool)"],
        );
        const setWhitelistedExecutorRoleHash = ethers.utils.keccak256(setWhitelistedExecutorRole);
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, bsctestnet.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, bsctestnet.CRITICAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, bsctestnet.GUARDIAN)).to.be.true;
      });

      it("should grant setPaused permission to all timelocks", async () => {
        const setPausedRole = ethers.utils.solidityPack(
          ["address", "string"],
          [RISK_STEWARD_RECEIVER, "setPaused(bool)"],
        );
        const setPausedRoleHash = ethers.utils.keccak256(setPausedRole);
        expect(await acm.hasRole(setPausedRoleHash, bsctestnet.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setPausedRoleHash, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setPausedRoleHash, bsctestnet.CRITICAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setPausedRoleHash, bsctestnet.GUARDIAN)).to.be.true;
      });
    });

    describe("Steward permissions", () => {
      it("should grant MC_STEWARD setSafeDeltaBps permission to NORMAL and FAST_TRACK TIMELOCK", async () => {
        const marketCapRole = ethers.utils.solidityPack(
          ["address", "string"],
          [MARKETCAP_STEWARD, "setSafeDeltaBps(uint256)"],
        );
        const marketCapRoleHash = ethers.utils.keccak256(marketCapRole);
        expect(await acm.hasRole(marketCapRoleHash, bsctestnet.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(marketCapRoleHash, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.true;
      });

      it("should grant CF_STEWARD setSafeDeltaBps permission to NORMAL and FAST_TRACK TIMELOCK ", async () => {
        const cfRole = ethers.utils.solidityPack(
          ["address", "string"],
          [COLLATERALFACTORS_STEWARD, "setSafeDeltaBps(uint256)"],
        );
        const cfRoleHash = ethers.utils.keccak256(cfRole);
        expect(await acm.hasRole(cfRoleHash, bsctestnet.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(cfRoleHash, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.true;
      });
    });

    describe("MARKETCAP_STEWARD permissions", () => {
      it("should grant _setMarketBorrowCaps permission to MARKETCAP_STEWARD", async () => {
        const borrowCapRole = ethers.utils.solidityPack(
          ["address", "string"],
          [CORE_COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])"],
        );
        const borrowCapRoleHash = ethers.utils.keccak256(borrowCapRole);
        expect(await acm.hasRole(borrowCapRoleHash, MARKETCAP_STEWARD)).to.be.true;
      });

      it("should grant _setMarketSupplyCaps permission to MARKETCAP_STEWARD", async () => {
        const supplyCapRole = ethers.utils.solidityPack(
          ["address", "string"],
          [CORE_COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])"],
        );
        const supplyCapRoleHash = ethers.utils.keccak256(supplyCapRole);
        expect(await acm.hasRole(supplyCapRoleHash, MARKETCAP_STEWARD)).to.be.true;
      });

      it("should grant CORE_POOL setCollateralFactor permission to COLLATERALFACTORS_STEWARD", async () => {
        const collateralFactorRole = ethers.utils.solidityPack(
          ["address", "string"],
          [CORE_COMPTROLLER, "setCollateralFactor(uint96,address,uint256,uint256)"],
        );
        const collateralFactorRoleHash = ethers.utils.keccak256(collateralFactorRole);
        expect(await acm.hasRole(collateralFactorRoleHash, COLLATERALFACTORS_STEWARD)).to.be.true;
      });

      it("should grant _setInterestRateModel permission to IRM_STEWARD", async () => {
        const irmRole = ethers.utils.solidityPack(
          ["address", "string"],
          [ethers.constants.AddressZero, "_setInterestRateModel(address)"],
        );
        const irmRoleHash = ethers.utils.keccak256(irmRole);
        expect(await acm.hasRole(irmRoleHash, IRM_STEWARD)).to.be.true;
      });
    });

    describe("Market operations", () => {
      let marketCapSteward: Signer;
      let collateralFactorSteward: Signer;
      let irmSteward: Signer;

      before(async () => {
        marketCapSteward = await initMainnetUser(MARKETCAP_STEWARD, parseUnits("2"));
        collateralFactorSteward = await initMainnetUser(COLLATERALFACTORS_STEWARD, parseUnits("2"));
        irmSteward = await initMainnetUser(IRM_STEWARD, parseUnits("2"));
      });

      it("should allow Market Cap Steward to set supply caps on core pool markets", async () => {
        await expect(
          comptroller.connect(marketCapSteward).setMarketSupplyCaps([vBTC], [parseUnits("150000", 18)]),
        ).to.emit(comptroller, "NewSupplyCap");
      });

      it("should allow Market Cap Steward to set borrow caps on core pool markets", async () => {
        await expect(
          comptroller.connect(marketCapSteward).setMarketBorrowCaps([vBTC], [parseUnits("55000", 18)]),
        ).to.emit(comptroller, "NewBorrowCap");
      });

      it("should allow Collateral Factor Steward to set collateral factors on core pool markets", async () => {
        await expect(
          comptroller
            .connect(collateralFactorSteward)
            ["setCollateralFactor(uint96,address,uint256,uint256)"](
              0,
              vBTC,
              parseUnits("0.7", 18),
              parseUnits("0.75", 18),
            ),
        ).to.be.revertedWith("invalid resilient oracle price"); // this reverts due to stale period but it means passed the ACM check
      });

      it("should allow IRM Steward to set interest rate models on core pool markets", async () => {
        const TEST_IRM_ADDRESS = "0xf59B7f2733a549dCF82b804d69d9c6a38985B90B";
        await expect(vBtc.connect(irmSteward)._setInterestRateModel(TEST_IRM_ADDRESS)).to.emit(
          vBtc,
          "NewMarketInterestRateModel",
        );
      });
    });

    describe("Risk Steward Ownership", () => {
      it("should set RISK_ORACLE owner to NORMAL_TIMELOCK", async () => {
        expect(await riskOracle.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      });

      it("should set RISK_STEWARD_RECEIVER owner to NORMAL_TIMELOCK", async () => {
        expect(await riskStewardReceiver.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      });

      it("should set MARKETCAP_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await marketCapSteward.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      });

      it("should set COLLATERALFACTORS_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await collateralFactorSteward.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      });

      it("should set IRM_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await irmSteward.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      });
    });
  });
});
