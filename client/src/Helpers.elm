module Helpers (..) where

import Json.Decode exposing (map, andThen, succeed, Decoder)


-- TODO: lol what does this even mean


apply : Decoder (a -> b) -> Decoder a -> Decoder b
apply f aDecoder =
    f `andThen` (\f' -> f' `map` aDecoder)


(|:) : Decoder (a -> b) -> Decoder a -> Decoder b
(|:) =
    apply
