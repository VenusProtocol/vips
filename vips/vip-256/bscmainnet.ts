import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const TOKEN_REDEEMER = "0x29171F17BF7F3691908eD55bAC2014A632B87dD3";
export const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const BINANCE = "0x6657911F7411765979Da0794840D671Be55bA273";

export const WBNB_AMOUNT = parseUnits("5901.651898613689829191", 18).toString();
export const vBNB_AMOUNT = parseUnits("672665.16913031", 8).toString();
export const BNB_AMOUNT_TO_BINANCE = BigNumber.from(parseUnits("15636.74", 18))
  .add(parseUnits("5865.60", 18))
  .toString();

// Received from vBNB after redeem is 15847.979107135037434728. But we will send to treasury only 15847.679107135037434728 i.e., 0.3 is kept in the timelock
export const BNB_AMOUNT_TO_TREASURY = parseUnits("15847.679107135037434728", 18).toString();

interface VTokenTransfer {
  symbol: string;
  amount: string;
  address: string;
}

interface BEP20Transfer {
  symbol: string;
  amount: string;
  address: string;
}

export const vToken_Transfers = [
  {
    symbol: "vBTC",
    amount: parseUnits("344.60553433", 8).toString(),
    address: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
  },
  {
    symbol: "vETH",
    amount: parseUnits("1685.06190157", 8).toString(),
    address: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
  },
  {
    symbol: "vUSDT",
    amount: parseUnits("2554859.57915445", 8).toString(),
    address: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
  },
  {
    symbol: "vLTC",
    amount: parseUnits("27660.07068667", 8).toString(),
    address: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
  },
  {
    symbol: "vXVS",
    amount: parseUnits("138740.90847753", 8).toString(),
    address: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
  },
  {
    symbol: "vCAKE",
    amount: parseUnits("245187.19242229", 8).toString(),
    address: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
  },
  {
    symbol: "vUNI",
    amount: parseUnits("2497.74135186", 8).toString(),
    address: "0x27FF564707786720C71A2e5c1490A63266683612",
  },
  {
    symbol: "vFDUSD",
    amount: parseUnits("10355.09068368", 8).toString(),
    address: "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba",
  },
  {
    symbol: "vUSDC",
    amount: parseUnits("1251038.96782643", 8).toString(),
    address: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
  },
  {
    symbol: "vDOT",
    amount: parseUnits("55089.83198008", 8).toString(),
    address: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
  },
  {
    symbol: "vADA",
    amount: parseUnits("662029.93490011", 8).toString(),
    address: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
  },
  {
    symbol: "vXRP",
    amount: parseUnits("534654.72490775", 8).toString(),
    address: "0xB248a295732e0225acd3337607cc01068e3b9c10",
  },
  // {
  //     symbol: "vTUSDOLD",
  //     amount: parseUnits("234046.29380374", 8).toString(),
  //     address: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3"
  // },
  {
    symbol: "vMATIC",
    amount: parseUnits("255028.0497963", 8).toString(),
    address: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
  },
  {
    symbol: "vLINK",
    amount: parseUnits("13919.2457489", 8).toString(),
    address: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
  },
  {
    symbol: "vBETH",
    amount: parseUnits("70.15886616", 8).toString(),
    address: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
  },
  {
    symbol: "vDOGE",
    amount: parseUnits("1940822.36351268", 8).toString(),
    address: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
  },
  {
    symbol: "vFIL",
    amount: parseUnits("25756.68067599", 8).toString(),
    address: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
  },
  {
    symbol: "vTUSD",
    amount: parseUnits("2576.73315234", 8).toString(),
    address: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
  },
  {
    symbol: "vWBETH",
    amount: parseUnits("0.89365885", 8).toString(),
    address: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
  },
  {
    symbol: "vDAI",
    amount: parseUnits("27071.86465849", 8).toString(),
    address: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
  },
  {
    symbol: "vBUSD",
    amount: parseUnits("10908.57803433", 8).toString(),
    address: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
  },
  {
    symbol: "vBCH",
    amount: parseUnits("21.1512832", 8).toString(),
    address: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
  },
  {
    symbol: "vSXP",
    amount: parseUnits("925.79433296", 8).toString(),
    address: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
  },
];

