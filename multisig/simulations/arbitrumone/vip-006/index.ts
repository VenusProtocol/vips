import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip006, { NATIVE_TOKEN_GATEWAY_CORE_POOL } from "../../../proposals/arbitrumone/vip-006";
import GATEWAY_ABI from "./abi/NativeTokenGateway.json";

const VWETH = "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0";
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

forking(216261352, async () => {
  let nativeTokenGateway: Contract;

  before(async () => {
    nativeTokenGateway = await ethers.getContractAt(GATEWAY_ABI, NATIVE_TOKEN_GATEWAY_CORE_POOL);
    await pretendExecutingVip(await vip006());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      expect(await nativeTokenGateway.owner()).equals(NETWORK_ADDRESSES.arbitrumone.NORMAL_TIMELOCK);
    });

    it("Should have correct owner vWETH and wETH addresses", async () => {
      expect(await nativeTokenGateway.vWNativeToken()).to.be.equal(VWETH);
      expect(await nativeTokenGateway.wNativeToken()).to.be.equal(WETH);
    });
  });
});
