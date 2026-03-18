# RPM (RelativePositionManager) VIP Simulation Test Guide

## Purpose

This guide explains how to write **VIP simulation tests** in the `vips` repo that exercise the **RelativePositionManager (RPM)** end-to-end on a mainnet fork. Unlike the fork tests in `venus-periphery` (which deploy RPM fresh), VIP simulations use **already-deployed contracts** on-chain.

The goal is to write tests for six core scenarios:

1. **Close with Profit** (favorable price movement)
2. **Close with Loss** (unfavorable price movement)
3. **Liquidation** (position becomes underwater)
4. **Scale Position** (increase leverage on existing position)
5. **Partial Close** (close a fraction of position, verify remainder)
6. **LONG = DSA Token** (special code path when long token equals DSA token)

---

## Key Differences: venus-periphery Fork Tests vs VIP Simulations

| Aspect                    | venus-periphery Fork Tests                   | VIP Simulation Tests                                                   |
| ------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| RPM contract              | Deployed fresh via `upgrades.deployProxy()`  | Already deployed on mainnet, use address directly                      |
| ACM permissions           | Granted manually in setup                    | Already configured (or configured by VIP under test)                   |
| PositionAccount impl      | Set in test setup                            | Already set (or set by VIP)                                            |
| DSA VTokens               | Added in test setup                          | Already configured (or configured by VIP)                              |
| SwapHelper                | Uses mainnet deployed contract               | Same - uses mainnet deployed contract                                  |
| LeverageStrategiesManager | Uses mainnet deployed contract               | Same - uses mainnet deployed contract                                  |
| Test framework            | `loadFixture` + `forking()` from local utils | `forking()` + `testVip()` from `src/vip-framework`                     |
| Running                   | `FORKED_NETWORK=bscmainnet npx hardhat test` | `npx hardhat test simulations/vip-XXX/bscmainnet.ts --fork bscmainnet` |

---

## Deployed Contract Addresses (BSC Mainnet)

```typescript
// RPM System (from venus-periphery deployments)
const RELATIVE_POSITION_MANAGER = "0xedcD8725D08585A7B61eE77A22D9cf591C1171c1";
const POSITION_ACCOUNT_IMPL = "0x18970e10B39BDf6981334b5DC0873d85CFdB9aa0";
const SWAP_HELPER = "0xD79be25aEe798Aa34A9Ba1230003d7499be29A24";
const LEVERAGE_STRATEGIES_MANAGER = "0x03F079E809185a669Ca188676D0ADb09cbAd6dC1";

// Venus Core Pool (BSC Mainnet)
const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

// Tokens & Markets (example trio: USDC as DSA, WBNB as LONG, ETH as SHORT)
const DSA_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"; // USDC
const vDSA_ADDRESS = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8"; // vUSDC
const LONG_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // WBNB
const vLONG_ADDRESS = "0x6bCa74586218dB34cdB402295796b79663d816e9"; // vWBNB
const SHORT_ADDRESS = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"; // ETH
const vSHORT_ADDRESS = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8"; // vETH

// Whales for funding
const DSA_WHALE = DSA_ADDRESS; // Token contract itself holds supply
const SHORT_WHALE = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3"; // Binance 8 (for ETH)

// Oracle
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
```

---

## File Structure

```
vips/
├── vips/vip-XXX/
│   └── bscmainnet.ts              # VIP definition (if RPM config changes needed)
├── simulations/vip-XXX/
│   ├── bscmainnet.ts              # Main simulation test file
│   └── abi/
│       ├── RelativePositionManager.json   # RPM ABI
│       ├── LeverageStrategiesManager.json # LSM ABI
│       ├── SwapHelper.json                # SwapHelper ABI
│       ├── Comptroller.json               # Comptroller ABI
│       ├── VBep20.json                    # vToken ABI
│       ├── ChainlinkOracle.json           # For price manipulation
│       └── ResilientOracle.json           # For oracle config
```

### Getting ABIs

Export ABIs from venus-periphery compiled artifacts:

```bash
# From venus-periphery repo
cat artifacts/contracts/RelativePositionManager.sol/RelativePositionManager.json | jq '.abi' > RelativePositionManager.json
cat artifacts/contracts/LeverageStrategiesManager.sol/LeverageStrategiesManager.json | jq '.abi' > LeverageStrategiesManager.json
```

Or copy existing ABIs from `vips/simulations/vip-610/abi/`.

---

## Core Helper Functions

### 1. `setMaxStalePeriod` - Prevent Oracle Staleness Reverts

On a forked network, oracle prices may be stale. Set max stale period to 1 year for all relevant tokens.

```typescript
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";

const REDSTONE = "0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a";
const CHAINLINK = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const BINANCE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const ONE_YEAR = "31536000";

async function setMaxStalePeriod(): Promise<void> {
  const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("2"));

  const chainlinkOracle = new ethers.Contract(CHAINLINK, CHAINLINK_ORACLE_ABI, timelock);
  const redStoneOracle = new ethers.Contract(REDSTONE, CHAINLINK_ORACLE_ABI, timelock);
  const binanceOracle = new ethers.Contract(BINANCE, BINANCE_ORACLE_ABI, timelock);

  const tokens = [
    {
      asset: DSA_ADDRESS,
      chainlinkFeed: "0x51597f405303C4377E36123cBc172b13269EA163",
      redstoneFeed: "0xeA2511205b959548459A01e358E0A30424dc0B70",
      binanceSymbol: "USDC",
    },
    {
      asset: LONG_ADDRESS,
      chainlinkFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
      redstoneFeed: "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e",
      binanceSymbol: "WBNB",
    },
    {
      asset: SHORT_ADDRESS,
      chainlinkFeed: "0xe48a5Fd74d4A5524D76960ef3B52204C0e11fCD1",
      redstoneFeed: "0x9cF19D284862A66378c304ACAcB0E857EBc3F856",
      binanceSymbol: "ETH",
    },
  ];

  for (const token of tokens) {
    await chainlinkOracle.setTokenConfig({ asset: token.asset, feed: token.chainlinkFeed, maxStalePeriod: ONE_YEAR });
    await redStoneOracle.setTokenConfig({ asset: token.asset, feed: token.redstoneFeed, maxStalePeriod: ONE_YEAR });
    await binanceOracle.setMaxStalePeriod(token.binanceSymbol, ONE_YEAR);
  }
  await binanceOracle.setMaxStalePeriod("BNB", ONE_YEAR);
}
```

