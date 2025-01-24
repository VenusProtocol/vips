import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip061 from "../../multisig/proposals/ethereum/vip-073";
import { COMPTROLLERS, REWARD_DISTRIBUTORS, VTOKENS } from "../../multisig/proposals/ethereum/vip-073";
import vip417 from "../../vips/vip-417/bscmainnet";
import OWNERSHIP_ABI from "../vip-416/abi/Ownership.json";

const { ethereum } = NETWORK_ADDRESSES;

forking(21686396, async () => {
  const provider = ethers.provider;

  before(async () => {
    await pretendExecutingVip(await vip061());
  });

  testForkedNetworkVipCommands("Accept ownerships/admins", await vip417());

  describe("Post-VIP behavior", async () => {
    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`correct owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
      });
    }

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, OWNERSHIP_ABI, provider);
        expect(await v.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
      });
    }
  });
});
