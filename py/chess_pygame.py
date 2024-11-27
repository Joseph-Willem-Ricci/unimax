import pygame as pg
import unimax_chess

# Initialize Pygame
pg.init()
ROWS = 8
COLS = 8
WIDTH = 1000
HEIGHT = 800
SQUARE_SIZE = HEIGHT // ROWS

PAWN_SIZE = 55
PIECE_SIZE = 80
SMALL_PIECE_SIZE = 40
SMALL_PAWN_SIZE = SMALL_PIECE_SIZE / PIECE_SIZE * PAWN_SIZE

PAWN_OFFSET = SQUARE_SIZE // 2 - PAWN_SIZE // 2
PIECE_OFFSET = SQUARE_SIZE // 2 - PIECE_SIZE // 2

screen = pg.display.set_mode([WIDTH, HEIGHT])
pg.display.set_caption("Unimax Algorithm Chess Simulation - Joseph Willem Ricci")
timer = pg.time.Clock()
fps = 60

b_q = pg.transform.scale(pg.image.load("py/images/b_q.png"), (PIECE_SIZE, PIECE_SIZE))
b_k = pg.transform.scale(pg.image.load("py/images/b_k.png"), (PIECE_SIZE, PIECE_SIZE))
b_n = pg.transform.scale(pg.image.load("py/images/b_n.png"), (PIECE_SIZE, PIECE_SIZE))
b_r = pg.transform.scale(pg.image.load("py/images/b_r.png"), (PIECE_SIZE, PIECE_SIZE))
b_p = pg.transform.scale(pg.image.load("py/images/b_p.png"), (PAWN_SIZE, PAWN_SIZE))
b_b = pg.transform.scale(pg.image.load("py/images/b_b.png"), (PIECE_SIZE, PIECE_SIZE))
w_q = pg.transform.scale(pg.image.load("py/images/w_q.png"), (PIECE_SIZE, PIECE_SIZE))
w_k = pg.transform.scale(pg.image.load("py/images/w_k.png"), (PIECE_SIZE, PIECE_SIZE))
w_n = pg.transform.scale(pg.image.load("py/images/w_n.png"), (PIECE_SIZE, PIECE_SIZE))
w_r = pg.transform.scale(pg.image.load("py/images/w_r.png"), (PIECE_SIZE, PIECE_SIZE))
w_p = pg.transform.scale(pg.image.load("py/images/w_p.png"), (PAWN_SIZE, PAWN_SIZE))
w_b = pg.transform.scale(pg.image.load("py/images/w_b.png"), (PIECE_SIZE, PIECE_SIZE))

b_q_small = pg.transform.scale(b_q, (SMALL_PIECE_SIZE, SMALL_PIECE_SIZE))
b_k_small = pg.transform.scale(b_k, (SMALL_PIECE_SIZE, SMALL_PIECE_SIZE))
b_n_small = pg.transform.scale(b_n, (SMALL_PIECE_SIZE, SMALL_PIECE_SIZE))
b_r_small = pg.transform.scale(b_r, (SMALL_PIECE_SIZE, SMALL_PIECE_SIZE))
b_p_small = pg.transform.scale(b_p, (SMALL_PAWN_SIZE, SMALL_PAWN_SIZE))
b_b_small = pg.transform.scale(b_b, (SMALL_PIECE_SIZE, SMALL_PIECE_SIZE))
w_q_small = pg.transform.scale(w_q, (SMALL_PIECE_SIZE, SMALL_PIECE_SIZE))
w_k_small = pg.transform.scale(w_k, (SMALL_PIECE_SIZE, SMALL_PIECE_SIZE))
w_n_small = pg.transform.scale(w_n, (SMALL_PIECE_SIZE, SMALL_PIECE_SIZE))
w_r_small = pg.transform.scale(w_r, (SMALL_PIECE_SIZE, SMALL_PIECE_SIZE))
w_p_small = pg.transform.scale(w_p, (SMALL_PAWN_SIZE, SMALL_PAWN_SIZE))
w_b_small = pg.transform.scale(w_b, (SMALL_PIECE_SIZE, SMALL_PIECE_SIZE))

white_images = [w_q, w_k, w_n, w_r, w_p, w_b]
white_images_small = [w_q_small, w_k_small, w_n_small, w_r_small, w_p_small, w_b_small]
black_images = [b_q, b_k, b_n, b_r, b_p, b_b]
black_images_small = [b_q_small, b_k_small, b_n_small, b_r_small, b_p_small, b_b_small]

piece_str_to_image = {"Q>": b_q, "K>": b_k, "N>": b_n, "R>": b_r, "p>": b_p, "B>": b_b,
                      "<Q": w_q, "<K": w_k, "<N": w_n, "<R": w_r, "<p": w_p, "<B": w_b}

def draw_board():
  for row in range(ROWS):
    for col in range(COLS):
      x = col * SQUARE_SIZE
      y = row * SQUARE_SIZE
      if (row + col) % 2 == 0:
        pg.draw.rect(screen, "light gray", [x, y, SQUARE_SIZE, SQUARE_SIZE])
      else:
        pg.draw.rect(screen, "dark gray", [x, y, SQUARE_SIZE, SQUARE_SIZE])
  pg.draw.rect(screen, "gray", [800, 0, 200, HEIGHT])

def draw_pieces(board):
  for row in range(ROWS):
    for col in range(COLS):
      piece = board[row][col]
      if piece:
        piece_str = str(piece)
        piece_image = piece_str_to_image[piece_str]
        if piece_str in ["p>", "<p"]:
          screen.blit(piece_image, (row * SQUARE_SIZE + PAWN_OFFSET, col * SQUARE_SIZE + PAWN_OFFSET))
        else:
          screen.blit(piece_image, (row * SQUARE_SIZE + PIECE_OFFSET, col * SQUARE_SIZE + PIECE_OFFSET))

def play(game):
    screen.fill('dark gray')
    draw_board()
    draw_pieces(game.get_board())
    pg.display.flip()

    i = 0
    captured_list = []
    playing = True
    while playing:
        is_player1 = i % 2 == 0
        move = game.get_best_move(is_player1, depth := 2)
        _, move_to = move[0], move[1]        
        game.prev_states.add(tuple(tuple(x) for x in game.get_board()))
        captured = game.get_board()[move_to[0]][move_to[1]]
        if captured:
            captured_list.append(captured)
            game.prev_states.clear()  # empty the set of previous states (because disjoint sets)
        game.perform_move(*move)
        timer.tick(fps)
        screen.fill('dark gray')
        draw_board()
        draw_pieces(game.get_board())
        
        for event in pg.event.get():
          if event.type == pg.QUIT:
            playing = False

        pg.display.flip()
        i += 1

    pg.quit()

game = unimax_chess.create_chess_game()
play(game)
