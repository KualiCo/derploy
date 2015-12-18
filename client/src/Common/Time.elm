module Common.Time (..) where

import Time exposing (Time)


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
        else if difference < oneDay && difference > oneHour then
            let
                hours = difference // oneHour
            in
                (toString hours) ++ (pluralize hours " hour") ++ " ago"
        else if difference < oneHour && difference > oneMinute then
            let
                minutes = difference // oneMinute
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
    if num == 1 then
        str
    else
        str ++ "s"
