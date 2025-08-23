ALTER TABLE sites ADD COLUMN auto_block_trial_abuse BOOLEAN DEFAULT false;
ALTER TABLE sites ADD COLUMN trial_abuse_threshold INTEGER DEFAULT 2;
