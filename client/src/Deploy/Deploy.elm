module Deploy.Deploy (..) where

import Common.Format exposing (format)
import Common.Time exposing (getRelativeTime)
import Common.Layout exposing (row, column)
import Date exposing (fromTime)
import Deploy.Commit as Commit exposing (Commit, commitDecoder)
import Deploy.Actions as Actions exposing (Action)
import Deploy.GitHubUser exposing (GitHubUser, gitHubUserDecoder)
import Debug exposing (log)
import Html exposing (Html, div, text, img, span, button, h3, a, h4)
import Html.Attributes exposing (src, class, href)
import Html.Events exposing (onClick)
import Http exposing (Error)
import Json.Decode exposing (Decoder, succeed, (:=), list, string, object3, object7, object8, int, succeed)
import Helpers exposing ((|:))
import Time exposing (Time)

type alias Deploy =
    { user : GitHubUser
    , title : String
    , description : String
    , displayName : String
    , id : Int
    , duration : Int
    , result : String
    , timestamp : Int
    , relativeTime : String
    , url : String
    , commits : List Commit
    , expanded : Bool
    }


model : Deploy
model =
    { user =
        { fullName = "NOTHING"
        , userName = "NATHIN"
        , avatarUrl = "http://NOPE.COM"
        }
    , title = ""
    , description = ""
    , displayName = ""
    , id = 0
    , duration = 0
    , result = ""
    , timestamp = 0
    , relativeTime = ""
    , url = ""
    , commits = []
    , expanded = False
    }


deployDecoder : Decoder Deploy
deployDecoder =
    succeed Deploy
        |: ("user" := gitHubUserDecoder)
        |: ("title" := string)
        |: ("description" := string)
        |: ("displayName" := string)
        |: ("_id" := int)
        |: ("duration" := int)
        |: ("result" := string)
        |: ("timestamp" := int)
        |: succeed ""
        |: ("url" := string)
        |: ("commits" := (list commitDecoder))
        |: succeed False


type alias Model =
    Deploy


updateRelativeTime : Time -> Deploy -> Deploy
updateRelativeTime currentTime deploy =
    let
        relativeTime = getRelativeTime currentTime deploy.timestamp
    in
        { deploy | relativeTime = relativeTime }


update : Action -> Model -> Model
update action model =
    case action of
        Actions.Toggle ->
            { model
                | expanded = not model.expanded
                , commits =
                    List.map
                        (\commit -> { commit | expanded = False })
                        model.commits
            }

        Actions.ToggleCommit hash ->
            { model
                | commits =
                    List.map
                        (\commit ->
                            if commit.hash == hash then
                                { commit | expanded = not commit.expanded }
                            else
                                commit
                        )
                        model.commits
            }


view : Time -> Signal.Address Action -> Deploy -> Html
view currentTime address deploy =
    if deploy.expanded then
        expandedDeploy currentTime address deploy
    else
        collapsedDeploy address deploy


collapsedDeploy : Signal.Address Action -> Deploy -> Html
collapsedDeploy address deploy =
    div
        [ class "deploy-container" ]
        [ div
            [ class "left-deploy" ]
            [ img
                [ src deploy.user.avatarUrl
                , class "profile-pic"
                ]
                []
            , div
                []
                [ text deploy.title ]
            ]
        , div
            [ class "right-deploy" ]
            [ text deploy.relativeTime
            , button [ onClick address Actions.Toggle ] [ text ">" ]
            ]
        ]


expandedDeploy : Time -> Signal.Address Action -> Deploy -> Html
expandedDeploy currentTime address deploy =
    div
        [ class "deploy-container expanded" ]
        [ div
            [ class "expanded-header" ]
            [ row
                [ h3 [] [ text deploy.title ]
                , text <| format "%A • %B %e • %I:%M %P" <| fromTime <| toFloat deploy.timestamp
                , button [ onClick address Actions.Toggle ] [ text "^" ]
                ]
            , div
                [ class "expanded-deploy-body" ]
                [ row
                    [ column
                        [ h4 [] [ text "Number" ]
                        , text (toString deploy.id)
                        ]
                    , column
                        [ h4 [] [ text "Duration" ]
                        , text (toString deploy.duration)
                        ]
                    , column
                        [ h4 [] [ text "Url" ]
                        , a
                            [ href deploy.url ]
                            [ text deploy.url ]
                        ]
                    ]
                , row [ h3 [] [ text "Commits" ] ]
                , div
                    [ class "expanded-deploy-commits" ]
                    (List.map (Commit.view currentTime address) deploy.commits)
                ]
            ]
        ]
