/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { converters } from "../../../vips/vip-converter/vip-converter-mainnet/Addresses";
import { vipConverter1 } from "../../../vips/vip-converter/vip-converter-mainnet/vip-converter1";
import ACCESS_CONTROL_MANAGER_ABI from "../abi/AccessControlManagerMainnet.json";
import CONVERTER_NETWORK_ABI from "../abi/ConverterNetwork.json";
import SINGLE_TOKEN_CONVERTER_ABI from "../abi/SingleTokenConverter.json";
import XVS_VAULT_CONVERTER_ABI from "../abi/XVSVaultTreasury.json";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const XVS_VAULT_TREASURY = "0x4D0Af9D0E15Fb36674535CDE804a9bd0aD3dd4Ac";
const CONVERTER_NETWORK = "0xc2Eb000a98b4BB9c6Bff346Bd86C49135d13E2B6";

forking(34489340, () => {
  const provider = ethers.provider;
  testVip("VIP-converter1", vipConverter1(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [SINGLE_TOKEN_CONVERTER_ABI], ["OwnershipTransferred"], [8]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [84]);
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
