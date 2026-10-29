import { TransactionResponse } from "@ethersproject/abstract-provider";
import { SnapshotRestorer, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { testForkedNetworkVipCommands } from "src/vip-framework";

import vip678 from "../../../vips/vip-678/bscmainnet";
import { REMOTE_CHAINS } from "../../../vips/vip-678/config";
import ACM_ABI from "../abi/AccessControlManager.json";
import EBRAKE_ABI from "../abi/EBrake.json";
import PROXY_ABI from "../abi/OptimizedTransparentUpgradeableProxy.json";
import COMPTROLLER_ABI from "../abi/SpokeComptroller.json";

const MINT_ACTION = 0;

// EBrake's grants on the Core pool comptroller, which this VIP keeps
const CORE_PERMISSIONS = [
  "setActionsPaused(address[],uint256[],bool)",
  "setCollateralFactor(address,uint256,uint256)",
  "setMarketBorrowCaps(address[],uint256[])",
  "setMarketSupplyCaps(address[],uint256[])",
];

export const checkRemoteChain = async (name: string, timelock: string) => {
  const chain = REMOTE_CHAINS.find(c => c.name === name);
  if (!chain) throw new Error(`${name} is not in REMOTE_CHAINS`);
  const acm = new Contract(chain.acm, ACM_ABI, ethers.provider);
  const ebrake = new Contract(chain.eBrake, EBRAKE_ABI, ethers.provider);

  describe("Pre-VIP behavior", () => {
    it("EBrake holds its grants on the Core pool comptroller", async () => {
      for (const signature of CORE_PERMISSIONS) {
        expect(await acm.isAllowedToCall(chain.eBrake, signature, { from: chain.coreComptroller }), signature).to.be
          .true;
      }
    });
  });

  testForkedNetworkVipCommands(`VIP-678 EBrake upgrade on ${name}`, await vip678(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("EBrake keeps its comptroller, ACM and owner", async () => {
      expect(await ebrake.COMPTROLLER()).to.equal(chain.coreComptroller);
      expect(await ebrake.IS_REMOTE_CHAIN()).to.be.true;
      expect(await ebrake.accessControlManager()).to.equal(chain.acm);
      expect(await ebrake.owner()).to.equal(timelock);
    });

    it("EBrake still holds its grants on the Core pool comptroller", async () => {
      for (const signature of CORE_PERMISSIONS) {
        expect(await acm.isAllowedToCall(chain.eBrake, signature, { from: chain.coreComptroller }), signature).to.be
          .true;
      }
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
      const comptroller = new Contract(chain.coreComptroller, COMPTROLLER_ABI, ethers.provider);
      const [market] = await comptroller.getAllMarkets();
      expect(await comptroller.actionPaused(market, MINT_ACTION)).to.be.false;

      await expect(ebrake.connect(await initMainnetUser(timelock, parseEther("1"))).pauseSupply(market))
        .to.emit(ebrake, "ActionPaused")
        .withArgs(timelock, market, MINT_ACTION);
      expect(await comptroller.actionPaused(market, MINT_ACTION)).to.be.true;
    });
  });
};
