module Sprint.SprintDay where

import Common.Layout exposing (row)
import Date
import Deploy.Deploy as Deploy
import Html exposing (..)
import Html.Attributes exposing (..)


type alias SprintDay =
    { deploys : List Deploy.Model
    , day : Date.Day
    }

view : SprintDay -> Html
view sprint =
  div
    [ class "deploy-container" ]
    [ div [] [text (toString sprint.day)]
    , div [] [text <| toString <| List.length sprint.deploys]
    ]
