module Actions (..) where

import Deploy.Actions as DeployActions
import Deploy.Deploy exposing (Deploy)
import Time exposing (Time)


type Action
    = LoadDeploys (List Deploy)
    | ErrorLoading String
    | DeployAction Int DeployActions.Action
    | UpdateTime Time
