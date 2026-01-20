import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";

import {
  ACM_AGGREGATOR,
  COMPTROLLER_CORE,
  DEFAULT_ADMIN_ROLE,
  PRIME,
  PRIME_LIQUIDITY_PROVIDER,
  vip501,
} from "../../vips/vip-501/bsctestnet";
import {
  ACM,
  CONVERTER_NETWORK,
  USDC,
  WETH,
  XVS,
  XVS_VAULT_TREASURY,
  converters,
} from "../../vips/vip-501/testnetAddresses";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACM_ABI from "./abi/AccessControlManager.json";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import COMPTROLLER_ABI from "./abi/ILComptroller.json";
import PRIME_ABI from "./abi/Prime.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";
import XVS_ABI from "./abi/xvs.json";
import XVS_VAULT_ABI from "./abi/xvsVault.json";

const { unichainsepolia } = NETWORK_ADDRESSES;

const USER = "0x6f057A858171e187124ddEDF034dAc63De5dE5dB";

forking(19755415, async () => {
  const provider = ethers.provider;
  let converterNetwork: Contract;
  let xvsVaultTreasury: Contract;
  let prime: Contract;
  let plp: Contract;
  let xvs: Contract;
  let xvsVault: Contract;
  let acm: Contract;

  testForkedNetworkVipCommands("VIP-501", await vip501(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PRIME_ABI], ["MarketAdded"], [2]);
      await expectEvents(txResponse, [PRIME_ABI], ["MintLimitsUpdated"], [1]);
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["NewPrimeToken"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [21]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    before(async () => {
      await impersonateAccount(USER);
      const signer = await ethers.getSigner(USER);
      converterNetwork = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
      xvsVaultTreasury = new ethers.Contract(XVS_VAULT_TREASURY, XVS_VAULT_TREASURY_ABI, provider);
      prime = new ethers.Contract(PRIME, PRIME_ABI, signer);
      plp = new ethers.Contract(PRIME_LIQUIDITY_PROVIDER, PLP_ABI, signer);
      xvs = new ethers.Contract(XVS, XVS_ABI, signer);
      xvsVault = new ethers.Contract(unichainsepolia.XVS_VAULT_PROXY, XVS_VAULT_ABI, signer);
      acm = new ethers.Contract(ACM, ACM_ABI, provider);

      await setMaxStalePeriodInChainlinkOracle(
        unichainsepolia.REDSTONE_ORACLE,
        USDC,
        ethers.constants.AddressZero,
        unichainsepolia.NORMAL_TIMELOCK,
      );
      await setMaxStalePeriodInChainlinkOracle(
        unichainsepolia.REDSTONE_ORACLE,
        WETH,
        ethers.constants.AddressZero,
        unichainsepolia.NORMAL_TIMELOCK,
      );
    });

    describe("Prime configuration", () => {
      it("Comptroller core should have correct Prime token address", async () => {
        const comptrollerCore = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
        expect(await comptrollerCore.prime()).to.be.equal(PRIME);
      });

      it("Plp should have correct tokens", async () => {
        expect(await plp.lastAccruedBlockOrSecond(USDC)).to.be.gt(0);
        expect(await plp.lastAccruedBlockOrSecond(WETH)).to.be.gt(0);
      });
    });

    it("prime markets", async () => {
      expect((await prime.getAllMarkets()).length).to.equal(2);
    });
    it("prime is configured in xvs vault", async () => {
      expect(await xvsVault.primeToken()).equals(PRIME);
    });

    it("prime address", async () => {
      expect(await plp.prime()).to.equal(PRIME);
    });

    it("claim prime token", async () => {
      await xvs.approve(xvsVault.address, parseUnits("4", 18));
      await xvsVault.deposit(XVS, 0, parseUnits("4", 18));

      await mine(10000);
      await expect(prime.claim()).not.to.be.reverted;
    });

    it("is paused", async () => {
      expect(await prime.paused()).to.be.equal(true);
      expect(await plp.paused()).to.be.equal(true);
    });

    describe("Converters configuration", () => {
      describe("Owner checks", () => {
        it("NORMAL TIMELOCK should be the owner of all converters", async () => {
          for (const converter of converters) {
            const Converter = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
            expect(await Converter.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
          }
        });

        it("NORMAL TIMELOCK should be the owner of ConverterNetwork", async () => {
          expect(await converterNetwork.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
        });

        it("NORMAL TIMELOCK should be the owner of XVSVaultTreasury", async () => {
          expect(await xvsVaultTreasury.owner()).to.equal(unichainsepolia.NORMAL_TIMELOCK);
        });
      });

      describe("Generic checks", () => {
        it("XVSVaultTreasury should have correct state variables", async () => {
          expect(await xvsVaultTreasury.XVS_ADDRESS()).to.equal(XVS);
          expect(await xvsVaultTreasury.xvsVault()).to.equal(unichainsepolia.XVS_VAULT_PROXY);
        });

        it("Converters should belong to the same ConverterNetwork", async () => {
          for (const converter of converters) {
            const Converter = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
            expect(await Converter.converterNetwork()).to.equal(CONVERTER_NETWORK);
          }
        });
      });
      describe("generic tests", async () => {
        checkXVSVault();
      });
      describe("Aggregator checks", async () => {
        it("check if DEFAULT_ROLE has been revoked for ACMAggregator", async () => {
          expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR)).to.be.false;
        });

        it("check few permissions", async () => {
          const converter = "0xfD57cc379D74d2d4A94D653f989F8EEb6b078aBF";
          const role1 = ethers.utils.solidityPack(["address", "string"], [converter, "addTokenConverter(address)"]);

          const roleHash = ethers.utils.keccak256(role1);
          expect(await acm.hasRole(roleHash, unichainsepolia.NORMAL_TIMELOCK)).to.be.true;

          const role2 = ethers.utils.solidityPack(
            ["address", "string"],
            [ethers.constants.AddressZero, "pauseConversion()"],
          );

          const roleHash2 = ethers.utils.keccak256(role2);
          expect(await acm.hasRole(roleHash2, unichainsepolia.NORMAL_TIMELOCK)).to.be.true;
        });
      });
    });
  });
});
