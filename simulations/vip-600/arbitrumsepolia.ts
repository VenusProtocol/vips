import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip600, {
  ARBITRUMSEPOLIA_ACM_AGGREGATOR,
  ARBITRUMSEPOLIA_ACM_AGR_INDEX,
  ARBITRUMSEPOLIA_PERMISSIONS,
  ARBITRUM_SEPOLIA_ACM,
  ARBITRUM_SEPOLIA_CF_STEWARD,
  ARBITRUM_SEPOLIA_COMPTROLLER,
  ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER,
  ARBITRUM_SEPOLIA_IRM_STEWARD,
  ARBITRUM_SEPOLIA_MC_STEWARD,
} from "../../vips/vip-600/bsctestnet";
import ACM_AGGREGATOR_ABI from "./abi/ACMAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import DSR_ABI from "./abi/DestinationStewardReceiver.json";
import ISOLATED_VToken_ABI from "./abi/ILVToken.json";
import ISOLATED_POOL_COMPTROLLER_ABI from "./abi/IsolatedPoolComptroller.json";
import Owner_ABI from "./abi/OwnerMinimalAbi.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

forking(231698540, async () => {
  let acm: Contract;
  let isolatedPoolComptroller: Contract;
  let acmAggregator: Contract;
  let destinationReceiverSteward: Contract;
  let arbitrumsepoliaMcSteward: Contract;
  let arbitrumsepoliaCfSteward: Contract;
  let arbitrumsepoliaIrmSteward: Contract;

  before(async () => {
    const provider = ethers.provider;
    acm = new ethers.Contract(ARBITRUM_SEPOLIA_ACM, ACCESS_CONTROL_MANAGER_ABI, provider);
    isolatedPoolComptroller = new ethers.Contract(
      ARBITRUM_SEPOLIA_COMPTROLLER,
      ISOLATED_POOL_COMPTROLLER_ABI,
      provider,
    );
    acmAggregator = new ethers.Contract(ARBITRUMSEPOLIA_ACM_AGGREGATOR, ACM_AGGREGATOR_ABI, provider);

    // ARBITRUM_SEPOLIA Risk Steward contracts
    destinationReceiverSteward = new ethers.Contract(ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER, DSR_ABI, provider);
    arbitrumsepoliaMcSteward = new ethers.Contract(ARBITRUM_SEPOLIA_MC_STEWARD, Owner_ABI, provider);
    arbitrumsepoliaCfSteward = new ethers.Contract(ARBITRUM_SEPOLIA_CF_STEWARD, Owner_ABI, provider);
    arbitrumsepoliaIrmSteward = new ethers.Contract(ARBITRUM_SEPOLIA_IRM_STEWARD, Owner_ABI, provider);
    const signer = provider.getSigner();
    await acmAggregator.connect(signer).addGrantPermissions(ARBITRUMSEPOLIA_PERMISSIONS);
  });

  describe("Pre-VIP behavior", () => {
    it("should verify stored permissions match ARBITRUMSEPOLIA_PERMISSIONS from buildRemoteChainPermissions", async () => {
      // Retrieve all permissions from the aggregator using grantPermissions and verify they match ARBITRUMSEPOLIA_PERMISSIONS
      const storedPermissions = [];
      for (let i = 0; i < ARBITRUMSEPOLIA_PERMISSIONS.length; i++) {
        const storedPermission = await acmAggregator.grantPermissions(ARBITRUMSEPOLIA_ACM_AGR_INDEX, i);
        storedPermissions.push(storedPermission);
        const expectedPermission = ARBITRUMSEPOLIA_PERMISSIONS[i];

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
      expect(storedPermissions.length).to.equal(ARBITRUMSEPOLIA_PERMISSIONS.length);
      // Out of bound
      await expect(
        acmAggregator.callStatic.grantPermissions(ARBITRUMSEPOLIA_ACM_AGR_INDEX, ARBITRUMSEPOLIA_PERMISSIONS.length),
      ).to.be.reverted;
    });
  });

  testForkedNetworkVipCommands("vip600 Configuring Risk Stewards on Arbitrum Sepolia", await vip600(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["PermissionGranted"],
        [24], // Expected number of PermissionGranted events for Arbitrum Sepolia commands
      );
    },
  });

  describe("Post-VIP behavior", () => {
    describe("DESTINATION_RECEIVER_STEWARD permissions", () => {
      it("should grant setRiskParameterConfig permission to NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK and GUARDIAN", async () => {
        const setRiskParamRole = ethers.utils.solidityPack(
          ["address", "string"],
          [ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER, "setRiskParameterConfig(string,address,uint256)"],
        );
        const setRiskParamRoleHash = ethers.utils.keccak256(setRiskParamRole);
        expect(await acm.hasRole(setRiskParamRoleHash, arbitrumsepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRiskParamRoleHash, arbitrumsepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRiskParamRoleHash, arbitrumsepolia.GUARDIAN)).to.be.true;
      });

      it("should grant setConfigActive permission to all timelocks", async () => {
        const setConfigActiveRole = ethers.utils.solidityPack(
          ["address", "string"],
          [ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER, "setConfigActive(string,bool)"],
        );
        const setConfigActiveRoleHash = ethers.utils.keccak256(setConfigActiveRole);
        expect(await acm.hasRole(setConfigActiveRoleHash, arbitrumsepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, arbitrumsepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, arbitrumsepolia.CRITICAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, arbitrumsepolia.GUARDIAN)).to.be.true;
      });

      it("should grant setRemoteDelay permission to NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK and GUARDIAN", async () => {
        const setRemoteDelayRole = ethers.utils.solidityPack(
          ["address", "string"],
          [ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER, "setRemoteDelay(uint256)"],
        );
        const setRemoteDelayRoleHash = ethers.utils.keccak256(setRemoteDelayRole);
        expect(await acm.hasRole(setRemoteDelayRoleHash, arbitrumsepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRemoteDelayRoleHash, arbitrumsepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRemoteDelayRoleHash, arbitrumsepolia.GUARDIAN)).to.be.true;
      });

      it("should grant setWhitelistedExecutor permission to all timelocks", async () => {
        const setWhitelistedExecutorRole = ethers.utils.solidityPack(
          ["address", "string"],
          [ARBITRUM_SEPOLIA_DESTINATION_STEWARD_RECEIVER, "setWhitelistedExecutor(address,bool)"],
        );
        const setWhitelistedExecutorRoleHash = ethers.utils.keccak256(setWhitelistedExecutorRole);
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, arbitrumsepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, arbitrumsepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, arbitrumsepolia.CRITICAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, arbitrumsepolia.GUARDIAN)).to.be.true;
      });
    });

    describe("REMOTE_RS setSafeDeltaBps permissions", () => {
      it("should grant MC_STEWARD setSafeDeltaBps permission to NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK and GUARDIAN", async () => {
        const marketCapRole = ethers.utils.solidityPack(
          ["address", "string"],
          [ARBITRUM_SEPOLIA_MC_STEWARD, "setSafeDeltaBps(uint256)"],
        );
        const marketCapRoleHash = ethers.utils.keccak256(marketCapRole);
        expect(await acm.hasRole(marketCapRoleHash, arbitrumsepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(marketCapRoleHash, arbitrumsepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(marketCapRoleHash, arbitrumsepolia.GUARDIAN)).to.be.true;
      });

      it("should grant CF_STEWARD setSafeDeltaBps permission to NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK and GUARDIAN", async () => {
        const cfRole = ethers.utils.solidityPack(
          ["address", "string"],
          [ARBITRUM_SEPOLIA_CF_STEWARD, "setSafeDeltaBps(uint256)"],
        );
        const cfRoleHash = ethers.utils.keccak256(cfRole);
        expect(await acm.hasRole(cfRoleHash, arbitrumsepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(cfRoleHash, arbitrumsepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(cfRoleHash, arbitrumsepolia.GUARDIAN)).to.be.true;
      });
    });

    describe("REMOTE MARKETCAP_STEWARD permissions", () => {
      it("should grant setMarketBorrowCaps permission to ARBITRUM_SEPOLIA_MC_STEWARD", async () => {
        const borrowCapRole = ethers.utils.solidityPack(
          ["address", "string"],
          [ARBITRUM_SEPOLIA_COMPTROLLER, "setMarketBorrowCaps(address[],uint256[])"],
        );
        const borrowCapRoleHash = ethers.utils.keccak256(borrowCapRole);
        expect(await acm.hasRole(borrowCapRoleHash, ARBITRUM_SEPOLIA_MC_STEWARD)).to.be.true;
      });

      it("should grant setMarketSupplyCaps permission to ARBITRUM_SEPOLIA_MC_STEWARD", async () => {
        const supplyCapRole = ethers.utils.solidityPack(
          ["address", "string"],
          [ARBITRUM_SEPOLIA_COMPTROLLER, "setMarketSupplyCaps(address[],uint256[])"],
        );
        const supplyCapRoleHash = ethers.utils.keccak256(supplyCapRole);
        expect(await acm.hasRole(supplyCapRoleHash, ARBITRUM_SEPOLIA_MC_STEWARD)).to.be.true;
      });

      it("should grant setCollateralFactor permission to ARBITRUM_SEPOLIA_CF_STEWARD", async () => {
        const collateralFactorRole = ethers.utils.solidityPack(
          ["address", "string"],
          [ARBITRUM_SEPOLIA_COMPTROLLER, "setCollateralFactor(address,uint256,uint256)"],
        );
        const collateralFactorRoleHash = ethers.utils.keccak256(collateralFactorRole);
        expect(await acm.hasRole(collateralFactorRoleHash, ARBITRUM_SEPOLIA_CF_STEWARD)).to.be.true;
      });
    });

    describe("REMOTE IRM_STEWARD permissions", () => {
      it("should grant setInterestRateModel permission to ARBITRUM_SEPOLIA_IRM_STEWARD", async () => {
        const irmRole = ethers.utils.solidityPack(
          ["address", "string"],
          [ethers.constants.AddressZero, "setInterestRateModel(address)"],
        );
        const irmRoleHash = ethers.utils.keccak256(irmRole);
        expect(await acm.hasRole(irmRoleHash, ARBITRUM_SEPOLIA_IRM_STEWARD)).to.be.true;
      });
    });

    describe("Remote operations", () => {
      let marketCapSteward: Signer;
      let collateralFactorSteward: Signer;
      let irmSteward: Signer;
      const marketAddress = "0x292Ec2b45C549Bc2c6B31937dBd511beaAEabea8";

      before(async () => {
        marketCapSteward = await initMainnetUser(ARBITRUM_SEPOLIA_MC_STEWARD, parseUnits("2"));
        collateralFactorSteward = await initMainnetUser(ARBITRUM_SEPOLIA_CF_STEWARD, parseUnits("2"));
        irmSteward = await initMainnetUser(ARBITRUM_SEPOLIA_IRM_STEWARD, parseUnits("2"));
      });

      it("should allow ARBITRUM_SEPOLIA_MC_STEWARD to set supply caps on remote markets", async () => {
        await expect(
          isolatedPoolComptroller
            .connect(marketCapSteward)
            .setMarketSupplyCaps([marketAddress], [parseUnits("150000", 18)]),
        ).to.emit(isolatedPoolComptroller, "NewSupplyCap");
      });

      it("should allow ARBITRUM_SEPOLIA_MC_STEWARD to set borrow caps on remote markets", async () => {
        await expect(
          isolatedPoolComptroller
            .connect(marketCapSteward)
            .setMarketBorrowCaps([marketAddress], [parseUnits("55000", 18)]),
        ).to.emit(isolatedPoolComptroller, "NewBorrowCap");
      });

      it("should allow ARBITRUM_SEPOLIA_CF_STEWARD to set collateral factors on remote markets", async () => {
        await expect(
          isolatedPoolComptroller
            .connect(collateralFactorSteward)
            .setCollateralFactor(marketAddress, parseUnits("0.8", 18), parseUnits("0.85", 18)),
        ).to.emit(isolatedPoolComptroller, "NewCollateralFactor");
      });

      it("should allow ARBITRUM_SEPOLIA_IRM_STEWARD to set interest rate models on remote markets", async () => {
        const irmAddress = "0x50e8FF8748684F5DbDAEc5554c7FE3E82Cdc19e1";
        const market = new ethers.Contract(marketAddress, ISOLATED_VToken_ABI, ethers.provider);

        await expect(market.connect(irmSteward).setInterestRateModel(irmAddress)).to.emit(
          market,
          "NewMarketInterestRateModel",
        );
      });
    });

    describe("ARBITRUM_SEPOLIA Risk Steward Ownership", () => {
      it("should set DESTINATION_RECEIVER_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await destinationReceiverSteward.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });

      it("should set ARBITRUM_SEPOLIA_MC_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await arbitrumsepoliaMcSteward.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });

      it("should set ARBITRUM_SEPOLIA_CF_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await arbitrumsepoliaCfSteward.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });

      it("should set ARBITRUM_SEPOLIA_IRM_STEWARD owner to NORMAL_TIMELOCK", async () => {
        expect(await arbitrumsepoliaIrmSteward.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    });
  });
});
