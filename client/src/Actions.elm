module Actions where

import Deploy exposing (Deploy)

type Action
    = LoadDeploys (List Deploy)
    | ErrorLoading String
    | DeployAction Int Deploy.Action
