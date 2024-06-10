/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip, testVip } from "../../../../src/vip-framework";
import { converters, GUARDIAN, CONVERTER_NETWORK } from "../../../proposals/sepolia/vip-converter/Addresses";
import vipConverter, {XVS_VAULT_TREASURY} from "../../../proposals/sepolia/vip-converter/vipConverter";

import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import XVS_VAULT_CONVERTER_ABI from "./abi/XVSVaultTreasury.json";

forking(6078088, () => {
  const provider = ethers.provider;

  describe("Post-VIP behavior", () => {
    let converterNetwork: Contract;
    let xvsVaultTreasury: Contract;
    before(async () => {
      await pretendExecutingVip(vipConverter());

      converterNetwork = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
      xvsVaultTreasury = new ethers.Contract(XVS_VAULT_TREASURY, XVS_VAULT_CONVERTER_ABI, provider);
    });

    it("Timelock should be the owner of all converters", async () => {
      for (const converter of converters) {
        const Converter = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
        expect(await Converter.owner()).to.equal(GUARDIAN);
      }
    });

    it("Timelock should be the owner of ConverterNetwork", async () => {
      expect(await converterNetwork.owner()).to.equal(GUARDIAN);
    });

    it("Timelock should be the owner of XVSVaultTreasury", async () => {
      expect(await xvsVaultTreasury.owner()).to.equal(GUARDIAN);
    });
  });
});