### 2. `getManipulatedSwapData` - Simulate Specific Swap Outcomes

Instead of hitting the real Venus swap API (which may fail in test), manipulate swaps to produce exact output amounts. This lets you control profit/loss scenarios precisely.

```typescript
import { BigNumber, Wallet } from "ethers";

let saltCounter = 0;

async function getManipulatedSwapData(
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  amountOut: BigNumber,
  recipient: string,
  tokenOutWhaleOverride?: string,
): Promise<string> {
  // Use a known private key for signing (hardhat default account #0)
  const swapSignerWallet = new Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    ethers.provider,
  );

  const swapHelperContract = new ethers.Contract(SWAP_HELPER, SWAP_HELPER_ABI, ethers.provider);

  // Set our wallet as backend signer
  const swapHelperOwner = await swapHelperContract.owner();
  const impersonatedOwner = await initMainnetUser(swapHelperOwner, ethers.utils.parseEther("1"));
  await swapHelperContract.connect(impersonatedOwner).setBackendSigner(swapSignerWallet.address);

  // Get EIP712 domain
  const domain = await swapHelperContract.eip712Domain();
  const network = await ethers.provider.getNetwork();
  const eip712Domain = {
    name: domain.name,
    version: domain.version,
    chainId: network.chainId,
    verifyingContract: domain.verifyingContract,
  };

  const TEN_YEARS_SECS = 10 * 365 * 24 * 60 * 60;
  const deadline = Math.floor(Date.now() / 1000) + TEN_YEARS_SECS;

  // Fund SwapHelper with tokenOut so it can "swap"
  const tokenOutContract = new ethers.Contract(tokenOut, ERC20_ABI, ethers.provider);
  const tokenOutWhale = tokenOutWhaleOverride ?? tokenOut;
  const whaleSigner = await initMainnetUser(tokenOutWhale, ethers.utils.parseEther("1"));
  await tokenOutContract.connect(whaleSigner).transfer(SWAP_HELPER, amountOut);

  // Encode a simple transfer call (fake swap: just transfer tokenOut to recipient)
  const tokenOutIface = new ethers.utils.Interface(["function transfer(address to, uint256 amount) returns (bool)"]);
  const transferCalldata = tokenOutIface.encodeFunctionData("transfer", [recipient, amountOut]);

  const swapHelperIface = swapHelperContract.interface;
  const calls: string[] = [];
  calls.push(swapHelperIface.encodeFunctionData("genericCall", [tokenOut, transferCalldata]));

  const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["uint256"], [++saltCounter]));

  const types = {
    Multicall: [
      { name: "caller", type: "address" },
      { name: "calls", type: "bytes[]" },
      { name: "deadline", type: "uint256" },
      { name: "salt", type: "bytes32" },
    ],
  };

  const value = { caller: recipient, calls, deadline, salt };
  const signature = await swapSignerWallet._signTypedData(eip712Domain, types, value);

  return swapHelperIface.encodeFunctionData("multicall", [calls, deadline, salt, signature]);
}
```

### 3. `getSwapData` - Real Swap via Venus API (Optional)

For tests that need real DEX routing (more realistic but slower and may fail if API is down):

```typescript
async function getSwapData(
  tokenIn: string,
  tokenOut: string,
  exactAmountInMantissa: string,
  recipient: string,
  slippagePercentage: string,
): Promise<{ swapData: string; minAmountOut: BigNumber }> {
  // Same as venus-periphery fork test - calls https://api.venus.io/find-swap
  // Signs multicall with EIP712
  // Returns encoded multicall data + minAmountOut
  // See venus-periphery/tests/hardhat/Fork/RelativePositionManager.ts lines 85-176
}
```

### 4. `setOraclePrice` - Manipulate Token Prices (For Liquidation)

```typescript
async function setOraclePrice(comptroller: Contract, asset: string, price: BigNumber): Promise<void> {
  const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
  const resilientOracleAddr = await comptroller.oracle();

  const resilientOracle = new ethers.Contract(
    resilientOracleAddr,
    [
      "function setTokenConfig((address asset, address[3] oracles, bool[3] enableFlagsForOracles, bool cachingEnabled))",
    ],
    timelock,
  );

  // Point oracle to only use Chainlink (so we can manipulate via setDirectPrice)
  await resilientOracle.setTokenConfig({
    asset,
    oracles: [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
    enableFlagsForOracles: [true, false, false],
    cachingEnabled: false,
  });

  const chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, timelock);
  await chainlinkOracle.setDirectPrice(asset, price);
}
```

---

## Test Scenarios

### Scenario 1: Close with Profit

**Flow**: Open position -> Price moves favorably -> Close with profit -> Validate

