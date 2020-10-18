const autocorrect = require('autocorrect')();

export default (req, res) => {
  res
    .status(200)
    .json({ correctedWord: autocorrect(req.query.word.toLowerCase()) });
};
