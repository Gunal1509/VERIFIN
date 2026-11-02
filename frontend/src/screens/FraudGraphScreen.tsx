import React, { useState } from 'react';
import { 
  Network, 
  ShieldAlert, 
  Building, 
  User, 
  MapPin, 
  CreditCard
} from 'lucide-react';
import { microcopy } from '../copy/microcopy';
import type { CaseData, EntityGraphNode } from '../types';

interface FraudGraphScreenProps {
  currentCase: CaseData;
}

export const FraudGraphScreen: React.FC<FraudGraphScreenProps> = ({ currentCase }) => {
  const [selectedElement, setSelectedElement] = useState<{
    type: 'node' | 'edge' | 'finding';
    data: any;
  } | null>(null);

  const copy = microcopy.screens.fraudGraph;

  // Icon by node type
  const getNodeIcon = (type: EntityGraphNode['type']) => {
    switch (type) {
      case 'borrower':
        return <Building className="w-4 h-4 text-brand-600" />;
      case 'counterparty':
        return <CreditCard className="w-4 h-4 text-slate-600" />;
      case 'director':
        return <User className="w-4 h-4 text-purple-600" />;
      case 'address':
        return <MapPin className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{copy.title}</h2>
            <span className="bg-rose-100 text-rose-900 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              NetworkX Forensic Graph
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{copy.subtitle}</p>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          {copy.flagCount(currentCase.findings.length)}
        </div>
      </div>

      {/* Main Grid: Interactive Graph + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Canvas Visualizer */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Network className="w-4 h-4 text-brand-600" />
                <span>Entity & Transaction Relationship Map</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {copy.clickPrompt}
              </span>
            </div>

            {/* Interactive SVG Diagram */}
            <div className="relative w-full h-80 bg-slate-50/70 rounded-xl border border-dashed border-slate-300 flex items-center justify-center overflow-hidden p-4">
              <svg className="w-full h-full" viewBox="0 0 600 300">
                <defs>
                  <marker
                    id="arrowhead-red"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#e11d48" />
                  </marker>
                  <marker
                    id="arrowhead-blue"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
                  </marker>
                </defs>

                {/* Simulated Graph Edges */}
                {currentCase.id === 'case_linked_ring_sharma_verma_gupta' ? (
                  <>
                    {/* Ring edges */}
                    <path
                      d="M 160 120 L 440 80"
                      stroke="#e11d48"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      markerEnd="url(#arrowhead-red)"
                      className="cursor-pointer hover:stroke-rose-700"
                      onClick={() =>
                        setSelectedElement({
                          type: 'edge',
                          data: {
                            id: 'TXN_RING_001',
                            from: 'Sharma Global Exports',
                            to: 'Verma Logistics',
                            amount: '₹25,00,000',
                            date: '2024-03-05',
                            status: 'Cycle Leg 1',
                          },
                        })
                      }
                    />
                    <path
                      d="M 440 80 L 300 240"
                      stroke="#e11d48"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      markerEnd="url(#arrowhead-red)"
                      className="cursor-pointer hover:stroke-rose-700"
                      onClick={() =>
                        setSelectedElement({
                          type: 'edge',
                          data: {
                            id: 'TXN_RING_002',
                            from: 'Verma Logistics',
                            to: 'Gupta Trading',
                            amount: '₹24,80,000',
                            date: '2024-03-08',
                            status: 'Cycle Leg 2',
                          },
                        })
                      }
                    />
                    <path
                      d="M 300 240 L 160 120"
                      stroke="#e11d48"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      markerEnd="url(#arrowhead-red)"
                      className="cursor-pointer hover:stroke-rose-700"
                      onClick={() =>
                        setSelectedElement({
                          type: 'edge',
                          data: {
                            id: 'TXN_RING_003',
                            from: 'Gupta Trading',
                            to: 'Sharma Global Exports',
                            amount: '₹24,70,000',
                            date: '2024-03-11',
                            status: 'Cycle Leg 3 (Returns to origin in 6 days)',
                          },
                        })
                      }
                    />
                  </>
                ) : (
                  <>
                    {/* Linear/Standard Edges */}
                    <line
                      x1="120"
                      y1="150"
                      x2="300"
                      y2="150"
                      stroke="#64748b"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead-blue)"
                    />
                    <line
                      x1="300"
                      y1="150"
                      x2="480"
                      y2="150"
                      stroke="#64748b"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead-blue)"
                    />
                  </>
                )}
              </svg>

              {/* Render Nodes as Interactive Badges */}
              <div className="absolute inset-0 p-4 flex flex-wrap items-center justify-around pointer-events-none">
                {currentCase.entityGraph.nodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedElement({ type: 'node', data: node })}
                    className={`pointer-events-auto p-3 rounded-xl border flex items-center space-x-2 text-xs font-bold shadow-sm transition-all hover:scale-105 ${
                      node.isFlagged
                        ? 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-200'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {getNodeIcon(node.type)}
                    <span>{node.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Outside World Test Summary */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Outside-World Cash Dissipation Test
              </span>
              <p className="text-xs text-slate-700">
                {currentCase.id === 'case_linked_ring_sharma_verma_gupta'
                  ? 'Failing: 87.4% of funds circulate strictly between related counterparties without retail/vendor dissipation.'
                  : 'Passing: Funds dissipate to genuine external suppliers, power utilities, and employees.'}
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                currentCase.id === 'case_linked_ring_sharma_verma_gupta'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {currentCase.id === 'case_linked_ring_sharma_verma_gupta' ? 'BREACH' : 'PASS'}
            </span>
          </div>
        </div>

        {/* Forensic Detail Inspector Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Forensic Findings & Transaction Proof</span>
            </h3>

            {/* Findings List */}
            <div className="space-y-3">
              {currentCase.findings.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedElement({ type: 'finding', data: f })}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedElement?.data?.id === f.id
                      ? 'border-brand-500 bg-brand-50/50 shadow-xs ring-1 ring-brand-400'
                      : f.severity === 'SEVERE'
                      ? 'border-rose-300 bg-rose-50/50 hover:bg-rose-50'
                      : f.severity === 'HIGH'
                      ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900">{f.title}</span>
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                      {f.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1.5 leading-relaxed">{f.description}</p>
                  {f.ruleFired && (
                    <span className="inline-block mt-2 font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Rule: {f.ruleFired}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Element Drawer */}
          {selectedElement && (
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs border border-slate-700 animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                  Transaction-Level Proof
                </span>
                <button
                  onClick={() => setSelectedElement(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-400">Target:</span> {selectedElement.data?.label || selectedElement.data?.id}
                </div>
                {selectedElement.data?.amount && (
                  <div>
                    <span className="text-slate-400">Amount:</span> {selectedElement.data.amount}
                  </div>
                )}
                {selectedElement.data?.transactionIds && (
                  <div>
                    <span className="text-slate-400">Linked Txn IDs:</span>{' '}
                    {selectedElement.data.transactionIds.join(', ')}
                  </div>
                )}
                {selectedElement.data?.status && (
                  <div className="text-amber-400">{selectedElement.data.status}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
