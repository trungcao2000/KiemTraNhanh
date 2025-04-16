import { registerRootComponent } from 'expo';
import { ResultsProvider } from './Context';

import App from './App';

// Wrap the App with AppProvider
const Root = () => (
  <ResultsProvider>

    <App />

  </ResultsProvider>
);

// Register the component
registerRootComponent(Root);
