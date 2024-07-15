import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip011, { POOL_REGISTRY, PSR } from "../../../proposals/arbitrumsepolia/vip-011";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

const OLD_POOL_REGISTRY = "0x6866b2BDaaEf6648ddd5b678B3e9f3352bF3d2A5";

forking(57920209, async () => {
  let protocolShareReserve: Contract;

  before(async () => {
    protocolShareReserve = await ethers.getContractAt(PSR_ABI, PSR);
  });

  describe("Pre tx checks", () => {
    it("PSR should contain old PoolRegistry address", async () => {
      const poolRegistry = await protocolShareReserve.poolRegistry();
      expect(poolRegistry).equals(OLD_POOL_REGISTRY);
    });
  });

  describe("Post tx checks", () => {
    before(async () => {
      await pretendExecutingVip(await vip011());
    });

    it("PSR should contain correct PoolRegistry address", async () => {
      const poolRegistry = await protocolShareReserve.poolRegistry();
      expect(poolRegistry).equals(POOL_REGISTRY);
    });
  });
});
