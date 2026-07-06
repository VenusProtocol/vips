import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriodForAllAssets } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999, {
  BTCB,
  FIXED_RATE_VAULT_CONTROLLER,
  SUPPLY_ASSET,
  VCEBTC,
  VCEBTC_INITIAL_SUPPLY,
} from "../../vips/vip-999/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import ERC20_ABI from "./abi/AccessControlledERC20.json";
import ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// ─────────────────────────────────────────────────────────────────────────────
// DRAFT SIMULATION — NOT RUNNABLE YET.
//
// This simulation cannot pass until the following are true (see the VIP header):
//   1. vceBTC is deployed and VCEBTC in the VIP file points to it (it is currently
//      the zero address). On a fork, deploy it in the `before()` hook below.
//   2. The InstitutionalVaultController proxy has been upgraded to the 6-param
//      `createVault` implementation. The impl live on bscmainnet today is 5-param,
//      so the createVault command reverts against the current fork state.
//   3. The underlying oracle feeds resolve a price for vceBTC (cloning the
//      ResilientOracle config alone is not enough — see the VIP's oracle TODO).
//   4. The DUMMY vault parameters are replaced with finalized values.
//
// Once the above are addressed, pick a fork block just before the proposal, fill in
// the assertions marked TODO, and remove `.skip`.
// ─────────────────────────────────────────────────────────────────────────────

const FORK_BLOCK = 0; // TODO: set to a block shortly before the proposal.

forking(FORK_BLOCK, async () => {
  let oracle: Contract;
  let acm: Contract;
  let vceBTC: Contract;

  before(async () => {
    oracle = await ethers.getContractAt(ORACLE_ABI, bscmainnet.RESILIENT_ORACLE);
    acm = await ethers.getContractAt(ACM_ABI, bscmainnet.ACCESS_CONTROL_MANAGER);
    vceBTC = await ethers.getContractAt(ERC20_ABI, VCEBTC);

    // The fork advances time, so oracle feeds go stale and getPrice reverts. Bump the
    // max stale period on the underlying feeds for the priced assets. vceBTC shares
    // BTCB's feeds, so bumping BTCB also covers vceBTC's price.
    const btcb = await ethers.getContractAt(ERC20_ABI, BTCB);
    const usdt = await ethers.getContractAt(ERC20_ABI, SUPPLY_ASSET);
    await setMaxStalePeriodForAllAssets(oracle, [btcb, usdt]);
  });

  describe.skip("Pre-VIP behavior", () => {
    it("vceBTC has no oracle config yet (getPrice reverts)", async () => {
      await expect(oracle.getPrice(VCEBTC)).to.be.reverted;
    });

    it("Timelock cannot yet mint vceBTC", async () => {
      expect(await acm.isAllowedToCall(bscmainnet.NORMAL_TIMELOCK, "mint(address,uint256)")).to.equal(false);
    });
  });

  testVip("VIP-999 Create Ceffu Custody BTC Fixed Rate Vault", await vip999(), {
    callbackAfterExecution: async txResponse => {
      // TODO: confirm the emitted events / counts once params are final.
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [5]);
    },
  });

  describe.skip("Post-VIP behavior", () => {
    it("vceBTC is priced identically to BTCB", async () => {
      expect(await oracle.getPrice(VCEBTC)).to.equal(await oracle.getPrice(BTCB));
    });

    it("Timelock and Guardian can mint/burn vceBTC", async () => {
      expect(await acm.isAllowedToCall(bscmainnet.NORMAL_TIMELOCK, "mint(address,uint256)")).to.equal(true);
      expect(await acm.isAllowedToCall(bscmainnet.CRITICAL_GUARDIAN, "mint(address,uint256)")).to.equal(true);
      expect(await acm.isAllowedToCall(bscmainnet.NORMAL_TIMELOCK, "burn(address,uint256)")).to.equal(true);
      expect(await acm.isAllowedToCall(bscmainnet.CRITICAL_GUARDIAN, "burn(address,uint256)")).to.equal(true);
    });

    it("initial vceBTC collateral was minted to the Venus Treasury", async () => {
      expect(await vceBTC.totalSupply()).to.equal(VCEBTC_INITIAL_SUPPLY);
      expect(await vceBTC.balanceOf(bscmainnet.VTREASURY)).to.equal(VCEBTC_INITIAL_SUPPLY);
    });

    it("a Fixed Rate Vault backed by vceBTC was created", async () => {
      const controller = await ethers.getContractAt(
        ["function allVaultsLength() view returns (uint256)"],
        FIXED_RATE_VAULT_CONTROLLER,
      );
      // TODO: assert a new vault is registered and its collateralAsset == vceBTC.
      expect(await controller.allVaultsLength()).to.be.gt(0);
    });
  });

  describe.skip("Post-VIP functional", () => {
    it("Guardian can mint vceBTC after the grant", async () => {
      const guardian = await initMainnetUser(bscmainnet.CRITICAL_GUARDIAN, ethers.utils.parseEther("1"));
      // TODO: mint a small amount and assert balance/totalSupply delta.
      await expect(vceBTC.connect(guardian).mint(bscmainnet.CRITICAL_GUARDIAN, 1)).to.not.be.reverted;
    });
  });
});
