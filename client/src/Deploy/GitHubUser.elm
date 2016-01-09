module Deploy.GitHubUser where

import Json.Decode exposing (Decoder, (:=), string, object3)

type alias GitHubUser =
    { fullName : String
    , userName : String
    , avatarUrl : String
    }


gitHubUserDecoder : Decoder GitHubUser
gitHubUserDecoder =
    object3
        GitHubUser
        ("fullName" := string)
        ("userName" := string)
        ("avatarUrl" := string)
