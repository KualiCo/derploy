module Deploy (..) where

import Html exposing (Html, div, text, img)
import Html.Attributes exposing (src, height, width, class)
import Http exposing (Error)
import Json.Decode exposing (Decoder, succeed, (:=), list, string, object3, object5, object8, int)
import Helpers exposing ((|:))

type alias GitHubUser =
  { fullName: String
  , userName: String
  , avatarUrl: String
  }

gitHubUserDecoder : Decoder GitHubUser
gitHubUserDecoder =
  object3 GitHubUser
    ("fullName" := string)
    ("userName" := string)
    ("avatarUrl" := string)

type alias Commit =
  { affectedPaths: List String
  , commitId: String
  , message: String
  , author: String
  , timestamp: Int
  }

commitDecoder : Decoder Commit
commitDecoder =
  object5 Commit
    ("affectedPaths" := (list string))
    ("commitId" := string)
    ("message" := string)
    ("author" := string)
    ("timestamp" := int)

type alias Deploy =
  { user: GitHubUser
  , title: String
  , description: String
  , displayName: String
  , number: Int
  , duration: Int
  , result: String
  , timestamp: Int
  , url: String
  , commits: List Commit
  }

deployDecoder : Decoder Deploy
deployDecoder =
  succeed Deploy
    |: ("user" := gitHubUserDecoder)
    |: ("title" := string)
    |: ("description" := string)
    |: ("displayName" := string)
    |: ("number" := int)
    |: ("duration" := int)
    |: ("result" := string)
    |: ("timestamp" := int)
    |: ("url" := string)
    |: ("commits" := (list commitDecoder))

type Action = Expand | Collapse

type alias Model = Deploy

update : Action -> Model -> Model
update action model =
  case action of
    Expand -> model
    Collapse -> model

view : Signal.Address Action -> Deploy -> Html
view address deploy =
  div []
      [ div []
          [ div []
              [ img [ src deploy.user.avatarUrl
                    , height 30
                    , width 30
                    , class "profile-pic"
                    ]
                  []
              , text deploy.title
              ]
          , div []
              [ text (toString deploy.timestamp) ]
          ]
      ]
