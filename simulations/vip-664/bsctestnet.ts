import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664, { TOKEN_REDEEMER } from "../../vips/vip-664/bsctestnet";
import TOKEN_REDEEMER_ABI from "./abi/TokenRedeemer.json";
import XVS_ABI from "./abi/XVS.json";

const { bsctestnet } = NETWORK_ADDRESSES;

// XVS Vault Proxy on BNB Chain Testnet — holds a large XVS balance, used to seed the TokenRedeemer.
const XVS_WHALE = "0x9aB56bAD2D7631B2A857ccf36d998232A8b82280";
const SWEEP_AMOUNT = parseUnits("1", 18);

// Fork at the block in which TokenRedeemer was deployed, so the contract exists on the fork.
const FORK_BLOCK = 114868878;

forking(FORK_BLOCK, async () => {
  let xvs: Contract;
  let tokenRedeemer: Contract;
  let treasuryBalanceBefore: BigNumber;

  before(async () => {
    xvs = new ethers.Contract(bsctestnet.XVS, XVS_ABI, ethers.provider);
    tokenRedeemer = new ethers.Contract(TOKEN_REDEEMER, TOKEN_REDEEMER_ABI, ethers.provider);

    // Seed the TokenRedeemer with a stuck XVS balance to recover.
    const whale = await initMainnetUser(XVS_WHALE, parseUnits("1", 18));
    await xvs.connect(whale).transfer(TOKEN_REDEEMER, SWEEP_AMOUNT);

    treasuryBalanceBefore = await xvs.balanceOf(bsctestnet.VTREASURY);
  });

  describe("Pre-VIP state", () => {
    it("TokenRedeemer holds the seeded XVS balance", async () => {
      expect(await xvs.balanceOf(TOKEN_REDEEMER)).to.equal(SWEEP_AMOUNT);
    });

    it("TokenRedeemer is owned by the NormalTimelock", async () => {
      expect(await tokenRedeemer.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });
  });

  testVip("VIP-664 [BNB Chain Testnet] Recover stuck XVS from TokenRedeemer to the Treasury", await vip664(), {
    callbackAfterExecution: async txResponse => {
      // sweepTokens transfers the full XVS balance to the Treasury — exactly one ERC-20 Transfer.
      await expectEvents(txResponse, [XVS_ABI], ["Transfer"], [1]);
    },
  });

  describe("Post-VIP state", () => {
    it("TokenRedeemer XVS balance is fully swept to zero", async () => {
      expect(await xvs.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    it("Treasury XVS balance increased by the swept amount", async () => {
      expect(await xvs.balanceOf(bsctestnet.VTREASURY)).to.equal(treasuryBalanceBefore.add(SWEEP_AMOUNT));
    });
  });
});
