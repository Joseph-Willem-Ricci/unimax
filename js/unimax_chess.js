// Constants
const ROWS = 8;
const COLS = 8;
const P1 = true;
const P2 = false;
const PAWN_VAL = 1;  // initial values from https://www.pi.infn.it/%7Ecarosi/chess/shannon.txt
const KNIGHT_VAL = 3;
const BISHOP_VAL = 3;
const ROOK_VAL = 5;
const QUEEN_VAL = 9;
const KING_VAL = 200;
const MOVE_VAL_DENOMINATOR = 7.5; // ~ between preferring no capture vs preferring free movement
const TIME_PER_MOVE = 300 // ms


class Piece {
    constructor(isPlayer1) {
        this.isPlayer1 = isPlayer1;
        this.val = 0;
    }

    isEmpty(piece) {
        return !piece;
    }

    isOpponent(piece) {
        return piece && piece.isPlayer1 !== this.isPlayer1;
    }

    isInBounds(r, c) {
        return 0 <= r && r < ROWS && 0 <= c && c < COLS;
    }

    isSelf(piece) {
        return piece === this;
    }

    isValidMove(r, c, board) {
        return (
            this.isInBounds(r, c) &&
            board[r][c] !== this &&
            (this.isEmpty(board[r][c]) || this.isOpponent(board[r][c]))
        );
    }

    getValidMoves(row, col, board) {
        return [];
    }
}


class Pawn extends Piece {
    constructor(isPlayer1) {
        super(isPlayer1);
        this.val = PAWN_VAL;
    }

    getValidMoves(row, col, board) {
        /**
         * Player 1's pawn begins at index 1 and moves positively,
         * Player 2's pawn begins at index 6 and moves negatively.
         */
        const moves = [];
        const initRow = this.isPlayer1 ? 1 : 6;
        const direction = this.isPlayer1 ? 1 : -1;

        // check initial double forward move
        if (
            row == initRow &&
            this.isEmpty(board[row + 2 * direction][col]) &&
            this.isEmpty(board[row + direction][col])
        ) {
            moves.push([row + 2 * direction, col]);
        }

        // check single forward move
        if (
            0 <= row + direction && row + direction < ROWS &&
            this.isEmpty(board[row + direction][col])
        ) {
            moves.push([row + direction, col]);
        }

        // check diagonal captures
        if (0 < row && row < ROWS - 1) {
            if (col > 0 && this.isOpponent(board[row + direction][col - 1])) {
              moves.push([row + direction, col - 1]);
            }
            if (col < COLS - 1 && this.isOpponent(board[row + direction][col + 1])) {
              moves.push([row + direction, col + 1]);
            }
        }
        return moves;
    }

    toString() {
        return this.isPlayer1 ? '♙' : '♟';
    }
}


class Rook extends Piece {
    constructor(isPlayer1) {
        super(isPlayer1);
        this.val = ROOK_VAL;
    }

    getValidMoves(row, col, board) {
        const moves = [];
        const up = Array.from({ length: ROWS - row - 1 }, (_, i) => [row + i + 1, col]);
        const down = Array.from({ length: row }, (_, i) => [row - i - 1, col]);
        const left = Array.from({ length: col }, (_, i) => [row, col - i - 1]);
        const right = Array.from({ length: COLS - col - 1 }, (_, i) => [row, col + i + 1]);
        const paths = [up, down, left, right];

        for (const path of paths) {
            for (const [r, c] of path) {
                if (this.isEmpty(board[r][c])) {
                    moves.push([r, c]);
                } else if (this.isOpponent(board[r][c])) {
                    moves.push([r, c]);
                    break; // Stop after capturing an opponent piece
                } else {
                    break; // Stop at any other obstruction
                }
            }
        }

        return moves;
    }

    toString() {
        return this.isPlayer1 ? '♖' : '♜';
    }
}


