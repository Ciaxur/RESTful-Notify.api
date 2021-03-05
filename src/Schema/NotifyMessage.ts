import * as joi from 'joi';

export interface INotifyMessage {
  title:    string,
  summary:  string,
  body:     string,
  urgency:  'low' | 'normal' | 'critical',
  icon:     Buffer,
}


export const NotifySchema = joi.object<INotifyMessage>({
  title:    joi.string().max(80).lowercase().required(),
  summary:  joi.string().max(128).required(),
  body:     joi.string().max(256).required(),
  urgency:  joi.string().valid('low', 'normal', 'critical').lowercase().default('low'),
  icon:     joi.binary().optional(),
});
