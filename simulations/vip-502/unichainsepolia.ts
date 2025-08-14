import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip501 from "../../vips/vip-501/bsctestnet";
import {
  AMOUNT,
  PRIME_LIQUIDITY_PROVIDER,
  USDC,
  USDC_DISTRIBUTION_SPEED,
  WETH,
  WETH_DISTRIBUTION_SPEED,
  vip502,
} from "../../vips/vip-502/bsctestnet";
import PLP_ABI from "./abi/primeLiquidityProvider.json";
import TREASURY_ABI from "./abi/treasury.json";
import USDC_ABI from "./abi/usdc.json";
import WETH_ABI from "./abi/weth.json";

const { unichainsepolia } = NETWORK_ADDRESSES;

forking(19755415, async () => {
  let plp: Contract;
  let usdc: Contract;
  let weth: Contract;
  let treasuryUSDCBefore: BigNumber;
  let treasuryETHBefore: BigNumber;

  describe("Pre-VIP", () => {
    before(async () => {
      const impersonateMultisig = await initMainnetUser(unichainsepolia.GUARDIAN, ethers.utils.parseEther("10003"));
      usdc = await ethers.getContractAt(USDC_ABI, USDC, impersonateMultisig);
      weth = await ethers.getContractAt(WETH_ABI, WETH, impersonateMultisig);
      await usdc.faucet(AMOUNT);
      await usdc.transfer(unichainsepolia.VTREASURY, AMOUNT);
      await weth.deposit({ value: AMOUNT });
      await weth.transfer(unichainsepolia.VTREASURY, AMOUNT);
    });
    it("set up", async () => {
      treasuryUSDCBefore = await usdc.balanceOf(NETWORK_ADDRESSES.unichainsepolia.VTREASURY);
      treasuryETHBefore = await weth.balanceOf(NETWORK_ADDRESSES.unichainsepolia.VTREASURY);
    });
  });

  testForkedNetworkVipCommands("VIP-501", await vip501());
  testForkedNetworkVipCommands("VIP-502", await vip502(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [TREASURY_ABI], ["WithdrawTreasuryToken"], [2]);
      await expectEvents(txResponse, [PLP_ABI], ["TokenDistributionSpeedUpdated"], [2]);
    },
  });

  describe("Post-VIP behavior", () => {
    before(async () => {
      plp = await ethers.getContractAt(PLP_ABI, PRIME_LIQUIDITY_PROVIDER);
    });
    it("should update the distribution speeds in plp", async () => {
      expect(await plp.tokenDistributionSpeeds(WETH)).to.be.equal(WETH_DISTRIBUTION_SPEED);
      expect(await plp.tokenDistributionSpeeds(USDC)).to.be.equal(USDC_DISTRIBUTION_SPEED);
    });
    it("balance check", async () => {
      const treasuryUSDCAfter = await usdc.balanceOf(NETWORK_ADDRESSES.unichainsepolia.VTREASURY);
      expect(treasuryUSDCAfter).to.eq(treasuryUSDCBefore.sub(AMOUNT));

      const treasuryETHAfter = await weth.balanceOf(NETWORK_ADDRESSES.unichainsepolia.VTREASURY);
      expect(treasuryETHAfter).to.eq(treasuryETHBefore.sub(AMOUNT));
    });
  });
});
