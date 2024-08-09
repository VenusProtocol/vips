import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip013 from "../../multisig/proposals/arbitrumsepolia/vip-013";
import { COMPTROLLERS, VTOKENS } from "../../multisig/proposals/arbitrumsepolia/vip-013";
import vip350 from "../../vips/vip-350/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

forking(70004884, async () => {
  const provider = ethers.provider;
  before(async () => {
    await pretendExecutingVip(await vip013());
  });

  testForkedNetworkVipCommands("vip350", await vip350(), {});

  describe("Post-VIP behavior", async () => {
    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }
  });
});
