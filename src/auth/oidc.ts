import { UserManager } from 'oidc-client-ts';

export const oidc = new UserManager({
  authority: 'http://localhost:8080/realms/central-vet', // KC realm URL
  client_id: 'central-vet-spa',
  response_type: 'code', // PKCE
  scope: 'openid profile email', // puedes añadir roles => 'openid profile email roles'
  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: `${window.location.origin}/`,
  silent_redirect_uri: `${window.location.origin}/silent-renew.html`,
  automaticSilentRenew: true, // refresca tokens en segundo plano
});
