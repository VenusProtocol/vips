import { expect } from "chai";
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
import PROXY_ABI from "./abi/manualProxy.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_BEACON_ABI from "./abi/vtokenBeacon.json";
import { getAllVTokens } from "./common";

forking(52932185, async () => {
  const xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, OPBNBMAINNET_XVS_VAULT_PROXY);
  const xvsVaultProxy = await ethers.getContractAt(PROXY_ABI, OPBNBMAINNET_XVS_VAULT_PROXY);
  const vTokenBeacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, OPBNBMAINNET_VTOKEN_BEACON);
  const poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, NETWORK_ADDRESSES.opbnbmainnet.POOL_REGISTRY);
  const allVTokens = await getAllVTokens(poolRegistry);

  describe("Pre-VIP behaviour", () => {
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
          expect(await vTokenBeacon.implementation()).not.equals(OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION);
        });

        for (const vToken of allVTokens) {
          it(`${vToken.symbol} should have old block rate in IL`, async () => {
            expect(await vToken.contract.blocksOrSecondsPerYear()).equals(31536000);
          });
        }
      });
    });
  });

  testForkedNetworkVipCommands("VIP-481", await vip481(), {});

  describe("Post-VIP behavior", () => {
    describe("Should point to new impl and have updated block rate", () => {
      describe("XVS Vault", () => {
        it("XVSVAULT should point to new impl", async () => {
          expect(await xvsVaultProxy.implementation()).equals(OPBNBMAINNET_NEW_XVS_VAULT_IMPLEMENTATION);
        });
        it("XVSVAULT should have block rate of 63072000", async () => {
          expect(await xvsVault.blocksOrSecondsPerYear()).equals(63072000);
        });
      });

      describe("VToken", () => {
        it("VToken beacon should point to new impl", async () => {
          expect(await vTokenBeacon.implementation()).equals(OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION);
        });

        for (const vToken of allVTokens) {
          it(`${vToken.symbol} should have new block rate in IL`, async () => {
            expect(await vToken.contract.blocksOrSecondsPerYear()).equals(63072000);
          });
        }
      });
    });
  });
});
