// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
   tankhapay_api: 'http://localhost:8080/api/',
  // tankhapay_api: 'https://tpaywfmstagapi.azurewebsites.net/api/',
  contract_api: 'https://cjcms.azurewebsites.net/api/',
  crm_node_api: 'https://cjcrmapi.azurewebsites.net/api/',
  tp_employer_api: "https://crmemployer.azurewebsites.net/api/",
  tpPay_api: "https://crmemployer.azurewebsites.net/",
  // PMS_TND_ATL_URL: 'http://localhost:8080',
  PMS_TND_ATL_URL: 'https://stgtpayphase2.z29.web.core.windows.net',
  Survey_Web_URL: 'https://surveystrgstage.z29.web.core.windows.net/',
  //survey.tankhapay.com
  // OfferLetterUrl:'https://tankhapaystag.z13.web.core.windows.net/',
  OfferLetterUrl: 'https://stgtpayphase2.z29.web.core.windows.net/',
  tnd_tankhapay_api: 'https://tpayphase2.azurewebsites.net/api/',
  // tnd_tankhapay_api: 'http://localhost:8080/api/',
  GOGOGLE_API_KEY_SELF: 'AIzaSyD-Ef4-DN62NTpKPxk0w4rwtF75heDatA8',
  GOGOGLE_API_KEY_SELF_MAP: 'AIzaSyD-Ef4-DN62NTpKPxk0w4rwtF75heDatA8',
  googleMaps_ApiKey_For_LiveTracking: 'AIzaSyDeYKThTSupy7Zo0Av1A-jfW-eo-GhMaIg',
  recaptcha: {
    siteKey: '6LfBzAgpAAAAAL61hNQkprJ6_015ZG3sTzoYvlUo',
  },
  business_sso_route_url: "https://tankhapaystag.z13.web.core.windows.net/sso-login"

};