```typescript
it("open position and close with profit", async () => {
  const rpm = new ethers.Contract(RELATIVE_POSITION_MANAGER, RPM_ABI, ethers.provider);
  const leverageManager = new ethers.Contract(LEVERAGE_STRATEGIES_MANAGER, LSM_ABI, ethers.provider);
  const [, alice] = await ethers.getSigners();

  const INITIAL_PRINCIPAL = ethers.utils.parseEther("9000");
  const SHORT_AMOUNT = ethers.utils.parseEther("4");
  const leverage = ethers.utils.parseEther("1.5");
  const closeFractionBps = 10000; // Full close

  // --- STEP 1: Fund Alice with DSA (USDC) ---
  const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
  const dsa = new ethers.Contract(DSA_ADDRESS, ERC20_ABI, whaleSigner);
  await dsa.transfer(alice.address, INITIAL_PRINCIPAL);
  await dsa.connect(alice).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

  // --- STEP 2: Activate + Open Position ---
  // Use manipulated swap: SHORT_AMOUNT ETH -> some WBNB amount
  const longAmount = ethers.utils.parseEther("30"); // Expected WBNB from swap
  const minLong = longAmount.mul(98).div(100);

  const openSwapData = await getManipulatedSwapData(
    SHORT_ADDRESS, // tokenIn (ETH)
    LONG_ADDRESS, // tokenOut (WBNB)
    SHORT_AMOUNT, // amountIn
    longAmount, // amountOut
    leverageManager.address,
    vLONG_ADDRESS, // whale override (vToken holds underlying)
  );

  await rpm.connect(alice).activateAndOpenPosition(
    vLONG_ADDRESS, // longVToken
    vSHORT_ADDRESS, // shortVToken
    0, // dsaIndex
    INITIAL_PRINCIPAL, // initialPrincipal (must be > 0)
    leverage, // effectiveLeverage
    SHORT_AMOUNT, // shortAmount
    minLong, // minLongAmount
    openSwapData, // swapData
  );

  // --- STEP 3: Record post-open state ---
  const position = await rpm.getPosition(alice.address, vLONG_ADDRESS, vSHORT_ADDRESS);
  const positionAccount = position.positionAccount;
  expect(position.isActive).to.eq(true);

  const shortVToken = new ethers.Contract(vSHORT_ADDRESS, VTOKEN_ABI, ethers.provider);
  const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
  const longBalanceAfterOpen = await rpm.callStatic.getLongCollateralBalance(
    alice.address,
    vLONG_ADDRESS,
    vSHORT_ADDRESS,
  );

  // --- STEP 4: Close with Profit ---
  // Simulate favorable price: use 75% of long to repay all debt, 25% is profit
  const longForRepay = longBalanceAfterOpen.mul(75).div(100);
  const longForProfit = longBalanceAfterOpen.sub(longForRepay);

  // Buffer for full close (2.2% = 2% contract tolerance + 0.2% interest)
  const shortRepayAmount = shortDebtAfterOpen.mul(1022).div(1000);

  const repaySwapData = await getManipulatedSwapData(
    LONG_ADDRESS,
    SHORT_ADDRESS,
    longForRepay,
    shortRepayAmount,
    leverageManager.address,
  );

  // Profit: LONG -> DSA (goes to RPM, then supplied as principal)
  const estimatedProfitDsa = longForProfit.mul(500); // ~500 USDC per WBNB rough estimate
  const profitSwapData = await getManipulatedSwapData(
    LONG_ADDRESS,
    DSA_ADDRESS,
    longForProfit,
    estimatedProfitDsa,
    rpm.address, // RPM receives profit, supplies as principal
  );

  await rpm.connect(alice).closeWithProfit(
    vLONG_ADDRESS,
    vSHORT_ADDRESS,
    closeFractionBps,
    longForRepay, // longAmountToRedeemForRepay
    shortRepayAmount, // minAmountOutRepay
    repaySwapData,
    longForProfit, // longAmountToRedeemForProfit
    estimatedProfitDsa.mul(98).div(100), // minAmountOutProfit
    profitSwapData,
  );

  // --- VALIDATION ---
  const shortDebtAfterClose = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
  const longBalanceAfterClose = await rpm.callStatic.getLongCollateralBalance(
    alice.address,
    vLONG_ADDRESS,
    vSHORT_ADDRESS,
  );

  expect(shortDebtAfterClose).to.eq(0, "All debt repaid");
  expect(longBalanceAfterClose).to.eq(0, "All long redeemed");
});
```

### Scenario 2: Close with Loss

**Flow**: Open position -> Price moves unfavorably -> Close with loss (use DSA to cover shortfall) -> Validate

