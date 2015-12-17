module Actions where

import Deploy exposing (Deploy)
import Time exposing (Time)

type Action
    = LoadDeploys (List Deploy)
    | ErrorLoading String
    | DeployAction Int Deploy.Action
    | UpdateTime Time
