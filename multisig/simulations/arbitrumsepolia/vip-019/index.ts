/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip019, { XVS_VAULT_TREASURY } from "../../../proposals/arbitrumsepolia/vip-019";
import {
  CONVERTER_NETWORK,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
  converters,
} from "../../../proposals/arbitrumsepolia/vip-019/Addresses";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;
const XVS = "0x877Dc896e7b13096D3827872e396927BbE704407";
const XVS_VAULT = "0x407507DC2809D3aa31D54EcA3BEde5C5c4C8A17F";

forking(94312350, async () => {
  const provider = ethers.provider;
  let converterNetwork: Contract;
  let xvsVaultTreasury: Contract;

  before(async () => {
    converterNetwork = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
    xvsVaultTreasury = new ethers.Contract(XVS_VAULT_TREASURY, XVS_VAULT_TREASURY_ABI, provider);

    await pretendExecutingVip(await vip019());
  });

  describe("Owner checks", () => {
    it("Timelock should be the owner of all converters", async () => {
      for (const converter of converters) {
        const Converter = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
        expect(await Converter.owner()).to.equal(arbitrumsepolia.GUARDIAN);
      }
    });

    it("Timelock should be the owner of ConverterNetwork", async () => {
      expect(await converterNetwork.owner()).to.equal(arbitrumsepolia.GUARDIAN);
    });

    it("Timelock should be the owner of XVSVaultTreasury", async () => {
      expect(await xvsVaultTreasury.owner()).to.equal(arbitrumsepolia.GUARDIAN);
    });
  });

  describe("Generic checks", () => {
    it("XVSVaultTreasury should have correct state variables", async () => {
      expect(await xvsVaultTreasury.XVS_ADDRESS()).to.equal(XVS);
      expect(await xvsVaultTreasury.xvsVault()).to.equal(XVS_VAULT);
    });

    it("Converters should belong to the same ConverterNetwork", async () => {
      for (const converter of converters) {
        const Converter = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
        expect(await Converter.converterNetwork()).to.equal(CONVERTER_NETWORK);
      }
    });
  });
});
