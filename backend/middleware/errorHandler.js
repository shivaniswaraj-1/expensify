const errorhandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  switch (statusCode) {
    case 400:
    case 401:
    case 403:
    case 404:
    case 405:
    case 500:
      res.json({
        success: false,
        message: err.message,
      });
      break;
    default:
      // Any status code not explicitly handled above (including the
      // implicit default of 200 when a controller throws without first
      // calling res.status(...)) still gets a real response instead of
      // leaving the request hanging with nothing sent back.
      console.log(err);
      res.status(500).json({
        success: false,
        message: err.message,
      });
      break;
  }
};

module.exports = errorhandler;
