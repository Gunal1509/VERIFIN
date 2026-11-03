import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { EntryScene } from './components/EntryScene';
import { JudgeTour } from './components/JudgeTour';
import { LandingScreen } from './screens/LandingScreen';
import { AgentTheatreScreen } from './screens/AgentTheatreScreen';
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
import { IntegrationScreen } from './screens/IntegrationScreen';
import { mockCases } from './data/mockCases';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<string>('landing');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case_sharma_traders');
  const [activePolicyPack, setActivePolicyPack] = useState<string>('bank_a');
  const [hasAppliedSharmaEvidence, setHasAppliedSharmaEvidence] = useState<boolean>(false);
  const [showEntryScene, setShowEntryScene] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('verifin_intro_seen');
    } catch {
      return true;
    }
  });

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

  const handleCloseEntryScene = () => {
    setShowEntryScene(false);
    try {
      sessionStorage.setItem('verifin_intro_seen', 'true');
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <EntryScene
        isOpen={showEntryScene}
        onClose={handleCloseEntryScene}
        onExploreCase={(caseId) => handleSelectCase(caseId, 'decision')}
        onOpenAgentTheatre={() => {
          handleCloseEntryScene();
          setActiveScreen('agentTheatre');
        }}
      />

      <Navbar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        cases={mockCases}
        selectedCaseId={selectedCaseId}
        setSelectedCaseId={setSelectedCaseId}
        activePolicyPack={activePolicyPack}
        onTogglePolicyPack={handleTogglePolicyPack}
        onOpenEntryScene={() => setShowEntryScene(true)}
      />

      <main className="flex-1">
        {activeScreen === 'landing' && (
          <LandingScreen
            onOpenCockpit={() => setActiveScreen('queue')}
            onOpenAgentTheatre={() => setActiveScreen('agentTheatre')}
            onOpenEntryScene={() => setShowEntryScene(true)}
            onOpenIntegrations={() => setActiveScreen('integrations')}
          />
        )}

        {activeScreen === 'integrations' && (
          <IntegrationScreen
            onOpenConnectorsTable={() => setActiveScreen('landing')}
          />
        )}

        {activeScreen === 'agentTheatre' && (
          <AgentTheatreScreen
            cases={mockCases}
            selectedCaseId={selectedCaseId}
            onSelectCase={setSelectedCaseId}
            onOpenCockpit={() => setActiveScreen('decision')}
          />
        )}

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

      <JudgeTour />
    </div>
  );
};

export default App;
