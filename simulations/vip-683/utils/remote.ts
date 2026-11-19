import { TransactionResponse } from "@ethersproject/abstract-provider";
import { SnapshotRestorer, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { testForkedNetworkVipCommands } from "src/vip-framework";

import { REMOTE_CHAINS as VIP_680_REMOTE_CHAINS } from "../../../vips/vip-680/config";
import vip683 from "../../../vips/vip-683/bscmainnet";
import { REMOTE_CHAINS, RESET_POOL_CF_SNAPSHOT } from "../../../vips/vip-683/config";
import ACM_ABI from "../abi/AccessControlManager.json";
import EBRAKE_ABI from "../abi/EBrake.json";
import PROXY_ABI from "../abi/OptimizedTransparentUpgradeableProxy.json";

// EIP-1967 implementation slot
const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const MINT_ACTION = 0;

const implementationOf = async (proxy: string) =>
  ethers.utils.getAddress("0x" + (await ethers.provider.getStorageAt(proxy, IMPLEMENTATION_SLOT)).slice(26));

export const checkRemoteChain = async (name: string, timelock: string) => {
  const chain = REMOTE_CHAINS.find(c => c.name === name);
  const vip680Chain = VIP_680_REMOTE_CHAINS.find(c => c.name === name);
  if (!chain || !vip680Chain) throw new Error(`${name} is not in REMOTE_CHAINS`);
  const acm = new Contract(chain.acm, ACM_ABI, ethers.provider);
  const ebrake = new Contract(chain.eBrake, EBRAKE_ABI, ethers.provider);
  const comptroller = new Contract(
    chain.coreComptroller,
    [
      "function getAllMarkets() view returns (address[])",
      "function actionPaused(address market, uint8 action) view returns (bool)",
    ],
    ethers.provider,
  );

  describe("Pre-VIP behavior", () => {
    it("EBrake runs the VIP-680 implementation", async () => {
      expect(await implementationOf(chain.eBrake)).to.equal(ethers.utils.getAddress(vip680Chain.newImplementation));
    });
  });

  testForkedNetworkVipCommands(`VIP-683 EBrake upgrade on ${name}`, await vip683(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("EBrake runs the new implementation", async () => {
      expect(await implementationOf(chain.eBrake)).to.equal(chain.newImplementation);
    });

    it("EBrake keeps its comptroller, ACM and owner", async () => {
      expect(await ebrake.COMPTROLLER()).to.equal(chain.coreComptroller);
      expect(await ebrake.IS_REMOTE_CHAIN()).to.be.true;
      expect(await ebrake.accessControlManager()).to.equal(chain.acm);
      expect(await ebrake.owner()).to.equal(timelock);
    });

    it("nobody holds the per-pool reset permission", async () => {
      expect(await acm.isAllowedToCall(timelock, RESET_POOL_CF_SNAPSHOT, { from: chain.eBrake })).to.be.false;
    });
  });

  describe("Post-VIP functional", () => {
    let snapshot: SnapshotRestorer;
    beforeEach(async () => {
      snapshot = await takeSnapshot();
    });
    afterEach(async () => {
      await snapshot.restore();
    });

    it("Normal Timelock pauses supply of a Core pool market through EBrake", async () => {
      const [market] = await comptroller.getAllMarkets();
      expect(await comptroller.actionPaused(market, MINT_ACTION)).to.be.false;

      await expect(ebrake.connect(await initMainnetUser(timelock, parseEther("1"))).pauseSupply(market))
        .to.emit(ebrake, "ActionPaused")
        .withArgs(timelock, market, MINT_ACTION);
      expect(await comptroller.actionPaused(market, MINT_ACTION)).to.be.true;
    });

    it("Normal Timelock cannot clear a pool snapshot on a remote chain", async () => {
      const [market] = await comptroller.getAllMarkets();
      await expect(
        ebrake.connect(await initMainnetUser(timelock, parseEther("1")))["resetCFSnapshot(address,uint96)"](market, 0),
      ).to.be.revertedWithCustomError(ebrake, "Unauthorized");
    });

    it("the per-pool reset reverts on a remote chain even with the permission", async () => {
      const [market] = await comptroller.getAllMarkets();
      const signer = await initMainnetUser(timelock, parseEther("1"));
      await acm.connect(signer).giveCallPermission(chain.eBrake, RESET_POOL_CF_SNAPSHOT, timelock);

      await expect(ebrake.connect(signer)["resetCFSnapshot(address,uint96)"](market, 0)).to.be.revertedWithCustomError(
        ebrake,
        "NotSupportedOnRemoteChain",
      );
    });
  });
};
