import { expect } from "chai";
import { Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip600, {
  BSCTESTNET_EID,
  DESTINATION_RECEIVER_STEWARD,
  RISK_STEWARD_RECEIVER,
  SEPOLIA_ACM,
  SEPOLIA_CF_STEWARD,
  SEPOLIA_COMPTROLLER,
  SEPOLIA_IRM_STEWARD,
  SEPOLIA_MC_STEWARD,
} from "../../vips/vip-600/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import DSR_ABI from "./abi/DestinationStewardReceiver.json";
import ISOLATED_VToken_ABI from "./abi/ILVToken.json";
import ISOLATED_POOL_COMPTROLLER_ABI from "./abi/IsolatedPoolComptroller.json";
import Owner_ABI from "./abi/OwnerMinimalAbi.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(9844003, async () => {
  const provider = ethers.provider;
  const acm = new ethers.Contract(SEPOLIA_ACM, ACCESS_CONTROL_MANAGER_ABI, provider);
  const isolatedPoolComptroller = new ethers.Contract(SEPOLIA_COMPTROLLER, ISOLATED_POOL_COMPTROLLER_ABI, provider);

  // SEPOLIA Risk Steward contracts
  const destinationReceiverSteward = new ethers.Contract(DESTINATION_RECEIVER_STEWARD, DSR_ABI, provider);
  const sepoliaMcSteward = new ethers.Contract(SEPOLIA_MC_STEWARD, Owner_ABI, provider);
  const sepoliaCfSteward = new ethers.Contract(SEPOLIA_CF_STEWARD, Owner_ABI, provider);
  const sepoliaIrmSteward = new ethers.Contract(SEPOLIA_IRM_STEWARD, Owner_ABI, provider);

  testForkedNetworkVipCommands("vip600 Configuring Risk Stewards on Sepolia", await vip600(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["PermissionGranted"],
        [18], // Expected number of PermissionGranted events for Sepolia commands
      );
    },
  });

  describe("Post-VIP behavior", () => {
    describe("DESTINATION_RECEIVER_STEWARD permissions", () => {
      it("should grant setRiskParameterConfig permission to NORMAL_TIMELOCK and FAST_TRACK_TIMELOCK", async () => {
        const setRiskParamRole = ethers.utils.solidityPack(
          ["address", "string"],
          [DESTINATION_RECEIVER_STEWARD, "setRiskParameterConfig(string,address,uint256)"],
        );
        const setRiskParamRoleHash = ethers.utils.keccak256(setRiskParamRole);
        expect(await acm.hasRole(setRiskParamRoleHash, sepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setRiskParamRoleHash, sepolia.FAST_TRACK_TIMELOCK)).to.be.true;
      });

      it("should grant setConfigActive permission to all timelocks", async () => {
        const setConfigActiveRole = ethers.utils.solidityPack(
          ["address", "string"],
          [DESTINATION_RECEIVER_STEWARD, "setConfigActive(string,bool)"],
        );
        const setConfigActiveRoleHash = ethers.utils.keccak256(setConfigActiveRole);
        expect(await acm.hasRole(setConfigActiveRoleHash, sepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, sepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, sepolia.CRITICAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setConfigActiveRoleHash, sepolia.GUARDIAN)).to.be.true;
      });

      it("should grant setWhitelistedExecutor permission to all timelocks", async () => {
        const setWhitelistedExecutorRole = ethers.utils.solidityPack(
          ["address", "string"],
          [DESTINATION_RECEIVER_STEWARD, "setWhitelistedExecutor(address,bool)"],
        );
        const setWhitelistedExecutorRoleHash = ethers.utils.keccak256(setWhitelistedExecutorRole);
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, sepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, sepolia.FAST_TRACK_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, sepolia.CRITICAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(setWhitelistedExecutorRoleHash, sepolia.GUARDIAN)).to.be.true;
      });
    });

    describe("REMOTE_RS setSafeDeltaBps permissions", () => {
      it("should grant setSafeDeltaBps permission to MARKETCAP_STEWARD", async () => {
        const marketCapRole = ethers.utils.solidityPack(
          ["address", "string"],
          [SEPOLIA_MC_STEWARD, "setSafeDeltaBps(uint256)"],
        );
        const marketCapRoleHash = ethers.utils.keccak256(marketCapRole);
        expect(await acm.hasRole(marketCapRoleHash, sepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(marketCapRoleHash, sepolia.FAST_TRACK_TIMELOCK)).to.be.true;
      });

      it("should grant setSafeDeltaBps permission to COLLATERALFACTORS_STEWARD", async () => {
        const cfRole = ethers.utils.solidityPack(
          ["address", "string"],
          [SEPOLIA_CF_STEWARD, "setSafeDeltaBps(uint256)"],
        );
        const cfRoleHash = ethers.utils.keccak256(cfRole);
        expect(await acm.hasRole(cfRoleHash, sepolia.NORMAL_TIMELOCK)).to.be.true;
        expect(await acm.hasRole(cfRoleHash, sepolia.FAST_TRACK_TIMELOCK)).to.be.true;
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
        ).to.emit(isolatedPoolComptroller, "NewCollateralFactor");
      });

      it("should allow SEPOLIA_IRM_STEWARD to set interest rate models on remote markets", async () => {
        const irmAddress = "0x8E09246751bcf2F621694881bd0E55d681f061c3";
        const market = new ethers.Contract(marketAddress, ISOLATED_VToken_ABI, provider);

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

    describe("Cross-chain peer connections", () => {
      it("should set peer for DESTINATION_RECEIVER_STEWARD (DSR) to RISK_STEWARD_RECEIVER (RSR)", async () => {
        const expectedPeer = ethers.utils.hexZeroPad(RISK_STEWARD_RECEIVER, 32);
        expect(await destinationReceiverSteward.peers(BSCTESTNET_EID)).to.equal(expectedPeer.toLocaleLowerCase());
      });
    });
  });
});
