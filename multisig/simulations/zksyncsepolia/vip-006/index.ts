import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip006, { POOL_REGISTRY, PRIME, PRIME_LIQUIDITY_PROVIDER } from "../../../proposals/zksyncsepolia/vip-006";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

forking(3589376, async () => {
  describe("Post-VIP behavior", async () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;

    before(async () => {
      await pretendExecutingVip(await vip006());

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    });

    it("prime should have correct pool registry address", async () => {
      expect(await prime.poolRegistry()).to.be.equal(POOL_REGISTRY);
    });

    it("should have correct owner", async () => {
      expect(await prime.owner()).to.be.equal(zksyncsepolia.GUARDIAN);
      expect(await primeLiquidityProvider.owner()).to.be.equal(zksyncsepolia.GUARDIAN);
    });
  });
});
