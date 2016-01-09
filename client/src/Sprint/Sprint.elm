module Sprint.Sprint (..) where

import Common.Format exposing (format)
import Date exposing (Date, fromTime)
import Debug exposing (log)
import Deploy.Actions as Actions exposing (Action, DeploysAction)
import Deploy.Deploy as Deploy exposing (Deploy)
import Html exposing (Html, div, h2, text)
import Html.Attributes exposing (class)
import Moment exposing (Moment)
import Signal exposing (Address)
import Sprint.SprintDay as SprintDay exposing (SprintDay)
import Time exposing (Time)


view : Time -> Address DeploysAction -> List Deploy -> Html
view currentTime address deploys =
    let
        sprintDeploys = deploysForWeek currentTime deploys

        deploysForEachDay = dateRanges currentTime deploys
    in
        div
            [ class "sprint" ]
            [ sprintHeader sprintDeploys currentTime
            , div
                [ class "deploy-rows" ]
                (List.map SprintDay.view deploysForEachDay)
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
            [ text (weekRange currentTime) ]
        ]


weekDates : Time -> ( Date, Date )
weekDates time =
    let
        now = Moment.fromTime time

        beginningOfWeek = Moment.setWeekDay now 0

        endOfWeek = Moment.setWeekDay now 6
    in
        ( beginningOfWeek |> Moment.toTime |> Date.fromTime
        , endOfWeek |> Moment.toTime |> Date.fromTime
        )


weekRange : Time -> String
weekRange time =
    let
        now = Moment.fromTime time

        start = Moment.setWeekDay now 1 |> Moment.toTime |> Date.fromTime

        end = Moment.setWeekDay now 5 |> Moment.toTime |> Date.fromTime
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



-- how does this work?
-- i make a list of start and end date pairs
-- map over the list, grab the day off the date, filter down deploys to items between those dates


dateRanges : Time -> List Deploy.Model -> List SprintDay
dateRanges currentTime deploys =
    let
        pairs =
            [ makePairs currentTime 1
            , makePairs currentTime 2
            , makePairs currentTime 3
            , makePairs currentTime 4
            , makePairs currentTime 5
            ]
    in
        List.map
            (\( start, end, day ) ->
                { day = day
                , deploys =
                    List.filter
                        (\d -> (toFloat d.timestamp) > start && (toFloat d.timestamp) < end)
                        deploys
                , isInFuture = end > currentTime
                }
            )
            pairs


makePairs : Time -> Int -> ( Time, Time, Date.Day )
makePairs time day =
    let
        m = time |> Moment.fromTime |> (flip Moment.setWeekDay) day

        start =
            (-- stuff on sunday actually gets lumped in with monday
             if day == 1 then
                Moment.setWeekDay m 0 |> beginningOfDay |> Moment.toTime
             else
                beginningOfDay m |> Moment.toTime
            )

        end =
            (-- stuff on friday gets lumped in with saturday
             if day == 5 then
                Moment.setWeekDay m 6 |> endOfDay |> Moment.toTime
             else
                endOfDay m |> Moment.toTime
            )

        dayOfWeek =
            (if day == 1 then
                Date.Mon
             else
                start |> Date.fromTime |> Date.dayOfWeek
            )
    in
        ( start, end, dayOfWeek )


beginningOfDay : Moment -> Moment
beginningOfDay m =
    { m
        | hours = 0
        , minutes = 0
        , seconds = 0
        , milliseconds = 0
    }


endOfDay : Moment -> Moment
endOfDay m =
    { m
        | hours = 23
        , minutes = 59
        , seconds = 59
        , milliseconds = 999
    }
