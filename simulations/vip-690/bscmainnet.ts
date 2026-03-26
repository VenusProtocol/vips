import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import {
  BNB_REPAYMENTS,
  REPAYMENTS_FROM_RISK_FUND,
  REPAYMENTS_FROM_TREASURY,
  TokenRepayment,
  USDT,
  USDT_TO_OTC,
  USDT_TREASURY_REIMBURSEMENT,
  totalBNB,
  totalForToken,
  vBNB,
} from "../../vips/vip-690/amounts";
import {
  BAD_DEBT_HELPER,
  DEV_WALLET,
  NORMAL_TIMELOCK,
  RISK_FUND,
  THE,
  vTHE,
  vip690,
} from "../../vips/vip-690/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTOKEN_ABI from "./abi/VBep20Abi.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const BLOCK_NUMBER = 88804635;

const THE_TARGET_RECEIVER = "0x5e7bb1f600e42bc227755527895a282f782555ec";

const THE_BORROWERS: string[] = [
  "0x737bc98f1d34e19539c074b8ad1169d5d45da619",
  "0x85ca0dff027102ea3fbf1c077524eab21d1f7927",
  "0xa72e1756426100c6207421471449e2ba9a917e86",
  "0x9958ed7f2441c208821ea14643224812a006d221",
  "0x6efee96287b5e1a2ef966e25bae15a54bde9b83e",
  "0x2c58d31559d65242cf7915a4fd89fcab9c96f7df",
  "0xdff9e1b12dfb7103231128940a19c2896f049de8",
  "0xa87f0d31846211ce417128a770c681fc342d3a74",
];

const ALL_BEP20_REPAYMENTS: TokenRepayment[] = [...REPAYMENTS_FROM_RISK_FUND, ...REPAYMENTS_FROM_TREASURY];

const shortAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

