import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip014, { NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL } from "../../../proposals/arbitrumsepolia/vip-014";
import GATEWAY_ABI from "./abi/NativeTokenGateway.json";

const VWETH = "0xd7057250b439c0849377bB6C3263eb8f9cf49d98";
const WETH = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73";

forking(77510100, async () => {
  let nativeTokenGateway: Contract;

  before(async () => {
    nativeTokenGateway = await ethers.getContractAt(GATEWAY_ABI, NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL);
    await pretendExecutingVip(await vip014());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      expect(await nativeTokenGateway.owner()).equals(NETWORK_ADDRESSES.arbitrumsepolia.GUARDIAN);
    });

    it("Should have correct owner vWETH and wETH addresses", async () => {
      expect(await nativeTokenGateway.vWNativeToken()).to.be.equal(VWETH);
      expect(await nativeTokenGateway.wNativeToken()).to.be.equal(WETH);
    });
  });
});
