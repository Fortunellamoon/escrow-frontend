# escrow-frontend —— 大作业路线 B：Next.js 用户前端

《区块链技术与应用》大作业「在区块链上构建应用系统」路线 B。基于 scaffold-eth 2（Next.js + wagmi/viem + RainbowKit），
给实验 3 的 Escrow 托管合约包了一层买家/卖家/仲裁人直接使用的页面：订单列表（从 OrderCreated 事件重建）、创建订单、
一键付款（approve + deposit 两笔交易）、确认收货、争议、仲裁，按当前账户角色与订单状态显示不同按钮。

## 运行方法

```bash
# 1. 安装依赖（Node >= 20）
yarn install

# 2. 启动前端
yarn start
```

打开 http://localhost:3000/escrow ，用 MetaMask 连接 **POTOS Testnet**（chainId 60600）：

- RPC：`https://rpc-testnet.potos.hk`
- 区块浏览器：https://scan-testnet.potos.hk
- 测试币水龙头：https://faucet-testnet.potos.hk （免 gas 领取 0.001 POT）

三人按验收流程走一遍：A 买家创建并付款两笔订单，B 卖家对订单 1 发起争议，C 仲裁人（合约 arbiter）
打开页面点「退给买家」，A 再对订单 0 点「确认收货」。

## 环境变量

| 变量 | 必须 | 说明 |
| --- | --- | --- |
| （无） | 否 | 页面运行不需要任何私钥。所有签名由 MetaMask 在用户本机完成 |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | 否 | 可选，不填使用默认 key |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | 否 | 可选，不填使用默认 projectId |

合约部署（如重新部署）才需要：`__RUNTIME_DEPLOYER_PRIVATE_KEY`（hardhat，仅本地环境变量）。
**仓库中任何文件不包含明文私钥。**

## 合约地址（POTOS Testnet, chainId 60600）

| 合约 | 地址 | 部署区块 |
| --- | --- | --- |
| Escrow（arbiter = 0x5969816CFDf70E119506c1AF47439320DA8226e7） | 0x5A4AB9e936533Ff9173cC39C7Ae342170650631c | 2687024 |
| ZHYToken（ZHY，18 位精度） | 0x5542EA0d580c43F6f43D7c2eBF9A6dc9E169Db4E | 2687021 |

## 页面功能（packages/nextjs/app/escrow/page.tsx）

1. **订单列表**：`useScaffoldEventHistory` 拉取 `OrderCreated` 事件日志拿到全部订单 id
   （POTOS 的 `eth_getLogs` 一次只扫 10 个区块，`blocksBatchSize` 必须设为 10），
   每行再用 `getOrder(id)` 读最新状态，状态显示为文字（Created/Paid/Completed/Refunded/Disputed）。
2. **创建订单**：卖家地址、金额（按「个」输入，页面用 `parseUnits(x, 18)` 换算）、多少分钟后到期（换算成时间戳）、描述。
3. **一键付款**：一个按钮顺序发两笔交易——先 `approve(Escrow, amount)`，等第一笔上链（`writeContractAsync` 返回）再发
   `deposit(id)`，MetaMask 会弹两次确认框。
4. **确认收货**：只对买家且状态 Paid 的订单显示。
5. **争议**：只对买家或卖家且状态 Paid 的订单显示。
6. **仲裁**：「判给卖家」「退给买家」两个按钮，只有当前连接账户 == 合约 `arbiter` 时才显示。
7. **角色提示**：每行按订单动态显示当前账户是 买家/卖家/仲裁人/旁观者；页面顶部显示当前账户、仲裁人、合约地址。

合约源码见 `packages/hardhat/contracts/escrow/`（Escrow.sol 与 ZSToken.sol）。

## 交易记录表

| 操作 | 交易哈希 | 区块浏览器链接 | 发起账户 |
| --- | --- | --- | --- |
| 部署 Escrow | 0x82d3524887488d3e63ee43d67bf164ac3fab410d033cf56eac73cf7920bc89f0 | https://scan-testnet.potos.hk/tx/0x82d3524887488d3e63ee43d67bf164ac3fab410d033cf56eac73cf7920bc89f0 | 0x48f42aC1a45eA12f44e580c85fD4E08A5C039ACd |
| createOrder 订单 0 | 0x0fe648b5fd476cb449fdfa03c20136fb497f28f06463bbd4c34462e4d1e1a3cd | https://scan-testnet.potos.hk/tx/0x0fe648b5fd476cb449fdfa03c20136fb497f28f06463bbd4c34462e4d1e1a3cd | 0x30be8eAD34CFe7a0Ac06fCBb27Df4Ae2C8FEd4f1 |
| approve | 0x66d8a4b2c75fb2cc085f8728450138eff9d24ba917a636c4b2eb8bf344031c4a | https://scan-testnet.potos.hk/tx/0x66d8a4b2c75fb2cc085f8728450138eff9d24ba917a636c4b2eb8bf344031c4a | 0x30be8eAD34CFe7a0Ac06fCBb27Df4Ae2C8FEd4f1 |
| deposit 订单 0 | 0xfcce93411048908cc0784234119630f9bc410415256860a3d039c6aae0150e37 | https://scan-testnet.potos.hk/tx/0xfcce93411048908cc0784234119630f9bc410415256860a3d039c6aae0150e37 | 0x30be8eAD34CFe7a0Ac06fCBb27Df4Ae2C8FEd4f1 |
| dispute 订单 1 | 0xe39d9949cb5631b094d03cbf53d20db0fdaebde642c51c767c6523abcac094b8 | https://scan-testnet.potos.hk/tx/0xe39d9949cb5631b094d03cbf53d20db0fdaebde642c51c767c6523abcac094b8 | 0x843Eb309c04302aa7C73a82F6B7B42F76A8242bd |
| resolve 订单 1 | 0x0d9e1a67279f5b9d4852909e0c55d89ef9a57d9bbdaad122dd47b70871e534db | https://scan-testnet.potos.hk/tx/0x0d9e1a67279f5b9d4852909e0c55d89ef9a57d9bbdaad122dd47b70871e534db | 0x5969816CFDf70E119506c1AF47439320DA8226e7 |
| confirm 订单 0 | 0xd89f3f415a2a20c7532bbf63da36885b1e1cf578ed1148cc3e6fb5e1dacaa2a2 | https://scan-testnet.potos.hk/tx/0xd89f3f415a2a20c7532bbf63da36885b1e1cf578ed1148cc3e6fb5e1dacaa2a2 | 0x30be8eAD34CFe7a0Ac06fCBb27Df4Ae2C8FEd4f1 |

> 路线 A 专用行（第 6 步 resolve 失败）在路线 B 不适用。

## 提交前自查（7.2 节）

```bash
grep -rnE "0x[0-9a-fA-F]{64}" --include="*.properties" --include="*.ts" --include="*.tsx" --include="*.java" --include="*.env*" --include="*.md" . | grep -v node_modules | grep -v deployments | grep -v artifacts
git ls-files | grep -E "\.env$"
```

两条命令均无输出（仓库中无明文私钥）。
