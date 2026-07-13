import { useState, type MouseEventHandler } from "react";
import "./App.css";

type Piece = "🐈" | "🐱" | "🐅" | "🐯";
const [KITTEN, CAT, CUB, TIGER]: Piece[] = ["🐈", "🐱", "🐅", "🐯"];

function Square({
  piece,
  toggleSelected,
  onSquareClick,
}: {
  piece?: Piece;
  toggleSelected?: boolean;
  onSquareClick?: MouseEventHandler;
}) {
  return (
    <div className="square">
      <button
        style={
          toggleSelected ? { backgroundColor: "var(--accent-border)" } : {}
        }
        onClick={onSquareClick}
      >
        {piece}
      </button>
    </div>
  );
}

function Board({
  squares,
  onPlay,
  selected,
}: {
  squares?: Piece[][];
  onPlay: Function;
  selected: { piece: Piece; index: number };
}) {
  function handleClick(row: number, col: number) {
    if (selected.index < 0 || !squares) return;

    const nextSquares = squares.map(row => row.slice())
    nextSquares[row][col] = selected.piece;
    onPlay(nextSquares);
  }
  return (
    <div className="game-board">
      {squares?.map((row, rowIndex) => {
        if (rowIndex > 0 && rowIndex < squares.length - 1) {
          return row.map((square, colIndex) => {
            if (colIndex > 0 && colIndex < row.length - 1) {
              return (
                <Square
                  key={rowIndex * 8 + colIndex}
                  piece={square}
                  onSquareClick={() => handleClick(rowIndex, colIndex)}
                />
              );
            }
          });
        }
      })}
    </div>
  );
}

function Hand({
  pieces,
  player,
  catsAreNext,
  onSelect,
  selected,
}: {
  pieces?: Piece[];
  player: "cats" | "tigers";
  catsAreNext: boolean;
  onSelect: (piece: Piece, index: number) => void;
  selected: { piece: Piece; index: number };
}) {
  const hand: React.JSX.Element[] = [];
  const isPlayerTurn =
    (player === "cats" && catsAreNext) || (player === "tigers" && !catsAreNext);

  const selectFunc: (piece: Piece, index: number) => void = isPlayerTurn ? onSelect : () => null;

  {
  }
  pieces?.forEach((piece, index) =>
    hand.push(
      <Square
        key={index}
        piece={piece}
        onSquareClick={() => selectFunc(piece, index)}
        toggleSelected={isPlayerTurn && (index === selected.index) ? true : false}
      />,
    ),
  );

  return hand;
}

function App() {
  const [squares, setSquares]: [
    Piece[][],
    React.Dispatch<React.SetStateAction<Piece[][]>>,
  ] = useState(Array(8).fill(Array(8).fill(null)));
  const [pieces, setPieces] = useState({
    kittens: 4,
    cats: 0,
    cubs: 4,
    tigers: 0,
  });
  const [catsAreNext, setCatsAreNext] = useState(true);
  const hands = calcHands();
  const catHand: Piece[] = Array(hands.kittens)
    .fill(KITTEN)
    .concat(Array(hands.cats).fill(CAT));
  const tigerHand: Piece[] = Array(hands.cubs)
    .fill(CUB)
    .concat(Array(hands.tigers).fill(TIGER));
  const [selected, setSelected] = useState({ piece: KITTEN, index: -1 });

  function handlePlay(squares: Piece[][]) {
    setSquares(squares);
    setSelected({piece: KITTEN,index: -1})
    setCatsAreNext(!catsAreNext)
  }

  function handleSelect(piece: Piece, index: number ) {
    setSelected({piece: piece, index: index});
  }

  function countBoardPieces(character: Piece) {
    return squares.flat().filter((square) => square === character).length;
  }

  function calcHands() {
    return {
      kittens: pieces.kittens - countBoardPieces(KITTEN),
      cats: pieces.cats - countBoardPieces(CAT),
      cubs: pieces.cubs - countBoardPieces(CUB),
      tigers: pieces.tigers - countBoardPieces(TIGER),
    };
  }

  return (
    <>
      <h1>Boop</h1>
      <div className="game">
        <Board squares={squares} selected={selected} onPlay={handlePlay} />
        <div className="hands">
          <div className="cat-hand">
            <Hand
              pieces={catHand}
              catsAreNext={catsAreNext}
              player="cats"
              onSelect={handleSelect}
              selected={selected}
            />
          </div>
          <div className="tiger-hand">
            <Hand
              pieces={tigerHand}
              catsAreNext={catsAreNext}
              player="tigers"
              onSelect={handleSelect}
              selected={selected}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
