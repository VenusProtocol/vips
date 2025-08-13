import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip536, {
  NEW_SINGLE_TOKEN_CONVERTER_IMP_BSC,
  SINGLE_TOKEN_CONVERTER_BEACON_BSC,
} from "../../vips/vip-536/bscmainnet";
import {
  BSC_CONVERSION_INCENTIVE,
  ConversionAccessibility,
  TREASURY_CONVERTER,
  TREASURY_CONVERTER_BSC,
} from "../../vips/vip-536/configuration";
import ACCESS_CONTROLL_MANAGER_ABI from "./abi/AccessControlManager.json";
import BEACON_ABI from "./abi/Beacon.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import CONVERTER_ABI from "./abi/singletokenconverter.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const OLD_SINGLE_TOKEN_CONVERTER_IMP_BSC = "0x40ed28180Df01FdeB957224E4A5415704B9D5990";

forking(56542578, async () => {
  const provider = ethers.provider;
  let beacon: Contract;
  let treasuryConverter: Contract;
  let acm: Contract;

  before(async () => {
    beacon = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON_BSC, BEACON_ABI, provider);
    treasuryConverter = new ethers.Contract(TREASURY_CONVERTER_BSC, CONVERTER_ABI, provider);
    acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACCESS_CONTROLL_MANAGER_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("SingleTokenConverter should have old implementation", async () => {
      expect(await beacon.implementation()).to.equal(OLD_SINGLE_TOKEN_CONVERTER_IMP_BSC);
    });

    describe("TreasuryConverter", () => {
      it("should have a correct pending owner", async () => {
        expect(await treasuryConverter.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
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
          "DistributionConfigUpdated",
          "DistributionConfigRemoved",
        ],
        [1, 1, TREASURY_CONVERTER.bscmainnet.whitelistedTokens.length, 2, 2, 2],
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
        expect(await treasuryConverter.destinationAddress()).to.equal(bscmainnet.VTREASURY);
      });

      it("should have correct owner", async () => {
        expect(await treasuryConverter.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      });

      it("should have correct converters network address", async () => {
        expect(await treasuryConverter.converterNetwork()).to.equal(TREASURY_CONVERTER.bscmainnet.converterNetwork);
      });

      it("should have correct conversion configuration", async () => {
        const { tokenIn, whitelistedTokens: tokenOuts } = TREASURY_CONVERTER.bscmainnet;

        for (const tokenOut of tokenOuts) {
          const config = await treasuryConverter.conversionConfigurations(tokenIn, tokenOut);

          expect(config.incentive).to.equal(BSC_CONVERSION_INCENTIVE);
          expect(config.conversionAccess).to.equal(ConversionAccessibility.ALL);
        }
      });

      it("guardian should have all permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, bscmainnet.GUARDIAN)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, bscmainnet.GUARDIAN)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, bscmainnet.GUARDIAN)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, bscmainnet.GUARDIAN)).to.be.true;
      });

      it("Regular timelock should have true permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, bscmainnet.NORMAL_TIMELOCK)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, bscmainnet.NORMAL_TIMELOCK)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, bscmainnet.NORMAL_TIMELOCK)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, bscmainnet.NORMAL_TIMELOCK)).to.be.true;
      });

      it("Fast Track timelock should have true permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;
      });

      it("Critical timelock should have true permissions to call TreasuryConverter", async () => {
        const pauseConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "pauseConversion()"],
        );
        const pauseConversionRoleHash = ethers.utils.keccak256(pauseConversionRole);
        expect(await acm.hasRole(pauseConversionRoleHash, bscmainnet.CRITICAL_TIMELOCK)).to.be.true;

        const resumeConversionRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "resumeConversion()"],
        );
        const resumeConversionRoleHash = ethers.utils.keccak256(resumeConversionRole);
        expect(await acm.hasRole(resumeConversionRoleHash, bscmainnet.CRITICAL_TIMELOCK)).to.be.true;

        const setMinAmountToConvertRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "setMinAmountToConvert(uint256)"],
        );
        const setMinAmountToConvertRoleHash = ethers.utils.keccak256(setMinAmountToConvertRole);
        expect(await acm.hasRole(setMinAmountToConvertRoleHash, bscmainnet.CRITICAL_TIMELOCK)).to.be.true;

        const setConversionConfigRole = ethers.utils.solidityPack(
          ["address", "string"],
          [TREASURY_CONVERTER_BSC, "setConversionConfig(address,address,ConversionConfig)"],
        );
        const setConversionConfigRoleHash = ethers.utils.keccak256(setConversionConfigRole);
        expect(await acm.hasRole(setConversionConfigRoleHash, bscmainnet.CRITICAL_TIMELOCK)).to.be.true;
      });
    });
  });
});
