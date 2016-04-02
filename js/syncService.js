import _ from 'lodash';
import Promise from 'bluebird';

const promisify = fn => new Promise((resolve, reject) => fn((err, res) => {
  if (err) {
    reject(err);
  } else {
    resolve(res);
  }
}));

const promisifyStd = fn => {
  return new Promise(resolve => fn(res => resolve(res)));
};

const readingDropbox = dropboxFile => {
  return promisify(dropboxFile.read.bind(dropboxFile))
    .catch(error => {
      console.error(error);
      return [];
    });
};

const readingStorage = localStorage => {
  return promisifyStd(localStorage.get.bind(localStorage));
};

// Exported for testing
export const merge = (sources, local, initialSync) => {
  var storageData = _.cloneDeep(sources[1]);
  var dropboxData = sources[0];

  if (_.isEmpty(local) && _.isEmpty(storageData) && _.isEmpty(dropboxData)) {
    throw Error('No annotations on this video to sync');
  }

  if (!initialSync) {
    return local;
  }

  if (_.isEmpty(storageData)) {
    return dropboxData;
  }

  var merged = _.map(dropboxData, (record) => {
    var storageIdx = _.findIndex(storageData, (d) => d.id === record.id);
    if (storageIdx > -1) {
      record = storageData.splice(storageIdx, 1)[0];
    }

    return record;
  });

  return merged.concat(storageData);
};

const syncingData = (localStorage, dropboxFile, collection, initialSync) => {
  return Promise
    .all([readingDropbox(dropboxFile), readingStorage(localStorage)])
    .then(data => merge(data, _.map(collection.models, (model) => model.toJSON()), initialSync))
    .then(jsonData => {
      if (initialSync) {
        collection.set(jsonData, { silent: true });
      }

      localStorage.save(jsonData);
      dropboxFile.write(jsonData);
    }).catch((err) => {
      console.error(err);
    });
};

export default syncingData;
