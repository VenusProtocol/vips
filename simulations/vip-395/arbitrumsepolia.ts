import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip015 from "../../multisig/proposals/arbitrumsepolia/vip-015";
import vip395, {
  ARBITRUM_SEPOLIA_COMPTROLLER_CORE,
  ARBITRUM_SEPOLIA_COMPTROLLER_LST,
  ARBITRUM_SEPOLIA_PLP,
  ARBITRUM_SEPOLIA_PRIME,
  ARBITRUM_SEPOLIA_USDC,
  ARBITRUM_SEPOLIA_USDT,
  ARBITRUM_SEPOLIA_VUSDC_CORE,
  ARBITRUM_SEPOLIA_VUSDT_CORE,
  ARBITRUM_SEPOLIA_VWBTC_CORE,
  ARBITRUM_SEPOLIA_VWETH_LST,
  ARBITRUM_SEPOLIA_WBTC,
  ARBITRUM_SEPOLIA_WETH,
} from "../../vips/vip-395/bsctestnet";
import COMPTROLLER_ABI from "./abi/ILComptroller.json";
import PRIME_ABI from "./abi/Prime.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

forking(95399250, async () => {
  const provider = ethers.provider;
  let prime: Contract;

  before(async () => {
    await pretendExecutingVip(await vip015());
    await mine(100);
  });

  describe("Pre-VIP behaviour", () => {
    before(async () => {
      prime = new ethers.Contract(ARBITRUM_SEPOLIA_PRIME, PRIME_ABI, provider);
    });

    it("Prime should have not contain number of revocable and irrevocable tokens", async () => {
      expect(await prime.irrevocableLimit()).to.equal(0);
      expect(await prime.revocableLimit()).to.equal(0);
    });
  });

  testForkedNetworkVipCommands("VIP 395", await vip395(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PRIME_ABI], ["MarketAdded"], [4]);
      await expectEvents(txResponse, [PRIME_ABI], ["MintLimitsUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    let prime: Contract;
    let plp: Contract;

    before(async () => {
      prime = new ethers.Contract(ARBITRUM_SEPOLIA_PRIME, PRIME_ABI, provider);
      plp = new ethers.Contract(ARBITRUM_SEPOLIA_PLP, PLP_ABI, provider);
    });

    it("prime should have correct pool registry address", async () => {
      expect(await prime.poolRegistry()).to.be.equal(arbitrumsepolia.POOL_REGISTRY);
    });

    it("Comptroller lst and core should have correct Prime token address", async () => {
      const comptrollerCore = new ethers.Contract(ARBITRUM_SEPOLIA_COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
      expect(await comptrollerCore.prime()).to.be.equal(ARBITRUM_SEPOLIA_PRIME);

      const comptrollerLst = new ethers.Contract(ARBITRUM_SEPOLIA_COMPTROLLER_LST, COMPTROLLER_ABI, provider);
      expect(await comptrollerLst.prime()).to.be.equal(ARBITRUM_SEPOLIA_PRIME);
    });

    it("Prime should contain correct markets", async () => {
      expect((await prime.markets(ARBITRUM_SEPOLIA_VUSDC_CORE))[4]).to.be.equal(true);
      expect((await prime.markets(ARBITRUM_SEPOLIA_VUSDT_CORE))[4]).to.be.equal(true);
      expect((await prime.markets(ARBITRUM_SEPOLIA_VWBTC_CORE))[4]).to.be.equal(true);
      expect((await prime.markets(ARBITRUM_SEPOLIA_VWETH_LST))[4]).to.be.equal(true);
    });

    it("Prime should have correct number of revocable and irrevocable tokens", async () => {
      expect(await prime.irrevocableLimit()).to.equal(0);
      expect(await prime.revocableLimit()).to.equal(500);
    });

    it("Plp should have correct tokens", async () => {
      expect(await plp.lastAccruedBlockOrSecond(ARBITRUM_SEPOLIA_USDT)).to.be.gt(0);
      expect(await plp.lastAccruedBlockOrSecond(ARBITRUM_SEPOLIA_USDC)).to.be.gt(0);
      expect(await plp.lastAccruedBlockOrSecond(ARBITRUM_SEPOLIA_WETH)).to.be.gt(0);
      expect(await plp.lastAccruedBlockOrSecond(ARBITRUM_SEPOLIA_WBTC)).to.be.gt(0);
    });
  });
});
