import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { checkInterestRate } from "../../src/vip-framework/checks/interestRateModel";
import { vip288 } from "../../vips/vip-288/bscmainnet";
import VTOKEN_IL_ABI from "./abi/VtokenIL.json";
import VTOKEN_CORE_POOL_ABI from "./abi/vTokenCorePool.json";

const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const VFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const VUSDT_StableCoin = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
const VUSDT_GameFi = "0x4978591f17670A846137d9d613e333C38dc68A37";
const VUSDT_DeFi = "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854";

const old_VUSDT_IR = "0x8c2651590ECE4FFe8E722ef6F80cc7407f537bBa";
const old_VUSDC_IR = "0x8c2651590ECE4FFe8E722ef6F80cc7407f537bBa";
const old_VDAI_IR = "0x8c2651590ECE4FFe8E722ef6F80cc7407f537bBa";
const old_VFDUSD_IR = "0xB105F9B511836cc7dF9F3dD0Ec4873766b5b6660";
const old_VTUSD_IR = "0x8c2651590ECE4FFe8E722ef6F80cc7407f537bBa";
const old_VUSDT_StableCoin_IR = "0x7dc969122450749A8B0777c0e324522d67737988";
const old_VUSDT_GameFi_IR = "0x009cdFB248e021f58A34B50dc2A7601EA72d14Ac";
const old_VUSDT_DeFi_IR = "0x009cdFB248e021f58A34B50dc2A7601EA72d14Ac";

const VUSDT_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const VUSDC_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const VDAI_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const VFDUSD_IR = "0x958F4C84d3ad523Fa9936Dc465A123C7AD43D69B";
const VTUSD_IR = "0x9e8fbACBfbD811Fc561af3Af7df8e38dEd4c52F3";
const VUSDT_StableCoin_IR = "0x2ba0F45f7368d2A56d0c9e5a29af363987BE1d02";
const VUSDT_GameFi_IR = "0x5ECa0FBBc5e7bf49dbFb1953a92784F8e4248eF6";
const VUSDT_DeFi_IR = "0x5ECa0FBBc5e7bf49dbFb1953a92784F8e4248eF6";

async function checkIRModelAddress(market: Contract, expectedIR: string) {
  const IR = await market.interestRateModel();
  expect(IR).equals(expectedIR);
}
forking(37700898, async () => {
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
    vusdtStableCoin = new ethers.Contract(VUSDT_StableCoin, VTOKEN_IL_ABI, provider);
    vusdtGameFi = new ethers.Contract(VUSDT_GameFi, VTOKEN_IL_ABI, provider);
    vusdtDefi = new ethers.Contract(VUSDT_DeFi, VTOKEN_IL_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("Validate old IRM address", async () => {
      await checkIRModelAddress(vusdt, old_VUSDT_IR);
      await checkIRModelAddress(vusdc, old_VUSDC_IR);
      await checkIRModelAddress(vdai, old_VDAI_IR);
      await checkIRModelAddress(vfdusd, old_VFDUSD_IR);
      await checkIRModelAddress(vtusd, old_VTUSD_IR);
      await checkIRModelAddress(vusdtStableCoin, old_VUSDT_StableCoin_IR);
      await checkIRModelAddress(vusdtGameFi, old_VUSDT_GameFi_IR);
      await checkIRModelAddress(vusdtDefi, old_VUSDT_DeFi_IR);
    });

    it("Old IRM parameters checks", async () => {
      checkInterestRate(old_VUSDT_IR, "vUSDT_core", {
        base: "0",
        multiplier: "0.06875",
        jump: "2.5",
        kink: "0.8",
      });
      checkInterestRate(old_VUSDC_IR, "vUSDC_core", {
        base: "0",
        multiplier: "0.06875",
        jump: "2.5",
        kink: "0.8",
      });
      checkInterestRate(old_VDAI_IR, "vDAI_core", {
        base: "0",
        multiplier: "0.06875",
        jump: "2.5",
        kink: "0.8",
      });
      checkInterestRate(old_VTUSD_IR, "vTUSD_core", {
        base: "0",
        multiplier: "0.06875",
        jump: "2.5",
        kink: "0.8",
      });
      checkInterestRate(old_VFDUSD_IR, "vFDUSD_core", {
        base: "0",
        multiplier: "0.06875",
        jump: "2.5",
        kink: "0.8",
      });
      checkInterestRate(old_VUSDT_StableCoin_IR, "vTUSD_StableCoin", {
        base: "0",
        multiplier: "0.06875",
        jump: "2.5",
        kink: "0.8",
      });
      checkInterestRate(old_VUSDT_GameFi_IR, "vUSDT_GameFi", {
        base: "0.02",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      });
      checkInterestRate(old_VUSDT_DeFi_IR, "vUSDT_DeFi", {
        base: "0.02",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      });
    });
  });

  testVip("VIP-288 Chaos lab recommendation", await vip288(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_IL_ABI], ["NewMarketInterestRateModel"], [3]);
      await expectEvents(txResponse, [VTOKEN_CORE_POOL_ABI], ["NewMarketInterestRateModel"], [5]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Validate new IRM address", async () => {
      await checkIRModelAddress(vusdt, VUSDT_IR);
      await checkIRModelAddress(vusdc, VUSDC_IR);
      await checkIRModelAddress(vdai, VDAI_IR);
      await checkIRModelAddress(vfdusd, VFDUSD_IR);
      await checkIRModelAddress(vtusd, VTUSD_IR);
      await checkIRModelAddress(vusdtStableCoin, VUSDT_StableCoin_IR);
      await checkIRModelAddress(vusdtGameFi, VUSDT_GameFi_IR);
      await checkIRModelAddress(vusdtDefi, VUSDT_DeFi_IR);
    });

    it("IRM parameters checks", async () => {
      checkInterestRate(VUSDT_IR, "vUSDT_core", {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      });
      checkInterestRate(VUSDC_IR, "vUSDC_core", {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      });
      checkInterestRate(VDAI_IR, "vDAI_core", {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      });
      checkInterestRate(VTUSD_IR, "vTUSD_core", {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      });
      checkInterestRate(VFDUSD_IR, "vFDUSD_core", {
        base: "0",
        multiplier: "0.1",
        jump: "5",
        kink: "0.8",
      });
      checkInterestRate(VUSDT_StableCoin_IR, "vTUSD_StableCoin", {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      });
      checkInterestRate(VUSDT_GameFi_IR, "vUSDT_GameFi", {
        base: "0.02",
        multiplier: "0.15",
        jump: "2.5",
        kink: "0.8",
      });
      checkInterestRate(VUSDT_DeFi_IR, "vUSDT_DeFi", {
        base: "0.02",
        multiplier: "0.15",
        jump: "2.5",
        kink: "0.8",
      });
    });
  });
});
