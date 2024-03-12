import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NORMAL_TIMELOCK, forking, pretendExecutingVip } from "../../../../src/vip-framework";
import {
  NATIVE_TOKEN_GATEWAY_VWETH_CORE,
  NATIVE_TOKEN_GATEWAY_VWETH_LST,
  vipGateway,
} from "../../../proposals/vip-Gateway/vip-gateway-sepolia3";
import NATIVE_TOKEN_GATEWAY_ABI from "../abi/NativeTokenGateway.json";

forking(5470354, () => {
  const provider = ethers.provider;
  let nativeTokenGatewayCore: Contract;
  let nativeTokenGatewayLst: Contract;

  before(async () => {
    nativeTokenGatewayCore = new ethers.Contract(NATIVE_TOKEN_GATEWAY_VWETH_CORE, NATIVE_TOKEN_GATEWAY_ABI, provider);
    nativeTokenGatewayLst = new ethers.Contract(NATIVE_TOKEN_GATEWAY_VWETH_LST, NATIVE_TOKEN_GATEWAY_ABI, provider);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vipGateway());
    });

    it("timelock should be the owner of NativeTokenGateway contract for core pool market", async () => {
      expect(await nativeTokenGatewayCore.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("timelock should be the owner of NativeTokenGateway contract for lst pool market", async () => {
      expect(await nativeTokenGatewayLst.owner()).to.equal(NORMAL_TIMELOCK);
    });
  });
});
