import { useState, type MouseEventHandler } from "react";
import "./App.css";

type Piece = "🐈" | "🐱" | "🐅" | "🐯" | null;
const [KITTEN, CAT, CUB, TIGER]: Piece[] = ["🐈", "🐱", "🐅", "🐯"];

function Square({
  piece,
  toggleSelected,
  onSquareClick,
  invisible,
}: {
  piece?: Piece;
  toggleSelected?: boolean;
  onSquareClick?: MouseEventHandler;
  invisible?: boolean;
}) {
  const style: React.CSSProperties = {};

  if (toggleSelected) style.backgroundColor = "var(--accent-border)";
  if (invisible) style.visibility = "hidden";

  return (
    <div className="square">
      <button style={style} onClick={onSquareClick}>
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
  squares?: Piece[][] | null[][];
  onPlay: Function;
  selected: { piece: Piece; index: number };
}) {
  function handleClick(row: number, col: number) {
    if (selected.index < 0 || !squares || squares[row][col]) return;

    const nextSquares = squares.map((row) => row.slice());
    nextSquares[row][col] = selected.piece;
    onPlay(row, col, nextSquares);
  }
  return (
    <div className="game-board">
      {squares?.map((row, rowIndex) => {
        return row.map((square, colIndex) => {
          return (
            <Square
              key={rowIndex * 8 + colIndex}
              piece={square}
              onSquareClick={() => handleClick(rowIndex, colIndex)}
              invisible={
                rowIndex == 0 ||
                rowIndex == squares.length - 1 ||
                colIndex == 0 ||
                colIndex == squares.length - 1
              }
            />
          );
        });
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

  const selectFunc: (piece: Piece, index: number) => void = isPlayerTurn
    ? onSelect
    : () => null;

  {
  }
  pieces?.forEach((piece, index) =>
    hand.push(
      <Square
        key={index}
        piece={piece}
        onSquareClick={() => selectFunc(piece, index)}
        toggleSelected={isPlayerTurn && index === selected.index ? true : false}
      />,
    ),
  );

  return hand;
}

function App() {
  const [squares, setSquares]: [
    Piece[][] | null[][],
    React.Dispatch<React.SetStateAction<Piece[][] | null[][]>>,
  ] = useState(Array(8).fill(Array(8).fill(null)));
  const [pieces, setPieces] = useState({
    kittens: 8,
    cats: 0,
    cubs: 8,
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
  const [winner, setWinner] = useState(false);

  function handlePlay(
    moveRow: number,
    moveCol: number,
    squares: [[Piece | null]],
  ) {
    if (winner) return;
    const blastZone = [];

    // blastZone should be all pieces adjacent and diagonal to move
    for (let i = moveRow - 1; i < moveRow + 2; i++) {
      for (let j = moveCol - 1; j < moveCol + 2; j++) {
        if (i == moveRow && j == moveCol) continue;
        blastZone.push([i, j]);
      }
    }

    blastZone.forEach((target) => boop(moveRow, moveCol, target[0], target[1]));

    checkLines();

    setSquares(squares);
    setSelected({ piece: KITTEN, index: -1 });
    setCatsAreNext(!catsAreNext);

    function boop(
      moveRow: number,
      moveCol: number,
      targetRow: number,
      targetCol: number,
    ) {
      if (isPieceInGutter(targetRow, targetCol)) return;
      // (targetRow - moveRow) + targetRow, algebraically reduced
      const destinationRow = 2 * targetRow - moveRow;
      const destinationCol = 2 * targetCol - moveCol;

      if (squares[destinationRow][destinationCol]) return;

      const moveIsLarge = isPieceLarge(squares[moveRow][moveCol]);
      const targetIsLarge = isPieceLarge(squares[targetRow][targetCol]);

      if (!targetIsLarge || moveIsLarge) {
        squares[destinationRow][destinationCol] = squares[targetRow][targetCol];
        squares[targetRow][targetCol] = null;
      } else return;

      if (isPieceInGutter(destinationRow, destinationCol)) {
        squares[destinationRow][destinationCol] = null;
      }
    }

    function checkLines() {
      for (let row = 2; row < squares.length - 2; row++) {
        for (let col = 2; col < squares.length - 2; col++) {
          // We'll always check a line ahead vertically and horizontally,
          // but we do some extra on the first checked row and column.
          // This is to prevent double-checking
          const lines = [
            [
              [row - 1, col + 1],
              [row, col + 1],
              [row + 1, col + 1],
            ],
            [
              [row + 1, col - 1],
              [row + 1, col],
              [row + 1, col + 1],
            ],
            [
              [row - 1, col - 1],
              [row, col],
              [row + 1, col + 1],
            ],
            [
              [row + 1, col - 1],
              [row, col],
              [row - 1, col + 1],
            ],
          ];

          if (row == 2) {
            lines.push([
              [row - 1, col - 1],
              [row - 1, col],
              [row - 1, col + 1],
            ]);
            lines.push([
              [row, col - 1],
              [row, col],
              [row, col + 1],
            ]);
          }
          if (col == 2) {
            lines.push(
              [
                [row - 1, col - 1],
                [row, col - 1],
                [row + 1, col - 1],
              ],
              [
                [row - 1, col],
                [row, col],
                [row + 1, col],
              ],
            );
          }

          for (const line of lines) {
            const linePieces = line.map(
              (square) => squares[square[0]][square[1]],
            );

            if (
              linePieces.every((piece) => isPieceCatlike(piece)) ||
              linePieces.every((piece) => isPieceTigerLike(piece))
            ) {
              if (linePieces.every((piece) => isPieceLarge(piece))) {
                setWinner(true);
              } else {
                line.forEach((square) => promote(square[0], square[1]));
              }
            }
          }
        }
      }
    }

    function promote(row: number, col: number): void {
      if (isPieceLarge(squares[row][col])) {
        squares[row][col] = null;
        return;
      }

      if (isPieceCatlike(squares[row][col])) {
        pieces.kittens--;
        pieces.cats++;
      } else {
        pieces.cubs--;
        pieces.tigers++;
      }

      squares[row][col] = null;
    }

    function isPieceInGutter(row: number, col: number) {
      return (
        row == 0 ||
        row == squares.length - 1 ||
        col == 0 ||
        col == squares.length - 1
      );
    }

    function isPieceLarge(piece: Piece): boolean {
      return [CAT, TIGER].includes(piece);
    }

    function isPieceCatlike(piece: Piece): boolean {
      return [CAT, KITTEN].includes(piece);
    }

    function isPieceTigerLike(piece: Piece): boolean {
      return [TIGER, CUB].includes(piece);
    }
  }

  function handleSelect(piece: Piece, index: number) {
    setSelected({ piece: piece, index: index });
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
        <h1>{winner ? "Winner" : ""}</h1>
      </div>
    </>
  );
}

export default App;
