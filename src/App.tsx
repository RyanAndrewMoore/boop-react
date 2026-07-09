import "./App.css";

type Piece = "🐈" | "🐱" | "🐅" | "🐯";

const [kitten, cat, cub, tiger]: Piece[] = ["🐈", "🐱", "🐅", "🐯"];

function Square({ piece }: { piece?: Piece }) {
  return (
    <div className="square">
      <button>{piece}</button>
    </div>
  );
}

function Board() {
  const pieces: Piece[] = [kitten, cat, cub, tiger]
  const rows = [];
  for (let i = 0; i < 6; i++) {
    const row = [];
    for (let j = 0; j < 6; j++) {
      const index = Math.round(Math.random() * 3)
      row.push(<Square piece={pieces[index]} />);
    }

    rows.push(row);
  }

  return <div className="game-board">{rows}</div>;
}

function App() {
  return (
    <>
      <h1>Boop</h1>
      <div className="game">
        <Board />
      </div>
    </>
  );
}

export default App;
