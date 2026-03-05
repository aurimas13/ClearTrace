import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  Handle,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { SupabaseTransaction } from './TransactionList';

interface NetworkGraphProps {
  transactions: SupabaseTransaction[];
}

interface AccountNodeData {
  label: string;
  isHighRisk: boolean;
  connectionCount: number;
  [key: string]: unknown;
}

function AccountNode({ data }: { data: AccountNodeData }) {
  return (
    <div
      className={`px-3 py-2 rounded-lg shadow-lg text-center min-w-[120px] border-2 ${
        data.isHighRisk
          ? 'bg-red-950/80 border-red-500 shadow-red-500/20'
          : 'bg-slate-800 border-slate-600 shadow-slate-900/40'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-500 !w-2 !h-2" />
      <div className={`text-xs font-mono font-semibold truncate ${data.isHighRisk ? 'text-red-300' : 'text-blue-300'}`}>
        {data.label}
      </div>
      <div className="text-[10px] text-slate-400 mt-0.5">
        {data.connectionCount} txn{data.connectionCount !== 1 ? 's' : ''}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-slate-500 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes: NodeTypes = { account: AccountNode };

function buildGraph(transactions: SupabaseTransaction[]) {
  const accountSet = new Map<string, { connectionCount: number; maxRisk: number }>();

  for (const tx of transactions) {
    const s = accountSet.get(tx.sender_account) || { connectionCount: 0, maxRisk: 0 };
    s.connectionCount++;
    s.maxRisk = Math.max(s.maxRisk, tx.risk_score);
    accountSet.set(tx.sender_account, s);

    const r = accountSet.get(tx.receiver_account) || { connectionCount: 0, maxRisk: 0 };
    r.connectionCount++;
    r.maxRisk = Math.max(r.maxRisk, tx.risk_score);
    accountSet.set(tx.receiver_account, r);
  }

  const accounts = Array.from(accountSet.entries());
  const count = accounts.length;
  const cx = 400;
  const cy = 250;
  const rx = Math.max(200, count * 30);
  const ry = Math.max(150, count * 22);

  const nodes: Node[] = accounts.map(([account, info], i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      id: account,
      type: 'account',
      position: { x: cx + rx * Math.cos(angle) - 60, y: cy + ry * Math.sin(angle) - 20 },
      data: {
        label: account,
        isHighRisk: info.maxRisk > 80,
        connectionCount: info.connectionCount,
      } satisfies AccountNodeData,
    };
  });

  const edges: Edge[] = transactions.map((tx) => ({
    id: `e-${tx.id}`,
    source: tx.sender_account,
    target: tx.receiver_account,
    animated: tx.risk_score > 80,
    style: {
      stroke: tx.risk_score > 80 ? '#ef4444' : tx.risk_score > 60 ? '#f97316' : '#475569',
      strokeWidth: Math.max(1.5, Math.min(4, tx.amount / 50000)),
    },
    label: `${tx.amount.toLocaleString()} ${tx.currency}`,
    labelStyle: { fill: '#94a3b8', fontSize: 10 },
    labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85 },
    labelBgPadding: [4, 2] as [number, number],
    markerEnd: { type: 'arrowclosed' as const, color: tx.risk_score > 80 ? '#ef4444' : '#475569' },
  }));

  return { nodes, edges };
}

export default function NetworkGraph({ transactions }: NetworkGraphProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraph(transactions);
    setNodes(n);
    setEdges(e);
  }, [transactions]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const uniqueAccounts = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      set.add(tx.sender_account);
      set.add(tx.receiver_account);
    });
    return set.size;
  }, [transactions]);

  const highRiskNodes = useMemo(() => {
    const set = new Set<string>();
    transactions.filter(tx => tx.risk_score > 80).forEach(tx => {
      set.add(tx.sender_account);
      set.add(tx.receiver_account);
    });
    return set.size;
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
        <p className="text-slate-400">No transaction data to visualize.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-white">Transaction Network</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {uniqueAccounts} accounts &middot; {transactions.length} transactions &middot;{' '}
            <span className="text-red-400">{highRiskNodes} high-risk nodes</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-red-500 bg-red-950"></div>
            <span className="text-slate-400">Risk &gt; 80</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-600 bg-slate-800"></div>
            <span className="text-slate-400">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-red-500"></div>
            <span className="text-slate-400">High risk edge</span>
          </div>
        </div>
      </div>

      <div style={{ height: 520 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          style={{ background: '#0f172a' }}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background color="#1e293b" gap={20} />
          <Controls
            showInteractive={false}
            className="!bg-slate-800 !border-slate-700 !shadow-xl [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-700"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
