import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip536, {
  NEW_SINGLE_TOKEN_CONVERTER_IMP_BSC,
  SINGLE_TOKEN_CONVERTER_BEACON_BSC,
} from "../../vips/vip-536/bsctestnet";
import {
  BSCTESTNET_CONVERSION_INCENTIVE,
  ConversionAccessibility,
  TREASURY_CONVERTER,
  TREASURY_CONVERTER_BSCTESTNET,
} from "../../vips/vip-536/configuration";
import ACCESS_CONTROLL_MANAGER_ABI from "./abi/AccessControlManager.json";
import BEACON_ABI from "./abi/Beacon.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import CONVERTER_ABI from "./abi/singletokenconverter.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const OLD_SINGLE_TOKEN_CONVERTER_IMP_BSC = "0x42Ec3Eb6F23460dFDfa3aE5688f3415CDfE0C6AD";

forking(60736885, async () => {
  const provider = ethers.provider;
  let beacon: Contract;
  let treasuryConverter: Contract;
  let acm: Contract;

  before(async () => {
    beacon = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON_BSC, BEACON_ABI, provider);
    treasuryConverter = new ethers.Contract(TREASURY_CONVERTER_BSCTESTNET, CONVERTER_ABI, provider);
    acm = new ethers.Contract(bsctestnet.ACCESS_CONTROL_MANAGER, ACCESS_CONTROLL_MANAGER_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("SingleTokenConverter should have old implementation", async () => {
      expect(await beacon.implementation()).to.equal(OLD_SINGLE_TOKEN_CONVERTER_IMP_BSC);
    });

    describe("TreasuryConverter", () => {
      it("should have a correct pending owner", async () => {
        expect(await treasuryConverter.pendingOwner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      });
    });
  });

  testVip("VIP-536", await vip536(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(
        txResponse,
        [BEACON_ABI, CONVERTER_ABI, PSR_ABI],
        [
          "Upgraded",
          "ConverterNetworkAddressUpdated",
          "ConversionConfigUpdated",
          "DistributionConfigAdded",
          "DistributionConfigRemoved",
        ],
        [1, 1, TREASURY_CONVERTER.bsctestnet.tokensOut.length, 2, 2],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("SingleTokenConverter should have new implementation", async () => {
      expect(await beacon.implementation()).to.equal(NEW_SINGLE_TOKEN_CONVERTER_IMP_BSC);
    });
    describe("TreasuryConverter", () => {
      it("should not be paused", async () => {
        expect(await treasuryConverter.conversionPaused()).to.be.false;
      });

      it("should have Treasury as destination for conversion", async () => {
        const destinationAddress = await treasuryConverter.destinationAddress();
        expect(destinationAddress.toLowerCase()).to.equal(bsctestnet.VTREASURY.toLowerCase());
      });

      it("should have correct owner", async () => {
        expect(await treasuryConverter.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      });

      it("should have correct converters network address", async () => {
        expect(await treasuryConverter.converterNetwork()).to.equal(TREASURY_CONVERTER.bsctestnet.converterNetwork);
      });

      it("should have correct conversion configuration", async () => {
        const { tokenIn, tokensOut } = TREASURY_CONVERTER.bsctestnet;

        for (const tokenOut of tokensOut) {
          const config = await treasuryConverter.conversionConfigurations(tokenIn, tokenOut);

          expect(config.incentive).to.equal(BSCTESTNET_CONVERSION_INCENTIVE);
          expect(config.conversionAccess).to.equal(ConversionAccessibility.ALL);
        }
      });

      it("guardian should have all permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, bsctestnet.GUARDIAN)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, bsctestnet.GUARDIAN)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, bsctestnet.GUARDIAN)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, bsctestnet.GUARDIAN)).to.be.true;
      });

      it("Regular timelock should have true permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, bsctestnet.NORMAL_TIMELOCK)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, bsctestnet.NORMAL_TIMELOCK)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, bsctestnet.NORMAL_TIMELOCK)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, bsctestnet.NORMAL_TIMELOCK)).to.be.true;
      });

      it("Fast Track timelock should have true permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.true;
      });

      it("Critical timelock should have true permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, bsctestnet.CRITICAL_TIMELOCK)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, bsctestnet.CRITICAL_TIMELOCK)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, bsctestnet.CRITICAL_TIMELOCK)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSCTESTNET, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, bsctestnet.CRITICAL_TIMELOCK)).to.be.true;
      });
    });
  });
});
