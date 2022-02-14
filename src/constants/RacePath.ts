export type PlayerId = 1 | 2
const RacePath = new Map<PlayerId, number[]>()

RacePath.set(1, [-3, 9, 6, 3, 0, 1, 4, 7, 10, 13, 16, 19, 22, 21, 18, -6])
RacePath.set(2, [-1, 11, 8, 5, 2, 1, 4, 7, 10, 13, 16, 19, 22, 23, 20, -4])

export const PATH_START = 0
export const PATH_END = 15

export default RacePath