import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip004, { NATIVE_TOKEN_GATEWAY_CORE_POOL } from "../../../proposals/unichainsepolia/vip-004";
import GATEWAY_ABI from "./abi/NativeTokenGateway.json";

const VWETH = "0x3dEAcBe87e4B6333140a46aBFD12215f4130B132";
const WETH = "0x4200000000000000000000000000000000000006";

forking(4724011, async () => {
  let nativeTokenGateway: Contract;

  before(async () => {
    nativeTokenGateway = await ethers.getContractAt(GATEWAY_ABI, NATIVE_TOKEN_GATEWAY_CORE_POOL);
    await pretendExecutingVip(await vip004());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      expect(await nativeTokenGateway.owner()).equals(NETWORK_ADDRESSES.unichainsepolia.GUARDIAN);
    });

    it("Should have correct vWETH and wETH addresses", async () => {
      expect(await nativeTokenGateway.vWNativeToken()).to.be.equal(VWETH);
      expect(await nativeTokenGateway.wNativeToken()).to.be.equal(WETH);
    });
  });
});
