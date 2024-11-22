/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip018 from "../../../proposals/arbitrumone/vip-018";
import {
  CONVERTER_NETWORK,
  PLP,
  USDC,
  USDT,
  WBTC,
  WETH,
  XVS,
  XVS_VAULT_TREASURY,
  converters,
} from "../../../proposals/arbitrumone/vip-018/addresses";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import COMPTROLLER_ABI from "./abi/ILComptroller.json";
import PRIME_ABI from "./abi/Prime.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";

const { arbitrumone } = NETWORK_ADDRESSES;

const XVS_VAULT = "0x8b79692AAB2822Be30a6382Eb04763A74752d5B4";
const COMPTROLLER_CORE = "0x317c1A5739F39046E20b08ac9BeEa3f10fD43326";
const COMPTROLLER_LST = "0x52bAB1aF7Ff770551BD05b9FC2329a0Bf5E23F16";
const PRIME = "0xFE69720424C954A2da05648a0FAC84f9bf11Ef49";

forking(276102872, async () => {
  const provider = ethers.provider;
  let converterNetwork: Contract;
  let xvsVaultTreasury: Contract;
  let prime: Contract;
  let plp: Contract;

  describe("Post-VIP behavior", () => {
    before(async () => {
      converterNetwork = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
      xvsVaultTreasury = new ethers.Contract(XVS_VAULT_TREASURY, XVS_VAULT_TREASURY_ABI, provider);
      prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
      plp = new ethers.Contract(PLP, PLP_ABI, provider);

      await pretendExecutingVip(await vip018());
    });

    describe("Prime configuration", () => {
      it("prime should have correct pool registry address", async () => {
        expect(await prime.poolRegistry()).to.be.equal(arbitrumone.POOL_REGISTRY);
      });

      it("Comptroller lst and core should have correct Prime token address", async () => {
        const comptrollerCore = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
        expect(await comptrollerCore.prime()).to.be.equal(PRIME);

        const comptrollerLst = new ethers.Contract(COMPTROLLER_LST, COMPTROLLER_ABI, provider);
        expect(await comptrollerLst.prime()).to.be.equal(PRIME);
      });

      it("Plp should have correct tokens", async () => {
        expect(await plp.lastAccruedBlockOrSecond(USDT)).to.be.gt(0);
        expect(await plp.lastAccruedBlockOrSecond(USDC)).to.be.gt(0);
        expect(await plp.lastAccruedBlockOrSecond(WETH)).to.be.gt(0);
        expect(await plp.lastAccruedBlockOrSecond(WBTC)).to.be.gt(0);
      });
    });

    describe("Converters configuration", () => {
      describe("Owner checks", () => {
        it("GUARDIAN should be the owner of all converters", async () => {
          for (const converter of converters) {
            const Converter = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
            expect(await Converter.owner()).to.equal(arbitrumone.GUARDIAN);
          }
        });

        it("GUARDIAN should be the owner of ConverterNetwork", async () => {
          expect(await converterNetwork.owner()).to.equal(arbitrumone.GUARDIAN);
        });

        it("GUARDIAN should be the owner of XVSVaultTreasury", async () => {
          expect(await xvsVaultTreasury.owner()).to.equal(arbitrumone.GUARDIAN);
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
  });
});
