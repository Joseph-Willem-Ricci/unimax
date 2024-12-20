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
const MOVE_VAL_DENOMINATOR = 9; // ~ between preferring no capture vs preferring free movement


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
    const game = createChessGame();
    playGame(game);
});

function initializeBoard(board) {
    const chessboardElement = document.getElementById('chessboard');

    // Create squares
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const square = document.createElement('div');
            square.classList.add('square');

            if ((row + col) % 2 === 0) {
                square.classList.add('light-square');
            } else {
                square.classList.add('dark-square');
            }

            // Position the square
            square.style.left = `${col * 60}px`;
            square.style.top = `${row * 60}px`;

            chessboardElement.appendChild(square);
        }
    }

    // Create pieces
    const pieceElements = new Map(); // Map to keep track of piece elements

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = board[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece');
                pieceElement.textContent = piece.toString();

                // Position the piece
                pieceElement.style.left = `${col * 60}px`;
                pieceElement.style.top = `${row * 60}px`;

                chessboardElement.appendChild(pieceElement);

                // Store the piece element for later reference
                pieceElements.set(`${row},${col}`, pieceElement);
            }
        }
    }

    return pieceElements;
}

function playGame(game) {
    const PIECE_ANIMATION_DURATION_MS = 50; // TODO: Match CSS
    const TRAIL_FADEOUT_DURATION_MS = 15000;
    const TIMEOUT_BUFFER_MS = 20;

    let isPlayer1Turn = true;
    const capturedList = [];
    let moveCount = 0;
    const chessboardElement = document.getElementById('chessboard');
    const pieceElements = initializeBoard(game.getBoard());
    const turnInfoElement = document.getElementById('turn-info');
    const capturedPiecesElement = document.getElementById('captured-pieces');


    function updateGameInfo() {
        turnInfoElement.textContent = `Turn ${moveCount + 1}`;
        capturedPiecesElement.textContent = `Captured pieces: ${capturedList.join(' ')}`;
    }

    updateGameInfo();

    function makeMove() {
        if (game.isGameOver()) {
            turnInfoElement.textContent = 'Game over';
            return;
        }

        // TODO: adjust unimax search depth. 2 = shallow/quick, 4 = deep/slow
        const bestMove = game.getBestMove(isPlayer1Turn, 3);
        if (!bestMove) {
            return;
        }

        const { moveFrom, moveTo } = bestMove;
        const capturedPiece = game.getBoard()[moveTo[0]][moveTo[1]];

        // Perform the move in the game logic
        game.performMove(moveFrom, moveTo);

        // Update the UI
        const fromKey = `${moveFrom[0]},${moveFrom[1]}`;
        const toKey = `${moveTo[0]},${moveTo[1]}`;
        const pieceElement = pieceElements.get(fromKey);

        // Handle captured piece
        if (capturedPiece) {
            const capturedPieceElement = pieceElements.get(toKey);
            if (capturedPieceElement) {
                capturedPieceElement.style.opacity = '0';
                setTimeout(() => {
                    try {
                        capturedPieceElement.remove();
                    } catch (error) {
                        console.error('Error removing captured piece:', error);
                    }
                }, PIECE_ANIMATION_DURATION_MS);
                pieceElements.delete(toKey);
            }
            capturedList.push(capturedPiece.toString());
        }

        // Update the piece's position in the map
        pieceElements.delete(fromKey);
        pieceElements.set(toKey, pieceElement);

        // Animate the piece movement by changing 'left' and 'top'
        pieceElement.style.left = `${moveTo[1] * 60}px`;
        pieceElement.style.top = `${moveTo[0] * 60}px`;


        function createAndAnimateTrail(moveFrom, moveTo) {
            const trailHeight = 60;
            const trailElement = document.createElement('div');
            trailElement.classList.add('trail');
            if (isPlayer1Turn) {
                trailElement.classList.add('trail-player1');
            } else {
                trailElement.classList.add('trail-player2');
            }
        
            const startX = moveFrom[1] * 60 + 30; // Center X of the start square
            const startY = moveFrom[0] * 60 + 30; // Center Y of the start square
            const endX = moveTo[1] * 60 + 30;     // Center X of the end square
            const endY = moveTo[0] * 60 + 30;     // Center Y of the end square
        
            // Calculate the distance and angle
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const distance = Math.hypot(deltaX, deltaY);
            const angle = Math.atan2(deltaY, deltaX);
        
            // Position the trail at the starting point
            trailElement.style.left = `${startX}px`;
            trailElement.style.top = `${startY - trailHeight / 2}px`;

            // Set the width to the distance between the two points
            trailElement.style.width = `${distance}px`;
        
            // Rotate the trail to align with the movement direction
            trailElement.style.transformOrigin = '0% 50%';
            trailElement.style.transform = `rotate(${angle}rad)`;
        
            const firstPieceElement = chessboardElement.querySelector('.piece');
            if (firstPieceElement) {
                chessboardElement.insertBefore(trailElement, firstPieceElement);
            } else {
                chessboardElement.appendChild(trailElement);
            }
        
            // Start the fade-out animation
            setTimeout(() => {
                trailElement.style.opacity = '0';
            }, TIMEOUT_BUFFER_MS); // Small delay to ensure the trail is rendered before fading
        
            // Remove the trail after the animation completes
            setTimeout(() => {
                trailElement.remove();
            }, TRAIL_FADEOUT_DURATION_MS + TIMEOUT_BUFFER_MS);
        }
        
        // Animate the piece's "trail"
        createAndAnimateTrail(moveFrom, moveTo, chessboardElement);

        moveCount++;
        isPlayer1Turn = !isPlayer1Turn;

        updateGameInfo();

        // Schedule the next move after the animation completes
        setTimeout(makeMove, PIECE_ANIMATION_DURATION_MS + TIMEOUT_BUFFER_MS);
    }

    // Start the game loop
    makeMove();
}

