module Deploy.Commit (..) where

import Common.Layout exposing (row, column, imageRow, ImageRow)
import Common.Time exposing (getRelativeTime)
import Deploy.Actions as Actions exposing (Action)
import Html exposing (Html, div, text, h3)
import Html.Attributes exposing (class)
import Json.Decode exposing (Decoder, list, string, succeed, object7, (:=), int)
import Time exposing (Time)


type alias Commit =
    { affectedPaths : List String
    , commitId : String
    , message : String
    , author : String
    , timestamp : Int
    , hash : String
    , expanded : Bool
    }


commitDecoder : Decoder Commit
commitDecoder =
    object7
        Commit
        ("affectedPaths" := (list string))
        ("commitId" := string)
        ("message" := string)
        ("author" := string)
        ("timestamp" := int)
        ("hash" := string)
        (succeed False)


commitRow : Time -> Commit -> Html
commitRow currentTime commit =
    let
        data = ImageRow "" commit.message (getRelativeTime currentTime commit.timestamp)
    in
        imageRow data


view : Time -> Signal.Address Action -> Commit -> Html
view currentTime address commit =
    commitRow currentTime commit
