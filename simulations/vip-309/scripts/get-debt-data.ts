import { BigNumber } from "ethers";
import { Result, formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking } from "../../../src/vip-framework";
import COMPROLLER_ABI from "../abi/Comptroller.json";
import ERC20_ABI from "../abi/IERC20.json";
import VAI_CONTROLLER_ABI from "../abi/VAIController.json";
import VTOKEN_ABI from "../abi/VBep20.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VAI_CONTROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const MULTICALL = "0xcA11bde05977b3631167028862bE2a173976CA11";
const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const ACCOUNT_LENS = "0x9659F447EB89C49E37f49f24979C0ee2c1a3c823";

const MULTICALL_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) public returns (uint256 blockNumber, bytes[] returnData)",
];

const ACCOUNT_LENS_ABI = [
  "function getSupplyAndBorrowsUsd(address comptroller, address account) external view returns (uint256 supplyUsd, uint256 borrowsUsd)",
];

const multicall = new ethers.Contract(MULTICALL, MULTICALL_ABI, ethers.provider);
const comptroller = new ethers.Contract(COMPTROLLER, COMPROLLER_ABI, ethers.provider);
const vaiController = new ethers.Contract(VAI_CONTROLLER, VAI_CONTROLLER_ABI, ethers.provider);
const accountLens = new ethers.Contract(ACCOUNT_LENS, ACCOUNT_LENS_ABI, ethers.provider);

