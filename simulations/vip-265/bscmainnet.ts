import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
// imported addresses from converter vip
import {
  BTCBPrimeConverterTokenOuts,
  BaseAssets,
  ETHPrimeConverterTokenOuts,
  RiskFundConverterTokenOuts,
  USDCPrimeConverterTokenOuts,
  USDTPrimeConverterTokenOuts,
  XVSVaultConverterTokenOuts,
  converters,
} from "../../vips/vip-248/vip-248/Addresses";
import {
  LIQUIDATOR_CONTRACT,
  NEW_RISK_FUND_CONVERTER_IMP,
  NEW_SINGLE_TOKEN_CONVERTER_IMP,
  PROXY_ADMIN,
  PROXY_ADMIN_LIQUIDATOR,
  PSR,
  RISK_FUND_CONVERTER_PROXY,
  SINGLE_TOKEN_CONVERTER_BEACON,
  vip265,
} from "../../vips/vip-265/bscmainnet";
import BEACON_ABI from "./abi/Beacon.json";
import DEFAULT_PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import ERC20_ABI from "./abi/ERC20.json";
import LIQUIDATOR_ABI from "./abi/Liquidator.json";
import PROTOCOL_SHARE_RESERVE_ABI from "./abi/ProtocolShareReserve.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import TRANSPARENT_PROXY_ABI from "./abi/TransparentProxyAbi.json";
import VTOKEN_ABI from "./abi/VTOKEN_ABI.json";
import COMPTROLLER_CORE_ABI from "./abi/comptroller.json";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

const ASSETS = [
  "0xfb6115445Bff7b52FeB98650C87f44907E58f802", // AAVE
  "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47", // ADA
  "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf", // BCH
  "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B", // BETH
  "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTCB
  "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", // CAKE
  "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", // DAI
  "0xbA2aE424d960c26247Dd6c32edC70B295c744C43", // DOGE
  "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402", // DOT
  "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // ETH
  "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409", // FDUSD
  "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153", // FIL
  "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", // LINK
  "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94", // LTC
  "0xCC42724C6683B7E57334c4E856f4c9965ED682bD", // MATIC
  "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A", // SXP
  "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3", // TRX
  "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9", // TUSD
  "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1", // UNI
  "0x55d398326f99059fF775485246999027B3197955", // USDT
  "0xa2E3356610840701BDf5611a53974510Ae27E2e1", // WBETH
  "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE", // XRP
  "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63", // XVS
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
];

const PROTOCOL_SHARE_RESERVE_PROXY = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";

function createInitializeData() {
  const iface = new ethers.utils.Interface(LIQUIDATOR_ABI);
  return iface.encodeFunctionData("transferOwnershipToTimelock", [NORMAL_TIMELOCK]);
}

const provider = ethers.provider;
let impersonatedTimelock: Signer;
let proxyAdmin: Contract;
let protocolShareReserve: Contract;
let beacon: Contract;
let liquidator: Contract;

forking(36680347, async () => {
  before(async () => {
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, DEFAULT_PROXY_ADMIN_ABI, provider);
    beacon = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON, BEACON_ABI, provider);
    impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
    liquidator = new ethers.Contract(LIQUIDATOR_CONTRACT, LIQUIDATOR_ABI, provider);

    protocolShareReserve = new ethers.Contract(PROTOCOL_SHARE_RESERVE_PROXY, PROTOCOL_SHARE_RESERVE_ABI, provider);
  });

  testVip("VIP-Converter", await vip265(createInitializeData()), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [TRANSPARENT_PROXY_ABI], ["Upgraded"], [4]);
      await expectEvents(
        txResponse,
        [LIQUIDATOR_ABI],
        ["OwnershipTransferStarted", "OwnershipTransferred", "NewProtocolShareReserve"],
        [1, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("RiskFundConverter and SingleTokenConverter should have new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND_CONVERTER_PROXY)).to.equal(NEW_RISK_FUND_CONVERTER_IMP);
      expect(await beacon.implementation()).to.equal(NEW_SINGLE_TOKEN_CONVERTER_IMP);
    });

    it("updates protocolShareReserveAddress", async () => {
      expect(PSR).to.equal(await liquidator.protocolShareReserve());
    });
  });
});

