module Main (..) where

import Actions exposing (Action)
import Ajax exposing (fetchDeploys)
import Common.Format exposing (format)
import Date exposing (fromTime)
import Debug exposing (log)
import Deploy.Deploy as Deploy exposing (Deploy)
import Effects exposing (Effects, Never)
import Html exposing (div, button, text, Html, h1, h2)
import Html.Attributes exposing (class)
import Maybe exposing (Maybe)
import StartApp
import Signal exposing (Address)
import Task exposing (Task)
import Time exposing (Time)


everyMinute : Signal Action
everyMinute =
    Signal.map (\t -> Actions.UpdateTime t) (Time.every Time.second)


app : StartApp.App Model
app =
    StartApp.start { init = init, view = view, update = update, inputs = [ everyMinute ] }


port tasks : Signal (Task Never ())
port tasks =
    app.tasks


main : Signal Html
main =
    app.html


type alias Model =
    { deploys : List Deploy.Model
    , currentTime : Time
    , err : Maybe String
    }


init : ( Model, Effects Action )
init =
    ( Model [] 0.0 Nothing
    , fetchDeploys Actions.LoadDeploys Actions.ErrorLoading "http://localhost:2999/deploys"
    )


sendId : Time -> Signal.Address Action -> Deploy.Model -> Html
sendId currentTime address model =
    Deploy.view
        currentTime
        (Signal.forwardTo address (Actions.DeployAction model.id))
        model


view : Address Action -> Model -> Html
view address model =
    div
        [ class "container" ]
        [ h1 [] [ text "CM Stats" ]
        , div
            [ class "row" ]
            [ div
                [ class "deploys" ]
                [ deployHeader model.deploys model.currentTime
                , div
                    [ class "deploy-rows" ]
                    (List.map (sendId model.currentTime address) model.deploys)
                ]
            , div
                [ class "sprint" ]
                [ sprintHeader model.deploys model.currentTime
                , h1 [] [ text "BUTTS" ]
                ]
            ]
        ]


deployHeader : List Deploy.Model -> Time -> Html
deployHeader deploys currentTime =
    div
        [ class "deploys-header" ]
        [ deployCount (List.length deploys)
        , deploysToday currentTime
        ]


sprintHeader : List Deploy -> Time -> Html
sprintHeader deploys currentTime =
    div
        [ class "deploys-header sprint-header" ]
        [ sprintCount deploys
        , deploysToday currentTime
        ]


sprintCount : List Deploy.Model -> Html
sprintCount deploys =
    -- hard code the date, TODO: FIGURE OUT HOW TO FILTER BY CURRENT DATE?
    div
        [ class "deploy-count sprint-count" ]
        [ text <| toString <| List.length deploys ]


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


update : Action -> Model -> ( Model, Effects Action )
update action model =
    case action of
        Actions.LoadDeploys loadedDeploys ->
            ( { model | deploys = loadedDeploys, err = Nothing }, Effects.none )

        Actions.ErrorLoading errorString ->
            ( log ("AN ERROR" ++ errorString) { model | err = Just errorString }, Effects.none )

        Actions.DeployAction id deployAction ->
            ( { model
                | deploys =
                    List.map
                        (\d ->
                            if d.id == id then
                                Deploy.update deployAction d
                            else
                                d
                        )
                        model.deploys
              }
            , Effects.none
            )

        Actions.UpdateTime t ->
            ( { model
                | currentTime = t
                , deploys = List.map (Deploy.updateRelativeTime t) model.deploys
              }
            , Effects.none
            )
