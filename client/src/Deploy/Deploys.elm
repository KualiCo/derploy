module Deploy.Deploys (..) where

import Common.Format exposing (format)
import Date exposing (fromTime)
import Deploy.Actions as Actions exposing (Action, DeploysAction)
import Deploy.Deploy as Deploy exposing (Deploy)
import Html exposing (Html, div, text, h2)
import Html.Attributes exposing (class)
import Signal exposing (Address)
import Time exposing (Time)


view : Time -> Address DeploysAction -> List Deploy -> Html
view currentTime address deploys =
    div
        [ class "deploys" ]
        [ deployHeader deploys currentTime
        , div
            [ class "deploy-rows" ]
            (List.map (sendId currentTime address) deploys)
        ]

sendId : Time -> Address DeploysAction -> Deploy.Model -> Html
sendId currentTime address model =
  Deploy.view
      currentTime
      (Signal.forwardTo address (Actions.DeploysAction model.id))
      model


deployHeader : List Deploy.Model -> Time -> Html
deployHeader deploys currentTime =
    div
        [ class "deploys-header" ]
        [ deployCount (List.length deploys)
        , deploysToday currentTime
        ]


deployCount : Int -> Html
deployCount count =
    div [ class "deploy-count" ] [ text (toString count) ]


deploysToday : Time -> Html
deploysToday currentTime =
    div
        [ class "deploys-today" ]
        [ h2 [] [ text "Deploys Today" ]
          -- TODO: How to format this correctly?
        , div
            []
            [ text <| format "%A, %B %e, %Y" <| fromTime currentTime
            ]
        ]


update : DeploysAction -> List Deploy -> List Deploy
update action deploys =
    case action of
        Actions.DeploysAction id deployAction ->
            List.map
                (\d ->
                    if d.id == id then
                        Deploy.update deployAction d
                    else
                        d
                )
                deploys