```typescript
it("open position and close with loss", async () => {
  const rpm = new ethers.Contract(RELATIVE_POSITION_MANAGER, RPM_ABI, ethers.provider);
  const leverageManager = new ethers.Contract(LEVERAGE_STRATEGIES_MANAGER, LSM_ABI, ethers.provider);
  const [, alice] = await ethers.getSigners();

  const INITIAL_PRINCIPAL = ethers.utils.parseEther("15000");
  const SHORT_AMOUNT = ethers.utils.parseEther("3");
  const leverage = ethers.utils.parseEther("3");
  const closeFractionBps = 10000; // Full close

  // --- STEP 1: Fund + Open (same pattern as profit test) ---
  const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
  const dsa = new ethers.Contract(DSA_ADDRESS, ERC20_ABI, whaleSigner);
  await dsa.transfer(alice.address, INITIAL_PRINCIPAL);
  await dsa.connect(alice).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

  const longAmount = ethers.utils.parseEther("25");
  const openSwapData = await getManipulatedSwapData(
    SHORT_ADDRESS,
    LONG_ADDRESS,
    SHORT_AMOUNT,
    longAmount,
    leverageManager.address,
    vLONG_ADDRESS,
  );

  await rpm
    .connect(alice)
    .activateAndOpenPosition(
      vLONG_ADDRESS,
      vSHORT_ADDRESS,
      0,
      INITIAL_PRINCIPAL,
      leverage,
      SHORT_AMOUNT,
      longAmount.mul(98).div(100),
      openSwapData,
    );

  const position = await rpm.getPosition(alice.address, vLONG_ADDRESS, vSHORT_ADDRESS);
  const positionAccount = position.positionAccount;

  const shortVToken = new ethers.Contract(vSHORT_ADDRESS, VTOKEN_ABI, ethers.provider);
  const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
  const longBalanceAfterOpen = await rpm.callStatic.getLongCollateralBalance(
    alice.address,
    vLONG_ADDRESS,
    vSHORT_ADDRESS,
  );

  // --- STEP 2: Close with Loss ---
  // Simulate 20% loss: swapping all LONG only gets 80% of SHORT needed
  const shortAmountFromLongSwap = shortDebtAfterOpen.mul(80).div(100);
  const shortfall = shortDebtAfterOpen.sub(shortAmountFromLongSwap);

  // First swap: LONG -> SHORT (with 20% loss)
  const firstSwapData = await getManipulatedSwapData(
    LONG_ADDRESS,
    SHORT_ADDRESS,
    longBalanceAfterOpen,
    shortAmountFromLongSwap,
    leverageManager.address,
  );

  // Second swap: DSA -> SHORT (to cover shortfall from principal)
  const dsaAmountToSwap = INITIAL_PRINCIPAL.mul(25).div(100);
  // Buffer for full close: 2.2%
  const shortFromDsaSwap = shortfall.mul(1022).div(1000);

  const secondSwapData = await getManipulatedSwapData(
    DSA_ADDRESS,
    SHORT_ADDRESS,
    dsaAmountToSwap,
    shortFromDsaSwap,
    leverageManager.address,
  );

  await rpm.connect(alice).closeWithLoss(
    vLONG_ADDRESS,
    vSHORT_ADDRESS,
    closeFractionBps,
    longBalanceAfterOpen, // longAmountToRedeemForFirstSwap
    shortAmountFromLongSwap, // shortAmountToRepayForFirstSwap
    shortAmountFromLongSwap, // minAmountOutFirstSwap
    firstSwapData,
    dsaAmountToSwap, // dsaAmountToRedeemForSecondSwap
    shortFromDsaSwap, // minAmountOutSecondSwap
    secondSwapData,
  );

  // --- VALIDATION ---
  const shortDebtAfterClose = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
  const longBalanceAfterClose = await rpm.callStatic.getLongCollateralBalance(
    alice.address,
    vLONG_ADDRESS,
    vSHORT_ADDRESS,
  );

  expect(shortDebtAfterClose).to.eq(0, "All debt repaid");
  expect(longBalanceAfterClose).to.eq(0, "All long redeemed");

  // Optional: deactivate and verify principal withdrawal
  await rpm.connect(alice).deactivatePosition(vLONG_ADDRESS, vSHORT_ADDRESS);
  const positionAfter = await rpm.getPosition(alice.address, vLONG_ADDRESS, vSHORT_ADDRESS);
  expect(positionAfter.isActive).to.eq(false);
});
```

### Scenario 3: Liquidation

**Flow**: Open position -> Crash LONG price via oracle manipulation -> External liquidator calls `liquidateBorrow` -> Validate seized collateral

