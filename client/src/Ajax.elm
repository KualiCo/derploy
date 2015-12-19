module Ajax (..) where

import Actions exposing (Action)
import Deploy.Deploy exposing (Deploy, deployDecoder)
import Effects exposing (Effects)
import Http exposing (Error)
import Json.Decode exposing (list)
import Stats.Stats exposing (Stat, statDecoder)
import Task exposing (Task)

fetchDeploys : (List Deploy -> Action) -> (String -> Action) -> String -> Effects Action
fetchDeploys successAction errorAction url =
    Http.get (list deployDecoder) url
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


-- ok, i have a function that creates a task.
-- how do i handle that task by sending it to a port? I guess i need a signal
-- for the port?

-- i think i need a mailbox?