const allAccounts = [
  "0xf2930d76a52857335be3a4147736bfc71c052d0c",
  "0x613592604ff962ad8361719e3953da08d85343d1",
  "0x44099bc16e1603d54b5fec0d19afcc04fc792dcd",
  "0xd745274a69d8fd93071e658e54c832474574fe51",
  "0xa8481e94eeda61e7fdec6e9678daeb677d57e136",
  "0x21f3bb63e775ccdf0cc04559be142971d241ab0e",
  "0x4ac5188c72c3a705d7daad03bdeaf8721a1fd30a",
  "0x058476edacb23e9507cff379e7dd8cf4dee4d2db",
  "0x12a1e05876c41f858bae86c720c197d5986b240d",
  "0xd8f7a0cc1baf9c56f9b48d3de836a21dbc979f1f",
  "0x7678266854f73c625f49069c83de63f26f0174da",
  "0x80a65288848f645cbafbe04c7c07e092df1de01a",
  "0xa7597c542b7edbb3e885b4102ef3f5bebbfc76e2",
  "0xf6099a6e4b5bcfc43c87626d17cc00ac3cdf2d4d",
  "0xaac4ea52570d29e0bddc88b56f05a13c23fb3b66",
  "0xdc9af4213dee2321c0461a59e761f76e4677fdb9",
  "0x9c6b3c2789f807ef10acd6a05de8b6f61b0b6aa3",
  "0x822759d8f48a42b9ff29c040619b5539c31b727b",
  "0x318b939379e79433a6e260adc48ded4daaa9b6d4",
  "0xf57245320d75fa2cb0eacd55055b57e4026dbcc7",
  "0xf37a8fad82771ee2c27b698163646cb99e228ca9",
  "0x21203096218d8761c397d162db7572be7d7c7b8e",
  "0xed5456c84812168584e45a83e8571a5a15485829",
  "0x7464cad56ab234458f0ed51f593f978e7ab9f059",
  "0xe2e6241af754d172f047ea48c950059b5813000f",
  "0xbe243f84611d729ba3ddfefb2d41333bb9cf533f",
  "0x84711eae73dcbf96718c57d55fb8c207dd4e38c4",
  "0xbdbb18c1a16a79510d529cdbc8a425d4aba8477c",
  "0x3b7f525dc67cca55251abb5d04c81a83a6005269",
  "0xbd043882d36b6def4c30f20c613cfa70d3af8bb7",
  "0x6a68b9cf65d64d060854f2cbb6825b6026bde920",
  "0xc3327bbc16644adcb5fd5faa6235718be39916af",
  "0x09fedc780a049c8ac876dc2443ad3146effe3875",
  "0x94061a67e9aafbc9c1366eaab664a4467eaf3f4b",
  "0x4b07cf856920e127cbd262ff3eac81c2f65f74f8",
  "0xd45fbbde3767b68e34cdcbb9dfbe865d3aa0ebb6",
  "0xfa684e2526ac3a68023dd00a563a73a9cfbf3ce9",
  "0x0f2577ccb1e895ed1e8bfd4e709706595831e78a",
  "0x42d4013830885f457b937bf12ba4f97e15c5eaf4",
  "0x17289bd5c7191c28340835166f2322d81a9b1bb7",
  "0xdf915e81acad4587c617122da0046694295d5b5f",
  "0xe42463dd1177485881c97c84c37e75c32078af8c",
  "0x894eb2f36769be80171f9d700b39695c1500b9f6",
  "0x24c0ae3612ca72069a39bb0edeb65357f59d2ec6",
  "0x642873e7abd1d8430fe9990a01ea5cec35e8d0e5",
  "0xef044206db68e40520bfa82d45419d498b4bc7bf",
  "0x3762e67e24b9b44cea8e89163aba9d4015e27d40",
  "0x4f381fb46dfde2bc9dcae2d881705749b1ed6e1a",
  "0x1e803cf10460bcd7235a87527105d1e2a3c6319b",
  "0x99982c26a813b7ffaf4b70ca8c07084d380a5ecf",
  "0x1f6d66ba924ebf554883cf84d482394013ed294b",
  "0x307c56fabc9fec98ff6d8cf06cf5325843623401",
  "0x3bca4d25aa8d75bb7b418e536fc02e4cf035e829",
  "0x49de015ac608d12859b3e531d001ca7d82c9bd9f",
  "0xccd9eb9b3d9e8e7782f85795a882d12649b5f98b",
  "0x88888888897519c77fa529a825cb699136b1adfb",
  "0xb8a7de41a8d28952a4d253f22c4786c6cd65122f",
  "0xa60385ba34e34e7899ceb3e61b367405501d958d",
  "0x70a9b01952a57bfa12eea490c95c13f743c549d7",
  "0xcac00a622290aebab1a0ec0eb649fd630cb998c3",
  "0x7a7c42979883a9964de7f82bd91d0587ab46a1a1",
  "0xcc6c1ad2aefc7ea7a58c2808495ab9ca6bf4cbdd",
  "0xd6a8a9eafaccef0e2f2e87941431712268f5dea1",
  "0x54b63f4bbb0b2ef9d0af0b93016fae8dfde59d37",
  "0x2d796771e3ac310fb4d2cbd40bcae51aa554f37b",
];

interface MarketData {
  address: string;
  exchangeRate: BigNumber;
  symbol: string;
  underlying: string;
}

interface AccountDebtData {
  account: string;
  debt: BigNumber;
}

interface MarketDebtData {
  market: MarketData;
  debts: AccountDebtData[];
  totalDebt: BigNumber;
  totalDebtInVTokens: BigNumber;
}

interface AccountSnapshotUsd {
  account: string;
  supplyUsd: BigNumber;
  borrowsUsd: BigNumber;
}

const getAccountSnapshots = async (accounts: ReadonlyArray<string>): Promise<AccountSnapshotUsd[]> => {
  const [, multicallResult] = await multicall.callStatic.aggregate(
    accounts.map(account => [
      accountLens.address,
      accountLens.interface.encodeFunctionData("getSupplyAndBorrowsUsd", [COMPTROLLER, account]),
    ]),
  );
  const snapshots: AccountSnapshotUsd[] = multicallResult.map(
    (r: Result, i: number): AccountSnapshotUsd => ({
      account: accounts[i],
      supplyUsd: accountLens.interface.decodeFunctionResult("getSupplyAndBorrowsUsd", r).supplyUsd,
      borrowsUsd: accountLens.interface.decodeFunctionResult("getSupplyAndBorrowsUsd", r).borrowsUsd,
    }),
  );
  return snapshots;
};

