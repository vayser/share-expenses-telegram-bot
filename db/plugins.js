export function findOrCreate(schema, options) {
  schema.statics.findOrCreate = function(criteria, data, callback) {
    const self = this;
    return new Promise(async function(resolve, reject) {
      try {
        let doc = await self.findOne(criteria);

        if (!doc) {
          doc = await self.create(data);
        }

        if (typeof callback === 'function') {
          callback(null, doc);
        }

        return resolve(doc);
      } catch (e) {
        if (typeof callback === 'function') {
          callback(e);
        }
        reject(e);
      }
    });
  };
}