class Knight extends Piece {
    constructor(isPlayer1) {
        super(isPlayer1);
        this.val = KNIGHT_VAL;
    }

    getValidMoves(row, col, board) {
        const moves = [];
        const knightMoves = [
            [row - 2, col - 1], [row - 2, col + 1],
            [row + 2, col - 1], [row + 2, col + 1],
            [row - 1, col - 2], [row - 1, col + 2],
            [row + 1, col - 2], [row + 1, col + 2],
        ];

        for (const [r, c] of knightMoves) {
            if (this.isValidMove(r, c, board)) {
              moves.push([r, c]);
            }
        }
      
        return moves;
    }

    toString() {
        return this.isPlayer1 ? '♘' : '♞';
    }
}


class Bishop extends Piece {
    constructor(isPlayer1) {
        super(isPlayer1);
        this.val = BISHOP_VAL;
    }

    getValidMoves(row, col, board) {
        const moves = [];
        const diag1 = Array.from(
            { length: Math.min(ROWS - row, COLS - col) - 1 },
            (_, i) => [row + i + 1, col + i + 1]
        );
        const diag2 = Array.from(
            { length: Math.min(ROWS - row, col + 1) - 1 },
            (_, i) => [row + i + 1, col - i - 1]
        );
        const diag3 = Array.from(
            { length: Math.min(row + 1, COLS - col) - 1 },
            (_, i) => [row - i - 1, col + i + 1]
        );
        const diag4 = Array.from(
            { length: Math.min(row + 1, col + 1) - 1 },
            (_, i) => [row - i - 1, col - i - 1]
        );
      
        const diagonals = [diag1, diag2, diag3, diag4];

        for (const diagonal of diagonals) {
            for (const [r, c] of diagonal) {
                if (this.isEmpty(board[r][c])) {
                    moves.push([r, c]);
                } else if (this.isOpponent(board[r][c])) {
                    moves.push([r, c]);
                    break; // Stop after capturing an opponent piece
                } else {
                    break; // Stop at any other obstruction
                }
            }
        }
      
        return moves;
    }

    toString() {
        return this.isPlayer1 ? '♗' : '♝';
    }
}


class King extends Piece {
    constructor(isPlayer1) {
        super(isPlayer1);
        this.val = KING_VAL;
    }

    getValidMoves(row, col, board) {
        const moves = [];
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (this.isValidMove(r, c, board)) {
                    moves.push([r, c]);
                }
            }
        }
        return moves;
    }

    toString() {
        return this.isPlayer1 ? '♔' : '♚';
    }
}


class Queen extends Piece {
    constructor(isPlayer1) {
        super(isPlayer1);
        this.val = QUEEN_VAL;
    }

    getValidMoves(row, col, board) {
        const moves = [];

        // Define diagonal paths
        const diag1 = Array.from(
            { length: Math.min(ROWS - row, COLS - col) - 1 },
            (_, i) => [row + i + 1, col + i + 1]
        );
        const diag2 = Array.from(
            { length: Math.min(ROWS - row, col + 1) - 1 },
            (_, i) => [row + i + 1, col - i - 1]
        );
        const diag3 = Array.from(
            { length: Math.min(row + 1, COLS - col) - 1 },
            (_, i) => [row - i - 1, col + i + 1]
        );
        const diag4 = Array.from(
            { length: Math.min(row + 1, col + 1) - 1 },
            (_, i) => [row - i - 1, col - i - 1]
        );

        // Define straight paths
        const up = Array.from(
            { length: ROWS - row - 1 },
            (_, i) => [row + i + 1, col]
        );
        const down = Array.from(
            { length: row },
            (_, i) => [row - i - 1, col]
        );
        const left = Array.from(
            { length: col },
            (_, i) => [row, col - i - 1]
        );
        const right = Array.from(
            { length: COLS - col - 1 },
            (_, i) => [row, col + i + 1]
        );

        const paths = [diag1, diag2, diag3, diag4, up, down, left, right];

        for (const path of paths) {
            for (const [r, c] of path) {
                if (this.isEmpty(board[r][c])) {
                    moves.push([r, c]);
                } else if (this.isOpponent(board[r][c])) {
                    moves.push([r, c]);
                    break; // Stop after capturing an opponent piece
                } else {
                    break; // Stop at any other obstruction
                }
            }
        }

        return moves;
    }

