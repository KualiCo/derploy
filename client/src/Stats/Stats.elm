module Stats.Stats (..) where

import Json.Decode exposing (Decoder, (:=), int, at, object3)


type alias Stat =
    { count : Int
    , week : Int
    , year : Int
    }


statDecoder : Decoder Stat
statDecoder =
    object3
        Stat
        ("count" := int)
        (at [ "_id",  "week" ] int)
        (at [ "_id",  "year" ] int)
