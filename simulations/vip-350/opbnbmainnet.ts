import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip010 from "../../multisig/proposals/opbnbmainnet/vip-020";
import vip350 from "../../vips/vip-350/bscmainnet";
import {
  COMPTROLLERS, VTOKENS
} from "../../multisig/proposals/opbnbmainnet/vip-020";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import VTOKEN_ABI from "./abi/VToken.json";
import { expect } from "chai";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;

forking(31449867, async () => {
  const provider = ethers.provider;
  before(async () => {
    await pretendExecutingVip(await vip010());
  });

  testForkedNetworkVipCommands("vip350", await vip350(), {
  });

  describe("Post-VIP behavior", async () => {
    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.owner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.owner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
      });
    }
  })
});