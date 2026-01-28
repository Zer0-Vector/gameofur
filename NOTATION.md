# Game Log Notation

Similar to chess notation, but each move is on a separate line.

Each line: `<roll><end space>[!*]`

* `<roll>`: number rolled
* `<end space>`: ending space

If `<end space>` was a rosette, mark the move with an asterisk (`*`).

If an opponent's piece was knocked out by moving to `<end>`, mark move with exclamation point (`!`).

Spaces in player A's area are notated `A#`, where `#` is the row number. Player B's area is `B#`. Starting spaces for player 1 and Player B are `A4` and `B4`.

The middle lane is `M#`.

Spaces `A5`, `A6`, `B5` and `B6` do not exist.

Rosettes are on spaces `A1`,`B1`,`M4`,`A7` and `B7`.

If `<start>` is the starting area, then no starting space is notated.

Finish area is notated `FINISH`.

If a zero is rolled, the move is notated `0`.

Player A path: `A4 A3 A2 A1 M1 M2 M3 M4 M5 M6 M7 M8 A8 A7 F`

Player B path: `B4 B3 B2 B1 M1 M2 M3 M4 M5 M6 M7 M8 B8 B7 F`

Occupied spaces can be listed after a `/`. For middle spaces, the player letter should be appended to the space notation, e.g. `M2B` if player B occupies space `M2`.

# Example

```text
2A3  / A3
3B2  / A3,B2
2A1* / A1,B2
3A2  / A1,A2,B2
4B1  / A2,A1,B2,B1
0    /
3M2  / A1,M2A,B2,B1
2M2! / A1,M2B,B2
.
.
.
```
