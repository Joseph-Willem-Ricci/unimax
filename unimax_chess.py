import random
import copy

ROWS = 8
COLS = 8
P1, P2 = True, False
PAWN_VAL = 1
KNIGHT_VAL = 3
BISHOP_VAL = 3
ROOK_VAL = 5
QUEEN_VAL = 9
KING_VAL = 200
MOVE_VAL_DENOMINATOR = 10


class Piece(object):
    def __init__(self, is_player1):
        self.is_player1 = is_player1
        self.val = 0
        
    def is_empty(self, piece):
        return not piece
    
    def is_opponent(self, piece):
        return piece and piece.is_player1 != self.is_player1
    
    def is_in_bounds(self, r, c):
        return 0 <= r < ROWS and 0 <= c < COLS
    
    def is_self(self, piece):
        return piece == self
    
    def is_valid_move(self, r, c, board):
        return self.is_in_bounds(r, c) and \
            not board[r][c] == self and \
                (self.is_empty(board[r][c]) or self.is_opponent(board[r][c]))
    

class Pawn(Piece):
    def __init__(self, is_player1):
        super().__init__(is_player1)
        self.val = PAWN_VAL
    
    def get_valid_moves(self, row, col, board):
        """Player 1's pawns begins at index 1 and move positively,
        Player 2's pawns begin at index 6 and move negatively."""
        
        init_row = 1 if self.is_player1 else 6
        direction = 1 if self.is_player1 else -1

        if row == init_row and self.is_empty(board[row + 2 * direction][col]) and self.is_empty(board[row + direction][col]):
            yield (row + 2 * direction, col)
        if 0 <= row + direction < 8 and self.is_empty(board[row + direction][col]):
            yield (row + direction, col)
        if 0 < row < 7:
            if col > 0 and self.is_opponent(board[row + direction][col - 1]):
                yield (row + direction, col - 1)
            if col < 7 and self.is_opponent(board[row + direction][col + 1]):
                yield (row + direction, col + 1)

    def __str__(self):
        return "p>" if self.is_player1 else "<p"

class Rook(Piece):
    def __init__(self, is_player1):
        super().__init__(is_player1)
        self.val = ROOK_VAL
    
    def get_valid_moves(self, row, col, board):
        up = [(r, col) for r in range(row + 1, ROWS)]
        down = [(r, col) for r in range(row - 1, -1, -1)]
        left = [(row, c) for c in range(col - 1, -1, -1)]
        right = [(row, c) for c in range(col + 1, COLS)]
        paths = [up, down, left, right]

        for path in paths:
            for r, c in path:
                if self.is_empty(board[r][c]):
                    yield (r, c)
                elif self.is_opponent(board[r][c]):
                    yield (r, c)
                    break
                elif board[r][c]:
                    break

    def __str__(self):
        return "R>" if self.is_player1 else "<R"
    
class Knight(Piece):
    def __init__(self, is_player1):
        super().__init__(is_player1)
        self.val = KNIGHT_VAL
    
    def get_valid_moves(self, row, col, board):
        for r, c in [(row - 2, col - 1), (row - 2, col + 1),
                     (row + 2, col - 1), (row + 2, col + 1),
                     (row - 1, col - 2), (row - 1, col + 2),
                     (row + 1, col - 2), (row + 1, col + 2)]:
            
            if self.is_valid_move(r, c, board):
                yield (r, c)
    
    def __str__(self):
        return "N>" if self.is_player1 else "<N"

class Bishop(Piece):
    def __init__(self, is_player1):
        super().__init__(is_player1)
        self.val = BISHOP_VAL
    
    def get_valid_moves(self, row, col, board):
        diag1 = [(row + i, col + i) for i in range(1, min(ROWS - row, COLS - col))]
        diag2 = [(row + i, col - i) for i in range(1, min(ROWS - row, col + 1))]
        diag3 = [(row - i, col + i) for i in range(1, min(row + 1, COLS - col))]
        diag4 = [(row - i, col - i) for i in range(1, min(row + 1, col + 1))]

        diagonals = [diag1, diag2, diag3, diag4]

        for diagonal in diagonals:
            for r, c in diagonal:
                if self.is_empty(board[r][c]):
                    yield (r, c)
                elif self.is_opponent(board[r][c]):
                    yield (r, c)
                    break
                elif board[r][c]:
                    break

    def __str__(self):
        return "B>" if self.is_player1 else "<B"

class King(Piece):
    def __init__(self, is_player1):
        super().__init__(is_player1)
        self.val = KING_VAL
    
    def get_valid_moves(self, row, col, board):
        for r in range(row - 1, row + 2):
            for c in range(col - 1, col + 2):
                if self.is_valid_move(r, c, board):
                    yield (r, c)

    def __str__(self):
        return "K>" if self.is_player1 else "<K"

