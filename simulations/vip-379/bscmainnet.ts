import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip379, {
  XVS_AMOUNT_TO_BRIDGE,
  XVS_BRIDGE_SRC,
  XVS_VAULT_REWARDS_SPEED,
  XVS_VAULT_TREASURY_RELEASE_AMOUNT,
} from "../../vips/vip-379/bscmainnet";
import XVS_BRIDGE_ABI from "./abi/XVSProxyOFTSrc.json";
import XVS_VAULT_ABI from "./abi/XVSVaultProxy.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";
import XVS_ABI from "./abi/Xvs.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";

forking(42790960, async () => {
  let xvsBridge: Contract;
  let oldCirculatingSupply: BigNumber;
  let oldXvsBalBridge: BigNumber;
  let xvs: Contract;
  let xvsVault: Contract;
  let oldXvsStoreBalance: BigNumber;

  before(async () => {
    xvsBridge = new ethers.Contract(XVS_BRIDGE_SRC, XVS_BRIDGE_ABI, ethers.provider);
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, bscmainnet.XVS_VAULT_PROXY);
    xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, ethers.provider);
    oldXvsStoreBalance = await xvs.balanceOf(XVS_STORE);
    oldCirculatingSupply = await xvsBridge.circulatingSupply();
    oldXvsBalBridge = await xvs.balanceOf(XVS_BRIDGE_SRC);
  });

  testVip("VIP-379", await vip379(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_TREASURY_ABI], ["FundsTransferredToXVSStore"], [1]);
    },
  });

  describe("Post-Execution", () => {
    it("balance of xvs store should increase", async () => {
      expect(await xvs.balanceOf(XVS_STORE)).to.be.equal(oldXvsStoreBalance.add(XVS_VAULT_TREASURY_RELEASE_AMOUNT));
    });

    it("Should update reward speeds correctly", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS)).to.be.equal(XVS_VAULT_REWARDS_SPEED);
    });

    it("Should decrease circulating supply", async () => {
      const currCirculatingSupply = await xvsBridge.circulatingSupply();
      expect(oldCirculatingSupply.sub(currCirculatingSupply)).equals(XVS_AMOUNT_TO_BRIDGE);
    });

    it("Should increase number of locked tokens on bridge", async () => {
      const currXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
      expect(currXVSBal.sub(oldXvsBalBridge)).equals(XVS_AMOUNT_TO_BRIDGE);
    });
  });
});
