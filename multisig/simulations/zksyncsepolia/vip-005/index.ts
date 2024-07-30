import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip005, { NATIVE_TOKEN_GATEWAY_CORE_POOL } from "../../../proposals/zksyncsepolia/vip-005";
import GATEWAY_ABI from "./abi/NativeTokenGateway.json";

const VWETH = "0x31eb7305f9fE281027028D0ba0d7f57ddA836d49";
const WETH = "0x53F7e72C7ac55b44c7cd73cC13D4EF4b121678e6";

forking(3548843, async () => {
  let nativeTokenGateway: Contract;

  before(async () => {
    nativeTokenGateway = await ethers.getContractAt(GATEWAY_ABI, NATIVE_TOKEN_GATEWAY_CORE_POOL);
    await pretendExecutingVip(await vip005());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      expect(await nativeTokenGateway.owner()).equals(NETWORK_ADDRESSES.zksyncsepolia.GUARDIAN);
    });

    it("Should have correct owner vWETH and wETH addresses", async () => {
      expect(await nativeTokenGateway.vWNativeToken()).to.be.equal(VWETH);
      expect(await nativeTokenGateway.wNativeToken()).to.be.equal(WETH);
    });
  });
});
