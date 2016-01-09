module Sprint.SprintDay where

import Common.Layout exposing (row)
import Date
import Deploy.Deploy as Deploy
import Html exposing (..)
import Html.Attributes exposing (..)


type alias SprintDay =
    { deploys : List Deploy.Model
    , day : Date.Day
    , isInFuture : Bool
    }

view : SprintDay -> Html
view sprintDay =
  div
    [
      classList
        [ ("deploy-container", True)
        , ("is-in-future", sprintDay.isInFuture)
        ]
    ]
    [ div [] [text (toString sprintDay.day)]
    , div [ class "deploys-for-day" ] [text <| toString <| List.length sprintDay.deploys]
    ]
