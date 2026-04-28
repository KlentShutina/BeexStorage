import { useState } from "react";
import LoadingScreen from "./LoadingScreen";
import BeexStorageApp from "./BeexStorageApp";

// Top-level entry. Shows the branded loading screen, then hands off to the app.
export default function App() {
  const [ready, setReady] = useState(false);
  if (!ready) return <LoadingScreen onDone={() => setReady(true)} />;
  return <BeexStorageApp />;
}
