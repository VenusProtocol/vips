import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BTC,
  BTC_AMOUNT_DEV_FUND,
  DEV_WALLET,
  ETH,
  ETH_AMOUNT_DEV_FUND,
  REQUIRED_VUSDC_FOR_USDC_DEV_FUND,
  TOKEN_REDEEMER,
  USDC,
  USDC_AMOUNT_DEV_FUND,
  WBNB,
  WBNB_AMOUNT_DEV_FUND,
  vUSDC,
  vip475,
} from "../../vips/vip-475/bscmainnet";
import BEP20_ABI from "./abi/BEP-20Abi.json";
import VTREASURY_ABI from "./abi/VtreasuryAbi.json";
import VTOKEN_ABI from "./abi/vTokenAbi.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(48183462, async () => {
  let oldUsdcBalance: BigNumber;
  let oldEthBalance: BigNumber;
  let oldBtcBalance: BigNumber;
  let oldBnbBalance: BigNumber;
  let oldTreasuryEthBalance: BigNumber;
  let oldTreasuryBtcBalance: BigNumber;
  let oldTreasuryWBnbBalance: BigNumber;
  let oldTreasuryVUsdcBalance: BigNumber;

  let usdc: Contract;
  let eth: Contract;
  let btc: Contract;
  let wbnb: Contract;
  let vUsdc: Contract;
  const provider = ethers.provider;

  before(async () => {
    usdc = new ethers.Contract(USDC, BEP20_ABI, provider);
    eth = new ethers.Contract(ETH, BEP20_ABI, provider);
    btc = new ethers.Contract(BTC, BEP20_ABI, provider);
    wbnb = new ethers.Contract(WBNB, BEP20_ABI, provider);
    vUsdc = new ethers.Contract(vUSDC, VTOKEN_ABI, provider);

    oldUsdcBalance = await usdc.balanceOf(DEV_WALLET);
    oldEthBalance = await eth.balanceOf(DEV_WALLET);
    oldBtcBalance = await btc.balanceOf(DEV_WALLET);
    oldBnbBalance = await ethers.provider.getBalance(DEV_WALLET);

    oldTreasuryEthBalance = await eth.balanceOf(bscmainnet.VTREASURY);
    oldTreasuryBtcBalance = await btc.balanceOf(bscmainnet.VTREASURY);
    oldTreasuryWBnbBalance = await wbnb.balanceOf(bscmainnet.VTREASURY);
    oldTreasuryVUsdcBalance = await vUsdc.balanceOf(bscmainnet.VTREASURY);
  });

  testVip("VIP-475", await vip475(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Check Treasury balance", async () => {
      expect(await vUsdc.balanceOf(bscmainnet.VTREASURY)).to.closeTo(
        oldTreasuryVUsdcBalance.sub(REQUIRED_VUSDC_FOR_USDC_DEV_FUND),
        parseUnits("16134", 8), // around 390 USDC, due to the current interest rate on the USDC market
      );
      expect(await eth.balanceOf(bscmainnet.VTREASURY)).to.equal(oldTreasuryEthBalance.sub(ETH_AMOUNT_DEV_FUND));
      expect(await btc.balanceOf(bscmainnet.VTREASURY)).to.equal(oldTreasuryBtcBalance.sub(BTC_AMOUNT_DEV_FUND));
      expect(await wbnb.balanceOf(bscmainnet.VTREASURY)).to.equal(oldTreasuryWBnbBalance.sub(WBNB_AMOUNT_DEV_FUND));
    });

    it("Check new balance of Dev Wallet", async () => {
      const newUsdcBalance = await usdc.balanceOf(DEV_WALLET);
      const newEthBalance = await eth.balanceOf(DEV_WALLET);
      const newBtcBalance = await btc.balanceOf(DEV_WALLET);
      const balance = await ethers.provider.getBalance(DEV_WALLET);

      expect(newUsdcBalance).equals(oldUsdcBalance.add(USDC_AMOUNT_DEV_FUND));
      expect(newEthBalance).equals(oldEthBalance.add(ETH_AMOUNT_DEV_FUND));
      expect(newBtcBalance).equals(oldBtcBalance.add(BTC_AMOUNT_DEV_FUND));
      expect(balance).to.be.equal(oldBnbBalance.add(WBNB_AMOUNT_DEV_FUND));
    });

    it("Token Redeemer should have no left USDC", async () => {
      expect(await usdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    it("Token Redeemer should have no left VUSDC", async () => {
      expect(await vUsdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });
  });
});
