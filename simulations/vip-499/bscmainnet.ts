import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip499, {
  BTCB,
  ETH,
  PLP_BTCB_AMOUNT,
  PLP_ETH_AMOUNT,
  PLP_USDC_AMOUNT,
  PLP_USDT_AMOUNT,
  PRIME_LIQUIDITY_PROVIDER,
  USDC,
  USDT,
  VANGUARD_TREASURY,
  VUSDC,
  VUSDC_AMOUNT_TO_WITHDRAW,
} from "../../vips/vip-499/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const VANGUARD_AMOUNT = parseUnits("30000", 18);

forking(50130227, async () => {
  let usdtBalanceOfVanguardTreasury: BigNumber;
  let usdtTreasuryBalanceBefore: BigNumber;
  let usdcTreasuryBalanceBefore: BigNumber;
  let vusdcTreasuryBalanceBefore: BigNumber;
  let ethTreasuryBalanceBefore: BigNumber;
  let btcbTreasuryBalanceBefore: BigNumber;
  let usdtPLPBalanceBefore: BigNumber;
  let usdcPLPBalanceBefore: BigNumber;
  let ethPLPBalanceBefore: BigNumber;
  let btcbPLPBalanceBefore: BigNumber;
  let usdt: Contract;
  let usdc: Contract;
  let vusdc: Contract;
  let eth: Contract;
  let btcb: Contract;

  before(async () => {
    const provider = ethers.provider;
    usdt = new ethers.Contract(USDT, ERC20_ABI, provider);
    usdc = new ethers.Contract(USDC, ERC20_ABI, provider);
    vusdc = new ethers.Contract(VUSDC, ERC20_ABI, provider);
    eth = new ethers.Contract(ETH, ERC20_ABI, provider);
    btcb = new ethers.Contract(BTCB, ERC20_ABI, provider);

    usdtBalanceOfVanguardTreasury = await usdt.balanceOf(VANGUARD_TREASURY);
    usdtTreasuryBalanceBefore = await usdt.balanceOf(bscmainnet.VTREASURY);
    usdcTreasuryBalanceBefore = await usdc.balanceOf(bscmainnet.VTREASURY);
    vusdcTreasuryBalanceBefore = await vusdc.balanceOf(bscmainnet.VTREASURY);
    ethTreasuryBalanceBefore = await eth.balanceOf(bscmainnet.VTREASURY);
    btcbTreasuryBalanceBefore = await btcb.balanceOf(bscmainnet.VTREASURY);
    usdtPLPBalanceBefore = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    usdcPLPBalanceBefore = await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    ethPLPBalanceBefore = await eth.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    btcbPLPBalanceBefore = await btcb.balanceOf(PRIME_LIQUIDITY_PROVIDER);
  });

  testVip("VIP-499", await vip499(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });

  describe("check balances", async () => {
    it("check USDT balance of Vanguard Treasury", async () => {
      const newBalance = await usdt.balanceOf(VANGUARD_TREASURY);
      expect(newBalance).to.equals(usdtBalanceOfVanguardTreasury.add(VANGUARD_AMOUNT));
    });

    it("check USDT balance of PrimeLiquidityProvider contract", async () => {
      const newBalance = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(newBalance).to.equals(usdtPLPBalanceBefore.add(PLP_USDT_AMOUNT));
    });

    it("check USDC balance of PrimeLiquidityProvider contract", async () => {
      const newBalance = await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(newBalance).to.equals(usdcPLPBalanceBefore.add(PLP_USDC_AMOUNT));
    });

    it("check ETH balance of PrimeLiquidityProvider contract", async () => {
      const newBalance = await eth.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(newBalance).to.equals(ethPLPBalanceBefore.add(PLP_ETH_AMOUNT));
    });

    it("check BTCB balance of PrimeLiquidityProvider contract", async () => {
      const newBalance = await btcb.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      expect(newBalance).to.equals(btcbPLPBalanceBefore.add(PLP_BTCB_AMOUNT));
    });

    it("check USDT balance of Treasury", async () => {
      const newBalance = await usdt.balanceOf(bscmainnet.VTREASURY);
      expect(newBalance).to.equals(usdtTreasuryBalanceBefore.sub(VANGUARD_AMOUNT).sub(PLP_USDT_AMOUNT));
    });

    it("check USDC balance of Treasury (should not change)", async () => {
      const newBalance = await usdc.balanceOf(bscmainnet.VTREASURY);
      expect(newBalance).to.equals(usdcTreasuryBalanceBefore);
    });

    it("check vUSDC balance of Treasury", async () => {
      const newBalance = await vusdc.balanceOf(bscmainnet.VTREASURY);
      expect(newBalance).to.be.gt(vusdcTreasuryBalanceBefore.sub(VUSDC_AMOUNT_TO_WITHDRAW));
    });

    it("check ETH balance of Treasury", async () => {
      const newBalance = await eth.balanceOf(bscmainnet.VTREASURY);
      expect(newBalance).to.equals(ethTreasuryBalanceBefore.sub(PLP_ETH_AMOUNT));
    });

    it("check BTCB balance of Treasury", async () => {
      const newBalance = await btcb.balanceOf(bscmainnet.VTREASURY);
      expect(newBalance).to.equals(btcbTreasuryBalanceBefore.sub(PLP_BTCB_AMOUNT));
    });
  });
});
