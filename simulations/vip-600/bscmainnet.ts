import { expect } from "chai";
import { Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip600, {
  CF_STEWARD_SAFE_DELTA,
  COLLATERALFACTORS_STEWARD,
  CORE_COMPTROLLER,
  DEBOUNCE,
  IRM_STEWARD,
  MARKETCAP_STEWARD,
  MC_STEWARD_SAFE_DELTA,
  RISK_ORACLE,
  RISK_PARAMETER_SENDER,
  RISK_STEWARD_RECEIVER,
  TIMELOCK,
  UPDATE_TYPES,
  WHITELISTED_EXECUTORS,
} from "../../vips/vip-600/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comproller.json";
import STEWARD_ABI from "./abi/MarketCapSteward.json";
import Owner_ABI from "./abi/OwnerMinimalAbi.json";
import RISK_ORACLE_ABI from "./abi/RiskOracle.json";
import RSR_ABI from "./abi/RiskStewardReceiver.json";
import VToken_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(80591637, async () => {
  const provider = ethers.provider;
  const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, provider);
  const comptroller = new ethers.Contract(CORE_COMPTROLLER, COMPTROLLER_ABI, provider);
  const vBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
  const vBtc = new ethers.Contract(vBTC, VToken_ABI, provider);

  // Risk Steward contracts
  const riskStewardReceiver = new ethers.Contract(RISK_STEWARD_RECEIVER, RSR_ABI, provider);
  const riskOracle = new ethers.Contract(RISK_ORACLE, RISK_ORACLE_ABI, provider);
  const marketCapSteward = new ethers.Contract(MARKETCAP_STEWARD, STEWARD_ABI, provider);
  const collateralFactorSteward = new ethers.Contract(COLLATERALFACTORS_STEWARD, STEWARD_ABI, provider);
  const irmSteward = new ethers.Contract(IRM_STEWARD, Owner_ABI, provider);

  testVip("VIP-600 Risk-Steward ACM Permissions & Configuration", await vip600(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, RISK_ORACLE_ABI, RSR_ABI, STEWARD_ABI],
        [
          "RoleGranted",
          "AuthorizedSenderAdded",
          "UpdateTypeAdded",
          "RiskParameterConfigUpdated",
          "ExecutorStatusUpdated",
          "SafeDeltaBpsUpdated",
        ],
        [33, 1, 4, 4, 1, 2], // 33 ACM permissions, 1 sender, 4 update types, 4 configs, 1 executor, 2 delta updates
      );
    },
  });

  describe("Post-VIP behavior", () => {
    describe("ACM Permissions", () => {
      describe("RISK_ORACLE permissions", () => {
        it("should grant addAuthorizedSender permission to NORMAL_TIMELOCK", async () => {
          const addAuthorizedSenderRoleNormal = ethers.utils.solidityPack(
            ["address", "string"],
            [RISK_ORACLE, "addAuthorizedSender(address)"],
          );
          const addAuthorizedSenderRoleHashNormal = ethers.utils.keccak256(addAuthorizedSenderRoleNormal);
          expect(await acm.hasRole(addAuthorizedSenderRoleHashNormal, bscmainnet.NORMAL_TIMELOCK)).to.be.true;
        });

        it("should grant removeAuthorizedSender permission to all timelocks", async () => {
          const removeAuthorizedSenderRoleNormal = ethers.utils.solidityPack(
            ["address", "string"],
            [RISK_ORACLE, "removeAuthorizedSender(address)"],
          );
          const removeAuthorizedSenderRoleHashNormal = ethers.utils.keccak256(removeAuthorizedSenderRoleNormal);
          expect(await acm.hasRole(removeAuthorizedSenderRoleHashNormal, bscmainnet.NORMAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(removeAuthorizedSenderRoleHashNormal, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(removeAuthorizedSenderRoleHashNormal, bscmainnet.CRITICAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(removeAuthorizedSenderRoleHashNormal, bscmainnet.GUARDIAN)).to.be.true;
        });

        it("should grant addUpdateType permission to NORMAL_TIMELOCK and FAST_TRACK_TIMELOCK", async () => {
          const addUpdateTypeRoleNormal = ethers.utils.solidityPack(
            ["address", "string"],
            [RISK_ORACLE, "addUpdateType(string)"],
          );
          const addUpdateTypeRoleHashNormal = ethers.utils.keccak256(addUpdateTypeRoleNormal);
          expect(await acm.hasRole(addUpdateTypeRoleHashNormal, bscmainnet.NORMAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(addUpdateTypeRoleHashNormal, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;
        });

        it("should grant setUpdateTypeActive permission to all timelocks", async () => {
          const setUpdateTypeActiveRole = ethers.utils.solidityPack(
            ["address", "string"],
            [RISK_ORACLE, "setUpdateTypeActive(string,bool)"],
          );
          const setUpdateTypeActiveRoleHash = ethers.utils.keccak256(setUpdateTypeActiveRole);
          expect(await acm.hasRole(setUpdateTypeActiveRoleHash, bscmainnet.NORMAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(setUpdateTypeActiveRoleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(setUpdateTypeActiveRoleHash, bscmainnet.CRITICAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(setUpdateTypeActiveRoleHash, bscmainnet.GUARDIAN)).to.be.true;
        });
      });

      describe("RISK_STEWARD_RECEIVER permissions", () => {
        it("should grant setRiskParameterConfig permission to NORMAL_TIMELOCK and FAST_TRACK_TIMELOCK", async () => {
          const setRiskParamRole = ethers.utils.solidityPack(
            ["address", "string"],
            [RISK_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256,uint256)"],
          );
          const setRiskParamRoleHash = ethers.utils.keccak256(setRiskParamRole);
          expect(await acm.hasRole(setRiskParamRoleHash, bscmainnet.NORMAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(setRiskParamRoleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;
        });

        it("should grant setConfigActive permission to all timelocks", async () => {
          const setConfigActiveRole = ethers.utils.solidityPack(
            ["address", "string"],
            [RISK_STEWARD_RECEIVER, "setConfigActive(string,bool)"],
          );
          const setConfigActiveRoleHash = ethers.utils.keccak256(setConfigActiveRole);
          expect(await acm.hasRole(setConfigActiveRoleHash, bscmainnet.NORMAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(setConfigActiveRoleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(setConfigActiveRoleHash, bscmainnet.CRITICAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(setConfigActiveRoleHash, bscmainnet.GUARDIAN)).to.be.true;
        });

        it("should grant setWhitelistedExecutor permission to all timelocks", async () => {
          const setWhitelistedExecutorRole = ethers.utils.solidityPack(
            ["address", "string"],
            [RISK_STEWARD_RECEIVER, "setWhitelistedExecutor(address,bool)"],
          );
          const setWhitelistedExecutorRoleHash = ethers.utils.keccak256(setWhitelistedExecutorRole);
          expect(await acm.hasRole(setWhitelistedExecutorRoleHash, bscmainnet.NORMAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(setWhitelistedExecutorRoleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(setWhitelistedExecutorRoleHash, bscmainnet.CRITICAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(setWhitelistedExecutorRoleHash, bscmainnet.GUARDIAN)).to.be.true;
        });

        it("should grant setPaused permission to all timelocks", async () => {
          const setPausedRole = ethers.utils.solidityPack(
            ["address", "string"],
            [RISK_STEWARD_RECEIVER, "setPaused(bool)"],
          );
          const setPausedRoleHash = ethers.utils.keccak256(setPausedRole);
          expect(await acm.hasRole(setPausedRoleHash, bscmainnet.NORMAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(setPausedRoleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(setPausedRoleHash, bscmainnet.CRITICAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(setPausedRoleHash, bscmainnet.GUARDIAN)).to.be.true;
        });
      });

      describe("Steward permissions", () => {
        it("should grant MC_STEWARD setSafeDeltaBps permission to NORMAL and FAST_TRACK TIMELOCK", async () => {
          const marketCapRole = ethers.utils.solidityPack(
            ["address", "string"],
            [MARKETCAP_STEWARD, "setSafeDeltaBps(uint256)"],
          );
          const marketCapRoleHash = ethers.utils.keccak256(marketCapRole);
          expect(await acm.hasRole(marketCapRoleHash, bscmainnet.NORMAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(marketCapRoleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;
        });

        it("should grant CF_STEWARD setSafeDeltaBps permission to NORMAL and FAST_TRACK TIMELOCK", async () => {
          const cfRole = ethers.utils.solidityPack(
            ["address", "string"],
            [COLLATERALFACTORS_STEWARD, "setSafeDeltaBps(uint256)"],
          );
          const cfRoleHash = ethers.utils.keccak256(cfRole);
          expect(await acm.hasRole(cfRoleHash, bscmainnet.NORMAL_TIMELOCK)).to.be.true;
          expect(await acm.hasRole(cfRoleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;
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
            ["0x0000000000000000000000000000000000000000000000000000000000000000", "_setInterestRateModel(address)"],
          );
          const irmRoleHash = ethers.utils.keccak256(irmRole);
          expect(await acm.hasRole(irmRoleHash, IRM_STEWARD)).to.be.true;
        });
      });

      describe("Market operations", () => {
        let marketCapStewardSigner: Signer;
        let collateralFactorStewardSigner: Signer;
        let irmStewardSigner: Signer;

        before(async () => {
          marketCapStewardSigner = await initMainnetUser(MARKETCAP_STEWARD, parseUnits("2"));
          collateralFactorStewardSigner = await initMainnetUser(COLLATERALFACTORS_STEWARD, parseUnits("2"));
          irmStewardSigner = await initMainnetUser(IRM_STEWARD, parseUnits("2"));
        });

        it("should allow Market Cap Steward to set supply caps on core pool markets", async () => {
          await expect(
            comptroller.connect(marketCapStewardSigner).setMarketSupplyCaps([vBTC], [parseUnits("150000", 18)]),
          ).to.emit(comptroller, "NewSupplyCap");
        });

        it("should allow Market Cap Steward to set borrow caps on core pool markets", async () => {
          await expect(
            comptroller.connect(marketCapStewardSigner).setMarketBorrowCaps([vBTC], [parseUnits("55000", 18)]),
          ).to.emit(comptroller, "NewBorrowCap");
        });

        it("should allow Collateral Factor Steward to set collateral factors on core pool markets", async () => {
          await expect(
            comptroller
              .connect(collateralFactorStewardSigner)
              ["setCollateralFactor(uint96,address,uint256,uint256)"](
                0,
                vBTC,
                parseUnits("0.7", 18),
                parseUnits("0.75", 18),
              ),
          ).to.be.revertedWith("invalid resilient oracle price"); // this reverts due to stale period but it means passed the ACM check
        });

        it("should allow IRM Steward to set interest rate models on core pool markets", async () => {
          const TEST_IRM_ADDRESS = "0x38Dd273fE7590403f554F350a7c3c592e8227EB7";
          await expect(vBtc.connect(irmStewardSigner)._setInterestRateModel(TEST_IRM_ADDRESS)).to.emit(
            vBtc,
            "NewMarketInterestRateModel",
          );
        });
      });

      describe("Risk Steward Ownership", () => {
        it("should set RISK_ORACLE owner to NORMAL_TIMELOCK", async () => {
          expect(await riskOracle.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
        });

        it("should set RISK_STEWARD_RECEIVER owner to NORMAL_TIMELOCK", async () => {
          expect(await riskStewardReceiver.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
        });

        it("should set MARKETCAP_STEWARD owner to NORMAL_TIMELOCK", async () => {
          expect(await marketCapSteward.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
        });

        it("should set COLLATERALFACTORS_STEWARD owner to NORMAL_TIMELOCK", async () => {
          expect(await collateralFactorSteward.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
        });

        it("should set IRM_STEWARD owner to NORMAL_TIMELOCK", async () => {
          expect(await irmSteward.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
        });
      });
    });

    describe("Risk Steward Configuration", () => {
      describe("Risk Oracle Configuration", () => {
        it("should add authorized senders to Risk Oracle", async () => {
          for (const sender of RISK_PARAMETER_SENDER) {
            expect(await riskOracle.authorizedSenders(sender)).to.be.true;
          }
        });

        it("should add all update types to Risk Oracle", async () => {
          expect(await riskOracle.getAllUpdateTypes()).to.deep.equal(UPDATE_TYPES);
        });
      });

      describe("Risk Steward Receiver Configuration", () => {
        it("should configure risk parameters for SupplyCap", async () => {
          const config = await riskStewardReceiver.getRiskParameterConfig(UPDATE_TYPES[0]);
          expect(config.riskSteward).to.equal(MARKETCAP_STEWARD);
          expect(config.debounce).to.equal(DEBOUNCE);
          expect(config.timelock).to.equal(TIMELOCK);
          expect(config.active).to.be.true;
        });

        it("should configure risk parameters for BorrowCap", async () => {
          const config = await riskStewardReceiver.getRiskParameterConfig(UPDATE_TYPES[1]);
          expect(config.riskSteward).to.equal(MARKETCAP_STEWARD);
          expect(config.debounce).to.equal(DEBOUNCE);
          expect(config.timelock).to.equal(TIMELOCK);
          expect(config.active).to.be.true;
        });

        it("should configure risk parameters for CollateralFactor", async () => {
          const config = await riskStewardReceiver.getRiskParameterConfig(UPDATE_TYPES[2]);
          expect(config.riskSteward).to.equal(COLLATERALFACTORS_STEWARD);
          expect(config.debounce).to.equal(DEBOUNCE);
          expect(config.timelock).to.equal(TIMELOCK);
          expect(config.active).to.be.true;
        });

        it("should configure risk parameters for IRM", async () => {
          const config = await riskStewardReceiver.getRiskParameterConfig(UPDATE_TYPES[3]);
          expect(config.riskSteward).to.equal(IRM_STEWARD);
          expect(config.debounce).to.equal(DEBOUNCE);
          expect(config.timelock).to.equal(TIMELOCK);
          expect(config.active).to.be.true;
        });

        it("should whitelist executors", async () => {
          for (const executor of WHITELISTED_EXECUTORS) {
            expect(await riskStewardReceiver.whitelistedExecutors(executor)).to.be.true;
          }
        });
      });

      describe("Steward Safe Delta Configuration", () => {
        it("should set safe delta BPS for Market Cap Steward to 50%", async () => {
          expect(await marketCapSteward.safeDeltaBps()).to.equal(MC_STEWARD_SAFE_DELTA);
        });

        it("should set safe delta BPS for Collateral Factor Steward to 10%", async () => {
          expect(await collateralFactorSteward.safeDeltaBps()).to.equal(CF_STEWARD_SAFE_DELTA);
        });
      });
    });
  });
});
