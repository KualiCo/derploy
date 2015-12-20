module Ajax (..) where

import Actions exposing (Action)
import Deploy.Deploy exposing (Deploy, deployDecoder)
import Effects exposing (Effects)
import Http exposing (Error)
import Json.Decode exposing (list)
import Signal exposing (Mailbox, Address, mailbox)
import Stats.Stats exposing (Stat, statDecoder)
import Task exposing (Task)


fetchDeploys : (List Deploy -> Action) -> (String -> Action) -> Effects Action
fetchDeploys successAction errorAction =
    Http.get (list deployDecoder) "http://localhost:2999/deploys?date=2015-11-30"
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


fetchStats : String -> Task Error (List Stat)
fetchStats url =
    Http.get (list statDecoder) url


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
