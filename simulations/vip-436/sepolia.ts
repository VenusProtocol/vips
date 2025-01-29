import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip073 from "../../multisig/proposals/sepolia/vip-073";
import { COMPTROLLERS, VTOKENS } from "../../multisig/proposals/sepolia/vip-073";
import vip436 from "../../vips/vip-436/bsctestnet";
import OWNERSHIP_ABI from "../vip-433/abi/Ownership.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(7596074, async () => {
  const provider = ethers.provider;

  before(async () => {
    await pretendExecutingVip(await vip073());
  });

  testForkedNetworkVipCommands("Accept ownerships/admins", await vip436());

  describe("Post-VIP behavior", async () => {
    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, OWNERSHIP_ABI, provider);
        expect(await v.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }
  });
});
