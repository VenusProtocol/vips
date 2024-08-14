import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip053, { CONVERTERS, CONVERTER_NETWORK, SINGLE_TOKEN_CONVERTER_BEACON } from "../../../proposals/sepolia/vip-052";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import SINGLE_TOKEN_CONVERTER_BEACON_ABI from "./abi/SingleTokenConverterBeacon.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(6466682, async () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    for (const converter of CONVERTERS) {
      it(`should have no pending owner for ${converter}`, async () => {
        const c = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
        expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

    it(`should have no pending owner for converter network`, async () => {
      const c = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
      expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it(`should have guardian as owner for converer beacon`, async () => {
      const c = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON, SINGLE_TOKEN_CONVERTER_BEACON_ABI, provider);
      expect(await c.owner()).to.equal(sepolia.GUARDIAN);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip053());
    });

    for (const converter of CONVERTERS) {
      it(`should have no pending owner for ${converter}`, async () => {
        const c = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
        expect(await c.pendingOwner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }

    it(`should have no pending owner for converter network`, async () => {
      const c = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
      expect(await c.pendingOwner()).to.equal(sepolia.NORMAL_TIMELOCK);
    });

    it(`should have NT as owner for converer beacon`, async () => {
      const c = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON, SINGLE_TOKEN_CONVERTER_BEACON_ABI, provider);
      expect(await c.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
    });
  });
});