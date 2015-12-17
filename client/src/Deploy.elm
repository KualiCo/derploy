module Deploy (..) where

import Debug exposing (log)
import Html exposing (Html, div, text, img, span)
import Html.Attributes exposing (src, class)
import Http exposing (Error)
import Json.Decode exposing (Decoder, succeed, (:=), list, string, object3, object5, object8, int, succeed)
import Helpers exposing ((|:))
import Time exposing (Time)

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
  , relativeTime: String
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
    |: succeed ""
    |: ("url" := string)
    |: ("commits" := (list commitDecoder))

type Action = Expand | Collapse

type alias Model = Deploy

updateRelativeTime : Time -> Deploy -> Deploy
updateRelativeTime currentTime deploy =
  let
    relativeTime = getRelativeTime currentTime deploy.timestamp
  in
    { deploy | relativeTime = relativeTime }

getRelativeTime : Time -> Int -> String
getRelativeTime now time =
  let
    nowAsInt = round now
    difference = nowAsInt - time
    oneMinute = 1000 * 60
    oneHour = oneMinute * 60
    oneDay = oneHour * 24
  in
    if difference < 0 then
      "YOU ARE IN THE FUTURE"
    else if  difference < oneDay && difference > oneHour then
      let
        hours = difference // oneHour
      in
        (toString hours) ++ (pluralize hours " hour") ++ " ago"
    else if difference < oneHour && difference > oneMinute then
      let minutes = difference // oneMinute
      in
        (toString minutes) ++ (pluralize minutes " minute") ++ " ago"
    else if difference < oneMinute then
      "less than a minute ago"
    else
      let
        days = difference // oneDay
      in
        (toString days) ++ (pluralize days " day") ++ " ago"

pluralize : Int -> String -> String
pluralize num str =
  if num == 1
  then
    str
  else
    str ++ "s"

update : Action -> Model -> Model
update action model =
  case action of
    Expand -> model
    Collapse -> model

view : Signal.Address Action -> Deploy -> Html
view address deploy =
  div [ class "centerer" ]
      [ div [ class "deploy-container" ]
        [
          div [ class "left-deploy" ]
                    [ img [ src deploy.user.avatarUrl
                          , class "profile-pic"
                          ]
                        []
                    , div [] [text deploy.title]
                    ]
                , div [ class "right-deploy" ]
                    [ text deploy.relativeTime ]
        ]
      ]
