import mongoose from 'mongoose';
import settings from './settings';

mongoose.connect(settings.db.url);
