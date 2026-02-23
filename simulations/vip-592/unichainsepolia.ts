import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip600, {
  UNICHAINSEPOLIA_ACM_AGGREGATOR,
  UNICHAINSEPOLIA_ACM_AGR_INDEX,
  UNICHAINSEPOLIA_PERMISSIONS,
  UNICHAIN_SEPOLIA_ACM,
  UNICHAIN_SEPOLIA_CF_STEWARD,
  UNICHAIN_SEPOLIA_COMPTROLLER,
  UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
  UNICHAIN_SEPOLIA_IRM_STEWARD,
  UNICHAIN_SEPOLIA_MC_STEWARD,
} from "../../vips/vip-592/bsctestnet";
import ACM_AGGREGATOR_ABI from "./abi/ACMAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import DSR_ABI from "./abi/DestinationStewardReceiver.json";
import ISOLATED_VToken_ABI from "./abi/ILVToken.json";
import ISOLATED_POOL_COMPTROLLER_ABI from "./abi/IsolatedPoolComptroller.json";
import Owner_ABI from "./abi/OwnerMinimalAbi.json";

const { unichainsepolia } = NETWORK_ADDRESSES;

forking(41021745, async () => {
  let acm: Contract;
  let isolatedPoolComptroller: Contract;
  let acmAggregator: Contract;
  let destinationReceiverSteward: Contract;
  let unichainsepoliaMcSteward: Contract;
  let unichainsepoliaCfSteward: Contract;
  let unichainsepoliaIrmSteward: Contract;

  before(async () => {
    const provider = ethers.provider;
    acm = new ethers.Contract(UNICHAIN_SEPOLIA_ACM, ACCESS_CONTROL_MANAGER_ABI, provider);
    isolatedPoolComptroller = new ethers.Contract(
      UNICHAIN_SEPOLIA_COMPTROLLER,
      ISOLATED_POOL_COMPTROLLER_ABI,
      provider,
    );
    acmAggregator = new ethers.Contract(UNICHAINSEPOLIA_ACM_AGGREGATOR, ACM_AGGREGATOR_ABI, provider);

    // UNICHAIN_SEPOLIA Risk Steward contracts
    destinationReceiverSteward = new ethers.Contract(UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER, DSR_ABI, provider);
    unichainsepoliaMcSteward = new ethers.Contract(UNICHAIN_SEPOLIA_MC_STEWARD, Owner_ABI, provider);
    unichainsepoliaCfSteward = new ethers.Contract(UNICHAIN_SEPOLIA_CF_STEWARD, Owner_ABI, provider);
    unichainsepoliaIrmSteward = new ethers.Contract(UNICHAIN_SEPOLIA_IRM_STEWARD, Owner_ABI, provider);
    const signer = provider.getSigner();
    await acmAggregator.connect(signer).addGrantPermissions(UNICHAINSEPOLIA_PERMISSIONS);
  });

  describe("Pre-VIP behavior", () => {
    it("should verify stored permissions match UNICHAINSEPOLIA_PERMISSIONS from buildRemoteChainPermissions", async () => {
      // Retrieve all permissions from the aggregator using grantPermissions and verify they match UNICHAINSEPOLIA_PERMISSIONS
      const storedPermissions = [];
      for (let i = 0; i < UNICHAINSEPOLIA_PERMISSIONS.length; i++) {
        const storedPermission = await acmAggregator.grantPermissions(UNICHAINSEPOLIA_ACM_AGR_INDEX, i);
        storedPermissions.push(storedPermission);
        const expectedPermission = UNICHAINSEPOLIA_PERMISSIONS[i];

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
      expect(storedPermissions.length).to.equal(UNICHAINSEPOLIA_PERMISSIONS.length);
      // Out of bound
      await expect(
        acmAggregator.callStatic.grantPermissions(UNICHAINSEPOLIA_ACM_AGR_INDEX, UNICHAINSEPOLIA_PERMISSIONS.length),
      ).to.be.reverted;
    });
  });

  testForkedNetworkVipCommands("vip600 Configuring Risk Stewards on Unichain Sepolia", await vip600(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["PermissionGranted"],
        [24], // Expected number of PermissionGranted events for Unichain Sepolia commands
      );
    },
  });

  describe("Post-VIP behavior", () => {
    describe("DESTINATION_RECEIVER_STEWARD permissions", () => {
      it("should grant setRiskParameterConfig permission to NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK and GUARDIAN", async () => {
        const setRiskParamRole = ethers.utils.solidityPack(
          ["address", "string"],
          [UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256)"],
        );
        const setRiskParamRoleHash = ethers.utils.keccak256(setRiskParamRole);
        expect(await acm.hasRole(setRiskParamRoleHash, unichainsepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRiskParamRoleHash, unichainsepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRiskParamRoleHash, unichainsepolia.GUARDIAN)).to.be.true;
      });

      it("should grant setConfigActive permission to all timelocks", async () => {
        const setConfigActiveRole = ethers.utils.solidityPack(
          ["address", "string"],
          [UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER, "setConfigActive(string,bool)"],
        );
        const setConfigActiveRoleHash = ethers.utils.keccak256(setConfigActiveRole);
        expect(await acm.hasRole(setConfigActiveRoleHash, unichainsepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, unichainsepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, unichainsepolia.CRITICAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, unichainsepolia.GUARDIAN)).to.be.true;
      });

      it("should grant setRemoteDelay permission to NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK and GUARDIAN", async () => {
        const setRemoteDelayRole = ethers.utils.solidityPack(
          ["address", "string"],
          [UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER, "setRemoteDelay(uint256)"],
        );
        const setRemoteDelayRoleHash = ethers.utils.keccak256(setRemoteDelayRole);
        expect(await acm.hasRole(setRemoteDelayRoleHash, unichainsepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRemoteDelayRoleHash, unichainsepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRemoteDelayRoleHash, unichainsepolia.GUARDIAN)).to.be.true;
      });

      it("should grant setWhitelistedExecutor permission to all timelocks", async () => {
        const setWhitelistedExecutorRole = ethers.utils.solidityPack(
          ["address", "string"],
          [UNICHAIN_SEPOLIA_DESTINATION_STEWARD_RECEIVER, "setWhitelistedExecutor(address,bool)"],
        );
        const setWhitelistedExecutorRoleHash = ethers.utils.keccak256(setWhitelistedExecutorRole);
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, unichainsepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, unichainsepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, unichainsepolia.CRITICAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, unichainsepolia.GUARDIAN)).to.be.true;
      });
    });

    describe("REMOTE_RS setSafeDeltaBps permissions", () => {
      it("should grant MC_STEWARD setSafeDeltaBps permission to NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK and GUARDIAN", async () => {
        const marketCapRole = ethers.utils.solidityPack(
          ["address", "string"],
          [UNICHAIN_SEPOLIA_MC_STEWARD, "setSafeDeltaBps(uint256)"],
        );
        const marketCapRoleHash = ethers.utils.keccak256(marketCapRole);
        expect(await acm.hasRole(marketCapRoleHash, unichainsepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(marketCapRoleHash, unichainsepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(marketCapRoleHash, unichainsepolia.GUARDIAN)).to.be.true;
      });

      it("should grant CF_STEWARD setSafeDeltaBps permission to NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK and GUARDIAN", async () => {
        const cfRole = ethers.utils.solidityPack(
          ["address", "string"],
          [UNICHAIN_SEPOLIA_CF_STEWARD, "setSafeDeltaBps(uint256)"],
        );
        const cfRoleHash = ethers.utils.keccak256(cfRole);
        expect(await acm.hasRole(cfRoleHash, unichainsepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(cfRoleHash, unichainsepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(cfRoleHash, unichainsepolia.GUARDIAN)).to.be.true;
      });
    });

    describe("REMOTE MARKETCAP_STEWARD permissions", () => {
      it("should grant setMarketBorrowCaps permission to UNICHAIN_SEPOLIA_MC_STEWARD", async () => {
        const borrowCapRole = ethers.utils.solidityPack(
          ["address", "string"],
          [UNICHAIN_SEPOLIA_COMPTROLLER, "setMarketBorrowCaps(address[],uint256[])"],
        );
        const borrowCapRoleHash = ethers.utils.keccak256(borrowCapRole);
        expect(await acm.hasRole(borrowCapRoleHash, UNICHAIN_SEPOLIA_MC_STEWARD)).to.be.true;
      });

      it("should grant setMarketSupplyCaps permission to UNICHAIN_SEPOLIA_MC_STEWARD", async () => {
        const supplyCapRole = ethers.utils.solidityPack(
          ["address", "string"],
          [UNICHAIN_SEPOLIA_COMPTROLLER, "setMarketSupplyCaps(address[],uint256[])"],
        );
        const supplyCapRoleHash = ethers.utils.keccak256(supplyCapRole);
        expect(await acm.hasRole(supplyCapRoleHash, UNICHAIN_SEPOLIA_MC_STEWARD)).to.be.true;
      });

      it("should grant setCollateralFactor permission to UNICHAIN_SEPOLIA_CF_STEWARD", async () => {
        const collateralFactorRole = ethers.utils.solidityPack(
          ["address", "string"],
          [UNICHAIN_SEPOLIA_COMPTROLLER, "setCollateralFactor(address,uint256,uint256)"],
        );
        const collateralFactorRoleHash = ethers.utils.keccak256(collateralFactorRole);
        expect(await acm.hasRole(collateralFactorRoleHash, UNICHAIN_SEPOLIA_CF_STEWARD)).to.be.true;
      });
    });

    describe("REMOTE IRM_STEWARD permissions", () => {
      it("should grant setInterestRateModel permission to UNICHAIN_SEPOLIA_IRM_STEWARD", async () => {
        const irmRole = ethers.utils.solidityPack(
          ["address", "string"],
          [ethers.constants.AddressZero, "setInterestRateModel(address)"],
        );
        const irmRoleHash = ethers.utils.keccak256(irmRole);
        expect(await acm.hasRole(irmRoleHash, UNICHAIN_SEPOLIA_IRM_STEWARD)).to.be.true;
      });
    });

    describe("Remote operations", () => {
      let marketCapSteward: Signer;
      let collateralFactorSteward: Signer;
      let irmSteward: Signer;
      const marketAddress = "0x0CA7edfcCF5dbf8AFdeAFB2D918409d439E3320A";

      before(async () => {
        marketCapSteward = await initMainnetUser(UNICHAIN_SEPOLIA_MC_STEWARD, parseUnits("2"));
        collateralFactorSteward = await initMainnetUser(UNICHAIN_SEPOLIA_CF_STEWARD, parseUnits("2"));
        irmSteward = await initMainnetUser(UNICHAIN_SEPOLIA_IRM_STEWARD, parseUnits("2"));
      });

      it("should allow UNICHAIN_SEPOLIA_MC_STEWARD to set supply caps on remote markets", async () => {
        await expect(
          isolatedPoolComptroller
            .connect(marketCapSteward)
            .setMarketSupplyCaps([marketAddress], [parseUnits("150000", 18)]),
        ).to.emit(isolatedPoolComptroller, "NewSupplyCap");
      });

      it("should allow UNICHAIN_SEPOLIA_MC_STEWARD to set borrow caps on remote markets", async () => {
        await expect(
          isolatedPoolComptroller
            .connect(marketCapSteward)
            .setMarketBorrowCaps([marketAddress], [parseUnits("55000", 18)]),
        ).to.emit(isolatedPoolComptroller, "NewBorrowCap");
      });

      it("should allow UNICHAIN_SEPOLIA_CF_STEWARD to set collateral factors on remote markets", async () => {
        await expect(
          isolatedPoolComptroller
            .connect(collateralFactorSteward)
            .setCollateralFactor(marketAddress, parseUnits("0.8", 18), parseUnits("0.85", 18)),
        ).to.emit(isolatedPoolComptroller, "NewCollateralFactor");
      });

      it("should allow UNICHAIN_SEPOLIA_IRM_STEWARD to set interest rate models on remote markets", async () => {
        const irmAddress = "0xAB28D51283Bd455bF1d3eE7e1B3f29fa23CBB89D";
        const market = new ethers.Contract(marketAddress, ISOLATED_VToken_ABI, ethers.provider);

        await expect(market.connect(irmSteward).setInterestRateModel(irmAddress)).to.emit(
          market,
          "NewMarketInterestRateModel",
        );
      });
    });

    describe("UNICHAIN_SEPOLIA Risk Steward Ownership", () => {
      it("should set DESTINATION_RECEIVER_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await destinationReceiverSteward.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
      });

      it("should set UNICHAIN_SEPOLIA_MC_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await unichainsepoliaMcSteward.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
      });

      it("should set UNICHAIN_SEPOLIA_CF_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await unichainsepoliaCfSteward.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
      });

      it("should set UNICHAIN_SEPOLIA_IRM_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await unichainsepoliaIrmSteward.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
      });
    });
  });
});
