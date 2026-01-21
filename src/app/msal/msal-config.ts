const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI;
const scope = process.env.NEXT_PUBLIC_LOGIN_REQUEST_SCOPE;

if (!clientId || !redirectUri || !scope) {
  throw new Error('Environment variables NEXT_PUBLIC_AZURE_CLIENT_ID and NEXT_PUBLIC_AZURE_REDIRECT_URI and NEXT_PUBLIC_LOGIN_REQUEST_SCOPE must be set.');
}

export const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/common`,
    redirectUri
  }
};

// export const API_SCOPE = "User.ReadBasic.All";

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */

export const userDataLoginRequest = {
  scopes: [scope]
};

export const graphLoginRequest = {
  scopes: ["User.Read", "User.ReadBasic.All"], // Graph API scopes
};
/**
 * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",

};
