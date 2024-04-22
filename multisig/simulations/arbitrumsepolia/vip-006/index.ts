import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip006, { NATIVE_TOKEN_GATEWAY_CORE_POOL } from "../../../proposals/arbitrumsepolia/vip-006";
import GATEWAY_ABI from "./abi/NativeTokenGateway.json";

const VWETH = "0xef6DF2bE5d6Ad0291eDb1160fEf7a4ED2528fAfb";
const WETH = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73";

forking(36361635, () => {
  let nativeTokenGateway: Contract;

  before(async () => {
    nativeTokenGateway = await ethers.getContractAt(GATEWAY_ABI, NATIVE_TOKEN_GATEWAY_CORE_POOL);
    await pretendExecutingVip(vip006());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      expect(await nativeTokenGateway.owner()).equals(NETWORK_ADDRESSES.arbitrumsepolia.NORMAL_TIMELOCK);
    });

    it("Should have correct owner vWETH and wETH addresses", async () => {
      expect(await nativeTokenGateway.vWNativeToken()).to.be.equal(VWETH);
      expect(await nativeTokenGateway.wNativeToken()).to.be.equal(WETH);
    });
  });
});
