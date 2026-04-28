import { useState } from "react";
import LoadingScreen from "./LoadingScreen.jsx";
import BeexStorageWebsite from "./BeexStorageWebsite.jsx";

export default function App() {
  const [loaded, setLoaded] = useState(false);
  return loaded ? (
    <BeexStorageWebsite />
  ) : (
    <LoadingScreen onDone={() => setLoaded(true)} />
  );
}