```typescript
it("liquidate position after price crash", async () => {
  const rpm = new ethers.Contract(RELATIVE_POSITION_MANAGER, RPM_ABI, ethers.provider);
  const leverageManager = new ethers.Contract(LEVERAGE_STRATEGIES_MANAGER, LSM_ABI, ethers.provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  const [, alice, liquidator] = await ethers.getSigners();

  // --- STEP 1: Open a highly leveraged position ---
  const INITIAL_PRINCIPAL = ethers.utils.parseEther("1500");
  const SHORT_AMOUNT = ethers.utils.parseEther("1.5");
  const leverage = ethers.utils.parseEther("3");

  const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
  const dsa = new ethers.Contract(DSA_ADDRESS, ERC20_ABI, whaleSigner);
  await dsa.transfer(alice.address, INITIAL_PRINCIPAL);
  await dsa.connect(alice).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

  const longAmount = ethers.utils.parseEther("30");
  const openSwapData = await getManipulatedSwapData(
    SHORT_ADDRESS,
    LONG_ADDRESS,
    SHORT_AMOUNT,
    longAmount,
    leverageManager.address,
    vLONG_ADDRESS,
  );

  await rpm
    .connect(alice)
    .activateAndOpenPosition(
      vLONG_ADDRESS,
      vSHORT_ADDRESS,
      0,
      INITIAL_PRINCIPAL,
      leverage,
      SHORT_AMOUNT,
      longAmount.mul(98).div(100),
      openSwapData,
    );

  const position = await rpm.getPosition(alice.address, vLONG_ADDRESS, vSHORT_ADDRESS);
  const positionAccount = position.positionAccount;

  const shortVToken = new ethers.Contract(vSHORT_ADDRESS, VTOKEN_ABI, ethers.provider);
  const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);

  // --- STEP 2: Set liquidator contract (required by Venus Core Pool) ---
  const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
  await comptroller.connect(timelock)._setLiquidatorContract(liquidator.address);

  // --- STEP 3: Fund liquidator with SHORT tokens ---
  const shortToken = new ethers.Contract(SHORT_ADDRESS, ERC20_ABI, ethers.provider);
  const shortWhaleSigner = await initMainnetUser(SHORT_WHALE, ethers.utils.parseEther("1"));
  await shortToken.connect(shortWhaleSigner).transfer(liquidator.address, ethers.utils.parseEther("10"));

  // --- STEP 4: Crash LONG (WBNB) price by 90% to make position liquidatable ---
  const oracleAddr = await comptroller.oracle();
  const oracle = new ethers.Contract(
    oracleAddr,
    ["function getPrice(address) view returns (uint256)"],
    ethers.provider,
  );
  const wbnbPrice = await oracle.getPrice(LONG_ADDRESS);
  await setOraclePrice(comptroller, LONG_ADDRESS, wbnbPrice.mul(10).div(100)); // 90% drop

  // Verify position is liquidatable
  const [, , shortfall] = await comptroller.getAccountLiquidity(positionAccount);
  expect(shortfall).to.be.gt(0, "Position should be liquidatable");

  // --- STEP 5: Liquidate ---
  const repayAmount = shortDebtAfterOpen.div(4); // Liquidate 25% of debt
  await shortToken.connect(liquidator).approve(vSHORT_ADDRESS, repayAmount);

  const dsaVToken = new ethers.Contract(vDSA_ADDRESS, VTOKEN_ABI, ethers.provider);
  const liquidatorVTokenBefore = await dsaVToken.balanceOf(liquidator.address);

  const shortVTokenAsLiquidator = new ethers.Contract(vSHORT_ADDRESS, VBEP20_ABI, liquidator);
  await shortVTokenAsLiquidator.liquidateBorrow(
    positionAccount,
    repayAmount,
    vDSA_ADDRESS, // Seize DSA collateral (or use vLONG_ADDRESS to seize LONG)
  );

  // --- VALIDATION ---
  const shortDebtAfterLiq = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
  const liquidatorVTokenAfter = await dsaVToken.balanceOf(liquidator.address);

  expect(shortDebtAfterLiq).to.be.lt(shortDebtAfterOpen, "Debt should decrease");
  expect(liquidatorVTokenAfter).to.be.gt(liquidatorVTokenBefore, "Liquidator received seized vTokens");
});
```

### Scenario 4: Scale Position (Increase Leverage)

**Flow**: Open position -> Scale up (add more leverage) -> Validate increased debt and long balance

```typescript
it("open position and scale up", async () => {
  const rpm = new ethers.Contract(RELATIVE_POSITION_MANAGER, RPM_ABI, ethers.provider);
  const leverageManager = new ethers.Contract(LEVERAGE_STRATEGIES_MANAGER, LSM_ABI, ethers.provider);
  const [, alice] = await ethers.getSigners();

  const INITIAL_PRINCIPAL = ethers.utils.parseEther("10000");
  const SHORT_AMOUNT = ethers.utils.parseEther("3");
  const leverage = ethers.utils.parseEther("2");

  // --- STEP 1: Fund + Open initial position ---
  const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
  const dsa = new ethers.Contract(DSA_ADDRESS, ERC20_ABI, whaleSigner);
  await dsa.transfer(alice.address, INITIAL_PRINCIPAL.mul(2)); // Extra for scaling
  await dsa.connect(alice).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL.mul(2));

  const longAmount = ethers.utils.parseEther("25");
  const openSwapData = await getManipulatedSwapData(
    SHORT_ADDRESS,
    LONG_ADDRESS,
    SHORT_AMOUNT,
    longAmount,
    leverageManager.address,
    vLONG_ADDRESS,
  );

  await rpm
    .connect(alice)
    .activateAndOpenPosition(
      vLONG_ADDRESS,
      vSHORT_ADDRESS,
      0,
      INITIAL_PRINCIPAL,
      leverage,
      SHORT_AMOUNT,
      longAmount.mul(98).div(100),
      openSwapData,
    );

  const position = await rpm.getPosition(alice.address, vLONG_ADDRESS, vSHORT_ADDRESS);
  const positionAccount = position.positionAccount;

  const shortVToken = new ethers.Contract(vSHORT_ADDRESS, VTOKEN_ABI, ethers.provider);
  const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
  const longBalanceAfterOpen = await rpm.callStatic.getLongCollateralBalance(
    alice.address,
    vLONG_ADDRESS,
    vSHORT_ADDRESS,
  );

  // --- STEP 2: Scale position (borrow more SHORT, swap to more LONG) ---
  const ADDITIONAL_PRINCIPAL = ethers.utils.parseEther("5000");
  const SCALE_SHORT_AMOUNT = ethers.utils.parseEther("2");
  const scaleLongAmount = ethers.utils.parseEther("18");

  const scaleSwapData = await getManipulatedSwapData(
    SHORT_ADDRESS,
    LONG_ADDRESS,
    SCALE_SHORT_AMOUNT,
    scaleLongAmount,
    leverageManager.address,
    vLONG_ADDRESS,
  );

  await rpm.connect(alice).scalePosition(
    vLONG_ADDRESS, // longVToken
    vSHORT_ADDRESS, // shortVToken
    ADDITIONAL_PRINCIPAL, // additionalPrincipal (can be 0 if not adding more)
    SCALE_SHORT_AMOUNT, // shortAmount
    scaleLongAmount.mul(98).div(100), // minLongAmount
    scaleSwapData, // swapData
  );

  // --- VALIDATION ---
  const shortDebtAfterScale = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
  const longBalanceAfterScale = await rpm.callStatic.getLongCollateralBalance(
    alice.address,
    vLONG_ADDRESS,
    vSHORT_ADDRESS,
  );

  // Debt should increase by approximately SCALE_SHORT_AMOUNT
  const expectedTotalDebt = shortDebtAfterOpen.add(SCALE_SHORT_AMOUNT);
  const debtTolerance = expectedTotalDebt.mul(1).div(100); // 1% tolerance
  expect(shortDebtAfterScale).to.be.closeTo(expectedTotalDebt, debtTolerance);

  // Long balance should increase by approximately scaleLongAmount
  const expectedTotalLong = longBalanceAfterOpen.add(scaleLongAmount);
  const longTolerance = expectedTotalLong.mul(2).div(100); // 2% tolerance
  expect(longBalanceAfterScale).to.be.closeTo(expectedTotalLong, longTolerance);

  // Position should still be active
  const positionAfterScale = await rpm.getPosition(alice.address, vLONG_ADDRESS, vSHORT_ADDRESS);
  expect(positionAfterScale.isActive).to.eq(true);
});
```

