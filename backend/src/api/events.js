import { models } from '../models';

export async function getEvent(req, res) {
  if (req.params.event) return res.json(await models.Event.find({ _id: req.params.event }));
  return res.json(await models.Event.find({ status: { $ne: 'deleted' } }));
}
