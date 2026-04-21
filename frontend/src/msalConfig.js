export const msalConfig = {
  auth: {
    clientId:    import.meta.env.VITE_AZURE_CLIENT_ID || 'placeholder-client-id',
    authority:   `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation:      'localStorage',
    storeAuthStateInCookie: false
  }
}

export const loginRequest = {
  scopes: ['User.Read']
}
