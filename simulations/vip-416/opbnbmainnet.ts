import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip021 from "../../multisig/proposals/opbnbmainnet/vip-024";
import { COMPTROLLERS, PSR, VTOKENS, NTGs } from "../../multisig/proposals/opbnbmainnet/vip-024";
import vip416 from "../../vips/vip-416/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import VTOKEN_ABI from "./abi/VToken.json";
import NTG_ABI from "./abi/NativeTokenGateway.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;

forking(43912806, async () => {
  const provider = ethers.provider;

  before(async () => {
    await pretendExecutingVip(await vip021());
  });

  testForkedNetworkVipCommands("vip416", await vip416());

  describe("Post-VIP behavior", async () => {
    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, PSR_ABI, provider);
      expect(await psr.owner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
    });

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

    for (const ntgAddress of NTGs) {
      it(`correct owner for ${ntgAddress}`, async () => {
        const ntg = new ethers.Contract(ntgAddress, NTG_ABI, provider);
        expect(await ntg.owner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
      });
    }
  });
});
