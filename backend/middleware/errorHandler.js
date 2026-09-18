const errorhandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  switch (statusCode) {
    case 400:
      res.json({
        title: "Validation Error!",
        message: err.message,
      });
      break;
    case 401:
      res.json({
        title: "Unauthorized!",
        message: err.message,
      });
      break;
    case 403:
      res.json({
        title: "Forbidden!",
        message: err.message,
      });
      break;
    case 404:
      res.json({
        title: "Not Found!",
        message: err.message,
      });
      break;
    case 405:
      res.json({
        title: "Method not Allowed!",
        message: err.message,
      });
      break;
    case 500:
      res.json({
        title: "Internal Server Error!",
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
        title: "Internal Server Error!",
        message: err.message,
      });
      break;
  }
};

module.exports = errorhandler;
