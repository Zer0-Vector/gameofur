import "./App.css";

import { useGame } from "./game";

export default function App() {
  useGame();
  return (
    <>
      <div className="ui container"></div>
      <div className="game container" id="game-container"></div>
    </>
  );
}
