module Main (..) where

import Actions exposing (Action)
import Ajax exposing (fetchDeploys)
import Deploy exposing (Deploy)
import Effects exposing (Effects, Never)
import Html exposing (div, button, text, Html, h1, h2)
import Html.Attributes exposing (class)
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
        [class "container"]
        [ h1 [] [ text "CM Stats" ]
        , div [class "row" ]
            [ div [ class "deploys" ]
                [ deployHeader model.deploys
                    , div [class "deploy-rows"]
                      (List.map
                        (Deploy.view
                          (Signal.forwardTo address (Actions.DeployAction 1)))
                      model.deploys)
                ]
            , div [ class "sprint" ]
                [ deployHeader model.deploys
                , h1 [] [text "BUTTS"]
                ]
            ]
        ]

deployHeader : List Deploy.Model -> Html
deployHeader deploys =
  div [ class "deploys-header" ]
      [ deployCount (List.length deploys)
      , deploysToday (List.head deploys)
      ]

deployCount : Int -> Html
deployCount count =
  div [ class "deploy-count"] [ text (toString count) ]

deploysToday : Maybe Deploy.Model -> Html
deploysToday deploy =
  div [ class "deploys-today"]
    [ h2 [] [ text "Deploys Today" ]
    -- TODO: How to format this correctly?
    , div [] [ text
      (case deploy of
        Just d -> "Wednesday, December 15th, 2015"
        Nothing -> " --- ")
      ]
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
