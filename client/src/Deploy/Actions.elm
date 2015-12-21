module Deploy.Actions (..) where


type Action
    = Toggle
    | ToggleCommit String

type DeploysAction = DeploysAction Int Action