export const BEP20Transfers = [
  {
    symbol: "BTCB",
    amount: BigNumber.from(parseUnits("3.5029", 18)).add(parseUnits("1.06876", 18)).toString(),
    address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  },
  {
    symbol: "ETH",
    amount: BigNumber.from(parseUnits("17.371", 18)).add(parseUnits("14.55908", 18)).toString(),
    address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
  },
  {
    symbol: "USDT",
    amount: BigNumber.from(parseUnits("29508.0359", 18)).add(parseUnits("219816.5002", 18)).toString(),
    address: "0x55d398326f99059fF775485246999027B3197955",
  },
  {
    symbol: "LTC",
    amount: parseUnits("280.38365", 18).toString(),
    address: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
  },
  {
    symbol: "XVS",
    amount: parseUnits("1322.056", 18).toString(),
    address: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
  },
  {
    symbol: "Cake",
    amount: BigNumber.from(parseUnits("3397.15865", 18)).add(parseUnits("891.64848", 18)).toString(),
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
  },
  {
    symbol: "UNI",
    amount: parseUnits("1252.25385", 18).toString(),
    address: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
  },
  {
    symbol: "FDUSD",
    amount: BigNumber.from(parseUnits("5261.65425", 18)).add(parseUnits("1031.64844", 18)).toString(),
    address: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
  },
  {
    symbol: "DOT",
    amount: BigNumber.from(parseUnits("618.32785", 18)).add(parseUnits("529.97468", 18)).toString(),
    address: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
  },
  {
    symbol: "ADA",
    amount: parseUnits("6877.765", 18).toString(),
    address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
  },
  {
    symbol: "XRP",
    amount: parseUnits("5427.9473", 18).toString(),
    address: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
  },
  {
    symbol: "LINK",
    amount: BigNumber.from(parseUnits("141.65625", 18)).add(parseUnits("75.03636", 18)).toString(),
    address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
  },
  {
    symbol: "MATIC",
    amount: parseUnits("2661.62045", 18).toString(),
    address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
  },
  {
    symbol: "BETH",
    amount: parseUnits("0.71965", 18).toString(),
    address: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
  },
  {
    symbol: "DOGE",
    amount: parseUnits("19727.91485", 8).toString(),
    address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
  },
  {
    symbol: "FIL",
    amount: parseUnits("266.1287", 18).toString(),
    address: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
  },
  {
    symbol: "TUSD",
    amount: BigNumber.from(parseUnits("1327.33975", 18)).add(parseUnits("3883.51888", 18)).toString(),
    address: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
  },
  {
    symbol: "wBETH",
    amount: parseUnits("0.4473", 18).toString(),
    address: "0xa2e3356610840701bdf5611a53974510ae27e2e1",
  },
  {
    symbol: "DAI",
    amount: parseUnits("4292.3044", 18).toString(),
    address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  },
  {
    symbol: "TRX",
    amount: parseUnits("11124.31032", 6).toString(),
    address: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
  },
];

const vBEP20TransferCommands = vToken_Transfers.map((vTokenTransfer: VTokenTransfer) => {
  return {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [vTokenTransfer.address, vTokenTransfer.amount, TOKEN_REDEEMER],
  };
});

const vBEP20RedeemCommands = vToken_Transfers.map((vTokenTransfer: VTokenTransfer) => {
  return {
    target: TOKEN_REDEEMER,
    signature: "redeemAndTransfer(address,address)",
    params: [vTokenTransfer.address, TREASURY],
  };
});

const BEP20TransferCommands = BEP20Transfers.map((bep20Transfer: BEP20Transfer) => {
  return {
    target: TREASURY,
    signature: "withdrawTreasuryBEP20(address,uint256,address)",
    params: [bep20Transfer.address, bep20Transfer.amount, BINANCE],
  };
});

