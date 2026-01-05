# Game Log Notation

Similar to chess notation, but each move is on a separate line.

Each line: `<roll><end space>[!*]`

* `<roll>`: number rolled
* `<end space>`: ending space

If `<end space>` was a rosette, mark the move with an asterisk (`*`).

If an opponent's piece was knocked out by moving to `<end>`, mark move with exclamation point (`!`).

Spaces in player A's area are notated `a#`, where `#` is the row number. Player B's area is `b#`. Starting spaces for player 1 and Player B are `a4` and `b4`.

The middle lane is `m#`.

Spaces `a5`, `a6`, `b5` and `b6` do not exist.

Rosettes are on spaces `a1`,`b1`,`m4`,`a7` and `b7`.

If `<start>` is the starting area, then no starting space is notated.

Finish area is notated `F`.

If a zero is rolled, the move is notated `0`.

Player A path: `a4 a3 a2 a1 m1 m2 m3 m4 m5 m6 m7 m8 a8 a7 F`

Player B path: `b4 b3 b2 b1 m1 m2 m3 m4 m5 m6 m7 m8 b8 b7 F`

Occupied spaces can be listed after a `/`. For middle spaces, the player letter should be appended to the space notation, e.g. `m2b` if player B occupies space `m2`.

# Example

```text
2a3  / a3
3b2  / a3,b2
2a1* / a1,b2
3a2  / a1,a2,b2
4b1  / a2,a1,b2,b1
0    /
3m2  / a1,m2a,b2,b1
2m2! / a1,m2b,b2
.
.
.
```
