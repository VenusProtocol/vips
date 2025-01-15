import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip060 from "../../multisig/proposals/sepolia/vip-071";
import { COMPTROLLERS, VTOKENS } from "../../multisig/proposals/sepolia/vip-071";
import vip417 from "../../vips/vip-417/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(7393932, async () => {
  const provider = ethers.provider;

  before(async () => {
    await pretendExecutingVip(await vip060());
  });

  testForkedNetworkVipCommands("vip350", await vip417());

  describe("Post-VIP behavior", async () => {
    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }
  });
});
