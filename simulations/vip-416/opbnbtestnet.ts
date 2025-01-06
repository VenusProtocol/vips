import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip021, { PSR } from "../../multisig/proposals/opbnbtestnet/vip-024";
import vip416 from "../../vips/vip-416/bsctestnet";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;

forking(48788035, async () => {
  const provider = ethers.provider;

  before(async () => {
    await pretendExecutingVip(await vip021());
  });

  testForkedNetworkVipCommands("vip416", await vip416());

  describe("Post-VIP behavior", async () => {
    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, PSR_ABI, provider);
      expect(await psr.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
    });
  });
});
