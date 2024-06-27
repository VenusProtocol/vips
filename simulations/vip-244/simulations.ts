import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { formatUnits, id, parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser, setMaxStaleCoreAssets } from "src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "src/vip-framework";
import { checkCorePoolComptroller } from "src/vip-framework/checks/checkCorePoolComptroller";

import { vip244 } from "../../vips/vip-244";
import ERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import VTOKEN_ABI from "./abi/VBep20DelegateAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import MOVE_DEBT_DELEGATE_ABI from "./abi/moveDebtDelegate.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const MOVE_DEBT_DELEGATE = "0x89621C48EeC04A85AfadFD37d32077e65aFe2226";
const PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343";
const ORIGINAL_MOVE_DEBT_DELEGATE_IMPL = "0x8439932C45e646FcC1009690417A65BF48f68Ce7";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";

// Interest rate model with no interest, for testing purposes
const ZERO_RATE_MODEL = "0x93FBc248e83bc8931141ffC7f457EC882595135A";

const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const VETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const VDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";

const vBep20TokenAddresses = {
  vUSDC: VUSDC,
  vUSDT: VUSDT,
  vBTC: VBTC,
  vETH: VETH,
  vDAI: VDAI,
};

interface BorrowBalanceRecord {
  borrower: string;
  vTokenSymbol: string;
  borrowBalance: BigNumber;
}

const debts = [
  { borrower: "0xef044206db68e40520bfa82d45419d498b4bc7bf", amount: parseUnits("348.3279", 18), vTokenSymbol: "vBTC" },
  { borrower: "0x7589dd3355dae848fdbf75044a3495351655cb1a", amount: parseUnits("2991.4833", 18), vTokenSymbol: "vETH" },
  { borrower: "0x24e77e5b74b30b026e9996e4bc3329c881e24968", amount: parseUnits("2177.2909", 18), vTokenSymbol: "vETH" },
  { borrower: "0x33df7a7f6d44307e1e5f3b15975b47515e5524c0", amount: parseUnits("2175.393", 18), vTokenSymbol: "vETH" },
  {
    borrower: "0x1f6d66ba924ebf554883cf84d482394013ed294b",
    amount: parseUnits("1078719.2611", 18),
    vTokenSymbol: "vUSDC",
  },
  {
    borrower: "0x1f6d66ba924ebf554883cf84d482394013ed294b",
    amount: parseUnits("1073481.2012", 18),
    vTokenSymbol: "vUSDT",
  },
  { borrower: "0x1f6d66ba924ebf554883cf84d482394013ed294b", amount: parseUnits("104.6177", 18), vTokenSymbol: "vETH" },
  {
    borrower: "0x3b7f525dc67cca55251abb5d04c81a83a6005269",
    amount: parseUnits("280988.5076", 18),
    vTokenSymbol: "vUSDT",
  },
  {
    borrower: "0x0f2577ccb1e895ed1e8bfd4e709706595831e78a",
    amount: parseUnits("111666.7983", 18),
    vTokenSymbol: "vUSDC",
  },
  {
    borrower: "0xbd043882d36b6def4c30f20c613cfa70d3af8bb7",
    amount: parseUnits("62898.9625", 18),
    vTokenSymbol: "vUSDC",
  },
  {
    borrower: "0x4f381fb46dfde2bc9dcae2d881705749b1ed6e1a",
    amount: parseUnits("124746.9254", 18),
    vTokenSymbol: "vUSDT",
  },
  {
    borrower: "0x7b899b97afacd8b9654a447b4db016ba430f6d11",
    amount: parseUnits("50917.875", 18),
    vTokenSymbol: "vUSDT",
  },
  {
    borrower: "0xe62721e908b7cbd4f92a014d5ccf07adbf71933b",
    amount: parseUnits("47123.8332", 18),
    vTokenSymbol: "vDAI",
  },
  {
    borrower: "0x8dcf5f960c38fd1861a4d036513adde829d63d81",
    amount: parseUnits("36656.7056", 18),
    vTokenSymbol: "vUSDC",
  },
  {
    borrower: "0x3762e67e24b9b44cea8e89163aba9d4015e27d40",
    amount: parseUnits("26393.6932", 18),
    vTokenSymbol: "vUSDT",
  },
  {
    borrower: "0x7eb163e6d0562d8534ab198551b7bf8815371152",
    amount: parseUnits("25471.1706", 18),
    vTokenSymbol: "vUSDT",
  },
  {
    borrower: "0x55f6dc97d739f52d66c7332c2f93016a4c9d852d",
    amount: parseUnits("21738.004", 18),
    vTokenSymbol: "vUSDT",
  },
  {
    borrower: "0xb38a6184069cf136ee9d145c6acf564dd10fd195",
    amount: parseUnits("19582.4556", 18),
    vTokenSymbol: "vUSDT",
  },
  {
    borrower: "0x1e85d99e182557960e2b86bb53ca417007eed16a",
    amount: parseUnits("17667.3858", 18),
    vTokenSymbol: "vUSDC",
  },
];

const newExploiterDebts = debts.reduce((acc: { [vTokenSymbol: string]: BigNumber }, { amount, vTokenSymbol }) => {
  acc[vTokenSymbol] = acc[vTokenSymbol] ? acc[vTokenSymbol].add(amount) : amount;
  return acc;
}, {});

