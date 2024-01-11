/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { converters } from "../../../vips/vip-converter/vip-converter-testnet/Addresses";
import { vipConverter1 } from "../../../vips/vip-converter/vip-converter-testnet/vip-converter1";
import ACCESS_CONTROL_MANAGER_ABI from "../abi/AccessControlManager.json";
import CONVERTER_NETWORK_ABI from "../abi/ConverterNetwork.json";
import SINGLE_TOKEN_CONVERTER_ABI from "../abi/SingleTokenConverter.json";
import XVS_VAULT_CONVERTER_ABI from "../abi/XVSVaultTreasury.json";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const XVS_VAULT_TREASURY = "0x317c6C4c9AA7F87170754DB08b4804dD689B68bF";
const CONVERTER_NETWORK = "0xC8f2B705d5A2474B390f735A5aFb570e1ce0b2cf";

forking(36752108, () => {
  const provider = ethers.provider;

  testVip("VIP-converter1", vipConverter1(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [SINGLE_TOKEN_CONVERTER_ABI], ["OwnershipTransferred"], [8]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [84]);
    },
  });

  describe("Post-VIP behavior", () => {
    let converterNetwork: Contract;
    let xvsVaultTreasury: Contract;

    before(async () => {
      converterNetwork = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
      xvsVaultTreasury = new ethers.Contract(XVS_VAULT_TREASURY, XVS_VAULT_CONVERTER_ABI, provider);
    });

    it("Timelock should be the owner of all converters", async () => {
      for (const converter of converters) {
        const Converter = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
        expect(await Converter.owner()).to.equal(NORMAL_TIMELOCK);
      }
    });

    it("Timelock should be the owner of ConverterNetwork", async () => {
      expect(await converterNetwork.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("Timelock should be the owner of XVSVaultTreasury", async () => {
      expect(await xvsVaultTreasury.owner()).to.equal(NORMAL_TIMELOCK);
    });
  });
});
