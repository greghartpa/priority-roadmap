import { useState } from 'react';
import { UrlLoader } from './components/UrlLoader';
import { RoadmapGrid } from './components/RoadmapGrid';
import { fetchExcelFile, parseRoadmap } from './utils/excel';
import type { RoadmapData } from './utils/excel';
import './styles.css';

function App() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setRoadmap(null);

    try {
      const arrayBuffer = await fetchExcelFile(url);
      const data = parseRoadmap(arrayBuffer);
      setRoadmap(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Excel loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Priority Roadmap</h1>
        <p>Product initiatives by team and quarter</p>
      </header>

      <main className="app-main">
        <UrlLoader onLoad={handleLoad} isLoading={isLoading} error={error} />
        {roadmap && <RoadmapGrid data={roadmap} />}
      </main>
    </div>
  );
}

export default App;
