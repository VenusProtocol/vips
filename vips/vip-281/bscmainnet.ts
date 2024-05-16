import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const TOKEN_REDEEMER = "0xd039B647603219D6D39C051c25f945c0E53d75F3";

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const COMMUNITY_WALLET = "0xc444949e0054a23c44fc45789738bdf64aed2391";

export const COMMUNITY_WALLET_USDT_AMOUNT = parseUnits("3500", 18).toString();

export const vTokenConfigs = {
  vUSDT: {
    address: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    underlying: "0x55d398326f99059fF775485246999027B3197955",
  },
  vUSDC: {
    address: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    underlying: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  },
  vBNB: {
    address: "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    underlying: "0x0000000000000000000000000000000000000000",
  },
  vBTC: {
    address: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    underlying: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  },
  vETH: {
    address: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    underlying: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
  },
  vDAI: {
    address: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    underlying: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  },
  vTUSDOLD: {
    address: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3",
    underlying: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
  },
};

export const shortfalls = {
  [vTokenConfigs.vBNB.address]: [
    "0x82e11AF71CA97f1c8E7456238d94B349b1514bf3",
    "0x59008Ee02096211782cf519d25F77965811fd2FA",
    "0xF815a566E42b0D8ddD5D77f91409A7d9CeB10B92",
  ],
  [vTokenConfigs.vBTC.address]: [
    "0x33df7a7F6D44307E1e5F3B15975b47515e5524c0",
    "0x24e77E5b74B30b026E9996e4bc3329c881e24968",
    "0xf57245320d75FA2Cb0eACD55055b57e4026dBCC7",
    "0xEF044206Db68E40520BfA82D45419d498b4bc7Bf",
  ],
  [vTokenConfigs.vDAI.address]: ["0x6f9Ac5B3Fa4308620C6763D9aA5a65446E75F5b5"],
  [vTokenConfigs.vETH.address]: [
    "0x7589dD3355DAE848FDbF75044A3495351655cB1A",
    "0xf57245320d75FA2Cb0eACD55055b57e4026dBCC7",
    "0x24e77E5b74B30b026E9996e4bc3329c881e24968",
    "0x33df7a7F6D44307E1e5F3B15975b47515e5524c0",
  ],
  [vTokenConfigs.vTUSDOLD.address]: ["0x058476edacB23e9507cFF379e7DD8cf4DEe4d2Db"],
  [vTokenConfigs.vUSDC.address]: [
    "0x913453a769713A692Ee97Ee9dCE5e097a5768a95",
    "0x16760e0e3153a48cE484a7834BEA1D42B93f1bd6",
    "0x4eb19eA75De0dFd109f17d9A0c3b9F8ec671403F",
    "0x00CF291c713f204B1Ac03F86A8ed5D11acb4Fb7a",
    "0xf6AdA09f201691a5372EC2bb31e00d86c65FD0e2",
    "0xF37A8fad82771Ee2C27b698163646cB99E228cA9",
    "0x1F6D66bA924EBF554883Cf84d482394013eD294B",
    "0x3469d31e92739e0c0D0dBa591C271C3Ed151E0D4",
    "0xa745A278E9459c35562E36255f38602c77837461",
    "0x12a1E05876C41f858bae86C720c197d5986B240D",
    "0x9C6b3c2789f807eF10AcD6a05DE8B6f61B0b6Aa3",
  ],
  [vTokenConfigs.vUSDT.address]: [
    "0x4258DdfdEc7538C70EDC3189E81e779a6f9f4629",
    "0xf6AdA09f201691a5372EC2bb31e00d86c65FD0e2",
    "0xf4F66E38c5D9234A5bF66bc310047d59C4AE571F",
    "0x8d655AAAA0ec224b17972df385e25325b9103332",
    "0x913453a769713A692Ee97Ee9dCE5e097a5768a95",
    "0x0150Bc2A8df90328C6b957eD03A8725462d0b4bB",
    "0x967a6C838893F77A645BBFc4375a2cDCeb6AC267",
    "0x1F6D66bA924EBF554883Cf84d482394013eD294B",
    "0xdD03adbFfDddF04cB2485B61C869c75Ed47E7d55",
  ],
};

