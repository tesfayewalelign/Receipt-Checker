"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../src/config/database"));
async function main() {
    await database_1.default.bank.createMany({
        data: [
            { name: "Commercial Bank of Ethiopia", code: "CBE" },
            { name: "TeleBirr", code: "TELEBIRR" },
        ],
        skipDuplicates: true,
    });
}
main()
    .catch((e) => console.error(e))
    .finally(async () => await database_1.default.$disconnect());
//# sourceMappingURL=seed.js.map