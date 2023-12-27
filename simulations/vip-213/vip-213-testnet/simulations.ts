import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { COMPTROLLER, XVS, XVS_AMOUNT, XVS_BRIDGE_SRC, vip213Testnet } from "../../../vips/vip-213/vip-213-testnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTSrc.json";

const XVS_HOLDER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

forking(36313819, () => {
  let xvsBridge: ethers.Contract;
  let xvs: ethers.Contract;
  let oldCirculatingSupply: BigNumber;
  let oldXVSBal: BigNumber;
  let xvsHolder: SignerWithAddress;

  before(async () => {
    xvsBridge = new ethers.Contract(XVS_BRIDGE_SRC, XVS_BRIDGE_ABI, ethers.provider);
    xvs = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);
    oldCirculatingSupply = await xvsBridge.circulatingSupply();
    oldXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
    xvsHolder = await initMainnetUser(XVS_HOLDER, ethers.utils.parseEther("2"));
    await xvs.connect(xvsHolder).transfer(COMPTROLLER, XVS_AMOUNT);
  });

  testVip("VIP-213 Send XVS to Dest Chain", vip213Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI, XVS_BRIDGE_ABI], ["VenusGranted", "SendToChain"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should decrease circulating supply", async () => {
      const currCirculatingSupply = await xvsBridge.circulatingSupply();
      expect(oldCirculatingSupply.sub(currCirculatingSupply)).equals(XVS_AMOUNT);
    });

    it("Should increase number of locked tokens on bridge", async () => {
      const currXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
      expect(currXVSBal.sub(oldXVSBal)).equals(XVS_AMOUNT);
    });
  });
});