export const vip256 = () => {
  const meta = {
    version: "v2",
    title: "VIP-253 Residual Shortfall Repayments",
    description: `Following [VIP-244](https://app.venus.io/#/governance/proposal/244?chainId=56), if passed, this VIP will execute steps 1, 2, 3 and 4 of the execution plan to further repay the remaining shortfall in the BNB Bridge Exploiter account by reducing the USDC debt. This repayment will make use of the fees from the liquidation of this account and the protocol risk fund balance. The expected repayment amount is: $7,205,911

The following are the relevant balances for the repayment operation:

*USD values consider token prices for Feb 05, blocknumber: 35735239*

BNB Bridge Exploiter Shortfall Balance:

- Total Shortfall balance: $14,680,936
- USDC Debt: 39,865,397

Liquidation fees:

- 15,426.60 BNB ($4,627,995)

vBNB Reserves:

- 14,663 BNB ($4,399,200)

vTreasury vToken Balance (underlying tokens with positions larger than $1,000):

- BNB: 15,846.91 ($4,765,166)
- BTCB: 7.0058 ($298,554.20)
- ETH: 34.742 ($79,664.51)
- USDT: 59,016.0718 ($58,952.04)
- LTC: 560.7673 ($37,805.07)
- USDC: 28,907.0181 ($28,907.02)
- XVS: 2,644.112 ($28,067.79)
- Cake: 6,794.3173 ($16,408.28)
- UNI: 2,504.5077 ($15,013.60)
- FDUSD: 10,523.3085 ($10,511.16)
- DOT: 1,236.6557 ($8,412.67)
- ADA(Binance-Peg): 13,755.53 ($6,808.90)
- LINK: 283.3125 ($5,463.20)
- XRP: 10,855.8946 ($5,456.05)
- TUSD(old): 4,882.8203 ($4,817.39)
- MATIC: 5,323.2409 ($4,157.54)
- BETH: 1.4393 ($3,388.09)
- DOGE: 39,455.8297 ($3,100.74)
- FIL: 532.2574 ($2,637.79)
- TUSD: 2,654.6795 ($2,612.56)
- wBETH: 0.8946 ($2,114.03)
- Others: $607

ProtocolShareReserve (PSR) Token Balance (tokens with positions larger than $1,000):

- USDT: 563,748.4017 ($563,074.72)
- USDC: 266,877.8406 ($266,877.84)
- BTCB: 2.6778 ($113,881.01)
- ETH: 38.1224 ($87,338.70)
- WBNB: 88.3266 ($26,524.49)
- DAI: 10,908.977 ($10,907.34)
- TUSD: 10,108.571 ($9,948.18)
- DOT: 1,359.6979 ($9,209.49)
- FLOKI: 233,081,491.374 ($6,423.67)
- Cake: 2,278.5927 ($5,477.74)
- LINK: 192.3052 ($3,695.27)
- TRX: 29,104.4352 ($3,455.94)
- FDUSD: 2,645.3861 ($2,642.33)
- ADA(Binance-Peg): 4,129.2605 ($2,040.56)
- DOGE: 20,599.2848 ($1,618.85)
- SXP: 11,475.6309 ($1,163.44)
- MATIC: 1,330.6035 ($1,037.84)
- Others: $4,171

#### Execution Plan

The protocol's tokenomics uses the same distribution proportion for treasury allocation and risk fund for protocol reserves (40%). These allocations will now be executed automatically, following the latest [Automatic Income Allocator deployment](https://app.venus.io/#/governance/proposal/248?chainId=56).

The risk fund allocation is set to go through a converter to swap and store assets in USDT. The treasury allocation has no converter yet and will receive the allocations in underlying tokens.

The current protocol shortfall primarily lies in the BNB Bridge Exploiter account, where the total debts are in USDC and USDT, meaning that repaying either USDT or USDC will have the same effect in insolvency reduction.

The expense of borrowings for this account increases the protocol's insolvency, as the borrow amount rises over time. With this, due to current market conditions, the proposal is to repay USDC since the average borrow expense for USDC is four times larger than for USDT.

The optimal procedure for repaying USDC will involve using the allocations transferred to the treasury, as this will prevent a double conversion from underlying tokens to USDT, then to USDC. Given that the treasury and risk fund share the same allocation proportion for reserve funds, the proposal suggests converting these assets from the treasury directly to USDC using Binance, and then reimbursing this expense with the USDT converted in the risk fund, allowing for a more cost-efficient process.

To settle accounting, a future VIP will be proposed to send an equal amount of USDT to the treasury to cover the shortfall repayment. The end result will be a net neutral amount for the vTreasury balance, with 40% of the treasury allocation converted to USDT and a reduction in the risk fund balance for the repayments of the shortfall.

To reference the liquidation fees, all revenues are stored in the vTreasury in the form of vTokens. These will be claimed, and 50% of their value will also be sent to Binance for conversion to USDC. The BNB market has an exception, as it includes liquidation fees generated through the various liquidations for the BNB Bridge Exploiter. These fees will be used entirely to cover the shortfall.

It is important to consider that tokens with a balance of less than $1,000 will not be included in the repayment operation, as their impact is negligible and excluding them will reduce the complexity of the operation.

**The process for the repayment will follow these steps:**

1. Redeem all vTokens from the vTreasury.
2. Send the Risk Fund allocation amount from the resulting redemption total to Binance to be converted to USDC.
    1. 50% of the resulting token amounts for all tokens except vBNB.
    2. vBNB will consider the total liquidation fees from the BNB Bridge exploiter in addition to the 50% allocation from regular liquidations.
    3. USDC amounts in the vTreasury will not be sent to Binance as there is no need for conversion.
3. Send 40% of all tokens sent from the PSR contract to the vTreasury to Binance for conversion to USDC.
    1. 40% of the total USDC will not be sent as there are no conversion needs.
4. Once the USDC is transferred to the vTreasury, use it to partially repay the USDC debt in the BNB Bridge Exploiter account. This step will be executed in another VIP.

#### Amounts to transfer to Binance for conversion

**Tokens from the vTreasury after redemption of vTokens**

- BNB: 15,636.74 ($4,691,023)
- BTCB: 3.5029 ($149,277.10)
- ETH: 17.371 ($39,832.26)
- USDT: 29,508.0359 ($29,476.02)
- LTC: 280.38365 ($18,902.54)
- XVS: 1,322.056 ($14,033.90)
- Cake: 3,397.15865 ($8,204.14)
- UNI: 1,252.25385 ($7,506.80)
- FDUSD: 5,261.65425 ($5,255.58)
- DOT: 618.32785 ($4,206.34)
- ADA(Binance-Peg): 6,877.765 ($3,404.45)
- XRP: 5,427.9473 ($2,728.03)
- LINK: 141.65625 ($2,731.60)
- MATIC: 2,661.62045 ($2,078.77)
- BETH: 0.71965 ($1,694.05)
- DOGE: 19,727.91485 ($1,550.37)
- FIL: 266.1287 ($1,318.90)
- TUSD: 1,327.33975 ($1,306.28)
- wBETH: 0.4473 ($1,057.02)

**Tokens from the vTreasury after allocation transfer from the PSR:**

- BNB: 5,865.60 ($1,759,680.00)
- USDT: 219,816.5002 ($219,718.68)
- BTCB: 1.06876 ($45,966.30)
- ETH: 14.55908 ($33,473.37)
- DAI: 4,292.3044 ($4,291.88)
- TUSD: 3,883.51888 ($3,823.56)
- DOT: 529.97468 ($3,666.94)
- Cake: 891.64848 ($2,180.97)
- LINK: 75.03636 ($1,344.74)
- TRX: 11,124.31032 ($1,292.25)
- FDUSD: 1,031.64844 ($1,030.59)

**Total Amount to send to Binance:**

- $7,082,298.38

**Estimated USDC Repayment Amount:**

- $7,205,911.72`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      ...vBEP20TransferCommands,
      ...vBEP20RedeemCommands,
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vBNB, vBNB_AMOUNT, NORMAL_TIMELOCK],
      },
      {
        target: vBNB,
        signature: "redeem(uint256)",
        params: [vBNB_AMOUNT],
      },
      {
        target: TREASURY,
        signature: "",
        params: [],
        value: BNB_AMOUNT_TO_TREASURY,
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBNB, WBNB_AMOUNT, NORMAL_TIMELOCK],
      },
      {
        target: WBNB,
        signature: "withdraw(uint256)",
        params: [WBNB_AMOUNT],
      },
      {
        target: TREASURY,
        signature: "",
        params: [],
        value: WBNB_AMOUNT,
      },
      ...BEP20TransferCommands,
      {
        target: TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_AMOUNT_TO_BINANCE, BINANCE],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip256;
