import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip600, {
  SEPOLIA_ACM,
  SEPOLIA_ACM_AGGREGATOR,
  SEPOLIA_ACM_AGR_INDEX,
  SEPOLIA_CF_STEWARD,
  SEPOLIA_COMPTROLLER,
  SEPOLIA_DESTINATION_STEWARD_RECEIVER,
  SEPOLIA_IRM_STEWARD,
  SEPOLIA_MC_STEWARD,
  SEPOLIA_PERMISSIONS,
} from "../../vips/vip-600/bsctestnet";
import ACM_AGGREGATOR_ABI from "./abi/ACMAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import DSR_ABI from "./abi/DestinationStewardReceiver.json";
import ISOLATED_VToken_ABI from "./abi/ILVToken.json";
import ISOLATED_POOL_COMPTROLLER_ABI from "./abi/IsolatedPoolComptroller.json";
import Owner_ABI from "./abi/OwnerMinimalAbi.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(10002670, async () => {
  let acm: Contract;
  let isolatedPoolComptroller: Contract;
  let acmAggregator: Contract;
  let destinationReceiverSteward: Contract;
  let sepoliaMcSteward: Contract;
  let sepoliaCfSteward: Contract;
  let sepoliaIrmSteward: Contract;

  before(async () => {
    const provider = ethers.provider;
    acm = new ethers.Contract(SEPOLIA_ACM, ACCESS_CONTROL_MANAGER_ABI, provider);
    isolatedPoolComptroller = new ethers.Contract(SEPOLIA_COMPTROLLER, ISOLATED_POOL_COMPTROLLER_ABI, provider);
    acmAggregator = new ethers.Contract(SEPOLIA_ACM_AGGREGATOR, ACM_AGGREGATOR_ABI, provider);

    // SEPOLIA Risk Steward contracts
    destinationReceiverSteward = new ethers.Contract(SEPOLIA_DESTINATION_STEWARD_RECEIVER, DSR_ABI, provider);
    sepoliaMcSteward = new ethers.Contract(SEPOLIA_MC_STEWARD, Owner_ABI, provider);
    sepoliaCfSteward = new ethers.Contract(SEPOLIA_CF_STEWARD, Owner_ABI, provider);
    sepoliaIrmSteward = new ethers.Contract(SEPOLIA_IRM_STEWARD, Owner_ABI, provider);
    const signer = provider.getSigner();
    await acmAggregator.connect(signer).addGrantPermissions(SEPOLIA_PERMISSIONS);
  });

  describe("Pre-VIP behavior", () => {
    it("should verify stored permissions match SEPOLIA_PERMISSIONS from buildRemoteChainPermissions", async () => {
      // Retrieve all permissions from the aggregator using grantPermissions and verify they match SEPOLIA_PERMISSIONS
      const storedPermissions = [];
      for (let i = 0; i < SEPOLIA_PERMISSIONS.length; i++) {
        const storedPermission = await acmAggregator.grantPermissions(SEPOLIA_ACM_AGR_INDEX, i);
        storedPermissions.push(storedPermission);
        const expectedPermission = SEPOLIA_PERMISSIONS[i];

        expect(storedPermission.contractAddress.toLowerCase()).to.equal(
          expectedPermission[0].toLowerCase(),
          `Permission ${i} contractAddress mismatch`,
        );
        expect(storedPermission.functionSig).to.equal(expectedPermission[1], `Permission ${i} functionSig mismatch`);
        expect(storedPermission.account.toLowerCase()).to.equal(
          expectedPermission[2].toLowerCase(),
          `Permission ${i} account mismatch`,
        );
      }
      // Verify the count matches
      expect(storedPermissions.length).to.equal(SEPOLIA_PERMISSIONS.length);
      // Out of bound
      await expect(acmAggregator.callStatic.grantPermissions(SEPOLIA_ACM_AGR_INDEX, SEPOLIA_PERMISSIONS.length)).to.be
        .reverted;
    });
  });

  testForkedNetworkVipCommands("vip600 Configuring Risk Stewards on Sepolia", await vip600(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["PermissionGranted"],
        [24], // Expected number of PermissionGranted events for Sepolia commands
      );
    },
  });

  describe("Post-VIP behavior", () => {
    describe("DESTINATION_RECEIVER_STEWARD permissions", () => {
      it("should grant setRiskParameterConfig permission to NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK and GUARDIAN", async () => {
        const setRiskParamRole = ethers.utils.solidityPack(
          ["address", "string"],
          [SEPOLIA_DESTINATION_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256)"],
        );
        const setRiskParamRoleHash = ethers.utils.keccak256(setRiskParamRole);
        expect(await acm.hasRole(setRiskParamRoleHash, sepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRiskParamRoleHash, sepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRiskParamRoleHash, sepolia.GUARDIAN)).to.be.true;
      });

      it("should grant setConfigActive permission to all timelocks", async () => {
        const setConfigActiveRole = ethers.utils.solidityPack(
          ["address", "string"],
          [SEPOLIA_DESTINATION_STEWARD_RECEIVER, "setConfigActive(string,bool)"],
        );
        const setConfigActiveRoleHash = ethers.utils.keccak256(setConfigActiveRole);
        expect(await acm.hasRole(setConfigActiveRoleHash, sepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, sepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, sepolia.CRITICAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, sepolia.GUARDIAN)).to.be.true;
      });

      it("should grant setRemoteDelay permission to NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK and GUARDIAN", async () => {
        const setRemoteDelayRole = ethers.utils.solidityPack(
          ["address", "string"],
          [SEPOLIA_DESTINATION_STEWARD_RECEIVER, "setRemoteDelay(uint256)"],
        );
        const setRemoteDelayRoleHash = ethers.utils.keccak256(setRemoteDelayRole);
        expect(await acm.hasRole(setRemoteDelayRoleHash, sepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRemoteDelayRoleHash, sepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRemoteDelayRoleHash, sepolia.GUARDIAN)).to.be.true;
      });

      it("should grant setWhitelistedExecutor permission to all timelocks", async () => {
        const setWhitelistedExecutorRole = ethers.utils.solidityPack(
          ["address", "string"],
          [SEPOLIA_DESTINATION_STEWARD_RECEIVER, "setWhitelistedExecutor(address,bool)"],
        );
        const setWhitelistedExecutorRoleHash = ethers.utils.keccak256(setWhitelistedExecutorRole);
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, sepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, sepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, sepolia.CRITICAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, sepolia.GUARDIAN)).to.be.true;
      });
    });

    describe("REMOTE_RS setSafeDeltaBps permissions", () => {
      it("should grant MC_STEWARD setSafeDeltaBps permission to NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK and GUARDIAN", async () => {
        const marketCapRole = ethers.utils.solidityPack(
          ["address", "string"],
          [SEPOLIA_MC_STEWARD, "setSafeDeltaBps(uint256)"],
        );
        const marketCapRoleHash = ethers.utils.keccak256(marketCapRole);
        expect(await acm.hasRole(marketCapRoleHash, sepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(marketCapRoleHash, sepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(marketCapRoleHash, sepolia.GUARDIAN)).to.be.true;
      });

      it("should grant CF_STEWARD setSafeDeltaBps permission to NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK and GUARDIAN", async () => {
        const cfRole = ethers.utils.solidityPack(
          ["address", "string"],
          [SEPOLIA_CF_STEWARD, "setSafeDeltaBps(uint256)"],
        );
        const cfRoleHash = ethers.utils.keccak256(cfRole);
        expect(await acm.hasRole(cfRoleHash, sepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(cfRoleHash, sepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(cfRoleHash, sepolia.GUARDIAN)).to.be.true;
      });
    });

    describe("REMOTE MARKETCAP_STEWARD permissions", () => {
      it("should grant setMarketBorrowCaps permission to SEPOLIA_MC_STEWARD", async () => {
        const borrowCapRole = ethers.utils.solidityPack(
          ["address", "string"],
          [SEPOLIA_COMPTROLLER, "setMarketBorrowCaps(address[],uint256[])"],
        );
        const borrowCapRoleHash = ethers.utils.keccak256(borrowCapRole);
        expect(await acm.hasRole(borrowCapRoleHash, SEPOLIA_MC_STEWARD)).to.be.true;
      });

      it("should grant setMarketSupplyCaps permission to SEPOLIA_MC_STEWARD", async () => {
        const supplyCapRole = ethers.utils.solidityPack(
          ["address", "string"],
          [SEPOLIA_COMPTROLLER, "setMarketSupplyCaps(address[],uint256[])"],
        );
        const supplyCapRoleHash = ethers.utils.keccak256(supplyCapRole);
        expect(await acm.hasRole(supplyCapRoleHash, SEPOLIA_MC_STEWARD)).to.be.true;
      });

      it("should grant setCollateralFactor permission to SEPOLIA_CF_STEWARD", async () => {
        const collateralFactorRole = ethers.utils.solidityPack(
          ["address", "string"],
          [SEPOLIA_COMPTROLLER, "setCollateralFactor(address,uint256,uint256)"],
        );
        const collateralFactorRoleHash = ethers.utils.keccak256(collateralFactorRole);
        expect(await acm.hasRole(collateralFactorRoleHash, SEPOLIA_CF_STEWARD)).to.be.true;
      });
    });

    describe("REMOTE IRM_STEWARD permissions", () => {
      it("should grant setInterestRateModel permission to SEPOLIA_IRM_STEWARD", async () => {
        const irmRole = ethers.utils.solidityPack(
          ["address", "string"],
          [ethers.constants.AddressZero, "setInterestRateModel(address)"],
        );
        const irmRoleHash = ethers.utils.keccak256(irmRole);
        expect(await acm.hasRole(irmRoleHash, SEPOLIA_IRM_STEWARD)).to.be.true;
      });
    });

    describe("Remote operations", () => {
      let marketCapSteward: Signer;
      let collateralFactorSteward: Signer;
      let irmSteward: Signer;
      const marketAddress = "0xfe050f628bF5278aCfA1e7B13b59fF207e769235";

      before(async () => {
        marketCapSteward = await initMainnetUser(SEPOLIA_MC_STEWARD, parseUnits("2"));
        collateralFactorSteward = await initMainnetUser(SEPOLIA_CF_STEWARD, parseUnits("2"));
        irmSteward = await initMainnetUser(SEPOLIA_IRM_STEWARD, parseUnits("2"));
      });

      it("should allow SEPOLIA_MC_STEWARD to set supply caps on remote markets", async () => {
        await expect(
          isolatedPoolComptroller
            .connect(marketCapSteward)
            .setMarketSupplyCaps([marketAddress], [parseUnits("150000", 18)]),
        ).to.emit(isolatedPoolComptroller, "NewSupplyCap");
      });

      it("should allow SEPOLIA_MC_STEWARD to set borrow caps on remote markets", async () => {
        await expect(
          isolatedPoolComptroller
            .connect(marketCapSteward)
            .setMarketBorrowCaps([marketAddress], [parseUnits("55000", 18)]),
        ).to.emit(isolatedPoolComptroller, "NewBorrowCap");
      });

      it("should allow SEPOLIA_CF_STEWARD to set collateral factors on remote markets", async () => {
        await expect(
          isolatedPoolComptroller
            .connect(collateralFactorSteward)
            .setCollateralFactor(marketAddress, parseUnits("0.8", 18), parseUnits("0.85", 18)),
        ).to.be.revertedWith("invalid resilient oracle price"); // this reverts due to stale period but it means passed the ACM check
      });

      it("should allow SEPOLIA_IRM_STEWARD to set interest rate models on remote markets", async () => {
        const irmAddress = "0x8E09246751bcf2F621694881bd0E55d681f061c3";
        const market = new ethers.Contract(marketAddress, ISOLATED_VToken_ABI, ethers.provider);

        await expect(market.connect(irmSteward).setInterestRateModel(irmAddress)).to.emit(
          market,
          "NewMarketInterestRateModel",
        );
      });
    });

    describe("SEPOLIA Risk Steward Ownership", () => {
      it("should set DESTINATION_RECEIVER_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await destinationReceiverSteward.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });

      it("should set SEPOLIA_MC_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await sepoliaMcSteward.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });

      it("should set SEPOLIA_CF_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await sepoliaCfSteward.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });

      it("should set SEPOLIA_IRM_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await sepoliaIrmSteward.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    });
  });
});