    toString() {
        return this.isPlayer1 ? '♕' : '♛';
    }
}


const INIT_BOARD = [
    [new Rook(P1), new Knight(P1), new Bishop(P1), new Queen(P1), new King(P1), new Bishop(P1), new Knight(P1), new Rook(P1)],
    Array(8).fill(null).map(() => new Pawn(P1)),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null).map(() => new Pawn(P2)),
    [new Rook(P2), new Knight(P2), new Bishop(P2), new Queen(P2), new King(P2), new Bishop(P2), new Knight(P2), new Rook(P2)]
];


class ChessGame {
    constructor(board = INIT_BOARD) {
        this.isBeingPlayed = false;
        this.board = board;
        this.prevStates = new Set();  // so as to not move to any previously visited state
        this.val = this.isGameOver() ? 0 : this.getUnimaxScore();
    }

    getBoard() {
        return this.board;
    }

    getUnimaxScore() {
        /**
         * unimax = the sum of the values of all pieces on the board plus
         * the number of legal moves available to both players divided by MOVE_VAL_DENOMINATOR
         * A higher piece value perfers states that keep that piece on the board
         * A lower move denominator prefers states that have more legal moves available
         * (sometimes at the expense of sacreficing a piece)
         */
        return this.board.flat().reduce((sum, piece) => sum + (piece ? piece.val : 0), 0) +
        (this.countLegalMoves(true) + this.countLegalMoves(false)) / MOVE_VAL_DENOMINATOR;
    }

    countLegalMoves(isPlayer1) {
        let moves = 0;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
            const piece = this.board[r][c];
            if (piece && piece.isPlayer1 === isPlayer1) {
                moves += piece.getValidMoves(r, c, this.board).length;
            }
            }
        }
        return moves;
    }

    getLegalMoves(isPlayer1) {  // TODO: optimize?
        const moves = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
            const piece = this.board[r][c];
            if (piece && piece.isPlayer1 === isPlayer1) {
                const validMoves = piece.getValidMoves(r, c, this.board);
                for (const moveTo of validMoves) {
                moves.push({ moveFrom: [r, c], moveTo });
                }
            }
            }
        }
        return moves;
    }

    performMove(moveFrom, moveTo) {
        const [fromRow, fromCol] = moveFrom;
        const [toRow, toCol] = moveTo;
        const capturedPiece = this.board[toRow][toCol];
        if (capturedPiece) {
            this.val -= capturedPiece.val;
        }
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
    }

    isGameOver() {
        const kingCount = this.board.flat().filter(piece => piece && piece.val === KING_VAL).length;
        return kingCount < 2;
    }

    copy() {
        const boardCopy = [];
        for (let r = 0; r < ROWS; r++) {
            const rowCopy = [];
            for (let c = 0; c < COLS; c++) {
                const cell = this.board[r][c];
                if (cell) {
                    const pieceCopy = new cell.constructor(cell.isPlayer1);
                    rowCopy.push(pieceCopy);
                } else {
                    rowCopy.push(null);
                }
            }
            boardCopy.push(rowCopy);
        }
        return new ChessGame(boardCopy);
    }
    

    *successors(isPlayer1) {
        const moves = [...this.getLegalMoves(isPlayer1)];
        for (let i = moves.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [moves[i], moves[j]] = [moves[j], moves[i]];
        }
      
        for (const move of moves) {
            const newGame = this.copy();
            newGame.performMove(move.moveFrom, move.moveTo);
            yield { move, game: newGame };
        }
    }

    getRandomMove(isPlayer1) {
        const legalMoves = this.getLegalMoves(isPlayer1);
        if (legalMoves.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * legalMoves.length);
        return legalMoves[randomIndex];
    }

    getBestMove(isPlayer1, limit) {
        const root = new Node(this, null, isPlayer1, null);
        root.searchForValue(limit, null, root);
        return root.bestMove;
    }
        

}


