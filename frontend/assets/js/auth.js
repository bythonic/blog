const AUTH = {
  KEY: 'blog_gh_token',

  getToken()       { return sessionStorage.getItem(this.KEY); },
  setToken(token)  { sessionStorage.setItem(this.KEY, token); },
  removeToken()    { sessionStorage.removeItem(this.KEY); },
  isLoggedIn()     { return !!this.getToken(); },

  requireAuth(loginPath = '../admin/login.html') {
    if (!this.isLoggedIn()) {
      location.href = loginPath;
      return false;
    }
    return true;
  },

  logout(loginPath = 'login.html') {
    this.removeToken();
    location.href = loginPath;
  },
};
