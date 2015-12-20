module Main (..) where

import Actions exposing (Action)
import Ajax exposing (fetchStatsAndDeploys, chartMailbox, sendStatsToJS)
import Common.Format exposing (format)
import Date exposing (fromTime)
import Debug exposing (log)
import Deploy.Deploy as Deploy exposing (Deploy)
import Effects exposing (Effects, Never)
import Html exposing (div, button, text, Html, h1, h2)
import Html.Attributes exposing (class)
import Maybe exposing (Maybe)
import StartApp
import Signal exposing (Address, Mailbox, mailbox)
import Stats.Stats exposing (Stat)
import Task exposing (Task)
import Time exposing (Time)


-- update the current time every minute, so we recalculate the relative dates
-- and such
everyMinute : Signal Action
everyMinute =
    Signal.map (\t -> Actions.UpdateTime t) (Time.every Time.minute)


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
    , stats : List Stat
    , currentTime : Time
    , err : Maybe String
    }


init : ( Model, Effects Action )
init =
    ( Model [] [] getStartTime Nothing
    , fetchStatsAndDeploys Actions.FirstLoadOfData Actions.HandleError
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
        [ class "deploys-container" ]
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
                , div
                    [ class "deploy-rows" ]
                    [ text "BUTTS" ]
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
            ( { model | deploys = loadedDeploys }, Effects.none )

        Actions.FirstLoadOfData loadedDeploys loadedStats ->
            ( { model
                | deploys = loadedDeploys
                , stats = loadedStats
              }
            , (sendStatsToJS loadedStats Actions.NoOp)
            )

        Actions.HandleError errorString ->
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

        Actions.NoOp ->
            ( model, Effects.none )


port loadChartData : Signal (List Stat)
port loadChartData =
    chartMailbox.signal

-- This comes from the call to `Elm.embed`. Apparently arguments provided at
-- init time come through on special ports that aren't signals or tasks or
-- anyhting. They just send data through to you. My knowledge of ports is still
-- pretty lacking, b/c this doesn't make tons of sense to me.
port getStartTime: Time
