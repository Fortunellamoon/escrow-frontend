"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import {
  useDeployedContractInfo,
  useScaffoldEventHistory,
  useScaffoldReadContract,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const STATUS = ["Created", "Paid", "Completed", "Refunded", "Disputed"];
const STATUS_CN = ["待付款", "已付款", "已完成", "已退款", "争议中"];

const STATUS_BADGE = [
  "badge-warning",
  "badge-info",
  "badge-success",
  "badge-secondary",
  "badge-error",
];

type OrderTuple = readonly [
  buyer: `0x${string}`,
  seller: `0x${string}`,
  token: `0x${string}`,
  amount: bigint,
  deadline: bigint,
  status: number,
  description: string,
];

function shortAddr(a?: string) {
  if (!a) return "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function RoleChip({ role }: { role: string }) {
  const colors: Record<string, string> = {
    买家: "bg-blue-100 text-blue-700 border-blue-300",
    卖家: "bg-green-100 text-green-700 border-green-300",
    仲裁人: "bg-purple-100 text-purple-700 border-purple-300",
    旁观者: "bg-gray-100 text-gray-600 border-gray-300",
  };
  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${colors[role] || colors["旁观者"]}`}>
      角色：{role}
    </span>
  );
}

type OrderRowProps = {
  id: bigint;
  escrowAddress?: string;
  arbiter?: string;
};

function OrderRow({ id, escrowAddress, arbiter }: OrderRowProps) {
  const { address: myAddress } = useAccount();

  const { data: order, isLoading } = useScaffoldReadContract({
    contractName: "Escrow",
    functionName: "getOrder",
    args: [id],
    watch: true,
  });

  const { data: myBalance } = useScaffoldReadContract({
    contractName: "ZSToken",
    functionName: "balanceOf",
    args: [myAddress],
    watch: true,
  });

  const { writeContractAsync: writeEscrow } = useScaffoldWriteContract({ contractName: "Escrow" });
  const { writeContractAsync: writeToken } = useScaffoldWriteContract({ contractName: "ZSToken" });

  const [busy, setBusy] = useState<string | null>(null);

  if (isLoading || !order) {
    return (
      <tr>
        <td colSpan={5} className="text-center text-sm text-base-content/60 py-6">
          正在加载订单 #{id.toString()}…
        </td>
      </tr>
    );
  }

  // wagmi may decode the tuple either as an array or as a named object — normalize both
  const raw = order as unknown as OrderTuple | Record<string, unknown>;
  const arr = Array.isArray(raw)
    ? raw
    : ([
        raw.buyer,
        raw.seller,
        raw.token,
        raw.amount,
        raw.deadline,
        raw.status,
        raw.description,
      ] as OrderTuple);
  const toBig = (v: unknown): bigint => {
    if (typeof v === "bigint") return v;
    const s = String(v ?? "0");
    return BigInt(s.startsWith("0x") ? s : "0x" + s);
  };
  const buyer = arr[0] as `0x${string}`;
  const seller = arr[1] as `0x${string}`;
  const token = arr[2] as `0x${string}`;
  const amount = toBig(arr[3]);
  const deadline = toBig(arr[4]);
  const status = Number(toBig(arr[5]));
  const description = String(arr[6] ?? "");

  const isBuyer = myAddress?.toLowerCase() === buyer.toLowerCase();
  const isSeller = myAddress?.toLowerCase() === seller.toLowerCase();
  const isArbiter = myAddress?.toLowerCase() === arbiter?.toLowerCase();
  const role = isArbiter ? "仲裁人" : isBuyer ? "买家" : isSeller ? "卖家" : "旁观者";
  const now = BigInt(Math.floor(Date.now() / 1000));

  const handlePay = async () => {
    if (!escrowAddress) return;
    setBusy("pay");
    try {
      // 付款 = approve + deposit 两笔交易，第二笔必须等第一笔确认（writeContractAsync 会等交易上链才返回）
      const approveTx = await writeToken({
        functionName: "approve",
        args: [escrowAddress as `0x${string}`, amount],
      });
      if (!approveTx) {
        setBusy(null);
        return;
      }
      notification.info("第 1 笔 approve 已确认，正在发送第 2 笔 deposit…");
      await writeEscrow({ functionName: "deposit", args: [id] });
      notification.success(`订单 #${id.toString()} 付款成功`);
    } catch (e) {
      console.error(e);
      notification.error(`付款失败：${(e as Error)?.message?.slice(0, 80)}`);
    } finally {
      setBusy(null);
    }
  };

  const handleAction = async (fn: "confirm" | "dispute" | "refund", args: [bigint]) => {
    setBusy(fn);
    try {
      await writeEscrow({ functionName: fn, args });
      notification.success(`操作 ${fn} 已上链`);
    } catch (e) {
      console.error(e);
      notification.error(`操作失败：${(e as Error)?.message?.slice(0, 80)}`);
    } finally {
      setBusy(null);
    }
  };

  const handleResolve = async (sellerWins: boolean) => {
    setBusy("resolve");
    try {
      await writeEscrow({ functionName: "resolve", args: [id, sellerWins] });
      notification.success(`已裁决：${sellerWins ? "判给卖家" : "退给买家"}`);
    } catch (e) {
      console.error(e);
      notification.error(`仲裁失败：${(e as Error)?.message?.slice(0, 80)}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <tr className="hover">
      <td className="font-mono text-sm">#{id.toString()}</td>
      <td>
        <div className="flex flex-col gap-1 text-sm">
          <span>
            买家 <span className="font-mono">{shortAddr(buyer)}</span>
          </span>
          <span>
            卖家 <span className="font-mono">{shortAddr(seller)}</span>
          </span>
          <span className="text-xs text-base-content/60">代币 {shortAddr(token)}</span>
        </div>
      </td>
      <td>
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">
            金额 {amount ? (Number(amount) / 1e18).toString() : "0"} 个
          </span>
          <span className="text-xs text-base-content/60">描述：{description || "—"}</span>
          <span className="text-xs text-base-content/60">
            到期：{new Date(Number(deadline) * 1000).toLocaleString()}
          </span>
        </div>
      </td>
      <td>
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex items-center gap-2">
            <span className={`badge badge-sm ${STATUS_BADGE[status]}`}>
              {STATUS[status]}（{STATUS_CN[status]}）
            </span>
            <RoleChip role={role} />
          </div>
          {role === "买家" && myBalance !== undefined && (
            <span className="text-xs text-base-content/60">
              我的余额：{(Number(toBig(myBalance)) / 1e18).toString()} 个
            </span>
          )}
        </div>
      </td>
      <td>
        <div className="flex flex-wrap gap-2">
          {status === 0 && isBuyer && (
            <button className="btn btn-sm btn-primary" disabled={busy !== null} onClick={handlePay}>
              {busy === "pay" ? <span className="loading loading-spinner loading-xs" /> : null}
              {busy === "pay" ? "付款中…" : "付款"}
            </button>
          )}
          {status === 1 && isBuyer && (
            <>
              <button className="btn btn-sm btn-success" disabled={busy !== null} onClick={() => handleAction("confirm", [id])}>
                {busy === "confirm" ? <span className="loading loading-spinner loading-xs" /> : null}
                确认收货
              </button>
              <button className="btn btn-sm btn-warning" disabled={busy !== null} onClick={() => handleAction("dispute", [id])}>
                {busy === "dispute" ? <span className="loading loading-spinner loading-xs" /> : null}
                争议
              </button>
              <button
                className="btn btn-sm btn-outline btn-secondary"
                disabled={busy !== null || now <= deadline}
                title={now <= deadline ? "未到截止时间，不能超期退款" : "超期退款"}
                onClick={() => handleAction("refund", [id])}
              >
                超期退款
              </button>
            </>
          )}
          {status === 1 && isSeller && (
            <button className="btn btn-sm btn-warning" disabled={busy !== null} onClick={() => handleAction("dispute", [id])}>
              {busy === "dispute" ? <span className="loading loading-spinner loading-xs" /> : null}
              争议
            </button>
          )}
          {status === 4 && isArbiter && (
            <>
              <button className="btn btn-sm btn-success" disabled={busy !== null} onClick={() => handleResolve(true)}>
                {busy === "resolve" ? <span className="loading loading-spinner loading-xs" /> : null}
                判给卖家
              </button>
              <button className="btn btn-sm btn-error" disabled={busy !== null} onClick={() => handleResolve(false)}>
                {busy === "resolve" ? <span className="loading loading-spinner loading-xs" /> : null}
                退给买家
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function EscrowPage() {
  const { address } = useAccount();

  const { data: arbiter } = useScaffoldReadContract({
    contractName: "Escrow",
    functionName: "arbiter",
    watch: true,
  });

  // 订单列表从 OrderCreated 事件重建；POTOS 的 eth_getLogs 一次只扫 10 个区块，必须把 blocksBatchSize 设为 10
  const { data: created } = useScaffoldEventHistory({
    contractName: "Escrow",
    eventName: "OrderCreated",
    watch: true,
    blocksBatchSize: 10,
  });

  const { data: escrowInfo } = useDeployedContractInfo({ contractName: "Escrow" });
  const { data: tokenInfo } = useDeployedContractInfo({ contractName: "ZSToken" });

  const { writeContractAsync: writeEscrow } = useScaffoldWriteContract({ contractName: "Escrow" });

  const [sellerAddr, setSellerAddr] = useState("");
  const [amountStr, setAmountStr] = useState("30");
  const [minutes, setMinutes] = useState("30");
  const [desc, setDesc] = useState("页面订单");
  const [creating, setCreating] = useState(false);

  const orderIds = useMemo(() => {
    const ids = (created ?? []).map(log => (log.args as { id?: bigint }).id).filter((x): x is bigint => x !== undefined);
    ids.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    return ids;
  }, [created]);

  const handleCreate = async () => {
    if (!tokenInfo?.address) {
      notification.error("未找到代币合约地址");
      return;
    }
    setCreating(true);
    try {
      const amountWei = parseUnits(amountStr || "0", 18);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + Math.max(Number(minutes) || 0, 0) * 60);
      await writeEscrow({
        functionName: "createOrder",
        args: [sellerAddr as `0x${string}`, tokenInfo.address as `0x${string}`, amountWei, deadline, desc],
      });
      notification.success("订单已创建");
    } catch (e) {
      console.error(e);
      notification.error(`创建失败：${(e as Error)?.message?.slice(0, 80)}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">托管交易 Escrow 页面</h1>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-lg border border-base-300 bg-base-200 px-4 py-3 text-sm">
          <span>
            当前账户：<span className="font-mono font-semibold">{address ?? "未连接"}</span>
          </span>
          <span>
            仲裁人：<span className="font-mono">{shortAddr(arbiter as string)}</span>
          </span>
          <span>
            Escrow 合约：<span className="font-mono">{shortAddr(escrowInfo?.address)}</span>
          </span>
          <span>
            代币合约：<span className="font-mono">{shortAddr(tokenInfo?.address)}</span>
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-base-300 bg-base-100 p-4">
        <h2 className="mb-3 text-lg font-semibold">创建订单</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="form-control w-full max-w-xs">
            <span className="label-text mb-1 text-xs">卖家地址</span>
            <input
              type="text"
              className="input input-bordered input-sm"
              placeholder="0x…"
              value={sellerAddr}
              onChange={e => setSellerAddr(e.target.value)}
            />
          </label>
          <label className="form-control w-full max-w-[8rem]">
            <span className="label-text mb-1 text-xs">金额（个）</span>
            <input
              type="number"
              className="input input-bordered input-sm"
              value={amountStr}
              onChange={e => setAmountStr(e.target.value)}
            />
          </label>
          <label className="form-control w-full max-w-[8rem]">
            <span className="label-text mb-1 text-xs">几分钟后到期</span>
            <input
              type="number"
              className="input input-bordered input-sm"
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
            />
          </label>
          <label className="form-control w-full max-w-xs">
            <span className="label-text mb-1 text-xs">描述</span>
            <input
              type="text"
              className="input input-bordered input-sm"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </label>
          <button className="btn btn-primary btn-sm" disabled={creating || !address} onClick={handleCreate}>
            {creating ? <span className="loading loading-spinner loading-xs" /> : null}
            {creating ? "创建中…" : "创建订单"}
          </button>
        </div>
        <p className="mt-2 text-xs text-base-content/60">金额按“个”输入，页面自动换算成 18 位精度；到期时间按“分钟”输入，页面自动换算成时间戳。</p>
      </div>

      <div className="rounded-lg border border-base-300 bg-base-100 p-4">
        <h2 className="mb-3 text-lg font-semibold">订单列表（从 OrderCreated 事件重建）</h2>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="text-sm">
                <th>订单号</th>
                <th>买卖双方</th>
                <th>金额 / 描述</th>
                <th>状态 / 角色</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orderIds.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-base-content/50">
                    还没有订单（等待 OrderCreated 事件…）
                  </td>
                </tr>
              )}
              {orderIds.map(id => (
                <OrderRow key={id.toString()} id={id} escrowAddress={escrowInfo?.address} arbiter={arbiter as string} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
