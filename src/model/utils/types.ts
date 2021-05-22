import { AGameAction } from "../game/abstract/AGameAction";
import { AGameState } from "../game/abstract/AGameState";
import { GameAction } from "../game/GameAction";
import { GameState } from "../game/GameState";
import { GameStateModel } from "../game/abstract/GameStateModel";
import { EntityId } from "../game/ids/EntityId";


export type Maybe<T> = T | undefined;
export type Nullable<T> = T | null;

export type PlayerEntity = EntityId.PLAYER1 | EntityId.PLAYER2;
export type OnboardSpaceEntity = EntityId.ONRAMP | EntityId.OFFRAMP | EntityId.MIDDLE;
export type BucketEntity = EntityId.START | EntityId.FINISH;
export type SpaceEntity = BucketEntity | OnboardSpaceEntity;
export type SpaceColumn = PlayerEntity | EntityId.MIDDLE;

export const PLAYER_MASK = EntityId.PLAYER1 + EntityId.PLAYER2;
export const BUCKET_MASK = EntityId.START + EntityId.FINISH;
export const ONBOARD_MASK = EntityId.ONRAMP + EntityId.OFFRAMP + EntityId.MIDDLE;
export const SPACE_MASK = ONBOARD_MASK + BUCKET_MASK;

export type DieValue =  0 | 1;
export type DiceValue = 0 | 1 | 2 | 3 | 4;
export type DiceList = [DieValue, DieValue, DieValue, DieValue];

export type OuterTransitionMethod = ((action: GameAction)=>AGameState)

export type OneToOneRepository<K extends number, V> = {[index in K]:V}
export type Repository<K extends number, V> = {[index in K]?:V}
export type ActionRepository = OneToOneRepository<GameAction, AGameAction>;
export type StateRepository = OneToOneRepository<GameState, AGameState>;
export type TransitionRepository = OneToOneRepository<GameState, Repository<GameAction, GameState>>;

export type PlayerInfoMap<T> = {[EntityId.PLAYER1]: T, [EntityId.PLAYER2]: T};

export type EdgeGraph = {
    [currentState in GameState]: GameStateModel<currentState>
};