### Scenario 5: Partial Close (Profit or Loss)

**Flow**: Open position -> Partial close (e.g., 30-50%) -> Validate remaining balances are proportional

```typescript
it("open position and partial close with profit (50%)", async () => {
  const rpm = new ethers.Contract(RELATIVE_POSITION_MANAGER, RPM_ABI, ethers.provider);
  const leverageManager = new ethers.Contract(LEVERAGE_STRATEGIES_MANAGER, LSM_ABI, ethers.provider);
  const [, alice] = await ethers.getSigners();

  const INITIAL_PRINCIPAL = ethers.utils.parseEther("9000");
  const SHORT_AMOUNT = ethers.utils.parseEther("4");
  const leverage = ethers.utils.parseEther("1.5");
  const closeFractionBps = 5000; // 50% partial close

  // --- STEP 1: Fund + Open (same as full close) ---
  const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
  const dsa = new ethers.Contract(DSA_ADDRESS, ERC20_ABI, whaleSigner);
  await dsa.transfer(alice.address, INITIAL_PRINCIPAL);
  await dsa.connect(alice).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

  const longAmount = ethers.utils.parseEther("30");
  const openSwapData = await getManipulatedSwapData(
    SHORT_ADDRESS,
    LONG_ADDRESS,
    SHORT_AMOUNT,
    longAmount,
    leverageManager.address,
    vLONG_ADDRESS,
  );

  await rpm
    .connect(alice)
    .activateAndOpenPosition(
      vLONG_ADDRESS,
      vSHORT_ADDRESS,
      0,
      INITIAL_PRINCIPAL,
      leverage,
      SHORT_AMOUNT,
      longAmount.mul(98).div(100),
      openSwapData,
    );

  const position = await rpm.getPosition(alice.address, vLONG_ADDRESS, vSHORT_ADDRESS);
  const positionAccount = position.positionAccount;

  const shortVToken = new ethers.Contract(vSHORT_ADDRESS, VTOKEN_ABI, ethers.provider);
  const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
  const longBalanceAfterOpen = await rpm.callStatic.getLongCollateralBalance(
    alice.address,
    vLONG_ADDRESS,
    vSHORT_ADDRESS,
  );

  // --- STEP 2: Partial Close with Profit (50%) ---
  // Proportional amounts based on close fraction
  const expectedLongToRedeem = longBalanceAfterOpen.mul(closeFractionBps).div(10000);
  const expectedShortToRepay = shortDebtAfterOpen.mul(closeFractionBps).div(10000);

  // Favorable price: 80% of redeemed long covers repay, 20% is profit
  const longForRepay = expectedLongToRedeem.mul(80).div(100);
  const longForProfit = expectedLongToRedeem.sub(longForRepay);

  // 0.2% buffer for partial close (no 2% contract tolerance like full close)
  const shortRepayAmount = expectedShortToRepay.mul(1002).div(1000);

  const repaySwapData = await getManipulatedSwapData(
    LONG_ADDRESS,
    SHORT_ADDRESS,
    longForRepay,
    shortRepayAmount,
    leverageManager.address,
  );

  const estimatedProfitDsa = longForProfit.mul(500);
  const profitSwapData = await getManipulatedSwapData(
    LONG_ADDRESS,
    DSA_ADDRESS,
    longForProfit,
    estimatedProfitDsa,
    rpm.address,
  );

  await rpm
    .connect(alice)
    .closeWithProfit(
      vLONG_ADDRESS,
      vSHORT_ADDRESS,
      closeFractionBps,
      longForRepay,
      shortRepayAmount,
      repaySwapData,
      longForProfit,
      estimatedProfitDsa.mul(98).div(100),
      profitSwapData,
    );

  // --- VALIDATION ---
  const shortDebtAfterClose = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
  const longBalanceAfterClose = await rpm.callStatic.getLongCollateralBalance(
    alice.address,
    vLONG_ADDRESS,
    vSHORT_ADDRESS,
  );

  // Remaining balances should be ~50% of initial (within 2% tolerance)
  const expectedRemainingDebt = shortDebtAfterOpen.mul(10000 - closeFractionBps).div(10000);
  const expectedRemainingLong = longBalanceAfterOpen.mul(10000 - closeFractionBps).div(10000);

  const debtTolerance = expectedRemainingDebt.mul(2).div(100);
  expect(shortDebtAfterClose).to.be.closeTo(expectedRemainingDebt, debtTolerance);

  const longTolerance = expectedRemainingLong.mul(2).div(100);
  expect(longBalanceAfterClose).to.be.closeTo(expectedRemainingLong, longTolerance);

  // Position should STILL be active (partial close, not full)
  expect(shortDebtAfterClose).to.be.gt(0, "Debt should remain after partial close");
  expect(longBalanceAfterClose).to.be.gt(0, "Long should remain after partial close");

  const positionAfterClose = await rpm.getPosition(alice.address, vLONG_ADDRESS, vSHORT_ADDRESS);
  expect(positionAfterClose.isActive).to.eq(true, "Position stays active after partial close");
});
```

