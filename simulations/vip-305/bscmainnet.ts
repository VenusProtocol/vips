import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { checkInterestRate } from "../../src/vip-framework/checks/interestRateModel";
import vip305, {
  NEW_VDAI_IR,
  NEW_VFDUSD_IR,
  NEW_VTUSD_IR,
  NEW_VUSDC_IR,
  NEW_VUSDT_DEFI_IR,
  NEW_VUSDT_GAMEFI_IR,
  NEW_VUSDT_IR,
  NEW_VUSDT_STABLE_COIN_IR,
  VDAI,
  VFDUSD,
  VTUSD,
  VUSDC,
  VUSDT,
  VUSDT_DEFI,
  VUSDT_GAMEFI,
  VUSDT_STABLE_COIN,
} from "../../vips/vip-305/bscmainnet";
import VTOKEN_CORE_POOL_ABI from "./abi/VTokenCorePool.json";
import VTOKEN_IL_ABI from "./abi/VTokenIL.json";

const OLD_VUSDT_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const OLD_VUSDC_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const OLD_VDAI_IR = "0x1485A27D95D3d2878a6641055dD3a643F296CCf6";
const OLD_VFDUSD_IR = "0x9Fca5d66Cc0DF990080825051E825A8104a7ffA4";
const OLD_VTUSD_IR = "0x1485A27D95D3d2878a6641055dD3a643F296CCf6";

const OLD_VUSDT_STABLE_COIN_IR = "0x5E0dB1e8a6D6181aa39B3317179CDF91FBa4Ac51";
const OLD_VUSDT_GAMEFI_IR = "0xE1E25b6f3A74fB836B2d3b5A01f5252e2fa916a8";
const OLD_VUSDT_DEFI_IR = "0xE1E25b6f3A74fB836B2d3b5A01f5252e2fa916a8";

async function checkIRModelAddress(market: Contract, expectedIR: string) {
  const IR = await market.interestRateModel();
  expect(IR).equals(expectedIR);
}