forking(35476872, async () => {
  let comptroller: Contract;
  let moveDebtDelegate: Contract;
  let proxyAdmin: Contract;

  let vTokens: { [vTokenSymbol: string]: Contract };
  let underlyings: { [vTokenSymbol: string]: Contract };
  let borrowBalancesBefore: BorrowBalanceRecord[];
  let exploiterDebtsBefore: { [vTokenSymbol: string]: BigNumber };
  let facetAddressBefore: string;

  before(async () => {
    await setMaxStaleCoreAssets(CHAINLINK_ORACLE, NORMAL_TIMELOCK);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    moveDebtDelegate = await ethers.getContractAt(MOVE_DEBT_DELEGATE_ABI, MOVE_DEBT_DELEGATE);
    proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, PROXY_ADMIN);

    facetAddressBefore = (await comptroller.facetAddress(id("_setCollateralFactor(address,uint256)").substring(0, 10)))
      .facetAddress;

    vTokens = Object.fromEntries(
      await Promise.all(
        Object.entries(vBep20TokenAddresses).map(
          async ([vTokenSymbol, vTokenAddress]: [string, string]): Promise<[string, Contract]> => {
            return [vTokenSymbol, await ethers.getContractAt(VTOKEN_ABI, vTokenAddress)];
          },
        ),
      ),
    );

    underlyings = Object.fromEntries(
      await Promise.all(
        Object.entries(vTokens).map(async ([vTokenSymbol, vToken]: [string, Contract]): Promise<[string, Contract]> => {
          return [vTokenSymbol, await ethers.getContractAt(ERC20_ABI, await vToken.underlying())];
        }),
      ),
    );

    // Set zero rate models to prevent interest accruals, so that borrow balance diffs are exact
    const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
    await Promise.all(
      Object.values(vTokens).map(vToken => vToken.connect(timelock)._setInterestRateModel(ZERO_RATE_MODEL)),
    );

    borrowBalancesBefore = await Promise.all(
      debts.map(async ({ borrower, vTokenSymbol }) => ({
        borrower,
        vTokenSymbol,
        borrowBalance: await vTokens[vTokenSymbol].callStatic.borrowBalanceCurrent(borrower),
      })),
    );
    exploiterDebtsBefore = Object.fromEntries(
      await Promise.all(
        Object.entries(vTokens).map(
          async ([vTokenSymbol, vToken]: [string, Contract]): Promise<[string, BigNumber]> => {
            return [vTokenSymbol, await vToken.callStatic.borrowBalanceCurrent(EXPLOITER_WALLET)];
          },
        ),
      ),
    );
  });

  testVip("VIP-244", await vip244());

  describe("Generic tests", async () => {
    checkCorePoolComptroller();
  });

  describe("Borrow balances", () => {
    debts.map(({ borrower, amount, vTokenSymbol }) => {
      it(`decreases the borrow balance of ${borrower} in ${vTokenSymbol} by ${formatUnits(amount, 18)}`, async () => {
        const borrowBalanceAfter = await vTokens[vTokenSymbol].callStatic.borrowBalanceCurrent(borrower);
        const { borrowBalance: borrowBalanceBefore } = borrowBalancesBefore.find(
          r => r.borrower === borrower && r.vTokenSymbol == vTokenSymbol,
        )!;
        expect(borrowBalanceBefore.sub(borrowBalanceAfter)).to.equal(amount);
      });
    });

    Object.entries(newExploiterDebts).map(([vTokenSymbol, newDebt]) => {
      it(`increases the borrow balance of the exploiter wallet in ${vTokenSymbol} by ${formatUnits(
        newDebt,
        18,
      )}`, async () => {
        const borrowBalanceAfter = await vTokens[vTokenSymbol].callStatic.borrowBalanceCurrent(EXPLOITER_WALLET);
        const borrowBalanceBefore = exploiterDebtsBefore[vTokenSymbol];
        expect(borrowBalanceAfter.sub(borrowBalanceBefore)).to.equal(newDebt);
      });
    });
  });

  describe("Cleanup", () => {
    it("has the original implementation for _setCollateralFactor", async () => {
      const { facetAddress } = await comptroller.facetAddress(
        id("_setCollateralFactor(address,uint256)").substring(0, 10),
      );
      expect(facetAddress).to.equal(facetAddressBefore);
    });

    it("sets the collateral factor of vBNB back to 0.78", async () => {
      expect((await comptroller.markets(VBNB)).collateralFactorMantissa).to.equal(parseUnits("0.78", 18));
    });

    it("restores the original MoveDebtDelegate implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(MOVE_DEBT_DELEGATE)).to.equal(ORIGINAL_MOVE_DEBT_DELEGATE_IMPL);
    });

    Object.keys(vBep20TokenAddresses).map(vTokenSymbol => {
      it(`restores the approvals of ${vTokenSymbol} underlying to zero`, async () => {
        const allowance = await underlyings[vTokenSymbol].allowance(NORMAL_TIMELOCK, MOVE_DEBT_DELEGATE);
        expect(allowance).to.equal(0);
      });
    });
  });

  describe("Enabling vUSDT/vUSDC repayments for the exploiter", () => {
    it("allows USDT repayments", async () => {
      expect(await moveDebtDelegate.repaymentAllowed(VUSDT, EXPLOITER_WALLET)).to.be.true;
    });

    it("allows USDC repayments", async () => {
      expect(await moveDebtDelegate.repaymentAllowed(VUSDC, EXPLOITER_WALLET)).to.be.true;
    });
  });
});
