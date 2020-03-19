// posts-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const getCurrentDate = (d) => {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

module.exports = function (app) {
  const modelName = 'posts';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    tags: [String],
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    date: { type: Date, default: getCurrentDate(new Date()) },
    introtext: { type: String, default: '' },
    text: { type: String, default: '' },
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
