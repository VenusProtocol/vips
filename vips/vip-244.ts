import { constants } from "ethers";
import { id, parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343";
const MOVE_DEBT_DELEGATE = "0x89621C48EeC04A85AfadFD37d32077e65aFe2226";
const ORIGINAL_MOVE_DEBT_DELEGATE_IMPLEMENTATION = "0x8439932C45e646FcC1009690417A65BF48f68Ce7";
const NEW_MOVE_DEBT_DELEGATE_IMPLEMENTATION = "0x3d606776d2A8Bae29B64e11BDe14E689421278Be";

const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const ORIGINAL_COMPTROLLER_SETTERS = "0xF2b7D75557B75a878E997934014E95Dd089B5f24";
const TEMPORARY_COMPTROLLER_SETTERS = "0x7E257cad16a6615C338F34dE6526a0720490ef4c";

const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";

const REPLACE = 1;
const SET_COLLATERAL_FACTOR = "_setCollateralFactor(address,uint256)";
const setCollateralFactorSighash = id(SET_COLLATERAL_FACTOR).substring(0, 10);

const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const VETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const VDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";

const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";

const underlyings = [USDC, USDT, BTC, ETH, DAI];

const debts = [
  { borrower: "0xef044206db68e40520bfa82d45419d498b4bc7bf", amount: parseUnits("348.3279", 18), vToken: VBTC },
  { borrower: "0x7589dd3355dae848fdbf75044a3495351655cb1a", amount: parseUnits("2991.4833", 18), vToken: VETH },
  { borrower: "0x24e77e5b74b30b026e9996e4bc3329c881e24968", amount: parseUnits("2177.2909", 18), vToken: VETH },
  { borrower: "0x33df7a7f6d44307e1e5f3b15975b47515e5524c0", amount: parseUnits("2175.393", 18), vToken: VETH },
  { borrower: "0x1f6d66ba924ebf554883cf84d482394013ed294b", amount: parseUnits("1078719.2611", 18), vToken: VUSDC },
  { borrower: "0x1f6d66ba924ebf554883cf84d482394013ed294b", amount: parseUnits("1073481.2012", 18), vToken: VUSDT },
  { borrower: "0x1f6d66ba924ebf554883cf84d482394013ed294b", amount: parseUnits("104.6177", 18), vToken: VETH },
  { borrower: "0x3b7f525dc67cca55251abb5d04c81a83a6005269", amount: parseUnits("280988.5076", 18), vToken: VUSDT },
  { borrower: "0x0f2577ccb1e895ed1e8bfd4e709706595831e78a", amount: parseUnits("111666.7983", 18), vToken: VUSDC },
  { borrower: "0xbd043882d36b6def4c30f20c613cfa70d3af8bb7", amount: parseUnits("62898.9625", 18), vToken: VUSDC },
  { borrower: "0x4f381fb46dfde2bc9dcae2d881705749b1ed6e1a", amount: parseUnits("124746.9254", 18), vToken: VUSDT },
  { borrower: "0x7b899b97afacd8b9654a447b4db016ba430f6d11", amount: parseUnits("50917.875", 18), vToken: VUSDT },
  { borrower: "0xe62721e908b7cbd4f92a014d5ccf07adbf71933b", amount: parseUnits("47123.8332", 18), vToken: VDAI },
  { borrower: "0x8dcf5f960c38fd1861a4d036513adde829d63d81", amount: parseUnits("36656.7056", 18), vToken: VUSDC },
  { borrower: "0x3762e67e24b9b44cea8e89163aba9d4015e27d40", amount: parseUnits("26393.6932", 18), vToken: VUSDT },
  { borrower: "0x7eb163e6d0562d8534ab198551b7bf8815371152", amount: parseUnits("25471.1706", 18), vToken: VUSDT },
  { borrower: "0x55f6dc97d739f52d66c7332c2f93016a4c9d852d", amount: parseUnits("21738.004", 18), vToken: VUSDT },
  { borrower: "0xb38a6184069cf136ee9d145c6acf564dd10fd195", amount: parseUnits("19582.4556", 18), vToken: VUSDT },
  { borrower: "0x1e85d99e182557960e2b86bb53ca417007eed16a", amount: parseUnits("17667.3858", 18), vToken: VUSDC },
];

export const vip244 = () => {
  const meta = {
    version: "v2",
    title: "VIP-244",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      // Upgrade the contracts and set CF to 10,000%
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [MOVE_DEBT_DELEGATE, NEW_MOVE_DEBT_DELEGATE_IMPLEMENTATION],
      },
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [[[TEMPORARY_COMPTROLLER_SETTERS, REPLACE, [setCollateralFactorSighash]]]],
      },
      {
        target: UNITROLLER,
        signature: SET_COLLATERAL_FACTOR,
        params: [VBNB, parseUnits("100", 18)],
      },
      {
        target: MOVE_DEBT_DELEGATE,
        signature: "setBorrowAllowed(address,bool)",
        params: [VDAI, true],
      },

      // Repay the debts
      ...underlyings.map(underlying => ({
        target: underlying,
        signature: "approve(address,uint256)",
        params: [MOVE_DEBT_DELEGATE, constants.MaxUint256],
      })),
      ...debts.map(({ borrower, amount, vToken }) => ({
        target: MOVE_DEBT_DELEGATE,
        signature: "moveDebt(address,address,uint256,address)",
        params: [vToken, borrower, amount, vToken],
      })),
      ...underlyings.map(underlying => ({
        target: underlying,
        signature: "approve(address,uint256)",
        params: [MOVE_DEBT_DELEGATE, 0],
      })),

      // Restore the original CF and implementation
      {
        target: UNITROLLER,
        signature: SET_COLLATERAL_FACTOR,
        params: [VBNB, parseUnits("0.78", 18)],
      },
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [[[ORIGINAL_COMPTROLLER_SETTERS, REPLACE, [setCollateralFactorSighash]]]],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [MOVE_DEBT_DELEGATE, ORIGINAL_MOVE_DEBT_DELEGATE_IMPLEMENTATION],
      },

      // Allow moving USDT/USDC debt from the exploiter to other debts of the exploiter
      {
        target: MOVE_DEBT_DELEGATE,
        signature: "setRepaymentAllowed(address,address,bool)",
        params: [VUSDC, EXPLOITER_WALLET, true],
      },
      {
        target: MOVE_DEBT_DELEGATE,
        signature: "setRepaymentAllowed(address,address,bool)",
        params: [VUSDT, EXPLOITER_WALLET, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