const treasuryWithdrawals = {
  // vUSDT:
  //   debt: 21286.067887473892834848 vUSDT
  //   +10% buffer: 23414.674676221282118332
  [vTokenConfigs.vUSDT.address]: "99250839881222", // equivalent to 23414.674676221282118332 USDT @ block 37541463

  // vUSDC:
  //   debt: 31678.6818946771210414 vUSDC
  //   +10% buffer: 34846.55008414483314554
  [vTokenConfigs.vUSDC.address]: "147548387729617", // equivalent to 34846.55008414483314554 USDC @ block 37541463

  // vBNB:
  //   debt: 24.489873549609557312 vBNB
  //   +10% buffer: 26.938860904570513043
  [vTokenConfigs.vBNB.address]: "112220593318", // equivalent to 26.938860904570513043 BNB @ block 37541463

  // vBTC:
  //   debt: 0.197217811064840463 vBTC
  //   +10% buffer: 0.216939592171324509
  [vTokenConfigs.vBTC.address]: "176005956", // full treasury vBTC balance (equivalent to 0.035790276661337662 BTC) @ block 37541463
  [vTokenConfigs.vBTC.underlying]: "181149315509986847", // remaining 0.181149315509986847 BTC

  // vETH:
  //   debt: 3.125610307138845952 vETH
  //   +10% buffer: 3.438171337852730547
  [vTokenConfigs.vETH.address]: "16641982314", // equivalent to 3.438171337852730547 ETH @ block 37541463

  // vDAI:
  //   debt: 9723.027564385775943737 vDAI
  //   +10% buffer: 10695.33032082435353811 DAI
  // We don't have vDAI in treasury, so we're using the underlying
  // However, although we request 10k, we don't have 10k in treasury, so the actually
  // repaid amount would be smaller (unless we accumulate some DAIs)
  [vTokenConfigs.vDAI.underlying]: "10695330320824353538110", // 10695.33032082435353811 DAI

  // vTUSDOLD:
  //   debt: 4535.576700721485968026 TUSDOLD
  //   +10% buffer: 4989.134370793634564828 TUSDOLD
  // We can't redeem vTUSDOLD, so we're using the underlying
  [vTokenConfigs.vTUSDOLD.underlying]: "4989134370793634564828", // 4989.134370793634564828 TUSDOLD
};

