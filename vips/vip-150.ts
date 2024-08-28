import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const VTUSDOLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const VTRXOLD = "0x61edcfe8dd6ba3c891cb9bec2dc7657b3b422e93";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const VTRXOLD_RATE_MODEL = "0x6b7C3d1ced49604c66e2C8125989E78B1E5356F5";
const VTUSDOLD_RATE_MODEL = "0x84645E886E6e8192921C2d9bFf9882B55c6E7830";
const SXP_RATE_MODEL = "0x91475A3f288841bce074Ec7edF27ec3fE58e18d1";
const VankrBNB_LST = "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f";
const VBNBx_LST = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
const LST_COMPTROLLER = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const TRON_COMPTROLLER = "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0";
const VUSDD_TRON = "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7";
const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";

export const vip150 = () => {
  const meta = {
    version: "v2",
    title: "VIP-150 Risk Parameters Update",
    description: `

  Changes to do
  Asset    Current_Kink New_Kink
    TUSDOLD  0.8           0.4
    TRXOLD   0.6           0.01
    SXP - increase Base rate to 0.5
    Increase ankrBNB borrow cap on LST isolated pool to 1,600
    Increase BNBx borrow cap on LST isolated pool to 1,920
    Increase USDD supply and borrow cap on TRON isolated pool to 2,700,000 and 1,800,000 respectively
    WBETH - increase CF to 70%`,
    forDescription: "I agree that Venus Protocol should proceed with the Risk Parameters Update's",
    againstDescription: "I do not think that Venus Protocol should proceed with the Risk Parameters Update's",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Risk Parameters Update's or not",
  };

  return makeProposal(
    [
      {
        target: VTRXOLD,
        signature: "_setInterestRateModel(address)",
        params: [VTRXOLD_RATE_MODEL],
      },

      {
        target: VTUSDOLD,
        signature: "_setInterestRateModel(address)",
        params: [VTUSDOLD_RATE_MODEL],
      },

      {
        target: VSXP,
        signature: "_setInterestRateModel(address)",
        params: [SXP_RATE_MODEL],
      },

      {
        target: LST_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [VankrBNB_LST, VBNBx_LST],
          [parseUnits("1600", 18), parseUnits("1920", 18)],
        ],
      },

      {
        target: TRON_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[VUSDD_TRON], [parseUnits("1800000", 18)]],
      },

      {
        target: TRON_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[VUSDD_TRON], [parseUnits("2700000", 18)]],
      },

      {
        target: CORE_COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VWBETH, parseUnits("0.7", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