class Node {
    constructor(gameObj, parentNode, isPlayer1, move) {
        this.game = gameObj;
        this.parent = parentNode;
        this.isPlayer1 = isPlayer1;
        this.move = move;
        this.bestMove = null;
        this.val = 0;
        this.depth = parentNode === null ? 0 : parentNode.depth + 1;
    }

    isLeaf(limit) {
        return this.depth === limit || this.game.isGameOver();
    }

    updateParent() {
        if (this.parent !== null && this.val > this.parent.val) {
            this.parent.val = this.val;
            this.parent.bestMove = this.move;
        }
    }

    shouldPrune() {
        return this.parent !== null && this.game.val >= this.parent.game.val;
    }

    searchForValue(limit, move, root) {
        if (this.isLeaf(limit)) {
            this.val = this.game.val;
        } else {
            for (const { move, game: childGame } of this.game.successors(this.isPlayer1)) {
                const boardState = JSON.stringify(childGame.getBoard());
                if (root.game.prevStates.has(boardState)) {
                    continue;
                }
                const childNode = new Node(childGame, this, !this.isPlayer1, move);
                childNode.searchForValue(limit, move, root);
                if (this.shouldPrune()) {
                    this.updateParent();
                    return;
                }
            }
        }
        this.updateParent();
    }
}


function createChessGame() {
    return new ChessGame(INIT_BOARD);
}


// Initialize the game when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = createChessGame(); // Initialize your game logic here
    playGame(game);
});

/**
 * Initializes the chessboard and pieces on the board.
 * @param {Array} board - The initial state of the chessboard.
 * @returns {Array} - A 2D array containing references to the square elements.
 */
function initializeBoard(board) {
    const chessboardElement = document.getElementById('chessboard');
    const squareElements = []; // 2D array to keep track of square elements

    for (let row = 0; row < ROWS; row++) {
        const rowElements = [];
        for (let col = 0; col < COLS; col++) {
            const square = document.createElement('div');
            square.classList.add('square');

            if ((row + col) % 2 === 0) {
                square.classList.add('light-square');
            } else {
                square.classList.add('dark-square');
            }

            const piece = board[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece');
                pieceElement.textContent = piece.toString(); // Or use getUnicodePiece(piece)
                square.appendChild(pieceElement);
            }

            chessboardElement.appendChild(square);
            rowElements.push(square);
        }
        squareElements.push(rowElements);
    }

    return squareElements;
}

/**
 * Runs the game loop, making moves and updating the UI.
 * @param {Object} game - The game instance containing the game logic.
 */