// Release Fund tests
forking(36680347, async () => {
  before(async () => {
    protocolShareReserve = new ethers.Contract(PROTOCOL_SHARE_RESERVE_PROXY, PROTOCOL_SHARE_RESERVE_ABI, provider);
    await pretendExecutingVip(await vip265(createInitializeData()));
  });

  it("amount out and amount in tests", async () => {
    const convertersTokenOutArray = [
      RiskFundConverterTokenOuts,
      USDTPrimeConverterTokenOuts,
      USDCPrimeConverterTokenOuts,
      BTCBPrimeConverterTokenOuts,
      ETHPrimeConverterTokenOuts,
      XVSVaultConverterTokenOuts,
    ];

    for (let i = 0; i < converters.length; i++) {
      const converterAddress = converters[i];
      const tokenOuts = convertersTokenOutArray[i];

      for (const tokenAddress of tokenOuts) {
        const converter: Contract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, provider);
        const configuration = await converter.conversionConfigurations(BaseAssets[i], tokenAddress);
        if (configuration.conversionAccess == 2) continue;

        const balance = await converter.balanceOf(tokenAddress);
        if (balance > 0) {
          const [, amountInMantissa] = await converter.getAmountIn(balance, BaseAssets[i], tokenAddress);
          const [, amountOutMantissa] = await converter.getAmountOut(amountInMantissa, BaseAssets[i], tokenAddress);

          expect(amountOutMantissa).to.be.lessThanOrEqual(balance);
        }
      }
    }
  });

  it("release funds should execute successfully", async () => {
    await protocolShareReserve.connect(impersonatedTimelock).releaseFunds(COMPTROLLER, ASSETS);
  });

  it("checks that 5% of the repaid amount is sent to the PSR, as underlying tokens", async () => {
    // Liquidation Test requisite
    const LIQUIDATOR = "0x1934057d1de58cf65fb59277a91f26ac9f8a4282";
    const BORROWER = "0x489a8756c18c0b8b24ec2a2b9ff3d4d447f79bec";
    const wBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    const vETH_ADDRESS = "0xf508fcd89b8bd15579dc79a6827cb4686a3592c8";
    const vBNB_ADDRESS = "0xa07c5b74c9b40447a954e1466938b865b6bbea36";
    const COMPTROLLER_CORE = "0xfD36E2c2a6789Db23113685031d7F16329158384";
    const REPAY_AMOUNT = "12600000000000000";

    const vBNB = await ethers.getContractAt(VTOKEN_ABI, vBNB_ADDRESS);

    const wBNB = await ethers.getContractAt(ERC20_ABI, wBNB_ADDRESS);

    const liquidator = await initMainnetUser(LIQUIDATOR, parseUnits("2", 18));
    const liquidatorContract = new ethers.Contract(LIQUIDATOR_CONTRACT, LIQUIDATOR_ABI, provider);
    const comptroller = await ethers.getContractAt(COMPTROLLER_CORE_ABI, COMPTROLLER_CORE);

    const liquidationIncentiveMantissa = await comptroller.liquidationIncentiveMantissa();
    const treasuryPercentMantissa = await liquidatorContract.treasuryPercentMantissa();

    const exchangeRateCurrent = await vBNB.callStatic.exchangeRateCurrent();
    const seizeTokens = await comptroller.liquidateCalculateSeizeTokens(vETH_ADDRESS, vBNB_ADDRESS, REPAY_AMOUNT);

    const seizedAmount = (exchangeRateCurrent * seizeTokens[1]) / 1e18;
    const psrBalanceIncreased = (seizedAmount * treasuryPercentMantissa) / liquidationIncentiveMantissa;

    await protocolShareReserve.connect(liquidator).releaseFunds(COMPTROLLER_CORE, [wBNB_ADDRESS]);

    const psrBalanceBeforeLiquidating = await wBNB.balanceOf(PSR);
    await liquidatorContract.connect(liquidator).liquidateBorrow(vETH_ADDRESS, BORROWER, REPAY_AMOUNT, vBNB_ADDRESS);
    const psrBalanceAfterLiquidating = await wBNB.balanceOf(PSR);

    const balanceDiff = psrBalanceAfterLiquidating - psrBalanceBeforeLiquidating;

    expect(balanceDiff).to.closeTo(psrBalanceIncreased, parseUnits("1", 10));

    // Please reference the below code to understand the percentage division asserted below
    // https://github.com/VenusProtocol/venus-protocol/blob/VEN-2375/contracts/Liquidator/Liquidator.sol#L439
    expect((balanceDiff / seizedAmount) * 100).to.equal(4.545454390274249);
  });
});

forking(36680347, async () => {
  let liquidator: Contract;
  let proxyAdmin: Contract;
  const provider = ethers.provider;
  let prevImplLiquidator: string;

  before(async () => {
    liquidator = new ethers.Contract(LIQUIDATOR_CONTRACT, LIQUIDATOR_ABI, provider);
    proxyAdmin = new ethers.Contract(PROXY_ADMIN_LIQUIDATOR, PROXY_ADMIN_ABI, provider);
    prevImplLiquidator = await proxyAdmin.getProxyImplementation(LIQUIDATOR_CONTRACT);
    await pretendExecutingVip(await vip265(createInitializeData()));
  });

  describe("Checks", async () => {
    it("Liquidator Owner should equal to Normal Timelock", async () => {
      const currOwner = await liquidator.owner();
      expect(currOwner).equals(NORMAL_TIMELOCK);
    });

    it("Liquidator Implementation should restore", async () => {
      const currImpl = await proxyAdmin.getProxyImplementation(LIQUIDATOR_CONTRACT);
      expect(currImpl).equals(prevImplLiquidator);
    });

    it("Liquidator pending owner should equal to zero address", async () => {
      const currPendingOwner = await liquidator.pendingOwner();
      expect(currPendingOwner).equals(ethers.constants.AddressZero);
    });

    it("ProxyAdmin owner should equal to Normal Timelock", async () => {
      const currOwner = await proxyAdmin.owner();
      expect(currOwner).equals(NORMAL_TIMELOCK);
    });
  });
});
