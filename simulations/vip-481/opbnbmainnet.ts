import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  OPBNBMAINNET_NEW_XVS_VAULT_IMPLEMENTATION,
  OPBNBMAINNET_VTOKEN_BEACON,
  OPBNBMAINNET_XVS_VAULT_PROXY,
  vip481,
} from "../../vips/vip-481/bscmainnet";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import PROXY_ABI from "./abi/manualProxy.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vtoken.json";
import VTOKEN_BEACON_ABI from "./abi/vtokenBeacon.json";

forking(52932185, async () => {
  let xvsVault: Contract;
  let xvsVaultProxy: Contract;
  let vtokenBeacon: Contract;
  let poolRegistry: Contract;

  before(async () => {
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, OPBNBMAINNET_XVS_VAULT_PROXY);
    xvsVaultProxy = await ethers.getContractAt(PROXY_ABI, OPBNBMAINNET_XVS_VAULT_PROXY);
    vtokenBeacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, OPBNBMAINNET_VTOKEN_BEACON);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, NETWORK_ADDRESSES.opbnbmainnet.POOL_REGISTRY);
  });

  describe("Pre-VIP behaviour", async () => {
    describe("Old Implementations & old block rate", () => {
      describe("XVS Vault", () => {
        it("XVSVAULT should not point to new impl", async () => {
          expect(await xvsVaultProxy.implementation()).not.equals(OPBNBMAINNET_NEW_XVS_VAULT_IMPLEMENTATION);
        });
        it("XVSVAULT should have block rate of 31536000", async () => {
          expect(await xvsVault.blocksOrSecondsPerYear()).equals(31536000);
        });
      });

      describe("VToken", () => {
        it("VToken beacon should not point to new impl", async () => {
          expect(await vtokenBeacon.implementation()).not.equals(OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION);
        });
        it("All Vtokens should have old block rate in IL", async () => {
          const registeredPools = await poolRegistry.getAllPools();
          for (const pool of registeredPools) {
            const comptrollerAddress = pool.comptroller;
            const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, comptrollerAddress);
            const poolVTokens = await comptroller.getAllMarkets();
            for (const vtokenAddress of poolVTokens) {
              const vtoken = await ethers.getContractAt(VTOKEN_ABI, vtokenAddress);
              expect(await vtoken.blocksOrSecondsPerYear()).equals(31536000);
            }
          }
        });
      });
    });
  });

  testForkedNetworkVipCommands("VIP-481", await vip481(), {});

  describe("Post-VIP behavior", async () => {
    describe("Should point to new impl and have updated block rate", () => {
      describe("XVS Vault", async () => {
        it("XVSVAULT should point to new impl", async () => {
          expect(await xvsVaultProxy.implementation()).equals(OPBNBMAINNET_NEW_XVS_VAULT_IMPLEMENTATION);
        });
        it("XVSVAULT should have block rate of 63072000", async () => {
          expect(await xvsVault.blocksOrSecondsPerYear()).equals(63072000);
        });
      });

      describe("VToken", () => {
        it("VToken beacon should point to new impl", async () => {
          expect(await vtokenBeacon.implementation()).equals(OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION);
        });
        it("All Vtokens should have new block rate in IL", async () => {
          const registeredPools = await poolRegistry.getAllPools();
          for (const pool of registeredPools) {
            const comptrollerAddress = pool.comptroller;
            const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, comptrollerAddress);
            const poolVTokens = await comptroller.getAllMarkets();
            for (const vtokenAddress of poolVTokens) {
              const vtoken = await ethers.getContractAt(VTOKEN_ABI, vtokenAddress);
              expect(await vtoken.blocksOrSecondsPerYear()).equals(63072000);
            }
          }
        });
      });
    });
  });
});
