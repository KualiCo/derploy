module Main (..) where

import Actions exposing (Action)
import Ajax exposing (fetchDeploys)
import Deploy exposing (Deploy)
import Effects exposing (Effects, Never)
import Html exposing (div, button, text, Html)
import Maybe exposing (Maybe)
import StartApp
import Signal exposing (Address)
import Task exposing (Task)


-- ok, what do i need to do?
-- for now, just do it all in one file. somehow make the HTTP request,
-- parse the JSON
-- ok, now i have json parsing. how do i make an http request and get
-- the results?


app : StartApp.App Model
app =
    StartApp.start { init = init, view = view, update = update, inputs = [] }


port tasks : Signal (Task Never ())
port tasks =
    app.tasks


main : Signal Html
main =
    app.html


type alias Model =
    { deploys : List Deploy.Model
    , err : Maybe String
    }


init : ( Model, Effects Action )
init =
    ( Model [] Nothing
    , fetchDeploys Actions.LoadDeploys Actions.ErrorLoading "http://localhost:2999/deploys"
    )


view : Address Action -> Model -> Html
view address model =
    div
        []
        [ div []
              (List.map
                (Deploy.view
                  (Signal.forwardTo address (Actions.DeployAction 1)))
              model.deploys)
        ]


update : Action -> Model -> ( Model, Effects Action )
update action model =
    case action of
        Actions.LoadDeploys loadedDeploys ->
            ( { model | deploys = loadedDeploys, err = Nothing }, Effects.none )

        Actions.ErrorLoading errorString ->
            ( { model | err = Just errorString }, Effects.none )

        Actions.DeployAction id deployAction ->
            -- TODO: forward action on to individual deploy
            ( model, Effects.none )