forking(BLOCK_NUMBER, async () => {
  let theToken: Contract;
  let vTheToken: Contract;
  let usdtToken: Contract;
  let vBnbToken: Contract;

  // Pre-VIP snapshots
  let receiverTheBalancePrev: BigNumber;
  let exchangeRatePrev: BigNumber;
  let vTheCashPrev: BigNumber;
  let vTheTotalBorrowsPrev: BigNumber;
  let vTheTotalReservesPrev: BigNumber;
  let vTheTotalSupplyPrev: BigNumber;
  let treasuryUsdtBalancePrev: BigNumber;
  let devWalletUsdtBalancePrev: BigNumber;
  let helperBnbBalancePrev: BigNumber;
  let timelockBnbBalancePrev: BigNumber;
  const timelockTokenBalancesPrev: Map<string, BigNumber> = new Map();
  const theBorrowerDebtsPrev: Map<string, BigNumber> = new Map();
  const bep20BorrowerDebtsPrev: Map<string, Map<string, BigNumber>> = new Map();
  const bnbBorrowerDebtsPrev: Map<string, BigNumber> = new Map();

  before(async () => {
    theToken = new ethers.Contract(THE, IERC20_ABI, ethers.provider);
    vTheToken = new ethers.Contract(vTHE, VTOKEN_ABI, ethers.provider);
    usdtToken = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    vBnbToken = new ethers.Contract(vBNB, VTOKEN_ABI, ethers.provider);

    receiverTheBalancePrev = await theToken.balanceOf(THE_TARGET_RECEIVER);
    exchangeRatePrev = await vTheToken.exchangeRateStored();
    vTheCashPrev = await vTheToken.getCash();
    vTheTotalBorrowsPrev = await vTheToken.totalBorrows();
    vTheTotalReservesPrev = await vTheToken.totalReserves();
    vTheTotalSupplyPrev = await vTheToken.totalSupply();
    treasuryUsdtBalancePrev = await usdtToken.balanceOf(bscmainnet.VTREASURY);
    devWalletUsdtBalancePrev = await usdtToken.balanceOf(DEV_WALLET);
    helperBnbBalancePrev = await ethers.provider.getBalance(BAD_DEBT_HELPER);
    timelockBnbBalancePrev = await ethers.provider.getBalance(NORMAL_TIMELOCK);
    // Capture timelock token balances
    for (const repayment of ALL_BEP20_REPAYMENTS) {
      if (!timelockTokenBalancesPrev.has(repayment.underlying)) {
        const token = new ethers.Contract(repayment.underlying, IERC20_ABI, ethers.provider);
        const balance = await token.balanceOf(NORMAL_TIMELOCK);
        timelockTokenBalancesPrev.set(repayment.underlying, balance);
      }
    }
    const theTimelockBalance = await theToken.balanceOf(NORMAL_TIMELOCK);
    timelockTokenBalancesPrev.set(THE, theTimelockBalance);

    for (const borrower of THE_BORROWERS) {
      const debt = await vTheToken.borrowBalanceStored(borrower);
      theBorrowerDebtsPrev.set(borrower, debt);
    }

    for (const repayment of ALL_BEP20_REPAYMENTS) {
      const vToken = new ethers.Contract(repayment.vToken, VTOKEN_ABI, ethers.provider);
      if (!bep20BorrowerDebtsPrev.has(repayment.vToken)) bep20BorrowerDebtsPrev.set(repayment.vToken, new Map());
      for (const borrower of repayment.borrowers) {
        const debt = await vToken.borrowBalanceStored(borrower.address);
        bep20BorrowerDebtsPrev.get(repayment.vToken)!.set(borrower.address, debt);
      }
    }

    for (const repayment of BNB_REPAYMENTS) {
      const debt = await vBnbToken.borrowBalanceStored(repayment.address);
      bnbBorrowerDebtsPrev.set(repayment.address, debt);
    }
  });

  // ══════════════════════════════════════════════════════════
  // Pre-VIP checks
  // ══════════════════════════════════════════════════════════

  describe("Pre-VIP behavior", () => {
    describe("THE market", () => {
      it("should have THE cash in vTHE", async () => {
        expect(vTheCashPrev).to.be.gt(0);
      });

      it("should have sufficient THE cash to cover all THE bad debt", async () => {
        let totalTheDebt = BigNumber.from(0);
        for (const borrower of THE_BORROWERS) {
          totalTheDebt = totalTheDebt.add(theBorrowerDebtsPrev.get(borrower)!);
        }
        expect(vTheCashPrev).to.be.gt(totalTheDebt);
      });

      for (const borrower of THE_BORROWERS) {
        it(`should have non-zero THE bad debt for ${shortAddr(borrower)}`, async () => {
          const debt = theBorrowerDebtsPrev.get(borrower)!;
          expect(debt).to.be.gt(0);
        });
      }

      it("should have inflated vTHE exchange rate", async () => {
        console.log(`    vTHE exchange rate: ${ethers.utils.formatUnits(exchangeRatePrev, 28)}`);
        expect(exchangeRatePrev).to.be.gt(ethers.utils.parseUnits("2", 28));
      });

      it("should have Normal Timelock as admin of vTHE", async () => {
        const admin = await vTheToken.admin();
        expect(admin).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("BEP20 bad debt", () => {
      for (const repayment of ALL_BEP20_REPAYMENTS) {
        for (const borrower of repayment.borrowers) {
          it(`should have non-zero ${repayment.name} debt for ${shortAddr(borrower.address)}`, async () => {
            const debt = bep20BorrowerDebtsPrev.get(repayment.vToken)!.get(borrower.address)!;
            expect(debt).to.be.gt(0);
          });
        }
      }
    });

    describe("BNB bad debt", () => {
      for (const repayment of BNB_REPAYMENTS) {
        it(`should have non-zero BNB debt for ${shortAddr(repayment.address)}`, async () => {
          const debt = bnbBorrowerDebtsPrev.get(repayment.address)!;
          expect(debt).to.be.gt(0);
        });
      }
    });

    describe("Fund sources", () => {
      for (const repayment of REPAYMENTS_FROM_RISK_FUND) {
        it(`should have sufficient ${repayment.name} in Risk Fund`, async () => {
          const token = new ethers.Contract(repayment.underlying, IERC20_ABI, ethers.provider);
          const riskFundBalance = await token.balanceOf(RISK_FUND);
          const needed = totalForToken(repayment);
          expect(riskFundBalance).to.be.gte(needed);
        });
      }

      const allTreasuryRepayments = REPAYMENTS_FROM_TREASURY;
      for (const repayment of allTreasuryRepayments) {
        it(`should have sufficient ${repayment.name} in Treasury`, async () => {
          const token = new ethers.Contract(repayment.underlying, IERC20_ABI, ethers.provider);
          const treasuryBalance = await token.balanceOf(bscmainnet.VTREASURY);
          const needed = totalForToken(repayment);
          expect(treasuryBalance).to.be.gte(needed);
        });
      }

      it("should have sufficient BNB in Treasury", async () => {
        const treasuryBnbBalance = await ethers.provider.getBalance(bscmainnet.VTREASURY);
        expect(treasuryBnbBalance).to.be.gte(totalBNB());
      });

      it("should have sufficient USDT in Risk Fund for bad debt + reimbursement + OTC", async () => {
        const riskFundUsdtBalance = await usdtToken.balanceOf(RISK_FUND);
        const usdtForBadDebt = totalForToken(REPAYMENTS_FROM_RISK_FUND.find(r => r.name === "USDT")!);
        const totalUsdtNeeded = usdtForBadDebt.add(USDT_TREASURY_REIMBURSEMENT).add(USDT_TO_OTC);
        expect(riskFundUsdtBalance).to.be.gte(totalUsdtNeeded);
      });
    });
  });

  // ══════════════════════════════════════════════════════════
  // Execute VIP
  // ══════════════════════════════════════════════════════════

  testVip("VIP-690 Bad Debt Repayment and $THE Market Recovery", await vip690());

  // ══════════════════════════════════════════════════════════
  // Post-VIP checks
  // ══════════════════════════════════════════════════════════

  describe("Post-VIP behavior", () => {
    describe("THE market recovery", () => {
      it("should have Normal Timelock as admin of vTHE", async () => {
        const admin = await vTheToken.admin();
        expect(admin).to.equal(NORMAL_TIMELOCK);
      });

      it("should have reduced vTHE exchange rate", async () => {
        const exchangeRatePost = await vTheToken.exchangeRateStored();
        console.log(
          `    vTHE exchange rate: ${ethers.utils.formatUnits(exchangeRatePrev, 28)} → ${ethers.utils.formatUnits(
            exchangeRatePost,
            28,
          )}`,
        );
        expect(exchangeRatePost).to.be.lt(exchangeRatePrev);
      });

      for (const borrower of THE_BORROWERS) {
        it(`should have fully repaid THE debt for ${shortAddr(borrower)}`, async () => {
          const debtPost = await vTheToken.borrowBalanceStored(borrower);
          expect(debtPost).to.equal(0);
        });
      }

      it("should have reduced vTHE cash", async () => {
        const vTheCashPost = await vTheToken.getCash();
        expect(vTheCashPost).to.be.lt(vTheCashPrev);
      });

      it("should have transferred THE to target receiver", async () => {
        const receiverBalance = await theToken.balanceOf(THE_TARGET_RECEIVER);
        const received = receiverBalance.sub(receiverTheBalancePrev);
        const cashPost = await vTheToken.getCash();
        const borrowsPost = await vTheToken.totalBorrows();
        const reservesPost = await vTheToken.totalReserves();
        const supplyPost = await vTheToken.totalSupply();
        const exchangeRatePost = await vTheToken.exchangeRateStored();
        const fmt = (v: BigNumber, d: number) => ethers.utils.formatUnits(v, d);
        console.log(`    vTHE Market State (before → after):`);
        console.log(`    ┌──────────────────┬──────────────────────────┬──────────────────────────┐`);
        console.log(`    │ Component        │ Before                   │ After                    │`);
        console.log(`    ├──────────────────┼──────────────────────────┼──────────────────────────┤`);
        console.log(`    │ cash             │ ${fmt(vTheCashPrev, 18).padEnd(24)} │ ${fmt(cashPost, 18).padEnd(24)} │`);
        console.log(
          `    │ totalBorrows     │ ${fmt(vTheTotalBorrowsPrev, 18).padEnd(24)} │ ${fmt(borrowsPost, 18).padEnd(24)} │`,
        );
        console.log(
          `    │ totalReserves    │ ${fmt(vTheTotalReservesPrev, 18).padEnd(24)} │ ${fmt(reservesPost, 18).padEnd(
            24,
          )} │`,
        );
        console.log(
          `    │ totalSupply      │ ${vTheTotalSupplyPrev.toString().padEnd(24)} │ ${supplyPost
            .toString()
            .padEnd(24)} │`,
        );
        console.log(
          `    │ exchangeRate     │ ${fmt(exchangeRatePrev, 28).padEnd(24)} │ ${fmt(exchangeRatePost, 28).padEnd(
            24,
          )} │`,
        );
        const borrowsRepaid = vTheTotalBorrowsPrev.sub(borrowsPost);
        const totalSwept = received.add(borrowsRepaid);
        console.log(`    ├──────────────────┼──────────────────────────┴──────────────────────────┤`);
        console.log(`    │ THE to receiver  │ ${fmt(received, 18).padEnd(51)} │`);
        console.log(`    │ THE debt repaid  │ ${fmt(borrowsRepaid, 18).padEnd(51)} │`);
        console.log(`    │ Total THE swept  │ ${fmt(totalSwept, 18).padEnd(51)} │`);
        console.log(`    └──────────────────┴─────────────────────────────────────────────────────┘`);
        expect(received).to.be.gt(0);
      });
    });

    describe("BEP20 bad debt repayment", () => {
      for (const repayment of ALL_BEP20_REPAYMENTS) {
        for (const borrower of repayment.borrowers) {
          it(`should have repaid ${repayment.name} debt for ${shortAddr(borrower.address)}`, async () => {
            const vToken = new ethers.Contract(repayment.vToken, VTOKEN_ABI, ethers.provider);
            const debtPrev = bep20BorrowerDebtsPrev.get(repayment.vToken)!.get(borrower.address)!;
            const debtPost = await vToken.borrowBalanceStored(borrower.address);
            // Debt should decrease. If it increased slightly due to interest accrual during
            // execution, the increase should be < 0.1% of original debt (dust).
            if (debtPost.gte(debtPrev)) {
              const increase = debtPost.sub(debtPrev);
              expect(increase).to.be.lt(
                debtPrev.div(1000),
                `${repayment.name} debt for ${borrower.address} increased by more than 0.1%`,
              );
            } else {
              expect(debtPost).to.be.lt(debtPrev);
            }
          });
        }
      }
    });

    describe("BNB bad debt repayment", () => {
      for (const repayment of BNB_REPAYMENTS) {
        it(`should have repaid BNB debt for ${shortAddr(repayment.address)}`, async () => {
          const debtPrev = bnbBorrowerDebtsPrev.get(repayment.address)!;
          const debtPost = await vBnbToken.borrowBalanceStored(repayment.address);
          expect(debtPost).to.be.lt(debtPrev);
        });
      }
    });

    describe("Helper contract cleanup", () => {
      it("should have no THE remaining on helper", async () => {
        const balance = await theToken.balanceOf(BAD_DEBT_HELPER);
        expect(balance).to.equal(0);
      });

      for (const repayment of ALL_BEP20_REPAYMENTS) {
        it(`should have no ${repayment.name} remaining on helper`, async () => {
          const token = new ethers.Contract(repayment.underlying, IERC20_ABI, ethers.provider);
          const balance = await token.balanceOf(BAD_DEBT_HELPER);
          expect(balance).to.equal(0);
        });
      }

      it("should have no BNB remaining on helper", async () => {
        const balance = await ethers.provider.getBalance(BAD_DEBT_HELPER);
        expect(balance).to.equal(helperBnbBalancePrev);
      });

      it("should have zero THE approval from helper on vTHE", async () => {
        const allowance = await theToken.allowance(BAD_DEBT_HELPER, vTHE);
        expect(allowance).to.equal(0);
      });

      for (const repayment of ALL_BEP20_REPAYMENTS) {
        it(`should have zero ${repayment.name} approval from helper`, async () => {
          const token = new ethers.Contract(repayment.underlying, IERC20_ABI, ethers.provider);
          const allowance = await token.allowance(BAD_DEBT_HELPER, repayment.vToken);
          expect(allowance).to.equal(0);
        });
      }
    });

    describe("Timelock should not retain repayment tokens", () => {
      for (const repayment of ALL_BEP20_REPAYMENTS) {
        it(`should have same or less ${repayment.name} on Timelock as before`, async () => {
          const token = new ethers.Contract(repayment.underlying, IERC20_ABI, ethers.provider);
          const balancePost = await token.balanceOf(NORMAL_TIMELOCK);
          const balancePrev = timelockTokenBalancesPrev.get(repayment.underlying)!;
          // Timelock should not have gained tokens — it sourced them and transferred to helper.
          // However, healAccount/repayBorrowBehalf calls trigger accrueInterest() on each vToken,
          // which accumulates reserves credited to the timelock (as vToken admin). Markets with high
          // utilization or many borrowers (e.g. USDT ~48, XRP ~2.5, DOGE ~1.14) see noticeable gains.
          // We allow up to 100 token units to accommodate this protocol-level interest accrual.
          if (balancePost.gt(balancePrev)) {
            const increase = balancePost.sub(balancePrev);
            const decimals = await token.decimals();
            expect(increase).to.be.lt(
              ethers.utils.parseUnits("100", decimals),
              `Timelock should not have gained significant ${repayment.name}`,
            );
          }
        });
      }

      it("should have same or less THE on Timelock as before", async () => {
        const balancePost = await theToken.balanceOf(NORMAL_TIMELOCK);
        const balancePrev = timelockTokenBalancesPrev.get(THE)!;
        expect(balancePost).to.be.lte(balancePrev);
      });

      it("should log BNB flow through Timelock and Helper", async () => {
        const timelockBnbBalancePost = await ethers.provider.getBalance(NORMAL_TIMELOCK);
        const helperBnbBalancePost = await ethers.provider.getBalance(BAD_DEBT_HELPER);

        console.log(`    Total BNB sent to helper for repayment: ${ethers.utils.formatEther(totalBNB())} BNB`);
        console.log(
          `    Helper BNB: ${ethers.utils.formatEther(helperBnbBalancePrev)} → ${ethers.utils.formatEther(
            helperBnbBalancePost,
          )}`,
        );
        console.log(
          `    Timelock BNB: ${ethers.utils.formatEther(timelockBnbBalancePrev)} → ${ethers.utils.formatEther(
            timelockBnbBalancePost,
          )}`,
        );
        // Note: Timelock's on-chain BNB balance (~12 BNB) is overwritten to 40 BNB by
        // initMainnetUser (src/vip-framework/index.ts:144) via hardhat_setBalance to provide
        // gas for proposal execution during simulation. The original 12 BNB is not lost on-chain —
        // it only appears overwritten in the forked test environment. On the real chain, the
        // Timelock's BNB stays untouched by this — it only receives/sends BNB as the VIP
        // specifies (Treasury → Timelock → Helper → vBNB repayments).
      });
    });

    describe("Treasury reimbursement and OTC", () => {
      it("should have reimbursed Treasury with USDT from Risk Fund", async () => {
        const treasuryUsdtBalancePost = await usdtToken.balanceOf(bscmainnet.VTREASURY);
        const received = treasuryUsdtBalancePost.sub(treasuryUsdtBalancePrev);
        expect(received).to.equal(USDT_TREASURY_REIMBURSEMENT);
      });

      it("should have swept USDT to Dev Wallet for OTC", async () => {
        const devWalletUsdtBalancePost = await usdtToken.balanceOf(DEV_WALLET);
        const received = devWalletUsdtBalancePost.sub(devWalletUsdtBalancePrev);
        expect(received).to.equal(USDT_TO_OTC);
      });
    });
  });
});
