module Sprint.Sprint (..) where

import Common.Format exposing (format)
import Date exposing (Date, fromTime)
import Debug exposing (log)
import Deploy.Actions as Actions exposing (Action, DeploysAction)
import Deploy.Deploy as Deploy exposing (Deploy)
import Html exposing (Html, div, h2, text)
import Html.Attributes exposing (class)
import Moment
import Signal exposing (Address)
import Time exposing (Time)


view : Time -> Address DeploysAction -> List Deploy -> Html
view currentTime address deploys =
    let
        sprintDeploys = deploysForWeek currentTime deploys
    in
        div
            [ class "sprint" ]
            [ sprintHeader sprintDeploys currentTime
            , div
                [ class "deploy-rows" ]
                [ text "COMING SOON WOO" ]
            ]


deploysForWeek : Time -> List Deploy -> List Deploy
deploysForWeek week deploys =
    let
        ( start, end ) = weekDates week

        startTime = Date.toTime start

        endTime = Date.toTime end
    in
        List.filter
            (\d ->
                let
                    ts = toFloat d.timestamp
                in
                    ts > startTime && ts < endTime
            )
            deploys


deploysThisSprint : Time -> Html
deploysThisSprint currentTime =
    div
        [ class "deploys-today" ]
        [ h2 [] [ text "Sprint Deploys" ]
        , div
            []
            [ text ((weekDates >> weekRangeFromDates) currentTime) ]
        ]


weekDates : Time -> ( Date, Date )
weekDates time =
    let
        now = Moment.fromTime time

        beginningOfWeek = Moment.setWeekDay now 1

        endOfWeek = Moment.setWeekDay now 5
    in
        ( beginningOfWeek |> Moment.toTime |> Date.fromTime
        , endOfWeek |> Moment.toTime |> Date.fromTime
        )


weekRangeFromDates : ( Date, Date ) -> String
weekRangeFromDates dates =
    let
        ( start, end ) = dates
    in
        (format "%B %e" start) ++ "-" ++ (format "%B %e" end)


sprintHeader : List Deploy -> Time -> Html
sprintHeader deploys currentTime =
    div
        [ class "deploys-header sprint-header" ]
        [ sprintCount deploys
        , deploysThisSprint currentTime
        ]


sprintCount : List Deploy.Model -> Html
sprintCount deploys =
    div
        [ class "deploy-count sprint-count" ]
        [ text <| toString <| List.length deploys ]
