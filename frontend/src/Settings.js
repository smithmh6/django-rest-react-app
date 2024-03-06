// app settings

const development = {
  url: 'http://localhost:8080/',
};

const production = {
  url: 'https://tsw-be-web.azurewebsites.net/',
};

export const config =
  process.env.REACT_APP_Mode === 'development' ? development : production;
