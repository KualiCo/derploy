module Ajax where

import Actions exposing (Action)
import Deploy exposing (Deploy, deployDecoder)
import Effects exposing (Effects)
import Http exposing (Error)
import Json.Decode exposing (list)
import Task exposing (Task)

-- ok now i have a task to fetch the deploys. what do i do with them?
-- how do i send out a request for tasks, and do something with the result?
--fetchDeploys : String -> Task Error (List Deploy)
--fetchDeploys url =
  --Http.get (list deployDecoder) url

fetchDeploys : (List Deploy -> Action) -> (String -> Action) -> String -> Effects Action
fetchDeploys successAction errorAction url =
  Http.get (list deployDecoder) url
    |> Task.toResult
    |> Task.map (\res ->
      case res of
        Ok deploys ->
          successAction deploys
        Err e ->
          errorAction (toString e)
    )
    |> Effects.task
