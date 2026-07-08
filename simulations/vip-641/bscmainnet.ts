import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip641, {
  NEW_XVS_VAULT_SPEED,
  PRIME_LIQUIDITY_PROVIDER,
  RECIPIENT,
  U,
  U_TO_SWEEP,
  XVS_FUND_AMOUNT,
  XVS_GRANT_AMOUNT,
  XVS_STORE,
  XVS_VAULT_TREASURY,
} from "../../vips/vip-641/bscmainnet";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";
import ERC20_ABI from "./abi/erc20.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// XVS Vault reward speed prior to this VIP (~1,846.6 XVS/day at 192,000 blocks/day).
const OLD_XVS_VAULT_SPEED = BigNumber.from("9620000000000000");

forking(106561536, async () => {
  let xvs: Contract;
  let xvsVault: Contract;
  let u: Contract;

  let treasuryXvsBefore: BigNumber;
  let storeXvsBefore: BigNumber;
  let unitrollerXvsBefore: BigNumber;
  let plpUBefore: BigNumber;
  let recipientUBefore: BigNumber;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, bscmainnet.XVS);
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, bscmainnet.XVS_VAULT_PROXY);
    u = await ethers.getContractAt(ERC20_ABI, U);

    treasuryXvsBefore = await xvs.balanceOf(XVS_VAULT_TREASURY);
    storeXvsBefore = await xvs.balanceOf(XVS_STORE);
    unitrollerXvsBefore = await xvs.balanceOf(bscmainnet.UNITROLLER);
    plpUBefore = await u.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    recipientUBefore = await u.balanceOf(RECIPIENT);
  });

  describe("Pre-VIP state", () => {
    it("XVS_FUND_AMOUNT equals the treasury's full XVS balance (all available)", async () => {
      expect(treasuryXvsBefore).to.equal(XVS_FUND_AMOUNT);
    });

    it("current XVS Vault reward speed is the pre-VIP value", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS)).to.equal(OLD_XVS_VAULT_SPEED);
    });

    it("Comptroller holds at least XVS_GRANT_AMOUNT of XVS", async () => {
      expect(unitrollerXvsBefore).to.be.gte(XVS_GRANT_AMOUNT);
    });

    it("PLP holds at least U_TO_SWEEP of U", async () => {
      expect(plpUBefore).to.be.gte(U_TO_SWEEP);
    });
  });

  testVip("VIP-641 XVS Vault Q3 2026 Rewards", await vip641(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [XVS_VAULT_TREASURY_ABI], ["FundsTransferredToXVSStore"], [1]);
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["SweepToken"], [1]);
    },
  });

  describe("Post-VIP state", () => {
    it("drains the treasury's XVS and grants the base reward into the XVS Store", async () => {
      const treasuryAfter = await xvs.balanceOf(XVS_VAULT_TREASURY);
      const storeAfter = await xvs.balanceOf(XVS_STORE);
      const unitrollerAfter = await xvs.balanceOf(bscmainnet.UNITROLLER);
      // Treasury is fully drained by fundXVSVault.
      expect(treasuryAfter).to.equal(treasuryXvsBefore.sub(XVS_FUND_AMOUNT));
      expect(treasuryAfter).to.equal(0);
      // Comptroller grants XVS_GRANT_AMOUNT out via _grantXVS.
      expect(unitrollerXvsBefore.sub(unitrollerAfter)).to.equal(XVS_GRANT_AMOUNT);
      // Store receives both the treasury fund and the base-reward grant.
      expect(storeAfter).to.equal(storeXvsBefore.add(XVS_FUND_AMOUNT).add(XVS_GRANT_AMOUNT));
    });

    it("updates the XVS Vault reward speed to 535 XVS/day", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS);
      expect(speed).to.equal(NEW_XVS_VAULT_SPEED);
      // 535 XVS/day (192,000 blocks/day) is a reduction from the prior ~1,846.6 XVS/day,
      // so the new per-block speed sits below the old one.
      expect(speed).to.be.lt(OLD_XVS_VAULT_SPEED);
      expect(speed).to.not.equal(OLD_XVS_VAULT_SPEED);
    });

    it("transfers 17,000 U from PLP to the recipient", async () => {
      const plpAfter = await u.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      const recipientAfter = await u.balanceOf(RECIPIENT);
      expect(plpUBefore.sub(plpAfter)).to.equal(U_TO_SWEEP);
      expect(recipientAfter.sub(recipientUBefore)).to.equal(U_TO_SWEEP);
    });
  });

  describe("Post-VIP behavior", () => {
    it("the swept U is genuinely controllable by the recipient", async () => {
      const burner = "0x000000000000000000000000000000000000dEaD";
      const recipient = await initMainnetUser(RECIPIENT, parseUnits("1"));

      const burnerBefore = await u.balanceOf(burner);
      await expect(u.connect(recipient).transfer(burner, U_TO_SWEEP)).to.not.be.reverted;
      expect((await u.balanceOf(burner)).sub(burnerBefore)).to.equal(U_TO_SWEEP);
    });
  });
});
