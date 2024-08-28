import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip005, { NATIVE_TOKEN_GATEWAY_CORE_POOL } from "../../../proposals/zksyncmainnet/vip-005";
import GATEWAY_ABI from "./abi/NativeTokenGateway.json";

const VWETH = "0xa85323aE38be6f2f2EDF5206d5Cbcad1f230F552";
const WETH = "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91";

forking(42816106, async () => {
  let nativeTokenGateway: Contract;

  before(async () => {
    nativeTokenGateway = await ethers.getContractAt(GATEWAY_ABI, NATIVE_TOKEN_GATEWAY_CORE_POOL);
    await pretendExecutingVip(await vip005());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      expect(await nativeTokenGateway.owner()).equals(NETWORK_ADDRESSES.zksyncmainnet.GUARDIAN);
    });

    it("Should have correct owner vWETH and wETH addresses", async () => {
      expect(await nativeTokenGateway.vWNativeToken()).to.be.equal(VWETH);
      expect(await nativeTokenGateway.wNativeToken()).to.be.equal(WETH);
    });
  });
});
