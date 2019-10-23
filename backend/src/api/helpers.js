import crypto from 'crypto';
import _ from 'lodash';
import settings from '../settings';

export const historySep = settings.vue.mode === 'history' ? '' : '#/';

export function hasPermission(user, eventID, permission) {
  // if (!mongoose.Types.ObjectId.isValid(eventID)) return false;
  console.log('Checking user', user.roles, 'for permission', permission, 'in event', eventID);
  return !!_.find(user.roles, userRole => {
    console.log('Checking userRole', userRole);
    if (!userRole.event) {
      return userRole.role.permissions.includes('*') || userRole.role.permissions.includes(permission);
    }
    if (userRole.event.equals(eventID)) {
      // only apply local permissions to local roles
      if ((userRole.role.permissions.includes(permission) || userRole.role.permissions.includes('*')) && settings.permissions.includes(permission)) return true;
    }
    return false;
  });
}


export function maskPhone(phoneNumber) {
  const numDigits = phoneNumber.match(/\d/g).length;
  let digitsToMask = -2;
  return phoneNumber.replace(/\d/g, match => {
    digitsToMask += 1;
    if (digitsToMask > 0 && digitsToMask < numDigits - 3) return 'X';
    return match;
  });
}

export function encryptPhoneNumber(phoneNumber) {
  const IV = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', settings.auth.encryptionKey, IV);
  let encrypted = `${IV.toString('hex')}|`;
  encrypted += cipher.update(`|${phoneNumber}`, 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function parseDuration(duration) {
  const [hours, minutes] = /(\d+):(\d+)/.exec(duration);
  return parseInt(hours, 10) * 3600 * 1000 + parseInt(minutes, 10) * 60 * 1000;
}


export function mergeNonArray(item, data) {
  return _.mergeWith(item, data, (obj, src) => (_.isArray(src) ? src : undefined));
}

export function isInSubmissionsPeriod(event) {
  const now = new Date();
  return now > event.submissionsStart && now < event.submissionsEnd;
}

export function isInApplicationsPeriod(event) {
  console.log('Applications period:', event.applicationsStart, event.applicationsEnd);
  const now = new Date();
  return now > event.applicationsStart && now < event.applicationsEnd;
}

export async function updateModel(Model, data, markModified) {
  let item = await Model.findOne({ _id: data._id }).exec();
  if (item) {
    if (item.readOnly === true) throw new Error('Item is read only!');
    delete data._id;
    mergeNonArray(item, data);
    _.each(markModified, prop => item.markModified(prop));
  } else {
    item = new Model(data);
  }
  console.log('Saving item', item);
  return item.save();
}
