// projects-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
const getCurrentDate = (d) => {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

module.exports = function (app) {
  const modelName = 'projects';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    title: { type: String, default: '' },
    text: { type: String, default: '' },
    client: { type: String, default: '' },
    size: { type: String, default: '' },
    date: { type: Date, default: getCurrentDate(new Date()) },
    category: [String],
    goal: { type: String, default: '' },
    links: [{ type: String, lowercase: true, trim: true }],
    stack: [{ type: String, trim: true }],
    thumbnail: { type: String, lowercase: true, trim: true, default: '' },
    image: { type: String, lowercase: true, trim: true, default: '' },
    gallery: [{ image: String, caption: String }],
    colors: {
      main: { type: String, default: '#000000' },
      second: { type: String, default: '#000000' },
    },
    published: { type: Boolean, default: 0 }
  }, {
    timestamps: true
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);

};