export const vip281 = () => {
  const meta = {
    version: "v2",
    title: "VIP-281 Partial shortfall repayment",
    description: `Following [VIP-266](https://app.venus.io/#/governance/proposal/266?chainId=56), if passed, this VIP will repay the debt for the following accounts, using the funds from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9):

- 6,970.74 DAI ($6,969.69) for account: [0x6f9Ac5B3Fa4308620C6763D9aA5a65446E75F5b5](https://debank.com/profile/0x6f9Ac5B3Fa4308620C6763D9aA5a65446E75F5b5)
- 17.59 BNB ($9,748.47) for account: [0x82e11AF71CA97f1c8E7456238d94B349b1514bf3](https://debank.com/profile/0x82e11AF71CA97f1c8E7456238d94B349b1514bf3)
- 7,633.53 USDT ($7,636.58) for account: [0x4258DdfdEc7538C70EDC3189E81e779a6f9f4629](https://debank.com/profile/0x4258DdfdEc7538C70EDC3189E81e779a6f9f4629)
- 7,154.76 USDC ($7,154.58) for account: [0x913453a769713A692Ee97Ee9dCE5e097a5768a95](https://debank.com/profile/0x913453a769713A692Ee97Ee9dCE5e097a5768a95)
- 0.09 BTC ($6,162.89) for account: [0x33df7a7F6D44307E1e5F3B15975b47515e5524c0](https://debank.com/profile/0x33df7a7F6D44307E1e5F3B15975b47515e5524c0)
- 6,021.55 USDC ($6,021.40) for account: [0x16760e0e3153a48cE484a7834BEA1D42B93f1bd6](https://debank.com/profile/0x16760e0e3153a48cE484a7834BEA1D42B93f1bd6)
- 4,535.58 TUSDOLD ($4,537.35) for account: [0x058476edacB23e9507cFF379e7DD8cf4DEe4d2Db](https://debank.com/profile/0x058476edacB23e9507cFF379e7DD8cf4DEe4d2Db)
- 4,422.53 USDC ($4,422.42) for account: [0x4eb19eA75De0dFd109f17d9A0c3b9F8ec671403F](https://debank.com/profile/0x4eb19eA75De0dFd109f17d9A0c3b9F8ec671403F)
- 0.06 BTC ($3,676.12) for account: [0x24e77E5b74B30b026E9996e4bc3329c881e24968](https://debank.com/profile/0x24e77E5b74B30b026E9996e4bc3329c881e24968)
- 3,419.31 USDT ($3,420.67) for account: [0xf6AdA09f201691a5372EC2bb31e00d86c65FD0e2](https://debank.com/profile/0xf6AdA09f201691a5372EC2bb31e00d86c65FD0e2)
- 0.94 ETH ($3,114.15) for account: [0x7589dD3355DAE848FDbF75044A3495351655cB1A](https://debank.com/profile/0x7589dD3355DAE848FDbF75044A3495351655cB1A)
- 2,956.59 USDC ($2,956.52) for account: [0x00CF291c713f204B1Ac03F86A8ed5D11acb4Fb7a](https://debank.com/profile/0x00CF291c713f204B1Ac03F86A8ed5D11acb4Fb7a)
- 2,927.13 USDC ($2,927.05) for account: [0xf6AdA09f201691a5372EC2bb31e00d86c65FD0e2](https://debank.com/profile/0xf6AdA09f201691a5372EC2bb31e00d86c65FD0e2)
- 0.82 ETH ($2,720.69) for account: [0xf57245320d75FA2Cb0eACD55055b57e4026dBCC7](https://debank.com/profile/0xf57245320d75FA2Cb0eACD55055b57e4026dBCC7)
- 0.68 ETH ($2,266.50) for account: [0x24e77E5b74B30b026E9996e4bc3329c881e24968](https://debank.com/profile/0x24e77E5b74B30b026E9996e4bc3329c881e24968)
- 0.68 ETH ($2,264.37) for account: [0x33df7a7F6D44307E1e5F3B15975b47515e5524c0](https://debank.com/profile/0x33df7a7F6D44307E1e5F3B15975b47515e5524c0)
- 4.33 BNB ($2,400.40) for account: [0x59008Ee02096211782cf519d25F77965811fd2FA](https://debank.com/profile/0x59008Ee02096211782cf519d25F77965811fd2FA)
- 2,252.19 USDT ($2,253.09) for account: [0xf4F66E38c5D9234A5bF66bc310047d59C4AE571F](https://debank.com/profile/0xf4F66E38c5D9234A5bF66bc310047d59C4AE571F)
- 1,704.93 USDC ($1,704.89) for account: [0xF37A8fad82771Ee2C27b698163646cB99E228cA9](https://debank.com/profile/0xF37A8fad82771Ee2C27b698163646cB99E228cA9)
- 0.02 BTC ($1,612.82) for account: [0xf57245320d75FA2Cb0eACD55055b57e4026dBCC7](https://debank.com/profile/0xf57245320d75FA2Cb0eACD55055b57e4026dBCC7)
- 1,644.00 USDT ($1,644.66) for account: [0x8d655AAAA0ec224b17972df385e25325b9103332](https://debank.com/profile/0x8d655AAAA0ec224b17972df385e25325b9103332)
- 0.02 BTC ($1,547.30) for account: [0xEF044206Db68E40520BfA82D45419d498b4bc7Bf](https://debank.com/profile/0xEF044206Db68E40520BfA82D45419d498b4bc7Bf)
- 1,569.48 USDC ($1,569.44) for account: [0x1F6D66bA924EBF554883Cf84d482394013eD294B](https://debank.com/profile/0x1F6D66bA924EBF554883Cf84d482394013eD294B)
- 1,466.95 USDT ($1,467.53) for account: [0x913453a769713A692Ee97Ee9dCE5e097a5768a95](https://debank.com/profile/0x913453a769713A692Ee97Ee9dCE5e097a5768a95)
- 2.56 BNB ($1,420.08) for account: [0xF815a566E42b0D8ddD5D77f91409A7d9CeB10B92](https://debank.com/profile/0xF815a566E42b0D8ddD5D77f91409A7d9CeB10B92)
- 1,327.26 USDC ($1,327.22) for account: [0x3469d31e92739e0c0D0dBa591C271C3Ed151E0D4](https://debank.com/profile/0x3469d31e92739e0c0D0dBa591C271C3Ed151E0D4)
- 1,296.69 USDT ($1,297.21) for account: [0x0150Bc2A8df90328C6b957eD03A8725462d0b4bB](https://debank.com/profile/0x0150Bc2A8df90328C6b957eD03A8725462d0b4bB)
- 1,292.40 USDT ($1,292.92) for account: [0x967a6C838893F77A645BBFc4375a2cDCeb6AC267](https://debank.com/profile/0x967a6C838893F77A645BBFc4375a2cDCeb6AC267)
- 1,256.60 USDC ($1,256.57) for account: [0xa745A278E9459c35562E36255f38602c77837461](https://debank.com/profile/0xa745A278E9459c35562E36255f38602c77837461)
- 1,209.34 USDC ($1,209.30) for account: [0x12a1E05876C41f858bae86C720c197d5986B240D](https://debank.com/profile/0x12a1E05876C41f858bae86C720c197d5986B240D)
- 1,161.09 USDT ($1,161.56) for account: [0x1F6D66bA924EBF554883Cf84d482394013eD294B](https://debank.com/profile/0x1F6D66bA924EBF554883Cf84d482394013eD294B)
- 1,128.94 USDC ($1,128.91) for account: [0x9C6b3c2789f807eF10AcD6a05DE8B6f61B0b6Aa3](https://debank.com/profile/0x9C6b3c2789f807eF10AcD6a05DE8B6f61B0b6Aa3)
- 1,120.23 USDT ($1,120.67) for account: [0xdD03adbFfDddF04cB2485B61C869c75Ed47E7d55](https://debank.com/profile/0xdD03adbFfDddF04cB2485B61C869c75Ed47E7d55)

The total repayments per token are the following:

- DAI: 6,970.74
- ETH: 3.13
- BTC: 0.20
- USDC: 31,679.11
- USDT: 21,286.38
- BNB: 24.49
- TUSDOLD: 4,535.58

With this, the total estimated repayment amount is **$104,167**, considering April 3rd, 2024 token prices.

The vTreasury has enough assets to repay all markets except DAI. For this, all the vTreasury DAI (6,970.74) will be used for a partial repayment, and 3,500 USDT will be transferred to the [Community Wallet](https://debank.com/profile/0xc444949e0054A23c44Fc45789738bdF64aed2391) to cover the rest.

Due to [VIP-262 Treasury Management](https://app.venus.io/#/governance/proposal/262?chainId=56), the ETH, USDC, and USDT markets will require an additional step for their repayments. It is necessary to first redeem the vTokens for an equivalent amount based on the table above.

#### References

- [TokenRedeemer contract used to repay the debt](https://bscscan.com/address/0xd039B647603219D6D39C051c25f945c0E53d75F3)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      ...Object.entries(treasuryWithdrawals).map(([vToken, vTokenAmount]) => ({
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vToken, vTokenAmount, TOKEN_REDEEMER],
      })),
      ...Object.entries(shortfalls).map(([vToken, borrowers]) => ({
        target: TOKEN_REDEEMER,
        signature: "redeemAndBatchRepay(address,address[],address)",
        params: [vToken, borrowers, VTREASURY],
      })),
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, COMMUNITY_WALLET_USDT_AMOUNT, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip281;