### Scenario 6: LONG = DSA Token (Special Code Path)

When the long token is the same as the DSA token (e.g., both USDC), the contract takes different paths:

- **On close with profit**: no profit swap needed (`"0x"` swap data) - redeemed long IS DSA, supplied directly as principal
- **On close with loss**: second swap redeems from DSA principal (same market as long)
- **On open**: swap output token is DSA, deposited into DSA market (which is also long market)

```typescript
it("close with profit when LONG = DSA (no profit swap needed)", async () => {
  const rpm = new ethers.Contract(RELATIVE_POSITION_MANAGER, RPM_ABI, ethers.provider);
  const leverageManager = new ethers.Contract(LEVERAGE_STRATEGIES_MANAGER, LSM_ABI, ethers.provider);
  const [, alice] = await ethers.getSigners();

  // LONG = DSA = USDC (vDSA market used for both)
  const INITIAL_PRINCIPAL = ethers.utils.parseEther("10000");
  const SHORT_AMOUNT = ethers.utils.parseEther("1");
  const leverage = ethers.utils.parseEther("2");
  const closeFractionBps = 10000; // Full close

  // --- STEP 1: Fund + Open (LONG = DSA) ---
  const whaleSigner = await initMainnetUser(DSA_WHALE, ethers.utils.parseEther("1"));
  const dsa = new ethers.Contract(DSA_ADDRESS, ERC20_ABI, whaleSigner);
  await dsa.transfer(alice.address, INITIAL_PRINCIPAL);
  await dsa.connect(alice).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

  // Swap: SHORT (ETH) -> LONG (USDC, which is DSA)
  const longAmount = ethers.utils.parseEther("4000"); // ~4000 USDC from 1 ETH
  const openSwapData = await getManipulatedSwapData(
    SHORT_ADDRESS,
    DSA_ADDRESS,
    SHORT_AMOUNT,
    longAmount,
    leverageManager.address,
    vDSA_ADDRESS, // whale: vToken holds underlying USDC
  );

  await rpm.connect(alice).activateAndOpenPosition(
    vDSA_ADDRESS, // longVToken = dsaVToken (LONG = DSA)
    vSHORT_ADDRESS,
    0,
    INITIAL_PRINCIPAL,
    leverage,
    SHORT_AMOUNT,
    longAmount.mul(98).div(100),
    openSwapData,
  );

  const position = await rpm.getPosition(alice.address, vDSA_ADDRESS, vSHORT_ADDRESS);
  const positionAccount = position.positionAccount;

  const shortVToken = new ethers.Contract(vSHORT_ADDRESS, VTOKEN_ABI, ethers.provider);
  const dsaVToken = new ethers.Contract(vDSA_ADDRESS, VTOKEN_ABI, ethers.provider);
  const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
  const longBalanceAfterOpen = await rpm.callStatic.getLongCollateralBalance(
    alice.address,
    vDSA_ADDRESS,
    vSHORT_ADDRESS,
  );

  // Accrue interest for accurate balance reads
  await dsaVToken.connect(alice).accrueInterest();
  await shortVToken.connect(alice).accrueInterest();

  // --- STEP 2: Close with Profit (LONG = DSA) ---
  // 80% of long for repay, 20% as profit (no swap needed - it's already DSA)
  const longForRepay = longBalanceAfterOpen.mul(80).div(100);
  const longForProfit = longBalanceAfterOpen.sub(longForRepay);

  // 2.2% buffer for full close
  const shortRepayAmount = shortDebtAfterOpen.mul(1022).div(1000);

  // First swap: LONG (USDC) -> SHORT (ETH) for repay
  const repaySwapData = await getManipulatedSwapData(
    DSA_ADDRESS,
    SHORT_ADDRESS,
    longForRepay,
    shortRepayAmount,
    leverageManager.address,
    vSHORT_ADDRESS, // whale for SHORT
  );

  // KEY DIFFERENCE: When LONG = DSA, profit swap is "0x" (no swap needed)
  // The redeemed long IS DSA, so it's supplied directly as principal
  const profitSwapData = "0x";
  const estimatedProfitDsa = longForProfit; // 1:1, no conversion needed

  const suppliedPrincipalBefore = await rpm.callStatic.getSuppliedPrincipalBalance(
    alice.address,
    vDSA_ADDRESS,
    vSHORT_ADDRESS,
  );

  await rpm.connect(alice).closeWithProfit(
    vDSA_ADDRESS,
    vSHORT_ADDRESS,
    closeFractionBps,
    longForRepay,
    shortRepayAmount,
    repaySwapData,
    longForProfit,
    estimatedProfitDsa, // minAmountOutProfit (exact, no swap)
    profitSwapData, // "0x" - no swap, long is already DSA
  );

  // --- VALIDATION ---
  const shortDebtAfterClose = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
  const longBalanceAfterClose = await rpm.callStatic.getLongCollateralBalance(
    alice.address,
    vDSA_ADDRESS,
    vSHORT_ADDRESS,
  );
  const suppliedPrincipalAfter = await rpm.callStatic.getSuppliedPrincipalBalance(
    alice.address,
    vDSA_ADDRESS,
    vSHORT_ADDRESS,
  );

  expect(shortDebtAfterClose).to.eq(0, "All debt repaid");
  expect(longBalanceAfterClose).to.eq(0, "All long redeemed");

  // Profit (redeemed long) should be added to supplied principal
  const principalIncrease = suppliedPrincipalAfter.sub(suppliedPrincipalBefore);
  const profitTolerance = longForProfit.mul(1).div(10000); // 0.01%
  expect(principalIncrease).to.be.closeTo(
    longForProfit,
    profitTolerance,
    "Profit added to principal (no swap, long IS DSA)",
  );

  // Deactivate to withdraw remaining principal
  await rpm.connect(alice).deactivatePosition(vDSA_ADDRESS, vSHORT_ADDRESS);
  const positionAfter = await rpm.getPosition(alice.address, vDSA_ADDRESS, vSHORT_ADDRESS);
  expect(positionAfter.isActive).to.eq(false);
});
```

