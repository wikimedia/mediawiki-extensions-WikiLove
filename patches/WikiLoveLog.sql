--
-- WikiLove logging schema
-- Not final, please apply this patch manually for now!
--

CREATE TABLE IF NOT EXISTS /*_*/wikilove_log (
	`wl_id` int NOT NULL PRIMARY KEY auto_increment,
	`wl_timestamp` binary(14) NOT NULL,
	`wl_sender_id` int(11) NOT NULL,
	`wl_receiver_id` int(11) NOT NULL,
	`wl_type` varchar(64) NOT NULL,
	`wl_subject` varchar(255) NOT NULL,
	`wl_message` blob NOT NULL,
	`wl_email` bool NOT NULL default '0'
) /*$wgDBTableOptions*/;
