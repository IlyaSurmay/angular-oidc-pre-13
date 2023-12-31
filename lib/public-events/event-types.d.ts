export declare enum EventTypes {
    /**
     *  This only works in the AppModule Constructor
     */
    ConfigLoaded = 0,
    ConfigLoadingFailed = 1,
    CheckSessionReceived = 2,
    UserDataChanged = 3,
    NewAuthenticationResult = 4,
    TokenExpired = 5,
    IdTokenExpired = 6,
    SilentRenewStarted = 7
}
