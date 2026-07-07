import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664, {
  NEW_XVS_VAULT_SPEED,
  PRIME_LIQUIDITY_PROVIDER,
  RECIPIENT,
  U,
  U_TO_SWEEP,
  XVS_FUND_AMOUNT,
  XVS_STORE,
  XVS_VAULT_TREASURY,
} from "../../vips/vip-664/bscmainnet";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";
import ERC20_ABI from "./abi/erc20.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// XVS Vault reward speed prior to this VIP (~1,108 XVS/day at 115,200 blocks/day).
const OLD_XVS_VAULT_SPEED = BigNumber.from("9620000000000000");

forking(106561536, async () => {
  let xvs: Contract;
  let xvsVault: Contract;
  let u: Contract;

  let treasuryXvsBefore: BigNumber;
  let storeXvsBefore: BigNumber;
  let plpUBefore: BigNumber;
  let recipientUBefore: BigNumber;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, bscmainnet.XVS);
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, bscmainnet.XVS_VAULT_PROXY);
    u = await ethers.getContractAt(ERC20_ABI, U);

    treasuryXvsBefore = await xvs.balanceOf(XVS_VAULT_TREASURY);
    storeXvsBefore = await xvs.balanceOf(XVS_STORE);
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

    it("PLP holds at least U_TO_SWEEP of U", async () => {
      expect(plpUBefore).to.be.gte(U_TO_SWEEP);
    });
  });

  testVip("VIP-664 Q3 XVS Vault Rewards Adjustment and Prime Budget Transfer", await vip664(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [XVS_VAULT_TREASURY_ABI], ["FundsTransferredToXVSStore"], [1]);
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["SweepToken"], [1]);
    },
  });

  describe("Post-VIP state", () => {
    it("drains the treasury's XVS to the XVS Store", async () => {
      const treasuryAfter = await xvs.balanceOf(XVS_VAULT_TREASURY);
      const storeAfter = await xvs.balanceOf(XVS_STORE);
      expect(treasuryAfter).to.equal(treasuryXvsBefore.sub(XVS_FUND_AMOUNT));
      expect(treasuryAfter).to.equal(0);
      expect(storeAfter).to.equal(storeXvsBefore.add(XVS_FUND_AMOUNT));
    });

    it("updates the XVS Vault reward speed to 1,837.9 XVS/day", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS);
      expect(speed).to.equal(NEW_XVS_VAULT_SPEED);
      expect(speed).to.be.gt(OLD_XVS_VAULT_SPEED);
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
