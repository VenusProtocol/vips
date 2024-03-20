import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { USDT, XVS, XVS_VAULT_CONVERTER, vipConverter } from "../../vips/vip-converter/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import CONVERTER_ABI from "./abi/XVSVaultConverter.json";

const USER = "0x9fcc67d7db763787bb1c7f3bc7f34d3c548c19fe";

forking(37126200, () => {
  const provider = ethers.provider;
  let xvs: Contract;
  let usdt: Contract;
  let xvsVaultConverter: Contract;
  let user: Signer;

  before(async () => {
    user = await initMainnetUser(USER, parseEther("1"));
    xvs = new ethers.Contract(XVS, ERC20_ABI, provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, provider);

    xvsVaultConverter = new ethers.Contract(XVS_VAULT_CONVERTER, CONVERTER_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("conversion config should be enable for private conversion only", async () => {
      const conversionConfig = await xvsVaultConverter.conversionConfigurations(XVS, USDT);
      expect(conversionConfig[1]).to.be.equal(2);
    });

    it("getAmountOut should revert", async () => {
      const tx = xvsVaultConverter.getAmountOut(parseUnits("1", 18), XVS, USDT);
      await expect(tx).to.be.revertedWithCustomError(xvsVaultConverter, "ConversionEnabledOnlyForPrivateConversions");
    });
  });

  testVip("VIP-Converter", vipConverter(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [CONVERTER_ABI], ["ConversionConfigUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("conversion config should be enable for all", async () => {
      const conversionConfig = await xvsVaultConverter.conversionConfigurations(XVS, USDT);
      expect(conversionConfig[1]).to.be.equal(1);
    });

    it("getAmountOut should not revert", async () => {
      await xvsVaultConverter.getAmountOut(parseUnits("1", 18), XVS, USDT);
    });

    it("convertExactTokens should not revert", async () => {
      const userUSdtBalanceBefore = await usdt.balanceOf(USER);
      await xvs.connect(user).approve(XVS_VAULT_CONVERTER, parseUnits("1", 18));
      await xvsVaultConverter
        .connect(user)
        .convertExactTokens(parseUnits("1", 18), parseUnits("1", 18), XVS, USDT, USER);
      const userUSdtBalanceAfter = await usdt.balanceOf(USER);

      expect(userUSdtBalanceAfter).to.be.greaterThan(userUSdtBalanceBefore);
    });
  });
});
