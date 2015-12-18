module Deploy.Commit (..) where

import Deploy.Actions as Actions exposing (Action)
import Html exposing (Html, div)
import Json.Decode exposing (Decoder, list, string, succeed, object7, (:=), int)


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


view : Signal.Address Action -> Commit -> Html
view address commit =
    div
        []
        []