function playGame(game) {
    let isPlayer1Turn = true;
    const capturedList = [];
    let moveCount = 0;
    const turnInfoElement = document.getElementById('turn-info');
    const capturedPiecesElement = document.getElementById('captured-pieces');

    // Initialize the board and get references to square elements
    const squareElements = initializeBoard(game.getBoard());

    /**
     * Updates the game information displayed to the user.
     */
    function updateGameInfo() {
        turnInfoElement.textContent = `Turn ${moveCount + 1}`;
        capturedPiecesElement.textContent = `Captured pieces: ${capturedList.join(' ')}`;
    }

    // Initial update of game info
    updateGameInfo();

    /**
     * Executes a move, updates the game state, and schedules the next move.
     */
    function makeMove() {
        if (game.isGameOver()) {
            turnInfoElement.textContent = 'Game over';
            return;
        }

        const bestMove = game.getBestMove(isPlayer1Turn, 3);
        if (!bestMove) {
            return;
        }

        const { moveFrom, moveTo } = bestMove;
        const pieceMoving = game.getBoard()[moveFrom[0]][moveFrom[1]];
        const capturedPiece = game.getBoard()[moveTo[0]][moveTo[1]];

        // Perform the move in the game logic
        game.performMove(moveFrom, moveTo);

        // Update the UI
        const fromSquare = squareElements[moveFrom[0]][moveFrom[1]];
        const toSquare = squareElements[moveTo[0]][moveTo[1]];
        const pieceElement = fromSquare.querySelector('.piece');

        // Handle captured piece
        if (capturedPiece) {
            const capturedPieceElement = toSquare.querySelector('.piece');
            if (capturedPieceElement) {
                // Fade out the captured piece
                capturedPieceElement.style.opacity = '0';
                setTimeout(() => {
                    toSquare.removeChild(capturedPieceElement);
                }, TIME_PER_MOVE);
            }
            capturedList.push(capturedPiece.toString());
        }

        // Animate the piece movement
        const deltaX = (moveTo[1] - moveFrom[1]) * 60; // Calculate horizontal movement
        const deltaY = (moveTo[0] - moveFrom[0]) * 60; // Calculate vertical movement

        // Apply the transform to animate
        pieceElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // After animation completes, reset the transform and move the piece element
        setTimeout(() => {
            pieceElement.style.transform = '';
            fromSquare.removeChild(pieceElement);
            toSquare.appendChild(pieceElement);
        }, TIME_PER_MOVE);

        moveCount++;
        isPlayer1Turn = !isPlayer1Turn;

        updateGameInfo();

        // Schedule the next move after the animation completes
        setTimeout(makeMove, TIME_PER_MOVE);
    }

    // Start the game loop
    makeMove();
}




// function playGameInTerminal(game) {
    //     let isPlayer1Turn = true;
    //     const capturedList = [];
    //     let moveCount = 0;
    
    //     // Function to print the board state
    //     function printBoard(board) {
    //         const columnLabels = '  a b c d e f g h';
    //         console.log(columnLabels);
    //         for (let rowIndex = 0; rowIndex < ROWS; rowIndex++) {
    //             const row = board[rowIndex];
    //             const rowNumber = 8 - rowIndex;
    //             const rowString = row.map(piece => (piece ? piece.toString() : '.')).join(' ');
    //             console.log(`${rowNumber} ${rowString}`);
    //         }
    //         console.log('');
    //     }
    
    //     printBoard(game.getBoard());
    
    //     while (!game.isGameOver()) {
    //         moveCount++;
    
    //         const bestMove = game.getBestMove(isPlayer1Turn, 2);  // NOTE: adjust depth limit
    //         if (!bestMove) {
    //             break;
    //         }
    
    //         const { moveFrom, moveTo } = bestMove;
    //         const pieceMoving = game.getBoard()[moveFrom[0]][moveFrom[1]];
    //         const capturedPiece = game.getBoard()[moveTo[0]][moveTo[1]];
    
    //         game.performMove(moveFrom, moveTo);
    
    //         if (capturedPiece) {
    //             capturedList.push(capturedPiece.toString());
    //         }
    
    //         const fromCol = String.fromCharCode('a'.charCodeAt(0) + moveFrom[1]);
    //         const fromRow = 8 - moveFrom[0];
    //         const toCol = String.fromCharCode('a'.charCodeAt(0) + moveTo[1]);
    //         const toRow = 8 - moveTo[0];
    
    //         printBoard(game.getBoard());
    
    //         isPlayer1Turn = !isPlayer1Turn;
    //     }
    
    //     console.log('Game over');
    //     console.log(`Captured pieces: ${capturedList.join(' ')}`);
    // }
// // Create a new chess game instance and play
// const game = createChessGame();
// playGameLocal(game);