const getMarketsData = async () => {
  const marketAddresses = await comptroller.getAllMarkets();
  const markets: MarketData[] = [];
  for (const address of marketAddresses) {
    const vToken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
    const exchangeRate = await vToken.callStatic.exchangeRateCurrent();
    const symbol = await vToken.symbol();
    const underlying = address == VBNB ? ethers.constants.AddressZero : await vToken.underlying();
    markets.push({ address, exchangeRate, symbol, underlying });
  }
  return markets;
};

const getMarketDebts = async (market: MarketData, accounts: ReadonlyArray<string>) => {
  const [signer] = await ethers.getSigners();
  const vToken = new ethers.Contract(market.address, VTOKEN_ABI, ethers.provider);
  vToken.connect(signer).accrueInterest();

  const [, multicallResult] = await multicall.callStatic.aggregate(
    accounts.map(account => [market.address, vToken.interface.encodeFunctionData("borrowBalanceStored", [account])]),
  );
  const debts: AccountDebtData[] = multicallResult
    .map(
      (r: string, i: number): AccountDebtData => ({
        account: accounts[i],
        debt: vToken.interface.decodeFunctionResult("borrowBalanceStored", r)[0],
      }),
    )
    .filter((acc: AccountDebtData) => acc.debt.gt(0));
  return debts;
};

const getVAIDebts = async (accounts: ReadonlyArray<string>) => {
  const [signer] = await ethers.getSigners();
  vaiController.connect(signer).accrueVAIInterest();
  const [, multicallResult] = await multicall.callStatic.aggregate(
    accounts.map(account => [
      vaiController.address,
      vaiController.interface.encodeFunctionData("getVAIRepayAmount", [account]),
    ]),
  );
  const debts: AccountDebtData[] = multicallResult
    .map(
      (r: string, i: number): AccountDebtData => ({
        account: accounts[i],
        debt: vaiController.interface.decodeFunctionResult("getVAIRepayAmount", r)[0],
      }),
    )
    .filter((acc: AccountDebtData) => acc.debt.gt(0));
  return debts;
};

const formatDebts = (marketDebtData: MarketDebtData[]) => {
  return Object.fromEntries(
    marketDebtData.map(({ market, debts }: MarketDebtData): [string, Record<string, string>] => {
      const accountDebts = Object.fromEntries(debts.map(({ account, debt }) => [account, debt.toString()]));
      return [market.symbol, accountDebts];
    }),
  );
};

const toVTokens = (underlyingAmount: BigNumber, exchangeRate: BigNumber) => {
  return underlyingAmount.mul(parseUnits("1", 18)).div(exchangeRate);
};

const balanceOf = async (token: string, account: string) => {
  if (token === ethers.constants.AddressZero) {
    return ethers.provider.getBalance(account);
  }
  const erc20 = new ethers.Contract(token, ERC20_ABI, ethers.provider);
  return erc20.balanceOf(account);
};

const computeTreasuryWithdrawals = async (
  marketDebtData: MarketDebtData[],
): Promise<{
  vTokenWithdrawals: Record<string, string>;
  underlyingWithdrawals: Record<string, string>;
  errors: string[];
}> => {
  const vTokenWithdrawals: Record<string, string> = {};
  const underlyingWithdrawals: Record<string, string> = {};
  const errors: string[] = [];
  for (const { market, totalDebt, totalDebtInVTokens } of marketDebtData) {
    const vTokenBalance = await balanceOf(market.address, VTREASURY);
    if (vTokenBalance.gt(totalDebtInVTokens)) {
      const marketLiquidity = await balanceOf(market.underlying, market.address);
      if (marketLiquidity.gt(totalDebt)) {
        vTokenWithdrawals[market.symbol] = totalDebtInVTokens.toString();
        continue;
      } else {
        errors.push(`Insufficient market liquidity to redeem ${market.symbol}`);
      }
    }
    const underlyingBalance = await balanceOf(market.underlying, VTREASURY);
    if (underlyingBalance.gt(totalDebt)) {
      underlyingWithdrawals[market.symbol] = totalDebt.toString();
      continue;
    }
    // We do not try to combine underlying withdrawals and vToken withdrawals
    errors.push(`Insufficient treasury balance to repay ${market.symbol} debt`);
  }
  return { vTokenWithdrawals, underlyingWithdrawals, errors };
};

