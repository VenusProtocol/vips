import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip014, { NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL } from "../../../proposals/arbitrumone/vip-014";
import GATEWAY_ABI from "./abi/NativeTokenGateway.json";

const VWETH = "0x39D6d13Ea59548637104E40e729E4aABE27FE106";
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

forking(250357800, async () => {
  let nativeTokenGateway: Contract;

  before(async () => {
    nativeTokenGateway = await ethers.getContractAt(GATEWAY_ABI, NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL);
    await pretendExecutingVip(await vip014());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      expect(await nativeTokenGateway.owner()).equals(NETWORK_ADDRESSES.arbitrumone.GUARDIAN);
    });

    it("Should have correct owner vWETH and wETH addresses", async () => {
      expect(await nativeTokenGateway.vWNativeToken()).to.be.equal(VWETH);
      expect(await nativeTokenGateway.wNativeToken()).to.be.equal(WETH);
    });
  });
});
