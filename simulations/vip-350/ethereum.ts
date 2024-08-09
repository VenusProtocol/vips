import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip053 from "../../multisig/proposals/ethereum/vip-053";
import { COMPTROLLERS, VTOKENS } from "../../multisig/proposals/ethereum/vip-053";
import vip350 from "../../vips/vip-350/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { ethereum } = NETWORK_ADDRESSES;

forking(20482317, async () => {
  const provider = ethers.provider;
  before(async () => {
    await pretendExecutingVip(await vip053());
  });

  testForkedNetworkVipCommands("vip350", await vip350(), {});

  describe("Post-VIP behavior", async () => {
    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
      });
    }
  });
});