**Key differences when LONG = DSA:**

- `longVToken` passed to RPM functions is `vDSA_ADDRESS` (same market for both long and DSA)
- Profit swap data is `"0x"` (redeemed long is already DSA, no conversion needed)
- `estimatedProfitDsa = longForProfit` (1:1, no swap slippage)
- On close with loss, second swap redeems DSA from the same market as long collateral
- `suppliedPrincipalBalance` tracks only the DSA principal portion (separate from long collateral in the same market)

---

## Complete Simulation File Template

```typescript
// simulations/vip-XXX/bscmainnet.ts
import { expect } from "chai";
import { BigNumber, Contract, Wallet } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vipXXX } from "../../vips/vip-XXX/bscmainnet";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import LSM_ABI from "./abi/LeverageStrategiesManager.json";
import RPM_ABI from "./abi/RelativePositionManager.json";
import SWAP_HELPER_ABI from "./abi/SwapHelper.json";
import VTOKEN_ABI from "./abi/VBep20.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// --- Constants (addresses above) ---
// ... paste deployed addresses here ...

// --- Helpers ---
// ... paste helper functions (setMaxStalePeriod, getManipulatedSwapData, setOraclePrice) ...

forking(BLOCK_NUMBER, async () => {
  let rpm: Contract;
  let leverageManager: Contract;
  let comptroller: Contract;

  before(async () => {
    await setMaxStalePeriod();
    rpm = new ethers.Contract(RELATIVE_POSITION_MANAGER, RPM_ABI, ethers.provider);
    leverageManager = new ethers.Contract(LEVERAGE_STRATEGIES_MANAGER, LSM_ABI, ethers.provider);
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  });

  // If there's a VIP to execute first (e.g., adding DSA, setting permissions):
  testVip("VIP-XXX Configure RPM", await vipXXX());

  describe("RPM Position Lifecycle Tests", function () {
    this.timeout(720000); // 12 minutes - fork tests are slow

    it("close with profit", async () => {
      /* ... */
    });
    it("close with loss", async () => {
      /* ... */
    });
    it("liquidation", async () => {
      /* ... */
    });
  });
});
```

---

## Important Notes

### Swap Data Mechanics

- **`getManipulatedSwapData`** is preferred for deterministic tests - it fakes swaps by directly transferring tokens
- The `recipient` for opening swaps is always `leverageManager.address`
- The `recipient` for profit swaps in `closeWithProfit` is `rpm.address` (RPM supplies profit as principal)
- Each swap call needs a unique `salt` (use incrementing counter)
- The SwapHelper backend signer must be set to your test wallet

### Token Whale Overrides

- When using `getManipulatedSwapData`, the function needs to fund SwapHelper with `tokenOut`
- For WBNB, use `vLONG_ADDRESS` (vToken holds underlying) as `tokenOutWhaleOverride`
- For ETH, use `SHORT_WHALE` (Binance hot wallet)
- For USDC, the token contract itself (`DSA_ADDRESS`) often holds supply

### Buffer Amounts

- **Partial close**: 0.2% buffer on repay amounts (for interest accrual during execution)
- **Full close (100%)**: 2.2% buffer (2% contract tolerance + 0.2% interest)
- Always use `.mul(X).div(Y)` for percentage calculations (no floating point)

### Position Lifecycle

1. `activateAndOpenPosition()` - Creates position account (proxy clone), supplies principal, borrows SHORT, swaps to LONG
2. `closeWithProfit()` - Redeems LONG, swaps to SHORT to repay debt, swaps remaining LONG to DSA as profit
3. `closeWithLoss()` - Redeems LONG, swaps to SHORT (insufficient), redeems DSA principal, swaps to SHORT to cover shortfall
4. `deactivatePosition()` - Withdraws remaining principal to user, marks position inactive
5. `liquidateBorrow()` - External call on vToken by liquidator when position is underwater

### Key Gotchas

- `initialPrincipal` MUST be > 0 in `activateAndOpenPosition` (reverts with `InsufficientPrincipal`)
- `_setLiquidatorContract` must be called on Comptroller before liquidation (Venus Core Pool requirement)
- Position stays `isActive = true` even after full close - must explicitly call `deactivatePosition()`
- Oracle manipulation requires impersonating `NORMAL_TIMELOCK`
- Fork block number must be recent enough that RPM contracts are deployed and configured

### Running the Test

```bash
npx hardhat test simulations/vip-XXX/bscmainnet.ts --fork bscmainnet
```
