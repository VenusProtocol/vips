import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip018, {
  COMPTROLLER_CORE,
  COMPTROLLER_LST,
  PLP,
  PRIME,
  USDC,
  USDT,
  WBTC,
  WETH,
} from "../../../proposals/arbitrumsepolia/vip-018";
import COMPTROLLER_ABI from "./abi/ILComptroller.json";
import PRIME_ABI from "./abi/Prime.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

forking(95153347, async () => {
  const provider = ethers.provider;
  let prime: Contract;
  let plp: Contract;

  describe("Pre-VIP behaviour", () => {
    before(async () => {
      prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
      plp = new ethers.Contract(PLP, PLP_ABI, provider);
    });

    it("Plp should not contain tokens", async () => {
      plp = new ethers.Contract(PLP, PLP_ABI, provider);

      expect(await plp.lastAccruedBlockOrSecond(USDT)).to.be.equal(0);
      expect(await plp.lastAccruedBlockOrSecond(USDC)).to.be.equal(0);
      expect(await plp.lastAccruedBlockOrSecond(WETH)).to.be.equal(0);
      expect(await plp.lastAccruedBlockOrSecond(WBTC)).to.be.equal(0);
    });

    it("Prime should have not contain number of revocable and irrevocable tokens", async () => {
      expect(await prime.irrevocableLimit()).to.equal(0);
      expect(await prime.revocableLimit()).to.equal(0);
    });
  });

  describe("Post-VIP behavior", () => {
    let prime: Contract;
    let plp: Contract;

    before(async () => {
      await pretendExecutingVip(await vip018());

      prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
      plp = new ethers.Contract(PLP, PLP_ABI, provider);
    });

    it("prime should have correct pool registry address", async () => {
      expect(await prime.poolRegistry()).to.be.equal(arbitrumsepolia.POOL_REGISTRY);
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
});
