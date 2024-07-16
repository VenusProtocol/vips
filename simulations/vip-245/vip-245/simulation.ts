/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { converters } from "../../../vips/vip-245/vip-245/Addresses";
import { vip245 } from "../../../vips/vip-245/vip-245/vip-245";
import ACCESS_CONTROL_MANAGER_ABI from "../abi/AccessControlManagerMainnet.json";
import CONVERTER_NETWORK_ABI from "../abi/ConverterNetwork.json";
import SINGLE_TOKEN_CONVERTER_ABI from "../abi/SingleTokenConverter.json";
import XVS_VAULT_CONVERTER_ABI from "../abi/XVSVaultTreasury.json";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
const CONVERTER_NETWORK = "0xF7Caad5CeB0209165f2dFE71c92aDe14d0F15995";

forking(35140949, async () => {
  const provider = ethers.provider;
  testVip("VIP-245", await vip245(), {
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
