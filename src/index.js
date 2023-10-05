const app = require('./app.js');
const { PORT } = require('./common/config.js');

app.listen(PORT, () => {
  console.log(`Server is runninggg on PORT ${PORT}`);
});