forking(38800400, () => {
  let vusdt: Contract;
  let vusdc: Contract;
  let vdai: Contract;
  let vfdusd: Contract;
  let vtusd: Contract;
  let vusdtStableCoin: Contract;
  let vusdtGameFi: Contract;
  let vusdtDefi: Contract;
  const provider = ethers.provider;

  before(async () => {
    vusdt = new ethers.Contract(VUSDT, VTOKEN_CORE_POOL_ABI, provider);
    vusdc = new ethers.Contract(VUSDC, VTOKEN_CORE_POOL_ABI, provider);
    vdai = new ethers.Contract(VDAI, VTOKEN_CORE_POOL_ABI, provider);
    vfdusd = new ethers.Contract(VFDUSD, VTOKEN_CORE_POOL_ABI, provider);
    vtusd = new ethers.Contract(VTUSD, VTOKEN_CORE_POOL_ABI, provider);
    vusdtStableCoin = new ethers.Contract(VUSDT_STABLE_COIN, VTOKEN_IL_ABI, provider);
    vusdtGameFi = new ethers.Contract(VUSDT_GAMEFI, VTOKEN_IL_ABI, provider);
    vusdtDefi = new ethers.Contract(VUSDT_DEFI, VTOKEN_IL_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("Validate OLD IRM address", async () => {
      await checkIRModelAddress(vusdt, OLD_VUSDT_IR);
      await checkIRModelAddress(vusdc, OLD_VUSDC_IR);
      await checkIRModelAddress(vdai, OLD_VDAI_IR);
      await checkIRModelAddress(vfdusd, OLD_VFDUSD_IR);
      await checkIRModelAddress(vtusd, OLD_VTUSD_IR);
      await checkIRModelAddress(vusdtStableCoin, OLD_VUSDT_STABLE_COIN_IR);
      await checkIRModelAddress(vusdtGameFi, OLD_VUSDT_GAMEFI_IR);
      await checkIRModelAddress(vusdtDefi, OLD_VUSDT_DEFI_IR);
    });

    it("OLD IRM parameters checks", async () => {
      checkInterestRate(OLD_VUSDT_IR, "VUSDT_CORE", {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      });

      checkInterestRate(OLD_VUSDC_IR, "VUSDC_CORE", {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      });

      checkInterestRate(OLD_VDAI_IR, "VDAI_CORE", {
        base: "0",
        multiplier: "0.125",
        jump: "2.5",
        kink: "0.8",
      });

      checkInterestRate(OLD_VFDUSD_IR, "VFDUSD_CORE", {
        base: "0",
        multiplier: "0.125",
        jump: "5.0",
        kink: "0.8",
      });

      checkInterestRate(OLD_VTUSD_IR, "VTUSD_CORE", {
        base: "0",
        multiplier: "0.125",
        jump: "2.5",
        kink: "0.8",
      });

      checkInterestRate(OLD_VUSDT_STABLE_COIN_IR, "VTUSD_STABLE_COIN", {
        base: "0",
        multiplier: "0.125",
        jump: "2.5",
        kink: "0.8",
      });

      checkInterestRate(OLD_VUSDT_GAMEFI_IR, "VUSDT_GAMEFI", {
        base: "0.02",
        multiplier: "0.175",
        jump: "2.5",
        kink: "0.8",
      });

      checkInterestRate(OLD_VUSDT_DEFI_IR, "VUSDT_DEFI", {
        base: "0.02",
        multiplier: "0.175",
        jump: "2.5",
        kink: "0.8",
      });
    });
  });

  testVip("VIP-305 Chaos lab recommendation", vip305(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_IL_ABI], ["NewMarketInterestRateModel"], [3]);
      await expectEvents(txResponse, [VTOKEN_CORE_POOL_ABI], ["NewMarketInterestRateModel"], [5]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Validate new IRM address", async () => {
      await checkIRModelAddress(vusdt, NEW_VUSDT_IR);
      await checkIRModelAddress(vusdc, NEW_VUSDC_IR);
      await checkIRModelAddress(vdai, NEW_VDAI_IR);
      await checkIRModelAddress(vfdusd, NEW_VFDUSD_IR);
      await checkIRModelAddress(vtusd, NEW_VTUSD_IR);
      await checkIRModelAddress(vusdtStableCoin, NEW_VUSDT_STABLE_COIN_IR);
      await checkIRModelAddress(vusdtGameFi, NEW_VUSDT_GAMEFI_IR);
      await checkIRModelAddress(vusdtDefi, NEW_VUSDT_DEFI_IR);
    });

    it("IRM parameters checks", async () => {
      checkInterestRate(NEW_VUSDT_IR, "VUSDT_CORE", {
        base: "0",
        multiplier: "0.0875",
        jump: "2.5",
        kink: "0.8",
      });

      checkInterestRate(NEW_VUSDC_IR, "VUSDC_CORE", {
        base: "0",
        multiplier: "0.0875",
        jump: "2.5",
        kink: "0.8",
      });

      checkInterestRate(NEW_VDAI_IR, "VDAI_CORE", {
        base: "0",
        multiplier: "0.0875",
        jump: "2.5",
        kink: "0.8",
      });

      checkInterestRate(NEW_VFDUSD_IR, "vFDUSD_core", {
        base: "0",
        multiplier: "0.0875",
        jump: "5.0",
        kink: "0.8",
      });

      checkInterestRate(NEW_VTUSD_IR, "VTUSD_CORE", {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      });

      checkInterestRate(NEW_VUSDT_STABLE_COIN_IR, "vTUSD_StableCoin", {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      });

      checkInterestRate(NEW_VUSDT_GAMEFI_IR, "vUSDT_GameFi", {
        base: "0.02",
        multiplier: "0.15",
        jump: "2.5",
        kink: "0.8",
      });

      checkInterestRate(NEW_VUSDT_DEFI_IR, "vUSDT_DeFi", {
        base: "0.02",
        multiplier: "0.15",
        jump: "2.5",
        kink: "0.8",
      });
    });
  });
});
