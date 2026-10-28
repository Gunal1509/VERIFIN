import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CaseQueueScreen } from './screens/CaseQueueScreen';
import { WorkflowScreen } from './screens/WorkflowScreen';
import { TrustGateScreen } from './screens/TrustGateScreen';
import { FraudGraphScreen } from './screens/FraudGraphScreen';
import { EvidenceLadderScreen } from './screens/EvidenceLadderScreen';
import { CamProofPackScreen } from './screens/CamProofPackScreen';
import { DecisionScreen } from './screens/DecisionScreen';
import { OperationsScreen } from './screens/OperationsScreen';
import { DemoVideoScreen } from './screens/DemoVideoScreen';
import { AnimatedScenarioScreen } from './screens/AnimatedScenarioScreen';
import { ArchitectureScreen } from './screens/ArchitectureScreen';
import { mockCases } from './data/mockCases';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<string>('queue');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case_sharma_traders');
  const [activePolicyPack, setActivePolicyPack] = useState<string>('bank_a');
  const [hasAppliedSharmaEvidence, setHasAppliedSharmaEvidence] = useState<boolean>(false);

  const selectedCase = mockCases.find((c) => c.id === selectedCaseId) || mockCases[0];

  const handleSelectCase = (caseId: string, screen: string = 'workflow') => {
    setSelectedCaseId(caseId);
    setActiveScreen(screen);
  };

  const handleApplySharmaEvidence = () => {
    setHasAppliedSharmaEvidence(true);
  };

  const handleTogglePolicyPack = () => {
    setActivePolicyPack((prev) => (prev === 'bank_a' ? 'bank_b' : 'bank_a'));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        cases={mockCases}
        selectedCaseId={selectedCaseId}
        setSelectedCaseId={setSelectedCaseId}
        activePolicyPack={activePolicyPack}
      />

      <main className="flex-1 pb-12">
        {activeScreen === 'queue' && (
          <CaseQueueScreen cases={mockCases} onSelectCase={handleSelectCase} />
        )}

        {activeScreen === 'workflow' && (
          <WorkflowScreen
            currentCase={selectedCase}
            onApplyNewEvidence={handleApplySharmaEvidence}
            hasAppliedEvidence={selectedCase.id === 'case_sharma_traders' && hasAppliedSharmaEvidence}
          />
        )}

        {activeScreen === 'trustGate' && (
          <TrustGateScreen currentCase={selectedCase} />
        )}

        {activeScreen === 'fraudGraph' && (
          <FraudGraphScreen currentCase={selectedCase} />
        )}

        {activeScreen === 'evidenceLadder' && (
          <EvidenceLadderScreen
            currentCase={selectedCase}
            onApplyNewEvidence={handleApplySharmaEvidence}
            hasAppliedEvidence={selectedCase.id === 'case_sharma_traders' && hasAppliedSharmaEvidence}
          />
        )}

        {activeScreen === 'camProofPack' && (
          <CamProofPackScreen
            currentCase={selectedCase}
            hasAppliedEvidence={selectedCase.id === 'case_sharma_traders' && hasAppliedSharmaEvidence}
          />
        )}

        {activeScreen === 'decision' && (
          <DecisionScreen
            currentCase={selectedCase}
            hasAppliedEvidence={selectedCase.id === 'case_sharma_traders' && hasAppliedSharmaEvidence}
          />
        )}

        {activeScreen === 'operations' && (
          <OperationsScreen
            activePolicyPack={activePolicyPack}
            onTogglePolicyPack={handleTogglePolicyPack}
            hasAppliedEvidence={selectedCase.id === 'case_sharma_traders' && hasAppliedSharmaEvidence}
          />
        )}

        {activeScreen === 'architecture' && (
          <ArchitectureScreen />
        )}

        {activeScreen === 'animatedFraudFlow' && (
          <AnimatedScenarioScreen />
        )}

        {activeScreen === 'demoVideo' && (
          <DemoVideoScreen />
        )}
      </main>
    </div>
  );
};

export default App;
