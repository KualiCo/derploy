module Common.Layout (..) where

import Html exposing (Html, div, text, img)
import Html.Attributes exposing (class, src)


column : List Html -> Html
column html =
    div
        [ class "column" ]
        html


row : List Html -> Html
row html =
    div
        [ class "flex-row" ]
        html


type alias ImageRow =
    { imageUrl : String
    , title : String
    , rightTitle : String
    }


imageRow : ImageRow -> Html
imageRow data =
    div
        [ class "centerer" ]
        [ div
            [ class "deploy-container" ]
            [ div
                [ class "left-deploy" ]
                [ img
                    [ src data.imageUrl
                    , class "profile-pic"
                    ]
                    []
                , div
                    []
                    [ text
                        data.title
                    ]
                ]
            , div
                [ class "right-deploy" ]
                [ text data.rightTitle ]
            ]
        ]
