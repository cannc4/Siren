/* @flow weak */
const config = {
  isProduction: false
}

const errorHandler = (req, res, next) => {

  const errorDetails = 'Undefined path';

  console.error('Yay', res);

  res.status(500).format({
    json() {
      const errorInfo = {
        details: config.isProduction ? null : errorDetails,
        error: errorDetails,
      };
      res.send(errorInfo);
    },

    html() {
      const message = config.isProduction
        ? '<p>Something went wrong</p>'
        : `<pre>${errorDetails}</pre>`;

      res.send(`<h1>500 Internal server error</h1>\n${message}`);
    },

    default() {
      const message = config.isProduction
        ? 'Something went wrong'
        : `${errorDetails}`;

      res.send(`500 Internal server error:\n${message}`);
    },
  });
};

export default errorHandler;
