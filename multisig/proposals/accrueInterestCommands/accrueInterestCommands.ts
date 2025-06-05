import * as fs from "fs";
import * as path from "path";
import { makeProposal } from "src/utils";

const filePath = path.join(__dirname, "address.json");

// Run getAllVtokens script before
const jsonData = fs.readFileSync(filePath, "utf8");
const allVtokens = JSON.parse(jsonData);

const accrueInterestCommands = () => {
  return makeProposal([
    ...allVtokens.map((vtoken: string) => {
      return {
        target: vtoken,
        signature: "accrueInterest()",
        params: [],
      };
    }),
  ]);
};
export default accrueInterestCommands;
