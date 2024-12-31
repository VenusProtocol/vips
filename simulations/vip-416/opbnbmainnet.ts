import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip021 from "../../multisig/proposals/opbnbmainnet/vip-024";
import { COMPTROLLERS, PSR, VTOKENS, XVS_STORE } from "../../multisig/proposals/opbnbmainnet/vip-024";
import vip416 from "../../vips/vip-416/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import VTOKEN_ABI from "./abi/VToken.json";
import XVS_STORE_ABI from "./abi/XVSStore.json";
import XVS_VAULT_PROXY_ABI from "./abi/XVSVaultProxy.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;

forking(31449867, async () => {
  const provider = ethers.provider;
  const xvsVaultProxy = new ethers.Contract(opbnbmainnet.XVS_VAULT_PROXY, XVS_VAULT_PROXY_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, XVS_STORE_ABI, provider);

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

    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
    });
  });
});
