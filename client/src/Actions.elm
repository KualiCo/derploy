module Actions (..) where

import Deploy.Actions as DeployActions
import Deploy.Deploy exposing (Deploy)
import Stats.Stats exposing (Stat)
import Time exposing (Time)


type Action
    = LoadDeploys (List Deploy)
    | FirstLoadOfData (List Deploy) (List Stat)
    | HandleError String
    | DeployAction Int DeployActions.Action
    | UpdateTime Time
    | NoOp
