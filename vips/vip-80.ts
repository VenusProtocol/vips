import { parseUnits } from "ethers/lib/utils";

const ACCESS_CONTROL = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const COMPTROLLER_PROXY = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const UPDATED_COMPTROLLER_IMPL = "0x0E37A3a04e298ab8349864cb94b242FB4f860372";
const COMPTROLLER_IMPL = "0xf2721703d5429BeC86bD0eD86519E0859Dd88209";
const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const VAI_CONTROLLER_IMPL = "0x8A1e5Db8f622B97f4bCceC4684697199C1B1D11b";
const COMPTROLLER_LENS = "0x50F618A2EAb0fB55e87682BbFd89e38acb2735cD";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const LIQUIDATOR_PROXY = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
const LIQUIDATOR_PROXY_ADMIN = "0x2b40b43ac5f7949905b0d2ed9d6154a8ce06084a";
const LIQUIDATOR_IMPL = "0x0BE68b10dFB2e303D3D0a51Cd8368Fb439E46409";
const BASE_RATE_MANTISSA = parseUnits("0.01", 18);

export const vip80 = () => {
  const signatures = [
    "_setPendingImplementation(address)",
    "_become(address)",
    "_setPendingImplementation(address)",
    "_become(address)",
    "_setComptrollerLens(address)",
    "_setPendingImplementation(address)",
    "_become(address)",
    "initialize()",
    "setAccessControl(address)",
    "giveCallPermission(address,string,address)", // base rate, fast-track
    "giveCallPermission(address,string,address)", // base rate, normal
    "giveCallPermission(address,string,address)", // float rate, fast-track
    "giveCallPermission(address,string,address)", // float rate, normal
    "giveCallPermission(address,string,address)", // mint cap, fast-track
    "giveCallPermission(address,string,address)", // mint cap, normal
    "setBaseRate(uint256)",
    "setReceiver(address)",
    "upgrade(address,address)",
  ];

  const targets = [
    COMPTROLLER_PROXY,
    UPDATED_COMPTROLLER_IMPL,
    COMPTROLLER_PROXY,
    COMPTROLLER_IMPL,
    COMPTROLLER_PROXY,
    VAI_CONTROLLER_PROXY,
    VAI_CONTROLLER_IMPL,
    VAI_CONTROLLER_PROXY,
    VAI_CONTROLLER_PROXY, // setAccessControl
    ACCESS_CONTROL,
    ACCESS_CONTROL,
    ACCESS_CONTROL,
    ACCESS_CONTROL,
    ACCESS_CONTROL,
    ACCESS_CONTROL,
    VAI_CONTROLLER_PROXY, // setBaseRate
    VAI_CONTROLLER_PROXY, // setReceiver
    LIQUIDATOR_PROXY_ADMIN,
  ];

  const params = [
    [UPDATED_COMPTROLLER_IMPL], // unitroller._setPendingImplementation(updatedComptrollerImpl)
    [COMPTROLLER_PROXY], // updatedComptrollerImpl._become(unitroller)
    [COMPTROLLER_IMPL], // unitroller._setPendingImplementation(comptrollerImpl)
    [COMPTROLLER_PROXY], // comptrollerImpl._become(unitroller)
    [COMPTROLLER_LENS], // comptroller._setComptrollerLens(lens)
    [VAI_CONTROLLER_IMPL], // vaiUnitroller._setPendingImplementation(vaiControllerImpl)
    [VAI_CONTROLLER_PROXY], // vaiControllerImpl._become(vaiControllerImpl)
    [], // vaiController.initialize()
    [ACCESS_CONTROL], // vaiController.setAccessControl(address)
    [VAI_CONTROLLER_PROXY, "setBaseRate(uint256)", FAST_TRACK_TIMELOCK], // accessControl.giveCallPermission(...)
    [VAI_CONTROLLER_PROXY, "setBaseRate(uint256)", NORMAL_TIMELOCK], // accessControl.giveCallPermission(...)
    [VAI_CONTROLLER_PROXY, "setFloatRate(uint256)", FAST_TRACK_TIMELOCK], // accessControl.giveCallPermission(...)
    [VAI_CONTROLLER_PROXY, "setFloatRate(uint256)", NORMAL_TIMELOCK], // accessControl.giveCallPermission(...)
    [VAI_CONTROLLER_PROXY, "setMintCap(uint256)", FAST_TRACK_TIMELOCK], // accessControl.giveCallPermission(...)
    [VAI_CONTROLLER_PROXY, "setMintCap(uint256)", NORMAL_TIMELOCK], // accessControl.giveCallPermission(...)
    [BASE_RATE_MANTISSA], // vaiController.setBaseRate(1%)
    [TREASURY], // vaiController.setReceiver(treasury)
    [LIQUIDATOR_PROXY, LIQUIDATOR_IMPL], // proxyAdmin.upgrade(liquidator, liquidatorImpl)
  ];

  const values = new Array(targets.length).fill("0");

  const meta = {
    version: "v2",
    title: "VIP-80 VAI Stability Fee",
    description: `### Summary
  
  The VAI Stablecoin has been unpegged for numerous months, and we are prepared to deliver a solution that will bring VAI back to its $1 peg and keep it near that level going forward.
  
  ### Details
  Venus will introduce a stability fee to keep VAI at or near its peg via market dynamics.
  
  An interest rate, initially set at 1%, will be charged for minting VAI. The rate will set by governance going forward. This variable rate will encourage more minting when demand is high and VAI’s price is over $1.00 while discouraging minting when demand is low and VAI’s price is below $1.00.
  
  The stability fee will be adjusted based on a base rate, the price of VAI, and a floating rate. The stability rate is an annual rate divided by the yearly number of blocks on the BNB  Chain, creating a stability rate per block.
  
  A small stability fee for minting and burning VAI discourages users from buying and selling below or above the price of $1.00, reducing price volatility while creating value for Venus Protocol. Stability fee income will be used for handling extreme conditions such as bad debt, risk funds, and outlier events.
  
  Before the VAI Stability Fee, a user's VAI mint limit was based on their total supplied funds without considering the collateral factor of those funds. If a user minted VAI up to the amount of their unused liquidity, they would put their account into immediate liquidation because they would have surpassed the collateral value of their supply. The VAI Stability Fee in Venus V4 allows users to only mint VAI based on their weighted supply rather than their total supply to reduce liquidations.`,
    forDescription: "I agree that Venus Protocol should proceed and introduce VAI Stability Fee",
    againstDescription: "I disagree and Venus should NOT proceed and introduce VAI Stability Fee",
    abstainDescription: "I am indifferent to whether Venus Protocol introduces VAI Stability Fee or not",
  };

  return { targets, signatures, params, values, meta };
};