class Queen(Piece):
    def __init__(self, is_player1):
        super().__init__(is_player1)
        self.val = QUEEN_VAL
    
    def get_valid_moves(self, row, col, board):
        diag1 = [(row + i, col + i) for i in range(1, min(ROWS - row, COLS - col))]
        diag2 = [(row + i, col - i) for i in range(1, min(ROWS - row, col + 1))]
        diag3 = [(row - i, col + i) for i in range(1, min(row + 1, COLS - col))]
        diag4 = [(row - i, col - i) for i in range(1, min(row + 1, col + 1))]
        up = [(r, col) for r in range(row + 1, ROWS)]
        down = [(r, col) for r in range(row - 1, -1, -1)]
        left = [(row, c) for c in range(col - 1, -1, -1)]
        right = [(row, c) for c in range(col + 1, COLS)]
        paths = [diag1, diag2, diag3, diag4, up, down, left, right]

        for path in paths:
            for r, c in path:
                if self.is_empty(board[r][c]):
                    yield (r, c)
                elif self.is_opponent(board[r][c]):
                    yield (r, c)
                    break
                elif board[r][c]:
                    break

    def __str__(self):
        return "Q>" if self.is_player1 else "<Q"



INIT_BOARD = [[Rook(P1), Knight(P1), Bishop(P1), Queen(P1), King(P1), Bishop(P1), Knight(P1), Rook(P1)],
             [Pawn(P1) for _ in range(8)],
             [False] * 8,
             [False] * 8,
             [False] * 8,
             [False] * 8,
             [Pawn(P2) for _ in range(8)],
             [Rook(P2), Knight(P2), Bishop(P2), Queen(P2), King(P2), Bishop(P2), Knight(P2), Rook(P2)]]


class ChessGame(object):

    def __init__(self, board):
        self.is_being_played = False
        self.board = board
        self.prev_states = set()
        if self.game_over():
            self.val = 0
        else:
            self.val = sum(piece.val for row in self.board for piece in row if piece) + \
                (sum(1 for _ in self.legal_moves(True)) + sum(1 for _ in self.legal_moves(False))) / \
                    MOVE_VAL_DENOMINATOR

    def get_board(self):
        return self.board

    def reset(self):
        self.board = copy.deepcopy(INIT_BOARD)
    
    def legal_moves(self, is_player1):
        for r in range(ROWS):
            for c in range(COLS):
                piece = self.board[r][c]
                if piece and piece.is_player1 == is_player1:
                    for move_to in piece.get_valid_moves(r, c, self.board):
                        move_from = (r, c)
                        yield move_from, move_to


    def perform_move(self, move_from, move_to):
        from_row, from_col = move_from
        to_row, to_col = move_to
        captured_piece = self.board[to_row][to_col]
        if captured_piece:
            self.val -= captured_piece.val
        self.board[to_row][to_col] = self.board[from_row][from_col]
        self.board[from_row][from_col] = False

    def game_over(self):
        if sum(1 for row in self.board for piece in row if piece and piece.val == KING_VAL) < 2:
            return True
        return False

    def copy(self):
        return ChessGame([row[:] for row in self.board])
    
    def successors(self, is_player1):
        moves = list(self.legal_moves(is_player1))
        random.shuffle(moves)
        for move in moves:
            new_game = self.copy()
            new_game.perform_move(*move)
            yield (move, new_game)

    def get_random_move(self, is_player1):
        return random.choice(list(self.legal_moves(is_player1)))

    def get_best_move(self, is_player1, limit):
        root = Node(self, None, is_player1, None)
        root.search_for_value(limit, None, root)
        return root.best_move


class Node(object):
    
    def __init__(self, game_obj, parent_node, is_player1, move):
        self.game = game_obj
        self.parent = parent_node
        self.is_player1 = is_player1
        self.move = move
        self.best_move = None
        self.num_leaf_nodes = 0
        self.val = 0
        self.depth = 0 if parent_node is None else parent_node.depth + 1
      
    def is_leaf(self, limit):
        return self.depth == limit or self.game.game_over()

    def update_parent(self):
        if self.parent is not None and self.val > self.parent.val:
            self.parent.val = self.val
            self.parent.best_move = self.move

    def should_prune(self):
        if self.parent is not None and self.game.val >= self.parent.game.val:
            return True
        return False

    def search_for_value(self, limit, move, root):
        if self.is_leaf(limit):
            self.val = self.game.val
        else:
            for move, child_game in self.game.successors(self.is_player1):
                if tuple(tuple(x) for x in child_game.get_board()) in root.game.prev_states:                    
                    continue
                child_node = Node(child_game, self, not self.is_player1, move)
                child_node.search_for_value(limit, move, root)
                if self.should_prune():
                    self.update_parent()
                    return
        self.update_parent()

def create_chess_game():
    return ChessGame(INIT_BOARD)