const sumDebts = (debts: AccountDebtData[]) => {
  return debts.reduce((acc: BigNumber, { debt }: AccountDebtData) => acc.add(debt), BigNumber.from(0));
};

const main = async () => {
  const markets = await getMarketsData();
  const accountSnapshots = await getAccountSnapshots(allAccounts);
  const liquidatableAccountSnapshots = accountSnapshots.filter(({ supplyUsd, borrowsUsd }) =>
    borrowsUsd.lte(supplyUsd),
  );
  const underwaterAccounts = accountSnapshots
    .filter(({ supplyUsd, borrowsUsd }) => borrowsUsd.gt(supplyUsd))
    .map(({ account }) => account);
  console.log("All accounts count", allAccounts.length);
  console.log("Underwater accounts count", underwaterAccounts.length);
  console.log("Excluded the following liquidatable accounts:");
  console.log(
    JSON.stringify(
      liquidatableAccountSnapshots.map(s => ({
        account: s.account,
        supplyUsd: formatUnits(s.supplyUsd, 18),
        borrowsUsd: formatUnits(s.borrowsUsd, 18),
      })),
      null,
      2,
    ),
  );
  const unfilteredMarketDebtData = await Promise.all(
    markets.map(async market => {
      const debts = await getMarketDebts(market, underwaterAccounts);
      const totalDebt = sumDebts(debts);
      const totalDebtInVTokens = toVTokens(totalDebt, market.exchangeRate);
      return { market, debts, totalDebt, totalDebtInVTokens };
    }),
  );
  const marketDebtData = unfilteredMarketDebtData.filter(({ totalDebtInVTokens }) => totalDebtInVTokens.gt(0));
  console.log(JSON.stringify(marketDebtData, null, 2));
  console.log(
    "const tokenConfigs = " +
      JSON.stringify(
        Object.fromEntries(markets.map(({ symbol, address, underlying }) => [symbol, { address, underlying }])),
        null,
        2,
      ),
  );
  console.log("const shortfalls = " + JSON.stringify(formatDebts(marketDebtData), null, 2));
  const { vTokenWithdrawals, underlyingWithdrawals, errors } = await computeTreasuryWithdrawals(marketDebtData);
  console.log("const vTokenWithdrawals = " + JSON.stringify(vTokenWithdrawals, null, 2));
  console.log("const underlyingWithdrawals = " + JSON.stringify(underlyingWithdrawals, null, 2));
  for (const error of errors) {
    console.warn(error);
  }

  const vaiDebts = await getVAIDebts(underwaterAccounts);
  const totalVAIDebt = sumDebts(vaiDebts);
  console.log(
    "const vaiDebts = " +
      JSON.stringify(Object.fromEntries(vaiDebts.map(({ account, debt }) => [account, debt.toString()])), null, 2),
  );
  console.log(`const totalVAIDebt = parseUnits("${formatUnits(totalVAIDebt, 18)}", 18);`);
};

// @kkirka: I couldn't make `hardhat run` preserve the --fork parameter: scripts are launched
// in a subprocess, so the configuration and custom params are reset. Thus, this script expects
// to be run in a test environment (i.e. `npx hardhat test --fork bscmainnet ./get-debt-data.ts`)
forking(38945597, async () => {
  it("prints the data for the VIP", main);
});
