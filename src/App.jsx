import { useState } from 'react';
import { useAppState } from './hooks/useAppState.js';
import SyncBar from './components/SyncBar.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import BudgetAllocator from './components/BudgetAllocator.jsx';
import ThreeAccounts from './components/ThreeAccounts.jsx';
import EmergencyFund from './components/EmergencyFund.jsx';
import SinkingFund from './components/SinkingFund.jsx';
import InvestmentEngine from './components/InvestmentEngine.jsx';
import GoalMatrix from './components/GoalMatrix.jsx';
import MonthlyReview from './components/MonthlyReview.jsx';
import { budgetLimits, emergencyTarget, sumByCategory } from './utils/finance.js';

export default function App() {
  const app = useAppState();
  const { data, update } = app;
  const [showSettings, setShowSettings] = useState(!app.configured && !localStorage.getItem('mb:welcomed'));

  const closeSettings = () => {
    localStorage.setItem('mb:welcomed', '1');
    setShowSettings(false);
  };

  const actual = sumByCategory(data.lineItems);
  const expenses = actual.needs + actual.wants;
  const target = emergencyTarget(actual.needs, actual.wants);
  const complete = target > 0 && data.emergencyFundSaved >= target;
  const savings = budgetLimits(data.salary).savings;

  return (
    <div className="min-h-screen">
      <SyncBar
        configured={app.configured}
        dirty={app.dirty}
        status={app.status}
        onPush={app.push}
        onPull={app.pull}
        onSettings={() => setShowSettings(true)}
      />

      <main className="mx-auto max-w-5xl px-4 pb-16">
        <div className="pt-10 pb-2">
          <h1 className="font-serif text-3xl font-bold leading-tight sm:text-5xl">
            <span className="highlight">How To Manage Your Money Like The 1%</span>
          </h1>
          <p className="mt-4 max-w-2xl text-gray-600">A 9-step system — with calculators — to give every rupee a job.</p>
        </div>

        <BudgetAllocator data={data} update={update} />
        <ThreeAccounts salary={data.salary} expenses={expenses} />
        <EmergencyFund monthly={expenses} target={target} saved={data.emergencyFundSaved} onChange={(v) => update({ emergencyFundSaved: v })} />
        <SinkingFund items={data.sinkingFund} update={update} />
        <InvestmentEngine savings={savings} complete={complete} salaryDay={data.salaryDay} update={update} />
        <GoalMatrix goals={data.goals} update={update} />
        <MonthlyReview checklist={data.checklist} update={update} />
      </main>

      {showSettings && (
        <SettingsPanel
          settings={app.settings}
          setSettings={app.setSettings}
          onClose={closeSettings}
          onPull={app.pull}
          resetData={app.resetData}
        />
      )}
    </div>
  );
}
