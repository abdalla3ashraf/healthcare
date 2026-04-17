import axios from 'axios';

const DOTNET_API = process.env.DOTNET_API_URL;

export const dotnetLogin = (email, password) =>
  axios.post(`${DOTNET_API}/api/Users/login`, {
    emailAddress: email,
    password,
  });

export const dotnetRegister = (data) =>
  axios.post(`${DOTNET_API}/api/Users/register`, {
    fullName: data.fullName,
    emailAddress: data.email,
    password: data.password,
  });

export const dotnetGoogleAuth = (data) =>
  axios.post(`${DOTNET_API}/api/Users/social-login`, {
    provider: 'Google',
    token: data.googleToken,
  });

export const dotnetFacebookAuth = (data) =>
  axios.post(`${DOTNET_API}/api/Users/social-login`, {
    provider: 'Facebook',
    token: data.accessToken,
  });

export const dotnetForgotPass = (email) =>
  axios.post(`${DOTNET_API}/api/Users/forgot-password`, { emailAddress: email });