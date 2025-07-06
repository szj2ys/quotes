import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 将未使用变量从错误改为警告，或完全关闭
      "@typescript-eslint/no-unused-vars": "warn", // 改为警告
      // 或者完全关闭：
      // "@typescript-eslint/no-unused-vars": "off",

      // 如果你想更精细的控制，可以使用以下配置：
      // "@typescript-eslint/no-unused-vars": [
      //   "warn",
      //   {
      //     "argsIgnorePattern": "^_", // 忽略以下划线开头的参数
      //     "varsIgnorePattern": "^_", // 忽略以下划线开头的变量
      //     "destructuredArrayIgnorePattern": "^_" // 忽略解构数组中以下划线开头的变量
      //   }
      // ]
    }
  }
];

export default eslintConfig;
