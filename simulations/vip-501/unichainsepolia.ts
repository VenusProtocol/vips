import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

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
  USDC_PRIME_CONVERTER,
  WETH,
  XVS,
  XVS_VAULT_CONVERTER,
  XVS_VAULT_TREASURY,
  converters,
} from "../../vips/vip-501/testnetAddresses";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACM_ABI from "./abi/AccessControlManager.json";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import COMPTROLLER_ABI from "./abi/ILComptroller.json";
import PRIME_ABI from "./abi/Prime.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import PROTOCOL_SHARE_RESERVE_ABI from "./abi/ProtocolShareReserve.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";
import USDC_ABI from "./abi/usdc.json";
import WETH_ABI from "./abi/weth.json";
import XVS_ABI from "./abi/xvs.json";
import XVS_VAULT_ABI from "./abi/xvsVault.json";

const { unichainsepolia } = NETWORK_ADDRESSES;

const USER = "0x6f057A858171e187124ddEDF034dAc63De5dE5dB";
const PSR = "0xcCcFc9B37A5575ae270352CC85D55C3C52a646C0";

forking(19755415, async () => {
  const provider = ethers.provider;
  let converterNetwork: Contract;
  let xvsVaultTreasury: Contract;
  let prime: Contract;
  let plp: Contract;
  let xvs: Contract;
  let xvsVault: Contract;
  let acm: Contract;
  let protocolShareReserve: Contract;
  let user1: Signer;
  let user1Address: string;
  let usdc: Contract;
  let weth: Contract;

  testForkedNetworkVipCommands("VIP-501", await vip501(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PRIME_ABI], ["MarketAdded"], [2]);
      await expectEvents(txResponse, [PRIME_ABI], ["MintLimitsUpdated"], [1]);
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
      protocolShareReserve = new ethers.Contract(PSR, PROTOCOL_SHARE_RESERVE_ABI, provider);
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

      it("Prime should have correct number of revocable and irrevocable tokens", async () => {
        expect(await prime.irrevocableLimit()).to.equal(0);
        expect(await prime.revocableLimit()).to.equal(500);
      });
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

      describe("Configuration checks", async () => {
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

        it("PSR should have correct distribution configs", async () => {
          const percentageDistributionConverters = [900, 1100, 2000];
          expect(await protocolShareReserve.totalDistributions()).to.equal(6);

          for (let i = 0; i < converters.length; i++) {
            expect(await protocolShareReserve.getPercentageDistribution(converters[i], 0)).to.equal(
              percentageDistributionConverters[i],
            );
          }
          expect(await protocolShareReserve.getPercentageDistribution(unichainsepolia.VTREASURY, 0)).to.equal(6000);
          expect(await protocolShareReserve.getPercentageDistribution(unichainsepolia.VTREASURY, 1)).to.equal(8000);
          expect(await protocolShareReserve.getPercentageDistribution(XVS_VAULT_CONVERTER, 1)).to.equal(2000);
        });
      });

      describe("Generic checks", () => {
        let usdcPrimeConverter: Contract;
        const amount = parseUnits("1000", 6);
        let usdcHolder: Signer;
        let wethHolder: SignerWithAddress;

        before(async () => {
          usdc = new ethers.Contract(USDC, USDC_ABI, provider);
          weth = new ethers.Contract(WETH, WETH_ABI, provider);
          usdcPrimeConverter = new ethers.Contract(USDC_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);

          [, user1, usdcHolder, wethHolder] = await ethers.getSigners();
          user1Address = await user1.getAddress();

          await usdc.connect(usdcHolder).faucet(parseUnits("10000", 6));
          await weth.connect(wethHolder).deposit({ value: "9000000000000000000000" });
        });

        it("Convert exact tokens should work correctly", async () => {
          const amountInMantissa = amount.div(2);
          await usdc.connect(usdcHolder).transfer(user1Address, amount);
          await weth.connect(wethHolder).transfer(USDC_PRIME_CONVERTER, parseUnits("1000", 18));
          const wethBalanceOfUsdcPrimeConverterPrevious = await usdcPrimeConverter.balanceOf(WETH);
          const usdcBalanceOfUserPrevious = await usdc.balanceOf(user1Address);
          const [, amountOutMantissa] = await usdcPrimeConverter
            .connect(user1)
            .callStatic.getUpdatedAmountOut(amountInMantissa, USDC, WETH);
          await usdc.connect(user1).approve(USDC_PRIME_CONVERTER, amountInMantissa);
          await usdcPrimeConverter
            .connect(user1)
            .convertExactTokens(amountInMantissa, amountInMantissa.div(2), USDC, WETH, user1Address);
          expect(await usdc.balanceOf(user1Address)).to.equal(usdcBalanceOfUserPrevious.sub(amountInMantissa));
          expect(await usdcPrimeConverter.balanceOf(USDC)).to.equal(0);
          expect(await usdcPrimeConverter.balanceOf(WETH)).to.equal(
            wethBalanceOfUsdcPrimeConverterPrevious.sub(amountOutMantissa),
          );
        });

        it("ConvertForExactTokens should work properly", async () => {
          await weth.connect(wethHolder).transfer(user1Address, amount);
          await weth.connect(user1).transfer(USDC_PRIME_CONVERTER, amount);

          const amountOutMantissa = amount.div(2);
          const amountInMaxMantissa = amount;
          await usdc.connect(usdcHolder).transfer(user1Address, amount);

          const wethBalanceOfUsdtPrimeConverterPrevious = await usdcPrimeConverter.balanceOf(WETH);
          const usdtBalanceOfUserPrevious = await usdc.balanceOf(user1Address);

          const [, amountInMantissa] = await usdcPrimeConverter
            .connect(user1)
            .getAmountIn(amountOutMantissa, USDC, WETH);

          await usdc.connect(user1).approve(USDC_PRIME_CONVERTER, amount);
          await usdcPrimeConverter
            .connect(user1)
            .convertForExactTokens(amountInMaxMantissa, amountOutMantissa, USDC, WETH, user1Address);

          expect(await usdc.balanceOf(user1Address)).to.equal(usdtBalanceOfUserPrevious.sub(amountInMantissa));
          expect(await usdcPrimeConverter.balanceOf(USDC)).to.equal(0);
          expect(await usdcPrimeConverter.balanceOf(WETH)).to.equal(
            wethBalanceOfUsdtPrimeConverterPrevious.sub(amountOutMantissa),
          );
        });
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
