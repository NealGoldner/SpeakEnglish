/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import SpeechPractice from './components/SpeechPractice';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <header className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">SpeakEnglish</h1>
        <p className="text-zinc-500">Practice your English speaking with AI.</p>
      </header>
      <SpeechPractice />
    </div>
  );
}
