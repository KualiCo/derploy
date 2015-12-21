module Ajax (..) where

import Actions exposing (Action)
import Deploy.Deploy exposing (Deploy, deployDecoder)
import Effects exposing (Effects)
import Http exposing (Error)
import Json.Decode exposing (list)
import Signal exposing (Mailbox, Address, mailbox)
import Stats.Stats exposing (Stat, statDecoder)
import Task exposing (Task, andThen)


fetchDeploys : (List Deploy -> Action) -> (String -> Action) -> Effects Action
fetchDeploys successAction errorAction =
    fetchDeploys'
        |> Task.toResult
        |> Task.map
            (\res ->
                case res of
                    Ok deploys ->
                        successAction deploys

                    Err e ->
                        errorAction (toString e)
            )
        |> Effects.task


fetchStatsAndDeploys : (List Deploy -> List Stat -> Action) -> (String -> Action) -> Effects Action
fetchStatsAndDeploys successAction errAction =
    Task.map2
        (\deploys stats ->
            { deploys = deploys
            , stats = stats
            }
        )
        fetchDeploys'
        fetchStats
        |> Task.toResult
        |> Task.map
            (\res ->
                case res of
                    Ok deploysAndStats ->
                        successAction deploysAndStats.deploys deploysAndStats.stats

                    Err e ->
                        errAction (toString e)
            )
        |> Effects.task


fetchDeploys' : Task Error (List Deploy)
fetchDeploys' =
    Http.get (list deployDecoder) "/deploys?date=2015-11-30"


fetchStats : Task Error (List Stat)
fetchStats =
    Http.get (list statDecoder) "/stats"


sendStatsToJS : List Stat -> Action -> Effects Action
sendStatsToJS stats action =
    Signal.send chartMailbox.address stats
        |> Task.toResult
        |> Task.map
            (\res ->
                case res of
                    Ok res ->
                        action

                    Err e ->
                        action
            )
        |> Effects.task



-- ok, i have a function that creates a task.
-- how do i handle that task by sending it to a port? I guess i need a signal
-- for the port?
-- i think i need a mailbox?


chartMailbox : Mailbox (List Stat)
chartMailbox =
    mailbox []
